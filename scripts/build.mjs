import { mkdir, copyFile } from 'node:fs/promises';
const root = new URL('../', import.meta.url);
const files = ['index.html', 'src/styles.css', 'src/calculator.js', 'src/format.js', 'src/app.js'];
await mkdir(new URL('dist/src/', root), { recursive: true });
for (const file of files) await copyFile(new URL(file, root), new URL(`dist/${file}`, root));
console.log(`Build listo: ${files.length} archivos en dist/.`);
