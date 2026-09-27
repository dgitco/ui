# DGit UI

개인 프로젝트들이 같이 쓰는 UI 킷. shadcn 레지스트리(`@dgit`)라서, 각 프로젝트가 필요한 항목을 **소스로 복사해 가서** 고쳐 쓴다. 사이트: https://ui.dgit.co (미리보기, 설치 명령, 소스)

## 구조

| 경로 | 내용 |
|---|---|
| `registry/dgit/` | 킷 원본. `styles/dgit.css`(테마), `lib/theme.ts`, `ui/*`(컴포넌트), `blocks/*`(화면 단위) |
| `registry.json` | 항목 목록. `bun run registry`가 `public/r/<항목>.json`으로 빌드 |
| `skills/dgit-ui/SKILL.md` | 에이전트용 스킬. 빌드 때 `public/skill.md`로 복사되어 사이트에서 받을 수 있다 |
| `src/` | 쇼케이스 사이트 (Vite + React + Tailwind v4). 미리보기는 `registry/` 원본을 그대로 쓴다 |
| `worker/` | `/r/*`에서만 도는 워커. 레지스트리 요청 수를 날짜·항목별로 센다. 숫자는 비공개이고 사이트에는 안 나온다 |

## 프로젝트에서 쓰기

```json
// components.json
"registries": { "@dgit": "https://ui.dgit.co/r/{name}.json" }
```

```sh
npx shadcn add @dgit/theme @dgit/use-theme @dgit/account-menu @dgit/app-header
```

메인 CSS에서 Tailwind 다음에 `@import "./dgit.css";`, `<head>`에 `themeScript`(`lib/theme`)를 인라인으로 넣는다. 자세한 건 사이트의 Docs.

## 에이전트 스킬

`skills/dgit-ui/SKILL.md`를 각 도구의 스킬 폴더에 `dgit-ui/SKILL.md`로 두면 Claude Code, Codex, Cursor가 UI를 만들 때 이 킷을 쓴다. 0bridge를 쓰면 `0b`가 모든 도구에 맞춰 준다.

## 개발

```sh
bun install
bun run registry   # public/r, public/skill.md
bun run dev        # http://localhost:5173
bun run build      # 레지스트리 + 타입 검사 + 사이트
bun run deploy     # Cloudflare (DGit 계정, ui.dgit.co). `0b profile use dgit`가 걸려 있어야 한다
```

원본 import는 받는 프로젝트에서의 경로로 쓴다: `@/lib/utils`, `@/registry/dgit/ui/…`. `shadcn add`가 받는 쪽 별칭(`~/components/ui/…` 등)으로 바꿔 준다. 킷이 `utils`를 다시 받지 않도록 `registryDependencies`에 `utils`를 넣지 않는다(shadcn 최신 `utils`가 기존 `cn`을 바꿔 버린다).

## 출처

로그인 화면과 상단 바는 0bridge에서, 메뉴·계정 메뉴·회색 단계는 Geist(Vercel 대시보드) 스타일을 실측해 다시 만들었다. 아이콘은 lucide, 글꼴은 Geist(SIL OFL).

## 라이선스

MIT. 글꼴 Geist는 SIL OFL.
