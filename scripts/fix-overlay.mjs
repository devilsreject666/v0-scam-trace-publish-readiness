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
  
  // Try listing top-level items in overlay node_modules
  try {
    const items = readdirSync(overlayNodeModules).filter(f => !f.startsWith('.')).slice(0, 30);
    console.log('[v0] overlay node_modules contents (first 30):', items.join(', '));
  } catch (e) {
    console.log('[v0] Could not read overlay node_modules:', e.message);
  }

  // Try to install tailwindcss directly in the overlay
  if (!existsSync(tailwindPath)) {
    console.log('[v0] Attempting to install tailwindcss in overlay...');
    try {
      execSync('cd /vercel/share/v0-next-shadcn && pnpm add tailwindcss@4.1.17 2>&1', { encoding: 'utf8', timeout: 30000 });
      console.log('[v0] Successfully installed tailwindcss in overlay');
    } catch (e) {
      console.log('[v0] pnpm install failed:', e.message?.slice(0, 500));
      
      // Fallback: try npm
      try {
        execSync('cd /vercel/share/v0-next-shadcn && npm install tailwindcss@4.1.17 --no-save 2>&1', { encoding: 'utf8', timeout: 30000 });
        console.log('[v0] Successfully installed via npm');
      } catch (e2) {
        console.log('[v0] npm install also failed:', e2.message?.slice(0, 500));
        
        // Fallback: try symlink from our project
        const ourTailwind = '/vercel/share/v0-project/node_modules/tailwindcss';
        console.log('[v0] Our tailwindcss exists:', existsSync(ourTailwind));
        
        if (existsSync(ourTailwind)) {
          try {
            symlinkSync(ourTailwind, tailwindPath, 'dir');
            console.log('[v0] Created symlink successfully');
          } catch (e3) {
            console.log('[v0] Symlink failed:', e3.message);
          }
        }
      }
    }
  }
} else {
  console.log('[v0] overlay node_modules does not exist');
  // Check what exists in the overlay dir
  try {
    const items = readdirSync(overlayDir);
    console.log('[v0] overlay dir contents:', items.join(', '));
  } catch (e) {
    console.log('[v0] Could not read overlay dir:', e.message);
  }
}
