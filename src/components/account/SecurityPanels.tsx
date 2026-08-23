"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { KeyRound, LogOut, Mail, Trash2 } from "lucide-react";

import { authErrorMessage, clearBrowserSession, googleSignIn, passwordSignIn } from "@/lib/auth/client";
import {
  changePassword,
  deleteAccount,
  requestEmailChange,
  signOutEverywhere,
  type SecurityOverview,
} from "@/app/actions/security";
import { invalidateSessionUser } from "@/hooks/useSessionUser";
import { Field, FormAlert, Input, SubmitButton } from "@/components/auth/fields";
import { Panel } from "./AccountLayout";

type Task = "password" | "email" | "delete";

/**
 * Zbiera dowód tożsamości przed każdą wrażliwą zmianą: hasło albo ponowne
 * przejście przez okno Google. Świeży token trafia potem do akcji serwerowej,
 * która sprawdza jego wiek — sama zalogowana sesja nie wystarczy.
 */
function useReauth(overview: SecurityOverview) {
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);

  const withProof = async (
    run: (idToken: string) => Promise<void>,
    onError: (message: string) => void
  ) => {
    setBusy(true);
    try {
      let idToken: string;
      if (overview.hasPassword) {
        if (!password) {
          onError("Podaj obecne hasło.");
          return;
        }
        idToken = await passwordSignIn(overview.email, password);
      } else {
        const result = await googleSignIn();
        idToken = result.idToken;
      }

      await run(idToken);
      await clearBrowserSession();
      setPassword("");
    } catch (error) {
      onError(authErrorMessage((error as { code?: string })?.code));
    } finally {
      setBusy(false);
    }
  };

  return { password, setPassword, busy, withProof };
}

export function SecurityPanels({ overview }: { overview: SecurityOverview }) {
  const router = useRouter();
  const [open, setOpen] = useState<Task | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [newPassword, setNewPassword] = useState("");
  const [newEmail, setNewEmail] = useState("");
  const [confirmText, setConfirmText] = useState("");

  const reauth = useReauth(overview);

  const start = (task: Task) => {
    setOpen((current) => (current === task ? null : task));
    setError(null);
    setNotice(null);
  };

  const onChangePassword = () =>
    reauth.withProof(async (idToken) => {
      const result = await changePassword({ idToken, newPassword });
      if (!result.success) {
        setError(result.error);
        return;
      }
      invalidateSessionUser();
      router.push("/logowanie?haslo-zmienione=1");
    }, setError);

  const onChangeEmail = () =>
    reauth.withProof(async (idToken) => {
      const result = await requestEmailChange({ idToken, newEmail });
      if (!result.success) {
        setError(result.error);
        return;
      }
      setOpen(null);
      setNewEmail("");
      setNotice(
        "Wysłaliśmy link potwierdzający na nowy adres. Adres zmieni się dopiero po kliknięciu w niego."
      );
    }, setError);

  const onDelete = () =>
    reauth.withProof(async (idToken) => {
      const result = await deleteAccount({ idToken });
      if (!result.success) {
        setError(result.error);
        return;
      }
      invalidateSessionUser();
      router.push("/");
      router.refresh();
    }, setError);

  const onSignOutEverywhere = async () => {
    setError(null);
    const result = await signOutEverywhere();
    if (!result.success) {
      setError(result.error);
      return;
    }
    invalidateSessionUser();
    router.push("/logowanie");
    router.refresh();
  };

  const proofField = overview.hasPassword ? (
    <Field label="Obecne hasło" required>
      <Input
        type="password"
        autoComplete="current-password"
        value={reauth.password}
        onChange={(event) => reauth.setPassword(event.target.value)}
      />
    </Field>
  ) : (
    <p className="text-sm font-medium text-muted-foreground leading-relaxed">
      Po kliknięciu poprosimy o potwierdzenie w oknie Google.
    </p>
  );

  return (
    <div className="flex flex-col gap-6">
      {error && <FormAlert>{error}</FormAlert>}
      {notice && <FormAlert tone="success">{notice}</FormAlert>}

      <Panel
        title="Sposoby logowania"
        description="Do jednego konta możesz mieć hasło i konto Google jednocześnie."
      >
        <div className="flex flex-col gap-3">
          <div className="flex items-center justify-between gap-4 py-3 border-b border-border/40">
            <div className="flex items-center gap-3">
              <Mail className="w-5 h-5 text-muted-foreground shrink-0" aria-hidden />
              <div>
                <p className="font-bold text-foreground">Adres e-mail</p>
                <p className="text-sm font-medium text-muted-foreground">{overview.email}</p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => start("email")}
              className="text-sm font-bold text-primary hover:underline underline-offset-4 cursor-pointer shrink-0"
            >
              Zmień
            </button>
          </div>

          <div className="flex items-center justify-between gap-4 py-3">
            <div className="flex items-center gap-3">
              <KeyRound className="w-5 h-5 text-muted-foreground shrink-0" aria-hidden />
              <div>
                <p className="font-bold text-foreground">Hasło</p>
                <p className="text-sm font-medium text-muted-foreground">
                  {overview.hasPassword
                    ? "Ustawione"
                    : "Nie ustawione — logujesz się przez Google"}
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => start("password")}
              className="text-sm font-bold text-primary hover:underline underline-offset-4 cursor-pointer shrink-0"
            >
              {overview.hasPassword ? "Zmień" : "Ustaw hasło"}
            </button>
          </div>

          {overview.hasGoogle && (
            <p className="text-sm font-medium text-muted-foreground pt-1">
              Logowanie przez Google jest aktywne dla tego konta.
            </p>
          )}
        </div>

        {open === "password" && (
          <div className="mt-6 pt-6 border-t border-border/60 flex flex-col gap-5">
            {proofField}
            <Field
              label={overview.hasPassword ? "Nowe hasło" : "Hasło"}
              required
              hint="Minimum 8 znaków, w tym litera i cyfra."
            >
              <Input
                type="password"
                autoComplete="new-password"
                value={newPassword}
                onChange={(event) => setNewPassword(event.target.value)}
              />
            </Field>
            <p className="text-sm font-medium text-muted-foreground">
              Po zmianie wylogujemy Cię ze wszystkich urządzeń — to standardowe zabezpieczenie.
            </p>
            <div className="sm:max-w-xs">
              <SubmitButton type="button" loading={reauth.busy} onClick={onChangePassword}>
                Zapisz hasło
              </SubmitButton>
            </div>
          </div>
        )}

        {open === "email" && (
          <div className="mt-6 pt-6 border-t border-border/60 flex flex-col gap-5">
            {proofField}
            <Field label="Nowy adres e-mail" required>
              <Input
                type="email"
                autoComplete="email"
                value={newEmail}
                onChange={(event) => setNewEmail(event.target.value)}
              />
            </Field>
            <p className="text-sm font-medium text-muted-foreground leading-relaxed">
              Wyślemy link na nowy adres. Do czasu kliknięcia logujesz się starym — dzięki temu
              literówka nie zamknie Ci drogi do konta.
            </p>
            <div className="sm:max-w-xs">
              <SubmitButton type="button" loading={reauth.busy} onClick={onChangeEmail}>
                Wyślij potwierdzenie
              </SubmitButton>
            </div>
          </div>
        )}
      </Panel>

      <Panel title="Sesje" description="Nie pamiętasz, gdzie się logowałeś? Zamknij wszystko naraz.">
        <button
          type="button"
          onClick={onSignOutEverywhere}
          className="inline-flex items-center justify-center gap-2 rounded-xl text-sm font-bold bg-card border border-border/70 text-foreground hover:bg-muted/50 hover:text-primary active:scale-[0.98] h-12 px-5 transition-all cursor-pointer"
        >
          <LogOut className="w-4 h-4" aria-hidden />
          Wyloguj ze wszystkich urządzeń
        </button>
      </Panel>

      <Panel title="Usunięcie konta">
        <p className="text-sm font-medium text-muted-foreground leading-relaxed max-w-2xl">
          Usuwamy Twój profil i sposoby logowania. Same zamówienia zostają w naszych rejestrach
          sprzedaży — przepisy podatkowe każą przechowywać je przez 5 lat od końca roku
          podatkowego — ale przestają być z Tobą powiązane. Tej operacji nie da się cofnąć.
        </p>

        {open !== "delete" ? (
          <button
            type="button"
            onClick={() => start("delete")}
            className="mt-5 inline-flex items-center justify-center gap-2 rounded-xl text-sm font-bold bg-destructive/10 border border-destructive/30 text-destructive hover:bg-destructive/15 active:scale-[0.98] h-12 px-5 transition-all cursor-pointer"
          >
            <Trash2 className="w-4 h-4" aria-hidden />
            Chcę usunąć konto
          </button>
        ) : (
          <div className="mt-6 pt-6 border-t border-border/60 flex flex-col gap-5">
            {proofField}
            <Field label="Wpisz USUWAM, żeby potwierdzić" required>
              <Input
                value={confirmText}
                onChange={(event) => setConfirmText(event.target.value)}
                placeholder="USUWAM"
                autoComplete="off"
              />
            </Field>
            <div className="flex flex-wrap gap-3">
              <button
                type="button"
                onClick={onDelete}
                disabled={confirmText.trim().toUpperCase() !== "USUWAM" || reauth.busy}
                className="inline-flex items-center justify-center gap-2 rounded-xl text-sm font-bold bg-destructive text-destructive-foreground hover:opacity-90 active:scale-[0.98] h-12 px-6 transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Trash2 className="w-4 h-4" aria-hidden />
                Usuń konto na zawsze
              </button>
              <button
                type="button"
                onClick={() => setOpen(null)}
                className="inline-flex items-center justify-center rounded-xl text-sm font-bold bg-card border border-border/70 text-foreground hover:bg-muted/50 h-12 px-6 transition-all cursor-pointer"
              >
                Anuluj
              </button>
            </div>
          </div>
        )}
      </Panel>
    </div>
  );
}
