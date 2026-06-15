import { CarFront } from "lucide-react";

type EmptyStateProps = {
  title: string;
  description: string;
};

export function EmptyState({ title, description }: EmptyStateProps) {
  return (
    <div className="grid min-h-[310px] place-content-center justify-items-center text-center text-[#6e7c74]">
      <span className="mb-[13px] grid h-[51px] w-[51px] place-items-center rounded-[13px] bg-club-100 text-club-600">
        <CarFront size={25} />
      </span>
      <h3 className="mb-1.5 font-display text-[15px] text-[#334138]">{title}</h3>
      <p className="m-0 max-w-[330px] text-[11px]">{description}</p>
    </div>
  );
}
