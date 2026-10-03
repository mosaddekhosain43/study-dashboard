"use client";

import { setTopicStatusAction } from "@/actions/index";
import { markTopicRevisedAction } from "@/actions/planner";

export interface OfflineQueueItem {
  id: string;
  type: "SET_TOPIC_STATUS" | "LOG_TIMER" | "MARK_REVISED";
  payload: any;
  timestamp: number;
}

const STORAGE_KEY = "alim_offline_sync_queue_v1";

export function getOfflineQueue(): OfflineQueueItem[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function saveOfflineQueue(queue: OfflineQueueItem[]): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(queue));
  } catch (err) {
    console.error("Failed to save offline queue:", err);
  }
}

export function enqueueOfflineAction(
  type: OfflineQueueItem["type"],
  payload: any
): void {
  const queue = getOfflineQueue();
  // Avoid duplicate queue entries for the same topic
  const filtered = queue.filter(
    (item) => !(item.type === type && item.payload?.topicId === payload?.topicId)
  );
  filtered.push({
    id: `${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
    type,
    payload,
    timestamp: Date.now(),
  });
  saveOfflineQueue(filtered);
  if (typeof window !== "undefined") {
    window.dispatchEvent(
      new CustomEvent("alim-offline-queue-changed", { detail: { count: filtered.length } })
    );
  }
}

let isSyncing = false;

export async function processOfflineSyncQueue(): Promise<{
  synced: number;
  remaining: number;
}> {
  if (typeof window === "undefined" || !navigator.onLine || isSyncing) {
    return { synced: 0, remaining: getOfflineQueue().length };
  }

  isSyncing = true;
  const queue = getOfflineQueue();
  if (queue.length === 0) {
    isSyncing = false;
    return { synced: 0, remaining: 0 };
  }

  let syncedCount = 0;
  const remainingQueue: OfflineQueueItem[] = [];

  for (const item of queue) {
    try {
      if (item.type === "SET_TOPIC_STATUS") {
        const res = await setTopicStatusAction(
          item.payload.topicId,
          item.payload.status
        );
        if (res.ok) {
          syncedCount++;
        } else {
          remainingQueue.push(item);
        }
      } else if (item.type === "MARK_REVISED") {
        const res = await markTopicRevisedAction(item.payload.topicId);
        if (res.ok) {
          syncedCount++;
        } else {
          remainingQueue.push(item);
        }
      } else {
        remainingQueue.push(item);
      }
    } catch {
      // Still offline or request failed, keep in queue
      remainingQueue.push(item);
    }
  }

  saveOfflineQueue(remainingQueue);
  isSyncing = false;

  if (syncedCount > 0 && typeof window !== "undefined") {
    window.dispatchEvent(
      new CustomEvent("alim-offline-synced", { detail: { count: syncedCount } })
    );
  }

  return { synced: syncedCount, remaining: remainingQueue.length };
}
