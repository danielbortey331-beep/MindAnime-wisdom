# Project memory

## Product intent & audience

- MindAnime Wisdom Platform: web app delivering curated daily expert insights, a motivational quote engine, and structured reflection prompts.
- Target audience: users seeking self-improvement / motivational content in a premium editorial format.
- Content model includes posts with: title, excerpt, author, readTime, category, imageUrl; some posts are premium (gated, lock icon).
- Engagement features: voting and comment counts on post cards.

## Brand personality & voice

- Premium, editorial, contemplative tone.
- Content framed as "wisdom" — calm and authoritative rather than hype-driven.

## Visual design & UX direction

- Dark mode editorial aesthetic; zinc-based dark palette (zinc-950 / zinc-800 / zinc-700) with amber accent for category badges (amber-950/amber-800).
- Cards: rounded-2xl, border, shadow-2xl, subtle hover scale + border highlight, active scale.
- Post card image area: aspect-video, object-cover, gradient overlay (top-to-bottom zinc fade) for legibility.
- Image loading pattern: opacity fade-in on load; branded gradient placeholder while loading or on error showing "Wisdom on: {title}"; fallback to `/default-wisdom-cover.webp` when imageUrl empty.
- Typography: bold titles, zinc-50; excerpts zinc-400 with line-clamp-2; meta text zinc-500.
- Components observed in app (current working version): PostCard with vote button, comment count, premium lock icon — differs from pasted reference snippet.
- Stack: Vite + React (JSX), Tailwind CSS, Lucide React icons, `@/` path alias to `src/`.

## Decisions, constraints & rationale

- `.bolt/prompt` is authoritative; not duplicated here.
- Use lucide-react for icons; avoid extra UI packages unless requested.
- Image resilience matters: implement error + loading states with branded gradient fallback; don't leave blank image areas.
- Preserve current working PostCard behavior (voting, comments, premium lock) when modifying card design.

## Open questions & assumptions

- Unclear whether the pasted PostCard should replace the current one or only inform specific fixes (image loading/fallback).
- Assumed existing project has `Post` type and current PostCard with vote/comment/premium features; verify before replacing.
- Default fallback image `/default-wisdom-cover.webp` assumed to exist or needs to be added.
- No confirmation yet on exact card design direction going forward.