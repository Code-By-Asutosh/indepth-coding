/** Converts a title into a URL/id-safe slug, e.g. "JVM Internals" -> "jvm-internals". */
export function slugify(value: string): string {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}
