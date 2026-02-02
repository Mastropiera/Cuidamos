"use client";

import { useState, useEffect, useCallback } from "react";
import {
  collection,
  doc,
  setDoc,
  deleteDoc,
  onSnapshot,
  query,
  where,
  updateDoc,
  arrayUnion,
  arrayRemove,
  getDoc,
  getDocs,
} from "firebase/firestore";
import { db, isConfigured } from "@/lib/firebase";
import type { CarePlan, CareTask, PlanInvite } from "@/lib/types";

// Generate random invite code (6 characters)
function generateInviteCode(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"; // Sin I, O, 0, 1 para evitar confusión
  let code = "";
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

export interface UseCarePlanResult {
  // State
  plans: CarePlan[];
  tasks: Record<string, CareTask[]>; // planId -> tasks
  selectedPlanId: string | null;
  isLoading: boolean;
  isFirebaseConfigured: boolean;

  // Plan operations
  setSelectedPlanId: (planId: string | null) => void;
  createPlan: (data: { name: string; description?: string; patientName?: string }) => Promise<string | null>;
  updatePlan: (planId: string, data: Partial<Pick<CarePlan, 'name' | 'description' | 'patientName'>>) => Promise<boolean>;
  deletePlan: (planId: string) => Promise<boolean>;

  // Task operations
  createTask: (planId: string, data: Omit<CareTask, 'id' | 'planId' | 'createdAt' | 'createdBy' | 'updatedAt' | 'completed'>) => Promise<string | null>;
  updateTask: (planId: string, taskId: string, data: Partial<CareTask>) => Promise<boolean>;
  deleteTask: (planId: string, taskId: string) => Promise<boolean>;
  toggleTaskComplete: (planId: string, taskId: string) => Promise<boolean>;

  // Collaboration
  generateInvite: (planId: string) => Promise<string | null>;
  joinWithInvite: (code: string) => Promise<boolean>;
  removeCollaborator: (planId: string, collaboratorId: string, collaboratorEmail: string) => Promise<boolean>;
  leaveAsCollaborator: (planId: string) => Promise<boolean>;
}

export function useCarePlan(userId: string | undefined, userEmail: string | undefined): UseCarePlanResult {
  const [plans, setPlans] = useState<CarePlan[]>([]);
  const [tasks, setTasks] = useState<Record<string, CareTask[]>>({});
  const [selectedPlanId, setSelectedPlanId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Listen to plans in real-time (two separate queries merged)
  useEffect(() => {
    if (!userId || !db || !isConfigured) {
      setPlans([]);
      setTasks({});
      setIsLoading(false);
      return;
    }

    setIsLoading(true);

    // Use two separate queries instead of or() to avoid composite index requirements
    const ownedQuery = query(
      collection(db, "carePlans"),
      where("ownerId", "==", userId)
    );
    const collabQuery = query(
      collection(db, "carePlans"),
      where("collaborators", "array-contains", userId)
    );

    let ownedPlans: CarePlan[] = [];
    let collabPlans: CarePlan[] = [];
    let ownedReady = false;
    let collabReady = false;

    const mergePlans = () => {
      if (!ownedReady || !collabReady) return;
      // Deduplicate by id and sort
      const map = new Map<string, CarePlan>();
      for (const p of ownedPlans) map.set(p.id, p);
      for (const p of collabPlans) map.set(p.id, p);
      setPlans(Array.from(map.values()).sort((a, b) => a.name.localeCompare(b.name)));
      setIsLoading(false);
    };

    const unsub1 = onSnapshot(
      ownedQuery,
      (snapshot) => {
        ownedPlans = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() } as CarePlan));
        ownedReady = true;
        mergePlans();
      },
      (error) => {
        console.error("Error listening to owned plans:", error);
        ownedReady = true;
        mergePlans();
      }
    );

    const unsub2 = onSnapshot(
      collabQuery,
      (snapshot) => {
        collabPlans = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() } as CarePlan));
        collabReady = true;
        mergePlans();
      },
      (error) => {
        console.error("Error listening to collaborator plans:", error);
        collabReady = true;
        mergePlans();
      }
    );

    return () => {
      unsub1();
      unsub2();
    };
  }, [userId]);

  // Listen to tasks for selected plan
  useEffect(() => {
    if (!selectedPlanId || !db || !isConfigured) return;

    const tasksQuery = query(
      collection(db, "carePlans", selectedPlanId, "tasks")
    );

    const unsubscribe = onSnapshot(
      tasksQuery,
      (snapshot) => {
        const loadedTasks: CareTask[] = [];
        snapshot.forEach((doc) => {
          loadedTasks.push({ id: doc.id, ...doc.data() } as CareTask);
        });
        // Sort by date and time
        loadedTasks.sort((a, b) => {
          const dateCompare = a.date.localeCompare(b.date);
          if (dateCompare !== 0) return dateCompare;
          return (a.time || "").localeCompare(b.time || "");
        });
        setTasks((prev) => ({
          ...prev,
          [selectedPlanId]: loadedTasks,
        }));
      },
      (error) => {
        console.error("Error listening to tasks:", error);
      }
    );

    return () => unsubscribe();
  }, [selectedPlanId]);

  // Create plan
  const createPlan = useCallback(
    async (data: { name: string; description?: string; patientName?: string }): Promise<string | null> => {
      if (!userId || !userEmail || !db) {
        console.error("User not authenticated or Firebase not configured");
        return null;
      }

      const planId = crypto.randomUUID();
      const newPlan: CarePlan = {
        id: planId,
        name: data.name,
        ...(data.description ? { description: data.description } : {}),
        ...(data.patientName ? { patientName: data.patientName } : {}),
        ownerId: userId,
        ownerEmail: userEmail,
        collaborators: [],
        collaboratorEmails: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      try {
        await setDoc(doc(db, "carePlans", planId), newPlan);
        return planId;
      } catch (error) {
        console.error("Error creating plan:", error);
        return null;
      }
    },
    [userId, userEmail]
  );

  // Update plan
  const updatePlan = useCallback(
    async (planId: string, data: Partial<Pick<CarePlan, 'name' | 'description' | 'patientName'>>): Promise<boolean> => {
      if (!db) return false;

      try {
        await updateDoc(doc(db, "carePlans", planId), {
          ...data,
          updatedAt: new Date().toISOString(),
        });
        return true;
      } catch (error) {
        console.error("Error updating plan:", error);
        return false;
      }
    },
    []
  );

  // Delete plan (only owner)
  const deletePlan = useCallback(
    async (planId: string): Promise<boolean> => {
      if (!db || !userId) return false;

      const plan = plans.find((p) => p.id === planId);
      if (!plan || plan.ownerId !== userId) {
        console.error("Only the owner can delete this plan");
        return false;
      }

      try {
        // Delete all tasks first
        const tasksSnapshot = await getDocs(
          collection(db, "carePlans", planId, "tasks")
        );
        const deletePromises = tasksSnapshot.docs.map((doc) => deleteDoc(doc.ref));
        await Promise.all(deletePromises);

        // Delete the plan
        await deleteDoc(doc(db, "carePlans", planId));

        // Delete pending invites
        const invitesQuery = query(
          collection(db, "planInvites"),
          where("planId", "==", planId)
        );
        const invitesSnapshot = await getDocs(invitesQuery);
        const inviteDeletePromises = invitesSnapshot.docs.map((doc) =>
          deleteDoc(doc.ref)
        );
        await Promise.all(inviteDeletePromises);

        if (selectedPlanId === planId) {
          setSelectedPlanId(null);
        }

        return true;
      } catch (error) {
        console.error("Error deleting plan:", error);
        return false;
      }
    },
    [userId, plans, selectedPlanId]
  );

  // Create task
  const createTask = useCallback(
    async (
      planId: string,
      data: Omit<CareTask, 'id' | 'planId' | 'createdAt' | 'createdBy' | 'updatedAt' | 'completed'>
    ): Promise<string | null> => {
      if (!userId || !db) return null;

      const taskId = crypto.randomUUID();
      const newTask: CareTask = {
        ...data,
        id: taskId,
        planId,
        completed: false,
        createdAt: new Date().toISOString(),
        createdBy: userId,
        updatedAt: new Date().toISOString(),
      };

      try {
        await setDoc(doc(db, "carePlans", planId, "tasks", taskId), newTask);
        return taskId;
      } catch (error) {
        console.error("Error creating task:", error);
        return null;
      }
    },
    [userId]
  );

  // Update task
  const updateTask = useCallback(
    async (planId: string, taskId: string, data: Partial<CareTask>): Promise<boolean> => {
      if (!db) return false;

      try {
        await updateDoc(doc(db, "carePlans", planId, "tasks", taskId), {
          ...data,
          updatedAt: new Date().toISOString(),
        });
        return true;
      } catch (error) {
        console.error("Error updating task:", error);
        return false;
      }
    },
    []
  );

  // Delete task
  const deleteTask = useCallback(
    async (planId: string, taskId: string): Promise<boolean> => {
      if (!db) return false;

      try {
        await deleteDoc(doc(db, "carePlans", planId, "tasks", taskId));
        return true;
      } catch (error) {
        console.error("Error deleting task:", error);
        return false;
      }
    },
    []
  );

  // Toggle task complete
  const toggleTaskComplete = useCallback(
    async (planId: string, taskId: string): Promise<boolean> => {
      if (!db || !userId || !userEmail) return false;

      const planTasks = tasks[planId] || [];
      const task = planTasks.find((t) => t.id === taskId);
      if (!task) return false;

      try {
        if (task.completed) {
          // Uncomplete
          await updateDoc(doc(db, "carePlans", planId, "tasks", taskId), {
            completed: false,
            completedAt: null,
            completedBy: null,
            completedByEmail: null,
            updatedAt: new Date().toISOString(),
          });
        } else {
          // Complete
          await updateDoc(doc(db, "carePlans", planId, "tasks", taskId), {
            completed: true,
            completedAt: new Date().toISOString(),
            completedBy: userId,
            completedByEmail: userEmail,
            updatedAt: new Date().toISOString(),
          });
        }
        return true;
      } catch (error) {
        console.error("Error toggling task:", error);
        return false;
      }
    },
    [userId, userEmail, tasks]
  );

  // Generate invite code
  const generateInvite = useCallback(
    async (planId: string): Promise<string | null> => {
      if (!db || !userId) return null;

      const plan = plans.find((p) => p.id === planId);
      if (!plan || plan.ownerId !== userId) {
        console.error("Only the owner can share this plan");
        return null;
      }

      const code = generateInviteCode();
      const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(); // 24 hours

      const invite: PlanInvite = {
        code,
        planId,
        createdBy: userId,
        createdAt: new Date().toISOString(),
        expiresAt,
      };

      try {
        // Save invite
        await setDoc(doc(db, "planInvites", code), invite);

        // Update plan with code
        await updateDoc(doc(db, "carePlans", planId), {
          inviteCode: code,
          inviteExpiresAt: expiresAt,
        });

        return code;
      } catch (error) {
        console.error("Error generating invite:", error);
        return null;
      }
    },
    [userId, plans]
  );

  // Join with invite code
  const joinWithInvite = useCallback(
    async (code: string): Promise<boolean> => {
      if (!userId || !userEmail || !db) {
        console.error("User not authenticated");
        return false;
      }

      const upperCode = code.toUpperCase().trim();

      try {
        const inviteDoc = await getDoc(doc(db, "planInvites", upperCode));

        if (!inviteDoc.exists()) {
          console.error("Invalid invite code");
          return false;
        }

        const invite = inviteDoc.data() as PlanInvite;

        // Check expiration
        if (new Date(invite.expiresAt) < new Date()) {
          console.error("Invite code expired");
          return false;
        }

        // Check not same user
        if (invite.createdBy === userId) {
          console.error("Cannot join your own plan");
          return false;
        }

        // Check plan exists
        const planDoc = await getDoc(doc(db, "carePlans", invite.planId));
        if (!planDoc.exists()) {
          console.error("Plan no longer exists");
          return false;
        }

        const plan = planDoc.data() as CarePlan;

        // Check not already collaborator
        if (plan.collaborators.includes(userId)) {
          console.log("Already a collaborator");
          return true;
        }

        // Add as collaborator
        await updateDoc(doc(db, "carePlans", invite.planId), {
          collaborators: arrayUnion(userId),
          collaboratorEmails: arrayUnion(userEmail),
        });

        return true;
      } catch (error) {
        console.error("Error joining:", error);
        return false;
      }
    },
    [userId, userEmail]
  );

  // Remove collaborator (owner only)
  const removeCollaborator = useCallback(
    async (planId: string, collaboratorId: string, collaboratorEmail: string): Promise<boolean> => {
      if (!db || !userId) return false;

      const plan = plans.find((p) => p.id === planId);
      if (!plan || plan.ownerId !== userId) {
        console.error("Only the owner can remove collaborators");
        return false;
      }

      try {
        await updateDoc(doc(db, "carePlans", planId), {
          collaborators: arrayRemove(collaboratorId),
          collaboratorEmails: arrayRemove(collaboratorEmail),
        });
        return true;
      } catch (error) {
        console.error("Error removing collaborator:", error);
        return false;
      }
    },
    [userId, plans]
  );

  // Leave as collaborator
  const leaveAsCollaborator = useCallback(
    async (planId: string): Promise<boolean> => {
      if (!userId || !userEmail || !db) return false;

      const plan = plans.find((p) => p.id === planId);
      if (!plan) return false;

      if (plan.ownerId === userId) {
        console.error("Owner cannot leave - must delete the plan");
        return false;
      }

      try {
        await updateDoc(doc(db, "carePlans", planId), {
          collaborators: arrayRemove(userId),
          collaboratorEmails: arrayRemove(userEmail),
        });

        if (selectedPlanId === planId) {
          setSelectedPlanId(null);
        }

        return true;
      } catch (error) {
        console.error("Error leaving:", error);
        return false;
      }
    },
    [userId, userEmail, plans, selectedPlanId]
  );

  return {
    plans,
    tasks,
    selectedPlanId,
    isLoading,
    isFirebaseConfigured: isConfigured,
    setSelectedPlanId,
    createPlan,
    updatePlan,
    deletePlan,
    createTask,
    updateTask,
    deleteTask,
    toggleTaskComplete,
    generateInvite,
    joinWithInvite,
    removeCollaborator,
    leaveAsCollaborator,
  };
}
