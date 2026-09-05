import Link from "next/link";
import { ExternalLink, ShieldCheck } from "lucide-react";

import type { AdminUserRow } from "@/lib/admin/users";
import { StatusPill } from "@/components/account/StatusPill";
import { formatDate, formatPln } from "@/lib/orders/status";

export function UsersTable({
  users,
  emptyMessage = "Brak kont dla wybranych filtrów.",
}: {
  users: AdminUserRow[];
  emptyMessage?: string;
}) {
  if (users.length === 0) {
    return (
      <p className="text-sm font-medium text-muted-foreground py-8 text-center">{emptyMessage}</p>
    );
  }

  return (
    <div className="overflow-x-auto -mx-5 sm:-mx-6 px-5 sm:px-6">
      <table className="w-full text-sm border-collapse">
        <thead>
          <tr className="text-left">
            {["Klient", "Kontakt", "Zarejestrowany", "Zamówienia", "Wydane", "Status", ""].map(
              (heading) => (
                <th
                  key={heading}
                  className="pb-3 pr-4 text-[11px] font-black uppercase tracking-wider text-muted-foreground whitespace-nowrap border-b border-border/60"
                >
                  {heading}
                </th>
              )
            )}
          </tr>
        </thead>
        <tbody>
          {users.map((user) => {
            const name = `${user.firstName} ${user.lastName}`.trim();

            return (
              <tr key={user.uid} className="border-b border-border/40 hover:bg-muted/25 transition-colors">
                <td className="py-3 pr-4 max-w-[220px]">
                  <span className="flex items-center gap-1.5 min-w-0">
                    <span className="block font-bold text-foreground truncate">{name || "—"}</span>
                    {user.isAdmin && (
                      <ShieldCheck
                        className="w-3.5 h-3.5 text-primary shrink-0"
                        aria-label="Administrator"
                      />
                    )}
                  </span>
                  <span className="block text-xs font-medium text-muted-foreground truncate">
                    {user.email}
                  </span>
                </td>
                <td className="py-3 pr-4 whitespace-nowrap font-medium text-muted-foreground">
                  {user.phone || "—"}
                </td>
                <td className="py-3 pr-4 whitespace-nowrap font-medium text-muted-foreground tabular-nums">
                  {formatDate(user.authCreatedAt)}
                </td>
                <td className="py-3 pr-4 whitespace-nowrap tabular-nums">
                  <span className="font-extrabold text-foreground">{user.orderCount}</span>
                </td>
                <td className="py-3 pr-4 whitespace-nowrap font-bold text-foreground tabular-nums">
                  {user.orderCount ? formatPln(user.totalSpent) : "—"}
                </td>
                <td className="py-3 pr-4">
                  <div className="flex flex-wrap gap-1.5">
                    <StatusPill tone={user.emailVerified ? "success" : "warning"}>
                      {user.emailVerified ? "E-mail OK" : "Niepotwierdzony"}
                    </StatusPill>
                    {user.disabled && <StatusPill tone="danger">Zablokowane</StatusPill>}
                  </div>
                </td>
                <td className="py-3 whitespace-nowrap">
                  <Link
                    href={`/admin/uzytkownicy/${user.uid}`}
                    className="inline-flex items-center gap-1.5 text-xs font-bold text-primary hover:underline"
                  >
                    Otwórz
                    <ExternalLink className="w-3.5 h-3.5" aria-hidden />
                  </Link>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
