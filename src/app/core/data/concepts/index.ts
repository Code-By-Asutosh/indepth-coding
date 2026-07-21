import { ConceptContent } from '../../models/content.model';
import { N_PLUS_ONE_PROBLEM } from './n-plus-one-problem';

/** Every concept that has real 10-stage written content so far. */
const WRITTEN_CONCEPTS: ConceptContent[] = [N_PLUS_ONE_PROBLEM];

function contentKey(categoryId: string, topicId: string, conceptId: string): string {
  return `${categoryId}/${topicId}/${conceptId}`;
}

const CONTENT_BY_KEY = new Map<string, ConceptContent>(
  WRITTEN_CONCEPTS.map((content) => [contentKey(content.categoryId, content.topicId, content.conceptId), content])
);

/** Looks up written 10-stage content for a concept, or undefined if not written yet. */
export function findConceptContent(categoryId: string, topicId: string, conceptId: string): ConceptContent | undefined {
  return CONTENT_BY_KEY.get(contentKey(categoryId, topicId, conceptId));
}
