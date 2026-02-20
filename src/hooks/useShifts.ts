"use client";

import { useState, useEffect, useCallback } from "react";
import {
  collection,
  doc,
  setDoc,
  deleteDoc,
  onSnapshot,
  query,
  orderBy,
} from "firebase/firestore";
import { db, isConfigured } from "@/lib/firebase";
import type { Shift } from "@/lib/types";

export interface CreateShiftData {
  patientId: string;
  patientName: string;
  cuidadoraId: string;
  cuidadoraName: string;
  cuidadoraColor: string;
  date: string;
  startTime: string;
  endTime: string;
}

export function useShifts(orgId: string | null) {
  const [shifts, setShifts] = useState<Shift[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!orgId || !db || !isConfigured) {
      setShifts([]);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);

    const q = query(
      collection(db, "organizations", orgId, "shifts"),
      orderBy("date")
    );

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const loaded: Shift[] = snapshot.docs.map(
          (d) => ({ id: d.id, ...d.data() } as Shift)
        );
        setShifts(loaded);
        setIsLoading(false);
      },
      (error) => {
        console.error("Error listening to shifts:", error);
        setIsLoading(false);
      }
    );

    return () => unsubscribe();
  }, [orgId]);

  const createShift = useCallback(
    async (data: CreateShiftData, createdBy: string): Promise<string | null> => {
      if (!orgId || !db) return null;

      const shiftId = crypto.randomUUID();
      const now = new Date().toISOString();

      const shift: Shift = {
        id: shiftId,
        patientId: data.patientId,
        patientName: data.patientName,
        cuidadoraId: data.cuidadoraId,
        cuidadoraName: data.cuidadoraName,
        cuidadoraColor: data.cuidadoraColor,
        date: data.date,
        startTime: data.startTime,
        endTime: data.endTime,
        createdAt: now,
        createdBy,
        updatedAt: now,
      };

      try {
        await setDoc(
          doc(db, "organizations", orgId, "shifts", shiftId),
          shift
        );
        return shiftId;
      } catch (error) {
        console.error("Error creating shift:", error);
        return null;
      }
    },
    [orgId]
  );

  const deleteShift = useCallback(
    async (shiftId: string): Promise<boolean> => {
      if (!orgId || !db) return false;

      try {
        await deleteDoc(
          doc(db, "organizations", orgId, "shifts", shiftId)
        );
        return true;
      } catch (error) {
        console.error("Error deleting shift:", error);
        return false;
      }
    },
    [orgId]
  );

  return {
    shifts,
    isLoading,
    createShift,
    deleteShift,
  };
}
