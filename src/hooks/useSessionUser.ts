"use client";

import { useSyncExternalStore } from "react";

export type SessionUserSummary = {
  email: string | null;
  firstName: string;
  emailVerified: boolean;
  isAdmin: boolean;
};

export type SessionState = { status: "loading" | "ready"; user: SessionUserSummary | null };

const LOADING: SessionState = { status: "loading", user: null };

/**
 * Stan sesji trzymamy w prostym zewnętrznym magazynie, wspólnym dla wszystkich
 * komponentów. Dzięki temu nagłówek, menu mobilne i formularz zamówienia
 * pytają serwer o sesję raz, a nie każdy z osobna.
 *
 * Nagłówek jest komponentem klienckim obecnym na każdej podstronie, więc
 * czytanie sesji w głównym layoucie wyłączyłoby statyczne generowanie całego
 * bloga i stron ofertowych — stąd dopytanie z przeglądarki.
 */
let snapshot: SessionState = LOADING;
let inFlight: Promise<void> | null = null;
const listeners = new Set<() => void>();

function publish(next: SessionState) {
  snapshot = next;
  listeners.forEach((listener) => listener());
}

function load(): Promise<void> {
  if (inFlight) return inFlight;

  inFlight = fetch("/api/sesja", { cache: "no-store" })
    .then((response) => (response.ok ? response.json() : { user: null }))
    .then((data) => publish({ status: "ready", user: data.user ?? null }))
    .catch(() => publish({ status: "ready", user: null }))
    .finally(() => {
      inFlight = null;
    });

  return inFlight;
}

function subscribe(onStoreChange: () => void): () => void {
  listeners.add(onStoreChange);
  if (snapshot === LOADING) void load();
  return () => {
    listeners.delete(onStoreChange);
  };
}

/** Czyści zapamiętany stan i pobiera go na nowo — wywoływane po zmianie sesji. */
export function invalidateSessionUser() {
  inFlight = null;
  publish(LOADING);
  void load();
}

export function useSessionUser(): SessionState {
  return useSyncExternalStore(
    subscribe,
    () => snapshot,
    () => LOADING
  );
}

export function initials(firstName: string, email: string | null): string {
  const fromName = firstName.trim().charAt(0);
  if (fromName) return fromName.toUpperCase();
  const fromEmail = (email || "").trim().charAt(0);
  return fromEmail ? fromEmail.toUpperCase() : "?";
}
