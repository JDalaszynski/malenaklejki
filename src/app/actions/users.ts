"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";

import { adminAuth, db } from "@/lib/firebase/admin";
import { getSession } from "@/lib/auth/dal";
import { recordAudit } from "@/lib/admin/audit";
import { sendVerificationEmail } from "@/lib/email/auth";

type Result = { success: true } | { success: false; error: string };

/** Jak w `actions/admin.ts` — akcja jest wystawiona pod własnym adresem, więc sama pilnuje uprawnień. */
async function requireAdminActor(): Promise<{ email: string; uid: string } | null> {
  const session = await getSession();
  if (!session?.isAdmin) return null;
  return { email: session.email ?? "administrator", uid: session.uid };
}

const DENIED = { success: false, error: "Brak uprawnień." } as const;

function refreshUserViews(uid: string) {
  revalidatePath("/admin/uzytkownicy");
  revalidatePath(`/admin/uzytkownicy/${uid}`);
}

function appUrl(): string {
  return (process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000").replace(/\/+$/, "");
}

const disabledSchema = z.object({
  uid: z.string().min(1).max(128),
  disabled: z.boolean(),
});

/**
 * Blokada logowania — odwracalna, w przeciwieństwie do usunięcia konta.
 * Świadomie nie ma tu opcji trwałego usuwania: konto bywa powiązane
 * z historią zamówień i fakturami, więc kasowanie go na stałe wymagałoby
 * osobnej decyzji o tym, co robimy z tymi danymi (RODO, ale i księgowość).
 */
export async function setUserDisabled(uid: string, disabled: boolean): Promise<Result> {
  const actor = await requireAdminActor();
  if (!actor) return DENIED;

  const parsed = disabledSchema.safeParse({ uid, disabled });
  if (!parsed.success) return { success: false, error: "Błędne dane." };

  if (parsed.data.uid === actor.uid && disabled) {
    return { success: false, error: "Nie możesz zablokować własnego konta." };
  }

  try {
    await adminAuth.updateUser(parsed.data.uid, { disabled: parsed.data.disabled });
  } catch (error) {
    console.error("setUserDisabled error:", error);
    return { success: false, error: "Nie udało się zmienić dostępu do konta." };
  }

  await recordAudit({
    actorEmail: actor.email,
    action: disabled ? "Zablokowano logowanie klienta" : "Odblokowano logowanie klienta",
    details: `uid: ${parsed.data.uid}`,
  });

  refreshUserViews(parsed.data.uid);
  return { success: true };
}

const resendSchema = z.object({ uid: z.string().min(1).max(128) });

/** Ponowna wysyłka maila weryfikacyjnego — dla konta, które go zgubiło albo nigdy nie kliknęło linku. */
export async function resendUserVerificationEmail(uid: string): Promise<Result> {
  const actor = await requireAdminActor();
  if (!actor) return DENIED;

  const parsed = resendSchema.safeParse({ uid });
  if (!parsed.success) return { success: false, error: "Błędne dane." };

  try {
    const record = await adminAuth.getUser(parsed.data.uid);
    if (record.emailVerified) {
      return { success: false, error: "Ten adres jest już potwierdzony." };
    }
    if (!record.email) {
      return { success: false, error: "Konto nie ma adresu e-mail." };
    }

    const profileSnap = await db.collection("users").doc(parsed.data.uid).get();
    const firstName = (profileSnap.data()?.firstName as string | undefined) ?? "";

    const link = await adminAuth.generateEmailVerificationLink(record.email, {
      url: `${appUrl()}/konto?powitanie=1`,
      handleCodeInApp: false,
    });
    await sendVerificationEmail(record.email, firstName, link);
  } catch (error) {
    console.error("resendUserVerificationEmail error:", error);
    return { success: false, error: "Wysyłka nie powiodła się. Sprawdź logi." };
  }

  await recordAudit({
    actorEmail: actor.email,
    action: "Ponowna wysyłka maila weryfikacyjnego",
    details: `uid: ${parsed.data.uid}`,
  });

  refreshUserViews(parsed.data.uid);
  return { success: true };
}
