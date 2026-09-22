import { ChevronDown, MailWarning } from "lucide-react";

import { MessageActions } from "./MessageActions";
import { StatusPill } from "@/components/account/StatusPill";
import { KIND_LABELS, type FormMessage } from "@/lib/admin/messages";
import { formatDateTime } from "@/lib/orders/status";

/**
 * Lista wiadomości z formularzy.
 *
 * Nie tabela, bo treść jest tym, po co się tu wchodzi, a nie da się jej
 * zmieścić w komórce. Każda wiadomość to zwijany blok na `<details>` —
 * nowe otwierają się od razu, załatwione czekają zwinięte, więc lista
 * zostaje przeglądalna także po stu wpisach.
 */
export function MessagesList({
  messages,
  emptyMessage = "Brak wiadomości dla wybranych filtrów.",
}: {
  messages: FormMessage[];
  emptyMessage?: string;
}) {
  if (messages.length === 0) {
    return (
      <p className="text-sm font-medium text-muted-foreground py-8 text-center">{emptyMessage}</p>
    );
  }

  return (
    <ul className="flex flex-col gap-3">
      {messages.map((item) => {
        const isNew = item.status === "new";

        return (
          <li key={item.id}>
            <details
              open={isNew}
              className={`group rounded-2xl border transition-colors ${
                isNew ? "border-primary/40 bg-primary/[0.04]" : "border-border/60 bg-card"
              }`}
            >
              <summary className="flex items-start justify-between gap-3 p-4 sm:p-5 cursor-pointer list-none [&::-webkit-details-marker]:hidden rounded-2xl hover:bg-muted/20 transition-colors">
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-1.5 mb-1.5">
                    <StatusPill tone={item.kind === "design" ? "info" : "neutral"}>
                      {KIND_LABELS[item.kind]}
                    </StatusPill>
                    <StatusPill tone={isNew ? "warning" : "success"}>
                      {isNew ? "Nowa" : "Załatwiona"}
                    </StatusPill>
                    {item.mailStatus === "failed" && (
                      <StatusPill tone="danger">
                        <MailWarning className="w-3.5 h-3.5" aria-hidden />
                        Mail nie wyszedł
                      </StatusPill>
                    )}
                  </div>

                  <p className="font-extrabold text-foreground truncate">{item.subject || "—"}</p>
                  <p className="text-xs font-semibold text-muted-foreground truncate mt-0.5">
                    {item.name ? `${item.name} · ` : ""}
                    {item.email}
                  </p>
                </div>

                <div className="shrink-0 flex items-center gap-2">
                  <span className="hidden sm:block text-xs font-bold text-muted-foreground tabular-nums whitespace-nowrap">
                    {formatDateTime(item.createdAt)}
                  </span>
                  <ChevronDown
                    className="w-4 h-4 text-muted-foreground transition-transform group-open:rotate-180"
                    aria-hidden
                  />
                </div>
              </summary>

              <div className="px-4 sm:px-5 pb-4 sm:pb-5 flex flex-col gap-4">
                <p className="sm:hidden text-xs font-bold text-muted-foreground tabular-nums">
                  {formatDateTime(item.createdAt)}
                </p>

                <div className="rounded-xl border border-border/50 bg-background px-4 py-3">
                  <p className="text-sm font-medium text-foreground leading-relaxed whitespace-pre-wrap break-words">
                    {item.message}
                  </p>
                </div>

                {item.mailStatus === "failed" && (
                  <div className="text-xs font-semibold text-destructive">
                    <p>
                      Powiadomienie nie wyszło z Brevo — ta wiadomość jest jedynym jej śladem,
                      odpisz z panelu.
                    </p>
                    {item.mailError && (
                      <p className="mt-1 font-normal text-destructive/80 break-words">
                        {item.mailError}
                      </p>
                    )}
                  </div>
                )}

                {item.mailStatus === "pending" && (
                  <p className="text-xs font-semibold text-muted-foreground">
                    Brak informacji o wysyłce powiadomienia.
                  </p>
                )}

                {item.status === "handled" && item.handledAt && (
                  <p className="text-xs font-semibold text-muted-foreground">
                    Załatwione {formatDateTime(item.handledAt)}
                    {item.handledBy ? ` — ${item.handledBy}` : ""}
                  </p>
                )}

                <MessageActions
                  id={item.id}
                  email={item.email}
                  subject={item.subject}
                  handled={item.status === "handled"}
                />
              </div>
            </details>
          </li>
        );
      })}
    </ul>
  );
}
