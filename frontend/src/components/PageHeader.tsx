import type { ReactNode } from "react";

type PageHeaderProps = {
  eyebrow: string;
  title: string;
  description: string;
  actions?: ReactNode;
};

export function PageHeader({ eyebrow, title, description, actions }: PageHeaderProps) {
  return (
    <header className="mb-[30px] flex items-end justify-between gap-7 max-[480px]:flex-col max-[480px]:items-start max-[480px]:gap-4">
      <div>
        <span className="mb-[7px] block text-[10px] font-bold uppercase tracking-[1.3px] text-club-600">
          {eyebrow}
        </span>
        <h1 className="mb-1.5 font-display text-[clamp(27px,3vw,35px)] leading-[1.14] tracking-[-1.1px] text-club-950">
          {title}
        </h1>
        <p className="m-0 text-sm text-[#6e7c74]">{description}</p>
      </div>
      {actions && <div className="shrink-0 max-[480px]:w-full">{actions}</div>}
    </header>
  );
}
