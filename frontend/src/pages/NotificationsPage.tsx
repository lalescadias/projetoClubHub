import {
  AlertCircle,
  AlertTriangle,
  ArrowRight,
  BellRing,
  CalendarClock,
  CheckCircle2,
  Info,
  ShieldCheck,
} from "lucide-react";
import { Link } from "react-router-dom";
import { LoadingState } from "../components/LoadingState";
import { PageHeader } from "../components/PageHeader";
import { useNotifications } from "../modules/notifications/hooks/useNotifications";
import type {
  Notification,
  NotificationSeverity,
} from "../modules/notifications/types/notification";

const dateFormatter = new Intl.DateTimeFormat("pt-PT", {
  day: "2-digit",
  month: "long",
  year: "numeric",
  timeZone: "UTC",
});

const severityConfig: Record<
  NotificationSeverity,
  {
    label: string;
    icon: typeof Info;
    card: string;
    iconBox: string;
    badge: string;
  }
> = {
  INFO: {
    label: "Informativa",
    icon: Info,
    card: "border-[#cbdde8] bg-[#f7fbfd]",
    iconBox: "bg-[#e1eff7] text-[#397494]",
    badge: "bg-[#e1eff7] text-[#397494]",
  },
  WARNING: {
    label: "Aviso",
    icon: AlertTriangle,
    card: "border-[#ecd9ac] bg-[#fffcf5]",
    iconBox: "bg-[#fff1d2] text-[#a66c16]",
    badge: "bg-[#fff1d2] text-[#a66c16]",
  },
  URGENT: {
    label: "Urgente",
    icon: AlertCircle,
    card: "border-[#efcaca] bg-[#fff9f9]",
    iconBox: "bg-[#fce4e4] text-[#b34949]",
    badge: "bg-[#fce4e4] text-[#b34949]",
  },
};

export function NotificationsPage() {
  const { notifications, loading, error, reload } = useNotifications();
  const counts = {
    INFO: notifications.filter((item) => item.severity === "INFO").length,
    WARNING: notifications.filter((item) => item.severity === "WARNING").length,
    URGENT: notifications.filter((item) => item.severity === "URGENT").length,
  };

  return (
    <>
      <PageHeader
        eyebrow="Frota"
        title="Notificações"
        description="Prazos de inspeção e seguro calculados automaticamente."
      />

      {loading ? (
        <LoadingState />
      ) : error ? (
        <div className="rounded-xl border border-[#efcaca] bg-[#fff0f0] p-4 text-xs text-[#974141]">
          {error}
          <button className="ml-2 font-bold underline" type="button" onClick={() => void reload()}>
            Tentar novamente
          </button>
        </div>
      ) : (
        <>
          <section className="mb-5 grid grid-cols-3 gap-3 max-sm:grid-cols-1">
            <SummaryCard icon={AlertCircle} label="Urgentes" value={counts.URGENT} tone="red" />
            <SummaryCard icon={AlertTriangle} label="Avisos" value={counts.WARNING} tone="amber" />
            <SummaryCard icon={Info} label="Informativas" value={counts.INFO} tone="blue" />
          </section>

          {notifications.length === 0 ? (
            <section className="grid min-h-80 place-content-center justify-items-center rounded-[13px] border border-[#dde4de] bg-white p-8 text-center">
              <span className="mb-4 grid h-14 w-14 place-items-center rounded-2xl bg-[#e9f5ed] text-[#287a50]">
                <CheckCircle2 size={27} />
              </span>
              <h2 className="mb-2 font-display text-lg text-club-950">Tudo em dia</h2>
              <p className="m-0 max-w-sm text-xs leading-5 text-[#718078]">
                Não existem inspeções ou seguros vencidos ou a terminar nos próximos 30 dias.
              </p>
            </section>
          ) : (
            <section className="grid gap-3">
              {notifications.map((notification) => (
                <NotificationCard key={notification.id} notification={notification} />
              ))}
            </section>
          )}
        </>
      )}
    </>
  );
}

function NotificationCard({ notification }: { notification: Notification }) {
  const config = severityConfig[notification.severity];
  const Icon = config.icon;
  const TypeIcon =
    notification.type === "INSPECTION" ? CalendarClock : ShieldCheck;

  return (
    <article className={`flex items-start gap-4 rounded-[13px] border p-5 ${config.card} max-sm:flex-wrap`}>
      <span className={`grid h-11 w-11 shrink-0 place-items-center rounded-xl ${config.iconBox}`}>
        <Icon size={21} />
      </span>
      <div className="min-w-0 flex-1">
        <div className="mb-1.5 flex flex-wrap items-center gap-2">
          <h2 className="m-0 font-display text-[15px] text-[#28362f]">{notification.title}</h2>
          <span className={`rounded-full px-2 py-1 text-[9px] font-bold uppercase tracking-wide ${config.badge}`}>
            {config.label}
          </span>
        </div>
        <p className="mb-3 text-xs leading-5 text-[#5f6d65]">{notification.message}</p>
        <div className="flex flex-wrap gap-x-5 gap-y-2 text-[11px] text-[#77847c]">
          <span className="inline-flex items-center gap-1.5">
            <TypeIcon size={14} />
            {notification.type === "INSPECTION" ? "Inspeção" : "Seguro"}
          </span>
          <span>{notification.make} {notification.model}</span>
          <span>Vencimento: {dateFormatter.format(new Date(`${notification.dueDate}T00:00:00Z`))}</span>
        </div>
      </div>
      <Link
        className="inline-flex shrink-0 items-center gap-1.5 rounded-lg border border-black/8 bg-white px-3 py-2 text-[11px] font-bold text-club-600 max-sm:ml-[60px]"
        to={`/vehicles/${notification.vehicleId}`}
      >
        Ver viatura <ArrowRight size={14} />
      </Link>
    </article>
  );
}

function SummaryCard({
  icon: Icon,
  label,
  value,
  tone,
}: {
  icon: typeof BellRing;
  label: string;
  value: number;
  tone: "red" | "amber" | "blue";
}) {
  const tones = {
    red: "bg-[#fce4e4] text-[#b34949]",
    amber: "bg-[#fff1d2] text-[#a66c16]",
    blue: "bg-[#e1eff7] text-[#397494]",
  };
  return (
    <article className="flex min-h-24 items-center gap-3 rounded-xl border border-[#dde4de] bg-white p-4">
      <span className={`grid h-10 w-10 place-items-center rounded-xl ${tones[tone]}`}><Icon size={19} /></span>
      <div><span className="block text-[10px] uppercase tracking-wide text-[#7c8981]">{label}</span><strong className="mt-1 block font-display text-xl text-club-950">{value}</strong></div>
    </article>
  );
}
