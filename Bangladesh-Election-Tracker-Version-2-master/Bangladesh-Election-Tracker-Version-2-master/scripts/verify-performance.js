#!/usr/bin/env node

/**
 * Performance Verification Script
 * 
 * Checks that all performance optimizations are in place
 * Run with: node scripts/verify-performance.js
 */

const fs = require('fs');
const path = require('path');

const checks = [];
let passed = 0;
let failed = 0;

function check(name, condition, recommendation) {
  checks.push({ name, passed: condition, recommendation });
  if (condition) {
    passed++;
    console.log(`✅ ${name}`);
  } else {
    failed++;
    console.log(`❌ ${name}`);
    if (recommendation) {
      console.log(`   → ${recommendation}`);
    }
  }
}

console.log('\n🔍 Verifying Performance Optimizations...\n');

// Check 1: Next.config.js has bundle analyzer
const nextConfig = fs.readFileSync(path.join(__dirname, '../next.config.js'), 'utf-8');
check(
  'Bundle analyzer configured',
  nextConfig.includes('@next/bundle-analyzer'),
  'Install @next/bundle-analyzer'
);

// Check 2: Analytics uses lazyOnload
const layout = fs.readFileSync(path.join(__dirname, '../app/layout.tsx'), 'utf-8');
check(
  'Analytics uses lazyOnload strategy',
  layout.includes('strategy="lazyOnload"'),
  'Change Google Analytics to lazyOnload in app/layout.tsx'
);

// Check 3: Dynamic imports on home page
const homePage = fs.readFileSync(path.join(__dirname, '../app/page.tsx'), 'utf-8');
check(
  'Home page uses dynamic imports',
  homePage.includes('dynamic(() => import') && homePage.includes('@/components/Header'),
  'Add dynamic imports to app/page.tsx'
);

// Check 4: React.memo in components
try {
  const seatCounter = fs.readFileSync(path.join(__dirname, '../components/SeatCounter.tsx'), 'utf-8');
  check(
    'Components use React.memo',
    seatCounter.includes('memo('),
    'Add React.memo to performance-critical components'
  );
} catch (e) {
  check('Components use React.memo', false, 'Component files not found');
}

// Check 5: Cache duration increased
const firestore = fs.readFileSync(path.join(__dirname, '../lib/firestore.ts'), 'utf-8');
check(
  'Cache duration is optimized',
  firestore.includes('CACHE_DURATION = 300000') || firestore.includes('CACHE_DURATION = 5'),
  'Increase CACHE_DURATION in lib/firestore.ts'
);

// Check 6: ISR configured
const newsPage = fs.readFileSync(path.join(__dirname, '../app/news/page.tsx'), 'utf-8');
check(
  'ISR configured for news page',
  newsPage.includes('export const revalidate'),
  'Add revalidate export to news page'
);

// Check 7: Mammoth package removed
const packageJson = JSON.parse(fs.readFileSync(path.join(__dirname, '../package.json'), 'utf-8'));
check(
  'Unused packages removed (mammoth)',
  !packageJson.dependencies.mammoth,
  'Remove unused mammoth package: npm uninstall mammoth'
);

// Check 8: SWC minification enabled
check(
  'SWC minification enabled',
  nextConfig.includes('swcMinify: true'),
  'Enable swcMinify in next.config.js'
);

// Check 9: Image optimization configured
check(
  'Image optimization configured',
  nextConfig.includes("formats: ['image/avif', 'image/webp']"),
  'Configure image formats in next.config.js'
);

// Check 10: DNS prefetch configured
check(
  'DNS prefetch configured',
  layout.includes('rel="dns-prefetch"') && layout.includes('rel="preconnect"'),
  'Add DNS prefetch and preconnect to layout.tsx'
);

console.log('\n' + '='.repeat(50));
console.log(`✅ Passed: ${passed}/${checks.length}`);
console.log(`❌ Failed: ${failed}/${checks.length}`);
console.log('='.repeat(50) + '\n');

if (failed > 0) {
  console.log('⚠️  Some optimizations are missing. Please review the recommendations above.\n');
  process.exit(1);
} else {
  console.log('🎉 All performance optimizations are in place!\n');
  console.log('Next steps:');
  console.log('  1. Run: npm run build');
  console.log('  2. Run: npm run analyze (to check bundle sizes)');
  console.log('  3. Test with Lighthouse in production mode\n');
  process.exit(0);
}
