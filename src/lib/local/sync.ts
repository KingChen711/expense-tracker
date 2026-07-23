"use client"

import { createClient } from "@/lib/supabase/client"
import {
  getOutbox,
  removeOutboxEntry,
  replaceLocalSnapshot,
} from "@/lib/local/db"
import { DATA_TABLES, type LocalRecord, type LocalSnapshot } from "@/lib/local/types"

export type SyncPhase = "idle" | "syncing" | "offline" | "signed-out" | "error"

export interface SyncStatus {
  phase: SyncPhase
  pending: number
  lastSyncedAt: string | null
  error: string | null
}

let status: SyncStatus = {
  phase: "idle",
  pending: 0,
  lastSyncedAt: null,
  error: null,
}
let running: Promise<boolean> | null = null
const listeners = new Set<() => void>()

function setStatus(next: Partial<SyncStatus>) {
  status = { ...status, ...next }
  for (const listener of listeners) listener()
}

export function getSyncStatus() {
  return status
}

export function subscribeSyncStatus(listener: () => void) {
  listeners.add(listener)
  return () => listeners.delete(listener)
}

async function performSync(): Promise<boolean> {
  if (!navigator.onLine) {
    const pending = (await getOutbox()).length
    setStatus({ phase: "offline", pending, error: null })
    return false
  }

  setStatus({ phase: "syncing", error: null })
  const supabase = createClient()
  const { data: sessionData, error: sessionError } = await supabase.auth.getSession()
  if (sessionError) throw sessionError
  const user = sessionData.session?.user
  if (!user) {
    const pending = (await getOutbox()).length
    setStatus({ phase: "signed-out", pending })
    return false
  }

  const outbox = await getOutbox()
  setStatus({ pending: outbox.length })

  for (const entry of outbox) {
    if (entry.operation === "delete") {
      const { error } = await supabase.from(entry.table).delete().eq("id", entry.entityId)
      if (error) throw error
    } else {
      const payload = { ...(entry.payload as LocalRecord), user_id: user.id }
      const { error } = await supabase.from(entry.table).upsert(payload as never)
      if (error) throw error
    }
    await removeOutboxEntry(entry.mutationId)
  }

  const results = await Promise.all(
    DATA_TABLES.map(async (table) => {
      const { data, error } = await supabase.from(table).select("*")
      if (error) throw error
      return [table, data ?? []] as const
    })
  )

  const snapshot = Object.fromEntries(results) as unknown as LocalSnapshot
  const changesDuringSync = await getOutbox()
  for (const entry of changesDuringSync) {
    const records = snapshot[entry.table] as LocalRecord[]
    const index = records.findIndex((record) => record.id === entry.entityId)
    if (entry.operation === "delete") {
      if (index >= 0) records.splice(index, 1)
    } else if (entry.payload) {
      if (index >= 0) records[index] = entry.payload
      else records.push(entry.payload)
    }
  }
  await replaceLocalSnapshot(snapshot)
  const lastSyncedAt = new Date().toISOString()
  setStatus({ phase: "idle", pending: changesDuringSync.length, lastSyncedAt, error: null })
  return changesDuringSync.length === 0
}

export function syncNow(): Promise<boolean> {
  if (running) return running
  running = performSync()
    .catch(async (error: unknown) => {
      const pending = (await getOutbox()).length
      setStatus({
        phase: navigator.onLine ? "error" : "offline",
        pending,
        error: error instanceof Error ? error.message : "Không thể đồng bộ",
      })
      return false
    })
    .finally(() => {
      running = null
      if (status.phase === "idle" && status.pending > 0 && navigator.onLine) {
        window.setTimeout(() => void syncNow(), 0)
      }
    })
  return running
}
