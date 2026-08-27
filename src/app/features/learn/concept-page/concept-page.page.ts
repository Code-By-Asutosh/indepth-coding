import {
  Component,
  DestroyRef,
  ElementRef,
  OnDestroy,
  computed,
  effect,
  inject,
  input,
  signal,
  viewChildren
} from '@angular/core';
import { RouterLink } from '@angular/router';
import { findCategory, findConcept, findTopic, flattenCategoryConcepts } from '../../../core/data/categories.data';
import { findConceptContent } from '../../../core/data/concepts';
import { LearningStore } from '../../../core/services/learning-store.service';
import { ActivePageContextService } from '../../../core/services/active-page-context.service';
import { PrevNextNav, PrevNextTarget } from '../../../shared/components/prev-next-nav/prev-next-nav';
import { CodeBlock } from '../../../shared/components/code-block/code-block';
import { DiagramView } from '../../../shared/components/diagrams/diagram-view/diagram-view';
import { StepPlayer } from '../../../shared/components/step-player/step-player';

interface TocEntry {
  id: string;
  label: string;
}

/** Fixed section order mirrors the story-driven learning flow + war-room appendix. */
const ALL_SECTIONS: (TocEntry & { present: 'always' | 'diagrams' | 'code' | 'player' | 'warroom' | 'related' })[] = [
  { id: 'opening', label: 'picking up…', present: 'always' },
  { id: 'formal', label: 'formal meaning', present: 'always' },
  { id: 'mechanism', label: 'how it works', present: 'always' },
  { id: 'player', label: 'watch it run', present: 'player' },
  { id: 'code', label: 'code lab', present: 'code' },
  { id: 'components', label: 'rules & parts', present: 'always' },
  { id: 'wild', label: 'in the wild', present: 'always' },
  { id: 'tradeoffs', label: 'trade-offs', present: 'always' },
  { id: 'mistakes', label: 'the trap', present: 'always' },
  { id: 'warroom', label: 'war room', present: 'warroom' },
  { id: 'related', label: 'go deeper', present: 'related' }
];

@Component({
  selector: 'app-concept-page',
  imports: [PrevNextNav, RouterLink, CodeBlock, DiagramView, StepPlayer],
  templateUrl: './concept-page.page.html',
  styleUrl: './concept-page.page.scss'
})
export class ConceptPagePage implements OnDestroy {
  private readonly store = inject(LearningStore);
  private readonly activePageContext = inject(ActivePageContextService);

  readonly categoryId = input.required<string>();
  readonly topicId = input.required<string>();
  readonly conceptId = input.required<string>();

  protected readonly category = computed(() => findCategory(this.categoryId()));
  protected readonly topic = computed(() => findTopic(this.categoryId(), this.topicId()));
  protected readonly conceptSummary = computed(() => findConcept(this.categoryId(), this.topicId(), this.conceptId()));
  protected readonly content = computed(() => findConceptContent(this.categoryId(), this.topicId(), this.conceptId()));

  // ---- interactive state ---------------------------------------------------

  /** 0..1 vertical read position of the whole page. */
  protected readonly readProgress = signal(0);
  /** Id of the section currently in the reader's viewport (scroll-spy). */
  protected readonly activeSection = signal<string>('opening');
  /** One-shot completion celebration + XP toast. */
  protected readonly celebration = signal<{ xp: number; leveledUp: boolean } | null>(null);

  private readonly sectionEls = viewChildren<ElementRef<HTMLElement>>('sec');
  private sectionObserver?: IntersectionObserver;

  constructor() {
    // Keep the global AI helper aware of whichever concept is currently open.
    effect(() => this.activePageContext.setActiveConcept(this.content() ?? null));
    inject(DestroyRef).onDestroy(() => this.activePageContext.clear());

    const destroyRef = inject(DestroyRef);

    // Reading-progress bar: passive scroll math written straight into a signal.
    const onScroll = () => {
      const doc = document.documentElement;
      const scrollable = doc.scrollHeight - window.innerHeight;
      this.readProgress.set(scrollable > 0 ? Math.min(1, Math.max(0, window.scrollY / scrollable)) : 0);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
    destroyRef.onDestroy(() => window.removeEventListener('scroll', onScroll));

    // Scroll-spy: (re)observe whichever sections currently exist.
    effect(() => {
      const els = this.sectionEls().map((ref) => ref.nativeElement);
      if (typeof IntersectionObserver === 'undefined') return;
      this.sectionObserver?.disconnect();
      if (els.length === 0) return;
      this.sectionObserver = new IntersectionObserver(
        (entries) => {
          for (const entry of entries) {
            if (entry.isIntersecting) {
              this.activeSection.set((entry.target as HTMLElement).dataset['section'] ?? '');
            }
          }
        },
        { rootMargin: '-15% 0px -70% 0px' }
      );
      els.forEach((el) => this.sectionObserver!.observe(el));
      destroyRef.onDestroy(() => this.sectionObserver?.disconnect());
    });
  }

  // Sections actually renderable for this concept, numbered sequentially.
  protected readonly visibleSections = computed<TocEntry[]>(() => {
    const content = this.content();
    return ALL_SECTIONS.filter((entry) => {
      switch (entry.present) {
        case 'always':
          return !!content;
        case 'diagrams':
          return !!content?.diagrams?.some((d) => d.definition);
        case 'player':
          return !!content?.stepPlayer;
        case 'code':
          return !!content?.codeExamples?.length;
        case 'warroom':
          return !!(content?.scenarioDrills?.length || content?.rapidFire?.length || content?.interviewPerspective);
        case 'related':
          return !!content?.relatedConcepts?.length;
      }
    }).map(({ id, label }) => ({ id, label }));
  });

  protected sectionNo(id: string): string {
    if (id === 'opening') return '00';
    if (id === 'player' || id === 'code') return '▶';
    if (id === 'warroom') return '⚔';

    const numberedSections = this.visibleSections().filter(
      (s) => s.id !== 'opening' && s.id !== 'player' && s.id !== 'code' && s.id !== 'warroom'
    );
    const idx = numberedSections.findIndex((entry) => entry.id === id);
    if (idx === -1) return '01';
    return String(idx + 1).padStart(2, '0');
  }

  /** Zero-padded ordinal for template use (String isn't callable there). */
  protected pad2(n: number): string {
    return String(n + 1).padStart(2, '0');
  }

  protected readonly definedDiagrams = computed(() => (this.content()?.diagrams ?? []).filter((d) => d.definition));

  protected readonly isComplete = computed(() =>
    this.store.isComplete(this.categoryId(), this.topicId(), this.conceptId())
  );

  /** Splits "…doom… Fix: do this instead" into body + fix lines for the trap cards. */
  protected splitFix(mistake: string): { body: string; fix: string | null } {
    const marker = mistake.indexOf('Fix:');
    return marker === -1
      ? { body: mistake.trim(), fix: null }
      : { body: mistake.slice(0, marker).trim(), fix: mistake.slice(marker + 4).trim() };
  }

  protected readonly topicPosition = computed(() => {
    const concepts = this.topic()?.concepts ?? [];
    const index = concepts.findIndex((concept) => concept.id === this.conceptId());
    return { index: index + 1, total: concepts.length };
  });

  private readonly orderedConcepts = computed(() => flattenCategoryConcepts(this.categoryId()));

  protected readonly prevTarget = computed<PrevNextTarget | null>(() => {
    const list = this.orderedConcepts();
    const index = list.findIndex(({ topicId, concept }) => topicId === this.topicId() && concept.id === this.conceptId());
    if (index <= 0) return null;
    const prev = list[index - 1];
    return { title: prev.concept.title, link: ['/learn', this.categoryId(), prev.topicId, prev.concept.id] };
  });

  protected readonly nextTarget = computed<PrevNextTarget | null>(() => {
    const list = this.orderedConcepts();
    const index = list.findIndex(({ topicId, concept }) => topicId === this.topicId() && concept.id === this.conceptId());
    if (index === -1 || index >= list.length - 1) return null;
    const next = list[index + 1];
    return { title: next.concept.title, link: ['/learn', this.categoryId(), next.topicId, next.concept.id] };
  });

  /** Marks complete with an XP toast (+level-up callout); undo is instant and silent. */
  protected toggleComplete(): void {
    const wasLevel = this.store.level();
    this.store.toggleComplete(this.categoryId(), this.topicId(), this.conceptId());

    if (!this.isComplete()) {
      this.celebration.set(null);
      return;
    }

    const importance = this.conceptSummary()?.importance ?? 'important';
    const xpGain = importance === 'core' ? 100 : importance === 'important' ? 60 : 30;
    const nowLevel = this.store.level();
    this.celebration.set({ xp: xpGain, leveledUp: nowLevel.level > wasLevel.level });

    // Zoneless-safe auto-dismiss: timeout only writes signals.
    setTimeout(() => this.celebration.set(null), 2600);
  }

  ngOnDestroy(): void {
    this.sectionObserver?.disconnect();
  }
}
