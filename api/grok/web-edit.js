const puppeteer = require('puppeteer');

module.exports = async (req, res) => {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { imageUrl, prompt } = req.body;
  
  if (!imageUrl || !prompt) {
    return res.status(400).json({
      success: false,
      error: 'imageUrl and prompt are required'
    });
  }

  let browser = null;
  
  try {
    console.log('🔄 Starting Grok web automation...');
    
    browser = await puppeteer.launch({
      headless: true,
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage'
      ]
    });
    
    const page = await browser.newPage();
    await page.goto('https://grok.com', { waitUntil: 'networkidle2' });
    
    console.log('Page loaded successfully');
    
    res.json({
      success: false,
      error: 'Grok automation in development',
      debug: {
        pageTitle: await page.title(),
        message: 'Basic automation working, need Aurora interface logic'
      }
    });
    
  } catch (error) {
    console.error('Automation failed:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  } finally {
    if (browser) {
      await browser.close();
    }
  }
};
