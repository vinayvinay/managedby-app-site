const puppeteer = require('puppeteer');
const path = require('path');
const fs = require('fs');

async function smokeTest() {
  console.log('🧪 Running smoke test...');
  
  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();
  
  try {
    // Load the built HTML file
    const htmlPath = path.join(__dirname, 'build', 'index.html');
    
    if (!fs.existsSync(htmlPath)) {
      throw new Error('Build file not found: build/index.html');
    }
    
    await page.goto(`file://${htmlPath}`);
    
    // Test 1: Check page title
    const title = await page.title();
    if (!title.includes('managedby.app')) {
      throw new Error(`Wrong title: ${title}`);
    }
    
    // Test 2: Check hero section exists
    const heroSection = await page.$('#hero-section');
    if (!heroSection) {
      throw new Error('Hero section not found');
    }
    
    // Test 3: Check main headline
    const headline = await page.$eval('.hero-headline', el => el.textContent);
    if (!headline.includes('Landlords')) {
      throw new Error('Main headline missing or incorrect');
    }
    
    // Test 4: Check CTA button exists
    const ctaButton = await page.$('#open-modal');
    if (!ctaButton) {
      throw new Error('CTA button not found');
    }
    
    // Test 5: Check minified assets are loaded
    const cssLoaded = await page.evaluate(() => {
      const link = document.querySelector('link[href*="styles.min.css"]');
      return !!link;
    });
    
    if (!cssLoaded) {
      throw new Error('Minified CSS not loaded');
    }
    
    const jsLoaded = await page.evaluate(() => {
      const script = document.querySelector('script[src*="bundle.min.js"]');
      return !!script;
    });
    
    if (!jsLoaded) {
      throw new Error('Bundle JS not loaded');
    }
    
    // Test 6: Check no console errors or warnings
    const errors = [];
    const warnings = [];
    
    page.on('console', msg => {
      if (msg.type() === 'error') {
        errors.push(msg.text());
      } else if (msg.type() === 'warning') {
        warnings.push(msg.text());
      }
    });
    
    // Wait a bit for any JS to run
    await page.waitForTimeout(1000);
    
    if (errors.length > 0) {
      throw new Error(`Console errors: ${errors.join(', ')}`);
    }
    
    if (warnings.length > 0) {
      throw new Error(`Console warnings: ${warnings.join(', ')}`);
    }
    
    console.log('✅ All smoke tests passed!');
    return true;
    
  } catch (error) {
    console.error('❌ Smoke test failed:', error.message);
    return false;
  } finally {
    await browser.close();
  }
}

if (require.main === module) {
  smokeTest().then(success => {
    process.exit(success ? 0 : 1);
  });
}

module.exports = smokeTest;