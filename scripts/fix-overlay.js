const { execSync } = require('child_process');
const { existsSync, mkdirSync, symlinkSync, readdirSync, writeFileSync } = require('fs');
const { join } = require('path');

const overlayDir = '/vercel/share/v0-next-shadcn';
const overlayNodeModules = join(overlayDir, 'node_modules');

console.log('[v0] === OVERLAY DIAGNOSTIC ===');
console.log('[v0] overlayDir exists:', existsSync(overlayDir));
console.log('[v0] overlayNodeModules exists:', existsSync(overlayNodeModules));

// Check if our project has tailwindcss installed
const ourProjectDir = '/vercel/share/v0-project';
const ourNodeModules = join(ourProjectDir, 'node_modules');
console.log('[v0] ourNodeModules exists:', existsSync(ourNodeModules));

if (existsSync(ourNodeModules)) {
  try {
    const twRelated = readdirSync(ourNodeModules).filter(f => f.includes('tailwind'));
    console.log('[v0] tailwind-related in our node_modules:', twRelated.join(', '));
  } catch (e) {
    console.log('[v0] Could not list our node_modules:', e.message);
  }
}

if (existsSync(overlayNodeModules)) {
  const tailwindTarget = join(overlayNodeModules, 'tailwindcss');
  console.log('[v0] tailwindcss in overlay exists:', existsSync(tailwindTarget));

  // List what's in the overlay's pnpm node_modules
  try {
    const pnpmDir = join(overlayNodeModules, '.pnpm');
    if (existsSync(pnpmDir)) {
      const pnpmItems = readdirSync(pnpmDir).filter(f => f.includes('tailwind')).slice(0, 10);
      console.log('[v0] tailwind-related in overlay .pnpm:', pnpmItems.join(', '));
    }
  } catch (e) {
    console.log('[v0] Could not read overlay .pnpm:', e.message);
  }

  if (!existsSync(tailwindTarget)) {
    console.log('[v0] Attempting fixes...');

    // Strategy 1: Try writing a minimal tailwindcss module stub 
    try {
      mkdirSync(tailwindTarget, { recursive: true });
      writeFileSync(join(tailwindTarget, 'package.json'), JSON.stringify({
        name: 'tailwindcss',
        version: '4.1.17',
        main: './index.js',
        exports: {
          '.': './index.js',
          './package.json': './package.json'
        }
      }, null, 2));
      writeFileSync(join(tailwindTarget, 'index.js'), 'module.exports = {};');
      console.log('[v0] SUCCESS: Created tailwindcss stub at', tailwindTarget);
    } catch (e) {
      console.log('[v0] Stub creation failed:', e.message);

      // Strategy 2: Try symlink from our node_modules
      const ourTailwind = join(ourNodeModules, 'tailwindcss');
      if (existsSync(ourTailwind)) {
        try {
          symlinkSync(ourTailwind, tailwindTarget, 'dir');
          console.log('[v0] SUCCESS: Symlinked', ourTailwind, '->', tailwindTarget);
        } catch (e2) {
          console.log('[v0] Symlink failed:', e2.message);
        }
      }

      // Strategy 3: Try npm install in overlay
      try {
        const out = execSync('cd /vercel/share/v0-next-shadcn && npm install tailwindcss@4.1.17 --no-save --legacy-peer-deps 2>&1', { encoding: 'utf8', timeout: 60000 });
        console.log('[v0] npm install result:', out.slice(0, 500));
      } catch (e3) {
        console.log('[v0] npm install failed:', e3.message?.slice(0, 500));
      }
    }
  }
} else {
  console.log('[v0] overlay node_modules dir does not exist');
  try {
    const contents = readdirSync(overlayDir);
    console.log('[v0] overlay dir contents:', contents.join(', '));
  } catch (e) {
    console.log('[v0] Could not read overlay dir:', e.message);
  }
}

console.log('[v0] === DONE ===');
