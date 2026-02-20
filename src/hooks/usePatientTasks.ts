"use client";

import { useState, useEffect, useCallback } from "react";
import {
  collection,
  doc,
  setDoc,
  updateDoc,
  deleteDoc,
  onSnapshot,
  query,
} from "firebase/firestore";
import { db, isConfigured } from "@/lib/firebase";
import type { CareTask } from "@/lib/types";

export function usePatientTasks(orgId: string | null, patientId: string | null) {
  const [tasks, setTasks] = useState<CareTask[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!orgId || !patientId || !db || !isConfigured) {
      setTasks([]);
      return;
    }

    setIsLoading(true);

    const q = query(
      collection(db, "organizations", orgId, "patients", patientId, "tasks")
    );

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const loaded: CareTask[] = snapshot.docs.map(
          (d) => ({ id: d.id, ...d.data() } as CareTask)
        );
        loaded.sort((a, b) => {
          const dateCompare = a.date.localeCompare(b.date);
          if (dateCompare !== 0) return dateCompare;
          return (a.time || "").localeCompare(b.time || "");
        });
        setTasks(loaded);
        setIsLoading(false);
      },
      (error) => {
        console.error("Error listening to patient tasks:", error);
        setIsLoading(false);
      }
    );

    return () => unsubscribe();
  }, [orgId, patientId]);

  const createTask = useCallback(
    async (
      data: Omit<CareTask, 'id' | 'patientId' | 'createdAt' | 'createdBy' | 'updatedAt' | 'completed'>
    ): Promise<string | null> => {
      if (!orgId || !patientId || !db) return null;

      const taskId = crypto.randomUUID();
      const now = new Date().toISOString();

      const newTask: CareTask = {
        ...data,
        id: taskId,
        patientId,
        completed: false,
        createdAt: now,
        createdBy: '', // will be set by caller via memberId
        updatedAt: now,
      };

      try {
        await setDoc(
          doc(db, "organizations", orgId, "patients", patientId, "tasks", taskId),
          newTask
        );
        return taskId;
      } catch (error) {
        console.error("Error creating task:", error);
        return null;
      }
    },
    [orgId, patientId]
  );

  const toggleTaskComplete = useCallback(
    async (taskId: string, memberId: string, memberName: string): Promise<boolean> => {
      if (!orgId || !patientId || !db) return false;

      const task = tasks.find((t) => t.id === taskId);
      if (!task) return false;

      try {
        const ref = doc(db, "organizations", orgId, "patients", patientId, "tasks", taskId);
        if (task.completed) {
          await updateDoc(ref, {
            completed: false,
            completedAt: null,
            completedBy: null,
            completedByName: null,
            updatedAt: new Date().toISOString(),
          });
        } else {
          await updateDoc(ref, {
            completed: true,
            completedAt: new Date().toISOString(),
            completedBy: memberId,
            completedByName: memberName,
            updatedAt: new Date().toISOString(),
          });
        }
        return true;
      } catch (error) {
        console.error("Error toggling task:", error);
        return false;
      }
    },
    [orgId, patientId, tasks]
  );

  const deleteTask = useCallback(
    async (taskId: string): Promise<boolean> => {
      if (!orgId || !patientId || !db) return false;

      try {
        await deleteDoc(
          doc(db, "organizations", orgId, "patients", patientId, "tasks", taskId)
        );
        return true;
      } catch (error) {
        console.error("Error deleting task:", error);
        return false;
      }
    },
    [orgId, patientId]
  );

  return {
    tasks,
    isLoading,
    createTask,
    toggleTaskComplete,
    deleteTask,
  };
}
