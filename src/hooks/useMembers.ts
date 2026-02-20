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
import type { Member, EmailMapping, UserRole } from "@/lib/types";

export interface CreateMemberData {
  name: string;
  email: string;
  phone: string;
  role: UserRole;
  color: string | null;
}

export function useMembers(orgId: string | null) {
  const [members, setMembers] = useState<Member[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!orgId || !db || !isConfigured) {
      setMembers([]);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);

    const q = query(
      collection(db, "organizations", orgId, "members"),
      orderBy("name")
    );

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const loaded: Member[] = snapshot.docs.map(
          (d) => ({ id: d.id, ...d.data() } as Member)
        );
        setMembers(loaded);
        setIsLoading(false);
      },
      (error) => {
        console.error("Error listening to members:", error);
        setIsLoading(false);
      }
    );

    return () => unsubscribe();
  }, [orgId]);

  const createMember = useCallback(
    async (data: CreateMemberData): Promise<string | null> => {
      if (!orgId || !db) return null;

      const memberId = crypto.randomUUID();
      const now = new Date().toISOString();
      const emailKey = data.email.toLowerCase().trim();

      const member: Member = {
        id: memberId,
        uid: null,
        email: emailKey,
        name: data.name.trim(),
        phone: data.phone.trim(),
        role: data.role,
        color: data.role === 'cuidadora' ? data.color : null,
        active: true,
        createdAt: now,
        updatedAt: now,
      };

      const emailMapping: EmailMapping = {
        orgId,
        memberId,
        role: data.role,
        createdAt: now,
      };

      try {
        await Promise.all([
          setDoc(doc(db, "organizations", orgId, "members", memberId), member),
          setDoc(doc(db, "emailMappings", emailKey), emailMapping),
        ]);
        return memberId;
      } catch (error) {
        console.error("Error creating member:", error);
        return null;
      }
    },
    [orgId]
  );

  const updateMember = useCallback(
    async (
      memberId: string,
      data: Partial<Pick<Member, 'name' | 'phone' | 'role' | 'color' | 'active'>>
    ): Promise<boolean> => {
      if (!orgId || !db) return false;

      try {
        await updateDoc(
          doc(db, "organizations", orgId, "members", memberId),
          { ...data, updatedAt: new Date().toISOString() }
        );

        // If role changed, update emailMapping too
        if (data.role) {
          const member = members.find((m) => m.id === memberId);
          if (member) {
            await updateDoc(
              doc(db, "emailMappings", member.email),
              { role: data.role }
            );
          }
        }

        return true;
      } catch (error) {
        console.error("Error updating member:", error);
        return false;
      }
    },
    [orgId, members]
  );

  const deleteMember = useCallback(
    async (memberId: string): Promise<boolean> => {
      if (!orgId || !db) return false;

      const member = members.find((m) => m.id === memberId);
      if (!member) return false;

      try {
        await Promise.all([
          deleteDoc(doc(db, "organizations", orgId, "members", memberId)),
          deleteDoc(doc(db, "emailMappings", member.email)),
        ]);
        return true;
      } catch (error) {
        console.error("Error deleting member:", error);
        return false;
      }
    },
    [orgId, members]
  );

  return {
    members,
    isLoading,
    createMember,
    updateMember,
    deleteMember,
  };
}
