import {
  Bell,
  Building2,
  BusFront,
  LayoutDashboard,
  Settings,
  LogOut,
  UserRound,
  Users,
} from "lucide-react";
import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { Brand } from "../components/Brand";
import { useAuth } from "../modules/auth/context/AuthContext";
import { useNotifications } from "../modules/notifications/hooks/useNotifications";

const baseNavigation = [
  { label: "Visão geral", to: "/", icon: LayoutDashboard, end: true },
  { label: "Viaturas", to: "/vehicles", icon: BusFront },
  { label: "Notificações", to: "/notifications", icon: Bell },
];

export function AppLayout() {
  const { user, activeRole, activeClub, logout } = useAuth();
  const { notifications } = useNotifications();
  const navigate = useNavigate();
  const navigation = [
    ...baseNavigation,
    ...(activeRole === "ADMIN" || activeRole === "SUPER_ADMIN"
      ? [{ label: "Utilizadores", to: "/users", icon: Users }]
      : []),
    ...(activeRole === "SUPER_ADMIN"
      ? [{ label: "Clubes", to: "/clubs", icon: Building2 }]
      : []),
    { label: "Conta", to: "/account", icon: UserRound },
  ];
  const initials = user?.name
    .split(" ")
    .map((part) => part[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
  const roleLabels = {
    SUPER_ADMIN: "Superadministrador",
    ADMIN: "Administrador",
    MEMBER: "Membro",
  };

  const signOut = () => {
    logout();
    navigate("/login", { replace: true });
  };

  return (
    <div className="min-h-screen">
      <aside className="fixed inset-y-0 left-0 z-20 flex w-[250px] flex-col bg-club-950 px-[18px] pb-5 pt-7 text-[#dfeae4] max-md:hidden">
        <Brand />

        <nav className="mt-12 flex flex-1 flex-col gap-1" aria-label="Navegação principal">
          <span className="px-[13px] pb-[9px] text-[10px] font-bold uppercase tracking-[1.6px] text-[#71877c]">
            Clube
          </span>
          {navigation.map(({ label, to, icon: Icon, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              className={({ isActive }) =>
                `flex min-h-[45px] items-center gap-3 rounded-[9px] px-[13px] text-sm font-semibold transition ${
                  isActive
                    ? "bg-[#285640] text-white shadow-[inset_3px_0_#bcd69c]"
                    : "text-[#9fb1a8] hover:bg-white/5 hover:text-white"
                }`
              }
            >
              <Icon size={19} />
              <span>{label}</span>
            </NavLink>
          ))}

        </nav>

        <div className="border-t border-white/8 pt-[18px]">
          <div className="flex items-center gap-2.5 p-[7px]">
            <div className="grid h-[35px] w-[35px] shrink-0 place-items-center rounded-[9px] bg-[#dfeaca] text-xs font-bold text-club-900">
              {activeClub?.name.slice(0, 2).toUpperCase() ?? "CH"}
            </div>
            <div className="min-w-0 flex-1">
              <strong className="block overflow-hidden text-ellipsis whitespace-nowrap text-xs text-[#e9f0ec]">
                {activeClub?.name ?? "Gestão global"}
              </strong>
              <span className="mt-[3px] block text-[10px] text-[#7f9489]">
                {activeRole ? roleLabels[activeRole] : ""}
              </span>
            </div>
          </div>
        </div>
      </aside>

      <div className="min-h-screen md:ml-[250px]">
        <header className="flex h-[70px] items-center justify-end border-b border-[#dde4de] bg-white/85 px-[42px] backdrop-blur-md max-md:h-[62px] max-md:justify-between max-md:px-[18px]">
          <div className="hidden items-center gap-[5px] max-md:flex">
            <Brand compact />
            <strong className="font-display text-base text-club-950">ClubHub</strong>
          </div>
          <div className="flex items-center gap-[9px]">
            <button
              className="relative grid h-[37px] w-[37px] place-items-center rounded-[9px] border border-[#dde4de] bg-white text-[#536159] hover:border-[#c4d0c7] hover:bg-[#f7f9f7] hover:text-club-800"
              type="button"
              aria-label="Notificações"
              onClick={() => navigate("/notifications")}
            >
              <Bell size={19} />
              {notifications.length > 0 && (
                <span className="absolute -right-1.5 -top-1.5 grid h-[18px] min-w-[18px] place-items-center rounded-full border-2 border-white bg-[#c95656] px-1 text-[8px] font-bold text-white">
                  {notifications.length > 9 ? "9+" : notifications.length}
                </span>
              )}
            </button>
            <button
              className="grid h-[37px] w-[37px] place-items-center rounded-[9px] border border-[#dde4de] bg-white text-[#536159] hover:border-[#c4d0c7] hover:bg-[#f7f9f7] hover:text-club-800 max-md:hidden"
              type="button"
              aria-label="A minha conta"
              onClick={() => navigate("/account")}
            >
              <Settings size={19} />
            </button>
            <button
              className="ml-[5px] grid h-9 w-9 place-items-center rounded-[9px] bg-club-800 text-[11px] font-bold text-[#f4f7f4]"
              onClick={() => navigate("/account")}
              aria-label="Abrir perfil"
            >
              {initials}
            </button>
            <button className="hidden text-[#87938c] hover:text-[#a44747] sm:block" onClick={signOut} aria-label="Terminar sessão">
              <LogOut size={18} />
            </button>
          </div>
        </header>

        <main className="mx-auto w-full max-w-[1480px] px-[42px] pb-[60px] pt-[39px] max-md:px-4 max-md:pb-[95px] max-md:pt-[27px]">
          <Outlet />
        </main>

        <nav
          className="fixed inset-x-0 bottom-0 z-50 hidden h-[67px] border-t border-[#dde4de] bg-white/95 backdrop-blur-md max-md:grid"
          style={{ gridTemplateColumns: `repeat(${navigation.length}, minmax(0, 1fr))` }}
          aria-label="Navegação móvel"
        >
          {navigation.map(({ label, to, icon: Icon, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              className={({ isActive }) =>
                `flex items-center justify-center gap-[7px] text-[10px] font-bold ${
                  isActive ? "text-club-600" : "text-[#89958e]"
                }`
              }
            >
              <Icon size={20} />
              <span>{label}</span>
            </NavLink>
          ))}
        </nav>
      </div>
    </div>
  );
}
