#!/usr/bin/env node

/**
 * Build Script for Cloudflare Pages
 * Ensures proper file generation and SPA routing setup
 */

import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

console.log('🔧 Building ADHD Learning RPG for Cloudflare Pages...');
console.log('=========================================================');

try {
  // 1. Clean and build
  console.log('1. Building with Vite...');
  execSync('npm run build', { stdio: 'inherit' });

  // 2. Ensure _redirects file exists in dist
  const distRedirectsPath = path.join(__dirname, 'dist', '_redirects');
  const publicRedirectsPath = path.join(__dirname, 'public', '_redirects');
  
  if (!fs.existsSync(distRedirectsPath)) {
    console.log('2. Copying _redirects file...');
    if (fs.existsSync(publicRedirectsPath)) {
      fs.copyFileSync(publicRedirectsPath, distRedirectsPath);
    } else {
      // Create default _redirects
      const defaultRedirects = `# Cloudflare Pages redirects for SPA
/api/* /api/:splat 200
/* /index.html 200
`;
      fs.writeFileSync(distRedirectsPath, defaultRedirects);
    }
    console.log('   ✅ _redirects file created');
  } else {
    console.log('2. ✅ _redirects file already exists');
  }

  // 3. Ensure _headers file exists in dist
  const distHeadersPath = path.join(__dirname, 'dist', '_headers');
  const publicHeadersPath = path.join(__dirname, 'public', '_headers');
  
  if (!fs.existsSync(distHeadersPath)) {
    console.log('3. Copying _headers file...');
    if (fs.existsSync(publicHeadersPath)) {
      fs.copyFileSync(publicHeadersPath, distHeadersPath);
    }
    console.log('   ✅ _headers file created');
  } else {
    console.log('3. ✅ _headers file already exists');
  }

  // 4. Check build output
  console.log('4. Checking build output...');
  const distPath = path.join(__dirname, 'dist');
  const files = fs.readdirSync(distPath);
  
  const requiredFiles = ['index.html', '_redirects', '_headers'];
  const missingFiles = requiredFiles.filter(file => !files.includes(file));
  
  if (missingFiles.length > 0) {
    console.log(`   ⚠️  Missing files: ${missingFiles.join(', ')}`);
  } else {
    console.log('   ✅ All required files present');
  }

  console.log('\n🎉 Build completed successfully!');
  console.log('\nNext steps:');
  console.log('1. Deploy: npm run cf:deploy');
  console.log('2. Or preview: npm run preview');

} catch (error) {
  console.error('❌ Build failed:', error.message);
  process.exit(1);
}
