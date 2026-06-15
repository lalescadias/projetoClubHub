export function LoadingState() {
  return (
    <div
      className="grid min-h-[310px] grid-flow-col place-content-center items-center gap-2.5 text-xs text-[#6e7c74]"
      role="status"
    >
      <span className="h-[19px] w-[19px] animate-spin rounded-full border-2 border-[#dbe3dd] border-t-club-600" />
      <span>A carregar dados...</span>
    </div>
  );
}
