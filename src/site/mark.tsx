// DGit 심볼 (Pills Dome). 원본: github.com/dgitco/brand svg/mark.svg
export function DGitMark({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 64 64" className={className} aria-hidden="true">
      <g fill="currentColor">
        <rect x="2.18" y="41.50" width="59.65" height="6.5" rx="3.25" />
        <rect x="4.40" y="33.00" width="55.21" height="6.5" rx="3.25" />
        <rect x="9.87" y="24.50" width="44.27" height="6.5" rx="3.25" />
        <rect x="23.43" y="16.00" width="17.14" height="6.5" rx="3.25" />
      </g>
    </svg>
  );
}

/** 앱 헤더·로그인 화면 brand 자리용: 둥근 사각 칩 안의 심볼 */
export function DGitChip() {
  return (
    <span className="grid size-7 place-content-center rounded-lg bg-foreground text-background">
      <DGitMark className="size-[18px]" />
    </span>
  );
}
