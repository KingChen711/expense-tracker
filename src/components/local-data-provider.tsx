"use client"

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  useSyncExternalStore,
  type ReactNode,
} from "react"
import {
  DB_CHANGED_EVENT,
  LOCAL_MUTATION_EVENT,
  getLocalSnapshot,
} from "@/lib/local/db"
import { generateDueRecurringLocal } from "@/lib/local/repository"
import {
  getSyncStatus,
  subscribeSyncStatus,
  syncNow,
  type SyncStatus,
} from "@/lib/local/sync"
import { EMPTY_SNAPSHOT, type LocalSnapshot } from "@/lib/local/types"

interface LocalDataContextValue {
  snapshot: LocalSnapshot
  loading: boolean
  refresh: () => Promise<void>
}

const LocalDataContext = createContext<LocalDataContextValue | null>(null)

export function LocalDataProvider({ children }: { children: ReactNode }) {
  const [snapshot, setSnapshot] = useState<LocalSnapshot>(EMPTY_SNAPSHOT)
  const [loading, setLoading] = useState(true)

  const refresh = useCallback(async () => {
    setSnapshot(await getLocalSnapshot())
    setLoading(false)
  }, [])

  useEffect(() => {
    let syncTimer: ReturnType<typeof setTimeout> | null = null
    const scheduleSync = () => {
      if (syncTimer) clearTimeout(syncTimer)
      syncTimer = setTimeout(() => void syncNow(), 700)
    }
    const handleVisibility = () => {
      if (document.visibilityState === "visible") void syncNow()
    }

    const initialLoad = window.setTimeout(() => void refresh(), 0)
    void (async () => {
      await syncNow()
      const generated = await generateDueRecurringLocal()
      if (generated > 0) await syncNow()
    })()

    window.addEventListener(DB_CHANGED_EVENT, refresh)
    window.addEventListener(LOCAL_MUTATION_EVENT, scheduleSync)
    window.addEventListener("online", syncNow)
    document.addEventListener("visibilitychange", handleVisibility)
    const interval = window.setInterval(() => void syncNow(), 60_000)
    if (navigator.storage?.persist) void navigator.storage.persist()

    return () => {
      if (syncTimer) clearTimeout(syncTimer)
      window.clearTimeout(initialLoad)
      window.clearInterval(interval)
      window.removeEventListener(DB_CHANGED_EVENT, refresh)
      window.removeEventListener(LOCAL_MUTATION_EVENT, scheduleSync)
      window.removeEventListener("online", syncNow)
      document.removeEventListener("visibilitychange", handleVisibility)
    }
  }, [refresh])

  const value = useMemo(() => ({ snapshot, loading, refresh }), [snapshot, loading, refresh])
  return <LocalDataContext.Provider value={value}>{children}</LocalDataContext.Provider>
}

export function useLocalData() {
  const value = useContext(LocalDataContext)
  if (!value) throw new Error("useLocalData must be used inside LocalDataProvider")
  return value
}

export function useSyncStatus(): SyncStatus {
  return useSyncExternalStore(subscribeSyncStatus, getSyncStatus, getSyncStatus)
}
