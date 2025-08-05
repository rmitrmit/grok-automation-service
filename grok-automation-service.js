/**
 * Standalone Grok Web Automation Service
 * Minimal Express server for Grok image editing via web automation
 * Deploy this separately to environments with Chrome support (Vercel, Railway, etc.)
 */

const express = require('express');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json({ limit: '50mb' }));

// Health check
app.get('/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    service: 'grok-automation',
    timestamp: new Date().toISOString()
  });
});

// Main Grok automation endpoint
app.post('/grok/web-edit', async (req, res) => {
  const { imageUrl, prompt } = req.body;
  
  if (!imageUrl || !prompt) {
    return res.status(400).json({
      success: false,
      error: 'imageUrl and prompt are required'
    });
  }

  let puppeteer;
  let browser = null;
  
  try {
    console.log('🔄 Starting Grok web automation...');
    console.log('Image:', imageUrl);
    console.log('Prompt:', prompt);
    
    // Import puppeteer
    puppeteer = require('puppeteer');
    
    // Launch browser with production settings
    browser = await puppeteer.launch({
      headless: true,
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-accelerated-2d-canvas',
        '--no-first-run',
        '--no-zygote',
        '--disable-gpu'
      ]
    });
    
    const page = await browser.newPage();
    await page.setViewport({ width: 1280, height: 720 });
    
    console.log('📋 Navigating to grok.com...');
    await page.goto('https://grok.com', { 
      waitUntil: 'networkidle2', 
      timeout: 30000 
    });
    
    // Wait for page to load
    await page.waitForTimeout(3000);
    
    console.log('🔍 Looking for Aurora image editing interface...');
    
    // Try to find image upload or editing interface
    const hasImageInterface = await page.evaluate(() => {
      // Look for common image upload patterns
      const uploadButtons = document.querySelectorAll('input[type="file"], button[aria-label*="upload"], button[aria-label*="image"]');
      const imageText = document.body.textContent.toLowerCase();
      return {
        hasUploadButton: uploadButtons.length > 0,
        hasImageKeywords: imageText.includes('image') || imageText.includes('aurora') || imageText.includes('upload')
      };
    });
    
    console.log('Interface check:', hasImageInterface);
    
    // For now, simulate the process (placeholder for actual automation)
    console.log('⚠️ Grok web automation in development - returning placeholder');
    
    // In production, this would:
    // 1. Upload the image to Grok's interface
    // 2. Enter the prompt text
    // 3. Wait for Aurora to process
    // 4. Download the edited image
    
    res.json({
      success: false,
      error: 'Grok web automation in development - Aurora interface automation needs completion',
      debug: {
        pageTitle: await page.title(),
        interfaceFound: hasImageInterface,
        message: 'Basic browser automation working, need to complete Aurora interaction logic'
      }
    });
    
  } catch (error) {
    console.error('❌ Grok automation failed:', error);
    res.status(500).json({
      success: false,
      error: error.message,
      service: 'grok-automation'
    });
  } finally {
    if (browser) {
      await browser.close();
    }
  }
});

// Error handling
app.use((error, req, res, next) => {
  console.error('Server error:', error);
  res.status(500).json({
    success: false,
    error: 'Internal server error'
  });
});

// For serverless environments (Vercel)
if (process.env.NODE_ENV !== 'development') {
  module.exports = app;
} else {
  app.listen(PORT, () => {
    console.log(`🚀 Grok Automation Service running on port ${PORT}`);
    console.log(`Health check: http://localhost:${PORT}/health`);
    console.log(`Automation endpoint: http://localhost:${PORT}/grok/web-edit`);
  });
}