"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";

import { recordAudit } from "@/lib/admin/audit";
import { getSession } from "@/lib/auth/dal";
import { db } from "@/lib/firebase/admin";

type Result = { success: true } | { success: false; error: string };

const DENIED = { success: false, error: "Brak uprawnień." } as const;

/**
 * Akcje wiadomości z formularzy sprawdzają uprawnienia samodzielnie —
 * tak samo jak reszta panelu, bo akcje serwerowe mają własne adresy
 * i ukrycie przycisku niczego nie zabezpiecza.
 */
async function requireAdminActor(): Promise<{ email: string } | null> {
  const session = await getSession();
  if (!session?.isAdmin) return null;
  return { email: session.email ?? "administrator" };
}

const idSchema = z.string().trim().min(1).max(128);

export async function setFormMessageHandled(raw: {
  id: string;
  handled: boolean;
}): Promise<Result> {
  const actor = await requireAdminActor();
  if (!actor) return DENIED;

  const id = idSchema.safeParse(raw?.id);
  if (!id.success) return { success: false, error: "Brak wiadomości." };
  const handled = Boolean(raw?.handled);

  const ref = db.collection("formMessages").doc(id.data);
  const snapshot = await ref.get();
  if (!snapshot.exists) return { success: false, error: "Wiadomość nie istnieje." };

  await ref.update(
    handled
      ? { status: "handled", handledAt: new Date().toISOString(), handledBy: actor.email }
      : { status: "new", handledAt: null, handledBy: null }
  );

  revalidatePath("/admin/formularz");
  return { success: true };
}

/**
 * Trwałe usunięcie wiadomości.
 *
 * Bez kosza — kasuje się tu przede wszystkim spam, a jedyne, co przepada,
 * to kopia tego, co i tak poszło mailem. Ślad zostaje w dzienniku panelu.
 */
export async function deleteFormMessage(rawId: string): Promise<Result> {
  const actor = await requireAdminActor();
  if (!actor) return DENIED;

  const id = idSchema.safeParse(rawId);
  if (!id.success) return { success: false, error: "Brak wiadomości." };

  const ref = db.collection("formMessages").doc(id.data);
  const snapshot = await ref.get();
  if (!snapshot.exists) return { success: false, error: "Wiadomość nie istnieje." };

  const data = snapshot.data()!;
  await ref.delete();

  await recordAudit({
    actorEmail: actor.email,
    action: "Usunięcie wiadomości z formularza",
    details: `${data.kind === "design" ? "projekt" : "kontakt"}, od ${data.email ?? "—"}, z ${data.createdAt ?? "—"}`,
  });

  revalidatePath("/admin/formularz");
  return { success: true };
}
