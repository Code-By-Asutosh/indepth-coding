# CLAUDE.md — Indepth Coding

## What this project is

**Indepth Coding** — a static, backend-less learning site that teaches Java + full-stack
engineering in a compressed, story-driven, highly retentive way, plus an AI-powered mock
assessment generator ("prove you understand it, not just remember it"). Built by a
developer with Java/Angular full-stack experience aiming for expert ("GOAT") level — and
helping the wider community get there too.

Two products in one repo:

1. **Learn** (`/learn/:categoryId`) — hand-written concept pages following a fixed
   10-stage learning framework (see "Content authoring" below).
2. **Practice** (`/practice`) — AI-generated mock assessments: topic in → mixed-format
   questions out → answers evaluated by AI with per-question feedback.

Core philosophy (never violate it): **"Simple, but simple that covers a lot."**
Never dumb a concept down — compress it. Same coverage, zero wasted words.
A page should be readable in ~3 minutes yet let the reader defend the concept in an
interview or design review.

## Commands

```bash
npm start            # ng serve — dev server
npm run build        # production build
npm test             # Vitest via ng test
```

- **Deploy (site):** GitHub Actions → GitHub Pages
  (`code-by-asutosh.github.io/indepth-coding/`), workflow in `.github/workflows/deploy.yml`.
- **Deploy (AI proxy):** separate Cloudflare Worker under `ai-proxy/` — deploy with
  `wrangler` from that directory; local secrets live in `ai-proxy/.dev.vars`.

## Tech stack & conventions

- **Angular 22** — standalone components, signals, new `@angular/build`. No NgModules.
- TypeScript strict; avoid `any`. Tailwind CSS 4 (PostCSS). Prism.js for code
  highlighting, Mermaid for diagrams, RxJS where reactive streams genuinely help.
- **Plain `fetch`, not HttpClient.**
- Match existing file style when editing data files (double-quoted strings,
  UPPER_SNAKE export names).
- Handle loading / empty / error / success states. Responsive + keyboard accessible.
- Treat all AI responses as untrusted external data — validate shape before rendering;
  never crash the UI on malformed model output.

## Architecture map

```
src/app/
├── core/
│   ├── models/content.model.ts      # Category → Topic → Concept content model
│   ├── data/categories.data.ts      # All 19 categories/topics/concept summaries (nav tree)
│   ├── data/concepts/               # Written concept pages (*.ts, one per concept)
│   │   └── index.ts                 # WRITTEN_CONCEPTS registry — every written page registers here
│   ├── services/                    # ai-assistant.service.ts (streaming chat), active-page-context
│   └── utils/
├── features/
│   ├── landing/                     # Home
│   ├── learn/                       # category-dashboard, category-overview, concept-page
│   └── practice/                    # practice-home, practice-assessment, practice-results
│       └── services/assessment-api.service.ts
└── shared/components/               # ai-help-fab, category-card, code-block, diagram

ai-proxy/                            # Cloudflare Worker (separate deployable)
└── src/worker.ts                    # POST /ask (streaming chat), /assessment/generate, /assessment/evaluate
```

- Routes: `/` landing · `/learn/:categoryId` · `/practice`.
- `environment.ts` / `environment.prod.ts` hold `aiProxyUrl`
  (`https://indepth-coding-ai-proxy.code-by-asutosh.workers.dev`).

## Content model

`Category → Topic → Concept` ([content.model.ts](src/app/core/models/content.model.ts)):

- `ConceptSummary` — nav metadata only (id, title, importance core/important/optional,
  interview frequency high/medium/low). Exists even before content is written.
- `TopicType` — decided BEFORE writing; each lens changes the explanation:
  `concept | framework | data-structure | algorithm | runtime-internals | system-architecture`.
- `ConceptContent` — the full page: `simpleIntuition`, `formalMeaning`, `whyItExists`,
  `howItWorksInternally[]`, optional `diagrams[]` (Mermaid) + `codeExamples[]`,
  `mainComponents[]`, `realWorldExamples[]`, `complexityAndTradeoffs[]`,
  `commonMistakes[]`, `interviewPerspective`, `triggerSentence`,
  optional `prerequisites[]` / `relatedConcepts[]` (with `note` explaining WHY linked).
- The page UI never labels these as "stages" — they read as natural learning material.

### Adding a new concept (the most common task)

1. If not present, add its `ConceptSummary` to the right Topic in
   [categories.data.ts](src/app/core/data/categories.data.ts).
2. Create `src/app/core/data/concepts/<concept-id>.ts` exporting
   `export const CONCEPT_ID_UPPER_SNAKE: ConceptContent = { ... }`.
3. Import and register it in the `WRITTEN_CONCEPTS` array in
   [concepts/index.ts](src/app/core/data/concepts/index.ts).

Reference exemplar of the house style: [exception-handling.ts](src/app/core/data/concepts/exception-handling.ts).

### Interview Prep track (`/learn/interview-prep`, first category)

A dedicated interview-preparation war-room built for the owner's Deloitte SE II
(Java microservices + AWS) preparation — also usable by site visitors. Rules that
keep it coherent:

- **One storyline:** ShopSphere (characters Asutosh & Riya) grows from laptop app →
  monolith → microservices → Docker+ECS on AWS across EVERY lesson. Anchor all
  analogies to it.
- **Extra optional ConceptContent fields:** `scenarioDrills[]` (situation/question/
  model answer, rendered as self-quiz toggles) and `rapidFire[]` (one-breath spoken
  definitional answers for AI/bot screening rounds). Prep lessons should include both.
- **Answer-shape doctrine:** model answers follow requirement → structure/choice →
  complexity/trade-off → escalation path.
- Simple English, short sentences; every lesson ends with a trigger sentence.
- Written so far: `strategy` + full `collections-mastery` module. The rest of the
  curriculum in categories.data.ts is roadmap (coming-soon) — write incrementally,
  keeping concept ids exactly as generated by `c(title)` there.

## Content authoring style (Story Narration Doctrine)

Every concept page follows the **Story Narration Doctrine**, modeled on Asutosh's Medium series (*Building ShopSphere*):

- **Master Guide**: See [STORY_NARRATION_STYLE_GUIDE.md](STORY_NARRATION_STYLE_GUIDE.md) and [ARTICLE_AUTHORING_CONTEXT.md](ARTICLE_AUTHORING_CONTEXT.md) for full rules, character arcs, visual diagram specs, step-player requirements, and authoring checklists.
- **Unified Universe**: All lessons attach to the continuous story of **ShopSphere** (characters **Asutosh**, **Sushil**, and **Riya** scaling an e-commerce platform from laptop monolith → microservices → AWS).
- **Core Philosophy**: **"Simple, but simple that covers a lot."** Compress, never dilute. Readable in ~3–5 minutes.
- **Deep Technical Rigor**: Every sub-component of a topic must have dedicated runnable code snippets (4–6 per lesson) and 2–4 native diagrams (`flow`, `hub`, `split`, `stack`).
- **Flow Structure**:
  1. **Continuation Opening (`Picking up where we left off`)**: Relatable scene/dilemma in ShopSphere. Never open cold with definitions.
  2. **Story Chapters (`h2.ch`)**: Numbered narrative headings (e.g. `01 The gift-card bug`, `02 Walking from both ends`). Mini-stories where the concept is the hero solving the dilemma.
  3. **Embedded Code Snippets**: Full runnable snippets with domain entities woven right into the story.
  4. **Memory Hook (`.hook`)**: 1 punchy invariant line with `⌘` icon.
  5. **Visual Simulation (`▶ Watch it run`)**: Embedded interactive step-player animation (`stepPlayer`) with synced code lines and playback controls.
  6. **Honest Trade-offs**: Spoken frankly within prose (*"One honest cost worth knowing..."*), not in an isolated box.
  7. **Synthesis Finale ("Put Together" Recap)**: Terminal summary box resolving the story + next-up teaser.
  8. **War Room Appendix (After the story)**: `rapidFire` (1-breath spoken definitions) + `scenarioDrills` (interview war games).

## Practice feature (AI assessments)

Spec lives in `AI_Mock_Assessment_Platform_Master_Context.md` — read before changing
assessment generation/evaluation logic. Key points: mixed question types (mcq, output,
debug, scenario, tradeoff, coding, cross-topic) driven by structured JSON schemas
(`ASSESSMENT_SCHEMA`, `EVALUATION_SCHEMA` in worker.ts); evaluate reasoning, never
keyword-match; partial credit via correct/partially_correct/incorrect; generation must
be topic-specific, non-repetitive, and hallucination-free (no invented APIs/behavior).

## Security rules (hard requirements)

- NEVER embed API keys/secrets in the frontend bundle — the site is public static.
  All provider calls go through the Cloudflare Worker proxy which holds secrets server-side.
- `.claude/settings.local.json` and `ai-proxy/.dev.vars` are gitignored — keep them that way.
- Never commit credentials of any kind.

## Deeper context docs (read when relevant)

- `goat-java-project-context.md` — product vision, full 26-section content roadmap,
  psychology behind the 10-stage flow.
- `AI_Mock_Assessment_Platform_Master_Context.md` — complete practice-feature spec.
