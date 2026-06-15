import { ClubHubMark } from "./ClubHubMark";

type BrandProps = {
  compact?: boolean;
};

export function Brand({ compact = false }: BrandProps) {
  return (
    <div className="flex items-center gap-3 px-2.5">
      <ClubHubMark />
      {!compact && (
        <div>
          <strong className="block font-display text-[19px] tracking-[-0.4px] text-white">
            ClubHub
          </strong>
          <span className="mt-px block text-[11px] text-[#8fa399]">
            Gestão desportiva
          </span>
        </div>
      )}
    </div>
  );
}
