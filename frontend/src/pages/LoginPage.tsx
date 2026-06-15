import { zodResolver } from "@hookform/resolvers/zod";
import { Building2, Eye, EyeOff, LockKeyhole, Mail } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { Navigate, useLocation, useNavigate } from "react-router-dom";
import { z } from "zod";
import { Brand } from "../components/Brand";
import { useAuth } from "../modules/auth/context/AuthContext";
import { getErrorMessage } from "../services/error.service";

const schema = z.object({
  club: z
    .string()
    .trim()
    .min(2, "Indique o código do clube.")
    .regex(/^[a-z0-9-]+$/, "Use o código fornecido pelo clube."),
  email: z.string().email("Indique um email válido."),
  password: z.string().min(8, "A palavra-passe deve ter pelo menos 8 caracteres."),
});
type LoginValues = z.infer<typeof schema>;

export function LoginPage() {
  const { login, user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginValues>({ resolver: zodResolver(schema) });

  if (user) return <Navigate to="/" replace />;

  const submit = async (values: LoginValues) => {
    try {
      setError(null);
      await login(values.club, values.email, values.password);
      const target = (location.state as { from?: string } | null)?.from ?? "/";
      navigate(target, { replace: true });
    } catch (requestError) {
      setError(getErrorMessage(requestError));
    }
  };

  return (
    <main className="grid min-h-screen grid-cols-[minmax(340px,0.9fr)_minmax(520px,1.1fr)] bg-[#f4f6f3] max-lg:grid-cols-1">
      <section className="flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-[420px]">
          <div className="mb-12 inline-flex rounded-xl bg-club-950 p-3">
            <Brand />
          </div>
          <span className="mb-2 block text-[10px] font-bold uppercase tracking-[1.5px] text-club-600">
            Área reservada
          </span>
          <h1 className="mb-3 font-display text-4xl tracking-[-1.3px] text-club-950">
            Bem-vindo ao ClubHub
          </h1>
          <p className="mb-8 text-sm leading-6 text-[#6e7c74]">
            Indique o código do clube e as suas credenciais. A sessão ficará limitada
            aos dados desse clube.
          </p>

          <form className="grid gap-5" onSubmit={handleSubmit(submit)}>
            <label className="grid gap-2">
              <span className="text-xs font-bold text-[#4f5d55]">Código do clube</span>
              <div className="flex h-12 items-center gap-3 rounded-lg border border-[#d9e0da] bg-white px-3 focus-within:border-club-500 focus-within:ring-3 focus-within:ring-club-500/10">
                <Building2 size={18} className="text-[#849188]" />
                <input
                  className="min-w-0 flex-1 border-0 bg-transparent text-sm lowercase outline-none"
                  autoComplete="organization"
                  placeholder="sporting-covilha"
                  {...register("club")}
                />
              </div>
              {errors.club && <small className="text-[11px] text-[#b84b4b]">{errors.club.message}</small>}
            </label>

            <label className="grid gap-2">
              <span className="text-xs font-bold text-[#4f5d55]">Email</span>
              <div className="flex h-12 items-center gap-3 rounded-lg border border-[#d9e0da] bg-white px-3 focus-within:border-club-500 focus-within:ring-3 focus-within:ring-club-500/10">
                <Mail size={18} className="text-[#849188]" />
                <input
                  className="min-w-0 flex-1 border-0 bg-transparent text-sm outline-none"
                  autoComplete="email"
                  placeholder="nome@clube.pt"
                  {...register("email")}
                />
              </div>
              {errors.email && <small className="text-[11px] text-[#b84b4b]">{errors.email.message}</small>}
            </label>

            <label className="grid gap-2">
              <span className="text-xs font-bold text-[#4f5d55]">Palavra-passe</span>
              <div className="flex h-12 items-center gap-3 rounded-lg border border-[#d9e0da] bg-white px-3 focus-within:border-club-500 focus-within:ring-3 focus-within:ring-club-500/10">
                <LockKeyhole size={18} className="text-[#849188]" />
                <input
                  className="min-w-0 flex-1 border-0 bg-transparent text-sm outline-none"
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  {...register("password")}
                />
                <button
                  className="text-[#849188]"
                  type="button"
                  onClick={() => setShowPassword((current) => !current)}
                  aria-label={showPassword ? "Ocultar palavra-passe" : "Mostrar palavra-passe"}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              {errors.password && <small className="text-[11px] text-[#b84b4b]">{errors.password.message}</small>}
            </label>

            {error && (
              <div className="rounded-lg border border-[#efcaca] bg-[#fff0f0] px-3 py-2.5 text-xs text-[#974141]">
                {error}
              </div>
            )}

            <button
              className="mt-1 min-h-12 rounded-lg bg-club-800 px-5 text-sm font-bold text-white shadow-[0_8px_20px_rgba(29,70,53,0.18)] hover:bg-club-900"
              disabled={isSubmitting}
              type="submit"
            >
              {isSubmitting ? "A entrar..." : "Entrar"}
            </button>
          </form>
        </div>
      </section>

      <section className="relative m-4 overflow-hidden rounded-[20px] bg-club-950 max-lg:hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_30%,rgba(82,151,105,0.32),transparent_35%),radial-gradient(circle_at_20%_85%,rgba(190,214,156,0.18),transparent_28%)]" />
        <div className="relative flex h-full flex-col justify-end p-14 text-white">
          <span className="mb-5 h-px w-16 bg-[#bcd69c]" />
          <h2 className="max-w-xl font-display text-4xl leading-tight tracking-[-1px]">
            Cada clube no seu espaço. Cada equipa com a informação certa.
          </h2>
          <p className="mt-5 max-w-lg text-sm leading-6 text-[#aabbb2]">
            Gestão centralizada com acesso separado por clube, funções e responsabilidades.
          </p>
        </div>
      </section>
    </main>
  );
}
