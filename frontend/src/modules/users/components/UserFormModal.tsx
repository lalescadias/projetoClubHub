import { zodResolver } from "@hookform/resolvers/zod";
import { X } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { getErrorMessage } from "../../../services/error.service";
import type { ClubRole } from "../../auth/types/auth";
import type { CreateClubUserPayload } from "../types/user";

const schema = z.object({
  name: z.string().trim().min(2, "Indique o nome."),
  email: z.string().email("Indique um email válido."),
  password: z
    .string()
    .min(10, "Use pelo menos 10 caracteres.")
    .regex(/[A-Z]/, "Inclua uma maiúscula.")
    .regex(/[a-z]/, "Inclua uma minúscula.")
    .regex(/[0-9]/, "Inclua um número."),
  role: z.enum(["SUPER_ADMIN", "ADMIN", "MEMBER"]),
});

const availableRoles: { value: ClubRole; label: string }[] = [
  { value: "MEMBER", label: "Membro - apenas consulta" },
  { value: "ADMIN", label: "Administrador - acesso total" },
  { value: "SUPER_ADMIN", label: "Superadministrador - gestão global" },
];

export function UserFormModal({
  onClose,
  onSubmit,
  canCreateAdministrators,
}: {
  onClose: () => void;
  onSubmit: (payload: CreateClubUserPayload) => Promise<void>;
  canCreateAdministrators: boolean;
}) {
  const [error, setError] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<CreateClubUserPayload>({
    resolver: zodResolver(schema),
    defaultValues: { role: "MEMBER" },
  });

  const submit = async (values: CreateClubUserPayload) => {
    try {
      setError(null);
      await onSubmit(values);
      onClose();
    } catch (requestError) {
      setError(getErrorMessage(requestError));
    }
  };

  const inputClass =
    "h-11 rounded-lg border border-[#d9e0da] bg-white px-3 text-sm outline-none focus:border-club-500 focus:ring-3 focus:ring-club-500/10";
  const roles = canCreateAdministrators
    ? availableRoles
    : availableRoles.filter((role) => role.value === "MEMBER");

  return (
    <div className="fixed inset-0 z-[100] grid place-items-center bg-club-950/60 p-5 backdrop-blur-sm max-sm:place-items-end max-sm:p-0">
      <section className="w-full max-w-lg rounded-[15px] bg-white shadow-2xl max-sm:rounded-b-none">
        <header className="flex items-center justify-between border-b border-[#dde4de] p-5">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-[1.3px] text-club-600">
              Acesso ao clube
            </span>
            <h2 className="mt-1 font-display text-xl text-club-950">Adicionar utilizador</h2>
          </div>
          <button className="grid h-9 w-9 place-items-center rounded-lg border border-[#dde4de]" type="button" onClick={onClose}>
            <X size={19} />
          </button>
        </header>
        <form onSubmit={handleSubmit(submit)}>
          <div className="grid gap-4 p-5">
            <label className="grid gap-1.5 text-xs font-bold text-[#4f5d55]">
              Nome
              <input className={inputClass} {...register("name")} />
              {errors.name && <small className="text-[#b84b4b]">{errors.name.message}</small>}
            </label>
            <label className="grid gap-1.5 text-xs font-bold text-[#4f5d55]">
              Email
              <input className={inputClass} type="email" {...register("email")} />
              {errors.email && <small className="text-[#b84b4b]">{errors.email.message}</small>}
            </label>
            <label className="grid gap-1.5 text-xs font-bold text-[#4f5d55]">
              Palavra-passe inicial
              <input className={inputClass} type="password" {...register("password")} />
              {errors.password && <small className="text-[#b84b4b]">{errors.password.message}</small>}
            </label>
            <label className="grid gap-1.5 text-xs font-bold text-[#4f5d55]">
              Função
              <select className={inputClass} {...register("role")}>
                {roles.map((role) => (
                  <option key={role.value} value={role.value}>{role.label}</option>
                ))}
              </select>
            </label>
            {error && <div className="rounded-lg border border-[#efcaca] bg-[#fff0f0] p-3 text-xs text-[#974141]">{error}</div>}
          </div>
          <footer className="flex justify-end gap-2 border-t border-[#dde4de] bg-[#fafbfa] p-4">
            <button className="h-10 rounded-lg border border-[#dde4de] bg-white px-4 text-xs font-bold" type="button" onClick={onClose}>Cancelar</button>
            <button className="h-10 rounded-lg bg-club-800 px-4 text-xs font-bold text-white" disabled={isSubmitting} type="submit">
              {isSubmitting ? "A adicionar..." : "Adicionar"}
            </button>
          </footer>
        </form>
      </section>
    </div>
  );
}
