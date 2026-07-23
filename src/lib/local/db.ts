"use client"

import {
  DATA_TABLES,
  EMPTY_SNAPSHOT,
  type DataTable,
  type LocalRecord,
  type LocalSnapshot,
  type OutboxEntry,
} from "@/lib/local/types"

const DB_NAME = "chi-tieu-local"
const DB_VERSION = 1
const OUTBOX_STORE = "outbox"
const META_STORE = "meta"

export const DB_CHANGED_EVENT = "chi-tieu:db-changed"
export const LOCAL_MUTATION_EVENT = "chi-tieu:local-mutation"

let databasePromise: Promise<IDBDatabase> | null = null

function requestResult<T>(request: IDBRequest<T>): Promise<T> {
  return new Promise((resolve, reject) => {
    request.onsuccess = () => resolve(request.result)
    request.onerror = () => reject(request.error)
  })
}

function transactionDone(transaction: IDBTransaction): Promise<void> {
  return new Promise((resolve, reject) => {
    transaction.oncomplete = () => resolve()
    transaction.onerror = () => reject(transaction.error)
    transaction.onabort = () => reject(transaction.error)
  })
}

export function openLocalDatabase(): Promise<IDBDatabase> {
  if (databasePromise) return databasePromise

  databasePromise = new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION)
    request.onupgradeneeded = () => {
      const database = request.result
      for (const table of DATA_TABLES) {
        if (!database.objectStoreNames.contains(table)) {
          database.createObjectStore(table, { keyPath: "id" })
        }
      }
      if (!database.objectStoreNames.contains(OUTBOX_STORE)) {
        const outbox = database.createObjectStore(OUTBOX_STORE, {
          keyPath: "mutationId",
        })
        outbox.createIndex("queuedAt", "queuedAt")
      }
      if (!database.objectStoreNames.contains(META_STORE)) {
        database.createObjectStore(META_STORE, { keyPath: "key" })
      }
    }
    request.onsuccess = () => {
      const database = request.result
      database.onversionchange = () => database.close()
      resolve(database)
    }
    request.onerror = () => reject(request.error)
  })

  return databasePromise
}

function announceChange(localMutation: boolean) {
  window.dispatchEvent(new Event(DB_CHANGED_EVENT))
  if (localMutation) window.dispatchEvent(new Event(LOCAL_MUTATION_EVENT))
}

export async function getLocalSnapshot(): Promise<LocalSnapshot> {
  const database = await openLocalDatabase()
  const transaction = database.transaction(DATA_TABLES, "readonly")
  const entries = await Promise.all(
    DATA_TABLES.map(async (table) => [table, await requestResult(transaction.objectStore(table).getAll())] as const)
  )
  await transactionDone(transaction)
  return { ...EMPTY_SNAPSHOT, ...Object.fromEntries(entries) } as LocalSnapshot
}

export async function getLocalRecord<T extends LocalRecord>(
  table: DataTable,
  id: string
): Promise<T | undefined> {
  const database = await openLocalDatabase()
  const transaction = database.transaction(table, "readonly")
  const value = await requestResult(transaction.objectStore(table).get(id))
  await transactionDone(transaction)
  return value as T | undefined
}

export async function putLocalRecord(
  table: DataTable,
  record: LocalRecord,
  queue = true
): Promise<void> {
  const database = await openLocalDatabase()
  const stores = queue ? [table, OUTBOX_STORE] : [table]
  const transaction = database.transaction(stores, "readwrite")
  transaction.objectStore(table).put(record)
  if (queue) {
    const entry: OutboxEntry = {
      mutationId: crypto.randomUUID(),
      table,
      entityId: record.id,
      operation: "upsert",
      payload: record,
      queuedAt: Date.now(),
    }
    transaction.objectStore(OUTBOX_STORE).put(entry)
  }
  await transactionDone(transaction)
  announceChange(queue)
}

export async function deleteLocalRecord(
  table: DataTable,
  id: string,
  queue = true
): Promise<void> {
  const database = await openLocalDatabase()
  const stores = queue ? [table, OUTBOX_STORE] : [table]
  const transaction = database.transaction(stores, "readwrite")
  transaction.objectStore(table).delete(id)
  if (queue) {
    const entry: OutboxEntry = {
      mutationId: crypto.randomUUID(),
      table,
      entityId: id,
      operation: "delete",
      payload: null,
      queuedAt: Date.now(),
    }
    transaction.objectStore(OUTBOX_STORE).put(entry)
  }
  await transactionDone(transaction)
  announceChange(queue)
}

export async function getOutbox(): Promise<OutboxEntry[]> {
  const database = await openLocalDatabase()
  const transaction = database.transaction(OUTBOX_STORE, "readonly")
  const entries = (await requestResult(
    transaction.objectStore(OUTBOX_STORE).index("queuedAt").getAll()
  )) as OutboxEntry[]
  await transactionDone(transaction)
  return entries
}

export async function removeOutboxEntry(mutationId: string): Promise<void> {
  const database = await openLocalDatabase()
  const transaction = database.transaction(OUTBOX_STORE, "readwrite")
  transaction.objectStore(OUTBOX_STORE).delete(mutationId)
  await transactionDone(transaction)
}

export async function replaceLocalSnapshot(snapshot: LocalSnapshot): Promise<void> {
  const database = await openLocalDatabase()
  const transaction = database.transaction(DATA_TABLES, "readwrite")
  for (const table of DATA_TABLES) {
    const store = transaction.objectStore(table)
    store.clear()
    for (const record of snapshot[table]) store.put(record)
  }
  await transactionDone(transaction)
  announceChange(false)
}

export async function clearLocalDatabase(): Promise<void> {
  const database = await openLocalDatabase()
  const stores = [...DATA_TABLES, OUTBOX_STORE, META_STORE]
  const transaction = database.transaction(stores, "readwrite")
  for (const store of stores) transaction.objectStore(store).clear()
  await transactionDone(transaction)
  announceChange(false)
}
