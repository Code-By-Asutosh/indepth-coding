import Prism from 'prismjs';

/**
 * PrismJS's language "components" files (prism-java.js, prism-sql.js, etc.)
 * are legacy scripts that expect a bare global `Prism` variable to already
 * exist - they don't import the core themselves, they just assume it was
 * already loaded via a <script> tag before them. That assumption breaks
 * under Angular's production esbuild bundling: it works fine in `ng serve`
 * (dev build), but fails after a real production build with
 * "Uncaught ReferenceError: Prism is not defined", because esbuild's CJS
 * interop for the core module doesn't reliably expose it as a true global
 * the same way. Explicitly assigning it to `globalThis` ourselves, before
 * any language component is imported, fixes this regardless of bundler
 * quirks.
 *
 * Every component that needs Prism should import it from here (not
 * directly from 'prismjs'), so this setup only ever runs once.
 */
(globalThis as unknown as { Prism: typeof Prism }).Prism = Prism;

import 'prismjs/components/prism-clike';
import 'prismjs/components/prism-java';
import 'prismjs/components/prism-bash';
import 'prismjs/components/prism-sql';
import 'prismjs/components/prism-json';
import 'prismjs/components/prism-typescript';

export default Prism;
