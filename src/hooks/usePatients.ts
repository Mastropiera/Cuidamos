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
  orderBy,
} from "firebase/firestore";
import { db, isConfigured } from "@/lib/firebase";
import type { Patient } from "@/lib/types";

export interface CreatePatientData {
  name: string;
  identifier?: string;
  birthDate?: string;
  address?: string;
  phone?: string;
  emergencyContact?: string;
  medicalNotes?: string;
}

export function usePatients(orgId: string | null) {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!orgId || !db || !isConfigured) {
      setPatients([]);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);

    const q = query(
      collection(db, "organizations", orgId, "patients"),
      orderBy("name")
    );

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const loaded: Patient[] = snapshot.docs.map(
          (d) => ({ id: d.id, ...d.data() } as Patient)
        );
        setPatients(loaded);
        setIsLoading(false);
      },
      (error) => {
        console.error("Error listening to patients:", error);
        setIsLoading(false);
      }
    );

    return () => unsubscribe();
  }, [orgId]);

  const createPatient = useCallback(
    async (data: CreatePatientData): Promise<string | null> => {
      if (!orgId || !db) return null;

      const patientId = crypto.randomUUID();
      const now = new Date().toISOString();

      const patient: Patient = {
        id: patientId,
        name: data.name.trim(),
        ...(data.identifier ? { identifier: data.identifier.trim() } : {}),
        ...(data.birthDate ? { birthDate: data.birthDate } : {}),
        ...(data.address ? { address: data.address.trim() } : {}),
        ...(data.phone ? { phone: data.phone.trim() } : {}),
        ...(data.emergencyContact ? { emergencyContact: data.emergencyContact.trim() } : {}),
        ...(data.medicalNotes ? { medicalNotes: data.medicalNotes.trim() } : {}),
        active: true,
        createdAt: now,
        updatedAt: now,
      };

      try {
        await setDoc(
          doc(db, "organizations", orgId, "patients", patientId),
          patient
        );
        return patientId;
      } catch (error) {
        console.error("Error creating patient:", error);
        return null;
      }
    },
    [orgId]
  );

  const updatePatient = useCallback(
    async (patientId: string, data: Partial<Patient>): Promise<boolean> => {
      if (!orgId || !db) return false;

      try {
        await updateDoc(
          doc(db, "organizations", orgId, "patients", patientId),
          { ...data, updatedAt: new Date().toISOString() }
        );
        return true;
      } catch (error) {
        console.error("Error updating patient:", error);
        return false;
      }
    },
    [orgId]
  );

  const deletePatient = useCallback(
    async (patientId: string): Promise<boolean> => {
      if (!orgId || !db) return false;

      try {
        await deleteDoc(
          doc(db, "organizations", orgId, "patients", patientId)
        );
        return true;
      } catch (error) {
        console.error("Error deleting patient:", error);
        return false;
      }
    },
    [orgId]
  );

  return {
    patients,
    isLoading,
    createPatient,
    updatePatient,
    deletePatient,
  };
}
