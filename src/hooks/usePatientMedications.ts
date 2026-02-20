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
import type { Medication } from "@/lib/types";

export function usePatientMedications(orgId: string | null, patientId: string | null) {
  const [medications, setMedications] = useState<Medication[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!orgId || !patientId || !db || !isConfigured) {
      setMedications([]);
      return;
    }

    setIsLoading(true);

    const q = query(
      collection(db, "organizations", orgId, "patients", patientId, "medications")
    );

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const loaded: Medication[] = snapshot.docs.map(
          (d) => ({ id: d.id, ...d.data() } as Medication)
        );
        loaded.sort((a, b) => {
          const dateCompare = a.date.localeCompare(b.date);
          if (dateCompare !== 0) return dateCompare;
          return (a.schedule[0] || "").localeCompare(b.schedule[0] || "");
        });
        setMedications(loaded);
        setIsLoading(false);
      },
      (error) => {
        console.error("Error listening to medications:", error);
        setIsLoading(false);
      }
    );

    return () => unsubscribe();
  }, [orgId, patientId]);

  const createMedication = useCallback(
    async (
      data: Omit<Medication, 'id' | 'patientId' | 'createdAt' | 'createdBy' | 'updatedAt' | 'completed'>
    ): Promise<string | null> => {
      if (!orgId || !patientId || !db) return null;

      const medId = crypto.randomUUID();
      const now = new Date().toISOString();

      const newMed: Medication = {
        ...data,
        id: medId,
        patientId,
        completed: false,
        createdAt: now,
        createdBy: '',
        updatedAt: now,
      };

      try {
        await setDoc(
          doc(db, "organizations", orgId, "patients", patientId, "medications", medId),
          newMed
        );
        return medId;
      } catch (error) {
        console.error("Error creating medication:", error);
        return null;
      }
    },
    [orgId, patientId]
  );

  const toggleMedicationComplete = useCallback(
    async (medId: string, memberId: string, memberName: string): Promise<boolean> => {
      if (!orgId || !patientId || !db) return false;

      const med = medications.find((m) => m.id === medId);
      if (!med) return false;

      try {
        const ref = doc(db, "organizations", orgId, "patients", patientId, "medications", medId);
        if (med.completed) {
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
        console.error("Error toggling medication:", error);
        return false;
      }
    },
    [orgId, patientId, medications]
  );

  const deleteMedication = useCallback(
    async (medId: string): Promise<boolean> => {
      if (!orgId || !patientId || !db) return false;

      try {
        await deleteDoc(
          doc(db, "organizations", orgId, "patients", patientId, "medications", medId)
        );
        return true;
      } catch (error) {
        console.error("Error deleting medication:", error);
        return false;
      }
    },
    [orgId, patientId]
  );

  return {
    medications,
    isLoading,
    createMedication,
    toggleMedicationComplete,
    deleteMedication,
  };
}
