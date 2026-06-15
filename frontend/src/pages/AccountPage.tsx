import { zodResolver } from "@hookform/resolvers/zod";
import { KeyRound, LogOut, UserRound } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { z } from "zod";
import { PageHeader } from "../components/PageHeader";
import { authApi } from "../modules/auth/api/auth.api";
import { useAuth } from "../modules/auth/context/AuthContext";
import { getErrorMessage } from "../services/error.service";

const schema = z.object({
  currentPassword: z.string().min(8),
  newPassword: z.string().min(10).regex(/[A-Z]/).regex(/[a-z]/).regex(/[0-9]/),
  confirmation: z.string(),
}).refine((data) => data.newPassword === data.confirmation, {
  path: ["confirmation"],
  message: "As palavras-passe não coincidem.",
});
type PasswordValues = z.infer<typeof schema>;

export function AccountPage() {
  const { user, activeMembership, logout } = useAuth();
  const navigate = useNavigate();
  const [message, setMessage] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<PasswordValues>({ resolver: zodResolver(schema) });

  const submit = async (values: PasswordValues) => {
    try {
      setMessage(null);
      await authApi.changePassword(values.currentPassword, values.newPassword);
      reset();
      setMessage("Palavra-passe alterada com sucesso.");
    } catch (error) {
      setMessage(getErrorMessage(error));
    }
  };

  const signOut = () => {
    logout();
    navigate("/login", { replace: true });
  };

  const inputClass = "h-11 rounded-lg border border-[#d9e0da] px-3 text-sm outline-none focus:border-club-500 focus:ring-3 focus:ring-club-500/10";

  return (
    <>
      <PageHeader eyebrow="Conta" title="O meu perfil" description="Consulte a sua conta e mantenha as credenciais atualizadas." />
      <div className="grid grid-cols-[minmax(260px,0.7fr)_minmax(340px,1.3fr)] gap-5 max-lg:grid-cols-1">
        <section className="rounded-[13px] border border-[#dde4de] bg-white p-6">
          <div className="mb-5 grid h-14 w-14 place-items-center rounded-2xl bg-club-100 text-club-600"><UserRound size={26} /></div>
          <h2 className="font-display text-xl text-club-950">{user?.name}</h2>
          <p className="text-sm text-[#6e7c74]">{user?.email}</p>
          <div className="mt-6 rounded-lg bg-[#f5f7f5] p-4 text-xs">
            <span className="block text-[#7c8981]">Clube ativo</span>
            <strong className="mt-1 block text-[#334139]">{activeMembership?.club.name}</strong>
            <span className="mt-1 block text-club-600">{activeMembership?.role}</span>
          </div>
          <button className="mt-5 inline-flex h-10 w-full items-center justify-center gap-2 rounded-lg border border-[#e3caca] text-xs font-bold text-[#a44747]" onClick={signOut}>
            <LogOut size={16} /> Terminar sessão
          </button>
        </section>

        <section className="rounded-[13px] border border-[#dde4de] bg-white p-6">
          <div className="mb-6 flex items-center gap-3">
            <span className="grid h-10 w-10 place-items-center rounded-xl bg-club-100 text-club-600"><KeyRound size={20} /></span>
            <div><h2 className="m-0 font-display text-lg">Alterar palavra-passe</h2><p className="m-0 text-xs text-[#7c8981]">Use pelo menos 10 caracteres, maiúscula, minúscula e número.</p></div>
          </div>
          <form className="grid gap-4" onSubmit={handleSubmit(submit)}>
            <label className="grid gap-1.5 text-xs font-bold">Palavra-passe atual<input className={inputClass} type="password" {...register("currentPassword")} /></label>
            <label className="grid gap-1.5 text-xs font-bold">Nova palavra-passe<input className={inputClass} type="password" {...register("newPassword")} />{errors.newPassword && <small className="text-[#b84b4b]">A palavra-passe não cumpre os requisitos.</small>}</label>
            <label className="grid gap-1.5 text-xs font-bold">Confirmar nova palavra-passe<input className={inputClass} type="password" {...register("confirmation")} />{errors.confirmation && <small className="text-[#b84b4b]">{errors.confirmation.message}</small>}</label>
            {message && <div className="rounded-lg bg-[#f1f6f1] p-3 text-xs text-[#356347]">{message}</div>}
            <button className="mt-1 h-11 rounded-lg bg-club-800 text-xs font-bold text-white" disabled={isSubmitting}>{isSubmitting ? "A alterar..." : "Alterar palavra-passe"}</button>
          </form>
        </section>
      </div>
    </>
  );
}
