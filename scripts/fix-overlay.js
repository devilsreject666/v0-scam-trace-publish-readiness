import { execSync } from 'child_process';
import { existsSync, mkdirSync, symlinkSync, readdirSync } from 'fs';
import { join } from 'path';

const overlayDir = '/vercel/share/v0-next-shadcn';
const overlayNodeModules = join(overlayDir, 'node_modules');

console.log('[v0] Checking overlay directory...');
console.log('[v0] overlayDir exists:', existsSync(overlayDir));
console.log('[v0] overlayNodeModules exists:', existsSync(overlayNodeModules));

if (existsSync(overlayNodeModules)) {
  const tailwindPath = join(overlayNodeModules, 'tailwindcss');
  console.log('[v0] tailwindcss exists in overlay:', existsSync(tailwindPath));

  try {
    const items = readdirSync(overlayNodeModules).filter(f => !f.startsWith('.')).slice(0, 30);
    console.log('[v0] overlay node_modules contents (first 30):', items.join(', '));
  } catch (e) {
    console.log('[v0] Could not read overlay node_modules:', e.message);
  }

  if (!existsSync(tailwindPath)) {
    console.log('[v0] Attempting to install tailwindcss in overlay...');

    // Try pnpm
    try {
      const out = execSync('cd /vercel/share/v0-next-shadcn && pnpm add tailwindcss@4.1.17 2>&1', { encoding: 'utf8', timeout: 30000 });
      console.log('[v0] pnpm result:', out.slice(0, 300));
    } catch (e) {
      console.log('[v0] pnpm failed:', e.message?.slice(0, 300));

      // Try npm
      try {
        const out2 = execSync('cd /vercel/share/v0-next-shadcn && npm install tailwindcss@4.1.17 --no-save 2>&1', { encoding: 'utf8', timeout: 30000 });
        console.log('[v0] npm result:', out2.slice(0, 300));
      } catch (e2) {
        console.log('[v0] npm failed:', e2.message?.slice(0, 300));

        // Symlink fallback
        const ourTailwind = '/vercel/share/v0-project/node_modules/tailwindcss';
        const ourTailwindPnpm = '/vercel/share/v0-project/node_modules/.pnpm/tailwindcss@3.4.17/node_modules/tailwindcss';
        const source = existsSync(ourTailwind) ? ourTailwind : existsSync(ourTailwindPnpm) ? ourTailwindPnpm : null;
        console.log('[v0] Our tailwindcss at default:', existsSync(ourTailwind));
        console.log('[v0] Our tailwindcss at pnpm:', existsSync(ourTailwindPnpm));

        if (source) {
          try {
            symlinkSync(source, tailwindPath, 'dir');
            console.log('[v0] Created symlink from', source, 'to', tailwindPath);
          } catch (e3) {
            console.log('[v0] Symlink failed:', e3.message);
          }
        } else {
          // List our node_modules to find tailwindcss
          try {
            const ourItems = readdirSync('/vercel/share/v0-project/node_modules').filter(f => f.includes('tailwind'));
            console.log('[v0] tailwind-related in our node_modules:', ourItems.join(', '));
          } catch (e4) {
            console.log('[v0] Could not read our node_modules:', e4.message);
          }
        }
      }
    }
  } else {
    console.log('[v0] tailwindcss already exists in overlay - no fix needed');
  }
} else {
  console.log('[v0] overlay node_modules does not exist');
  try {
    const items = readdirSync(overlayDir);
    console.log('[v0] overlay dir contents:', items.join(', '));
  } catch (e) {
    console.log('[v0] Could not read overlay dir:', e.message);
  }
}
