// Prepares dist/ for GitHub Pages.
// --spa: also serve index.html for unknown paths, so client-side routes work after a refresh.
import { copyFileSync, writeFileSync } from 'node:fs';

writeFileSync('dist/.nojekyll', '');
if (process.argv.includes('--spa')) copyFileSync('dist/index.html', 'dist/404.html');
