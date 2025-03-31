const express = require('express');
const puppeteer = require('puppeteer-extra');
const StealthPlugin = require('puppeteer-extra-plugin-stealth');
const { PrismaClient } = require('@prisma/client');
const cors = require('cors');

// Use stealth plugin to better avoid detection
puppeteer.use(StealthPlugin());

const prisma = new PrismaClient();
const app = express();
const PORT = process.env.PORT || 3001;

app.use(express.json());
app.use(cors({
  origin: process.env.ALLOWED_ORIGIN || '*',
  methods: ['GET', 'POST']
}));

// Endpoint to scrape a PSA card
app.post('/api/scrape', async (req, res) => {
  const { url, cardName } = req.body;
  
  if (!url || !cardName) {
    return res.status(400).json({ error: 'URL and card name are required' });
  }
  
  try {
    // Launch browser with stealth mode
    const browser = await puppeteer.launch({
      headless: true,
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-accelerated-2d-canvas',
        '--disable-gpu',
        '--window-size=1920x1080',
      ],
      executablePath: '/usr/bin/google-chrome',
    });
    
    const page = await browser.newPage();
    
    // Set a realistic viewport
    await page.setViewport({ width: 1920, height: 1080 });
    
    // Set up realistic browser behavior
    await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36');
    
    // Set cookies if needed
    // await page.setCookie(...cookies);
    
    // Visit the page and wait for it to load
    await page.goto(url, { waitUntil: 'networkidle2', timeout: 60000 });
    
    // Wait for the content to be visible
    await page.waitForSelector('.tab-pane', { timeout: 30000 });
    
    // Extract the card data
    const cardData = await page.evaluate(() => {
      const grades = ['10', '9', '8', '7', '6', '5', '4', '3', '2', '1.5', '1', 'Auth'];
      const result = {
        grades: []
      };
      
      for (const gradeValue of grades) {
        // Find the section for this grade
        const gradeSection = document.querySelector(`#grade-${gradeValue}`);
        if (!gradeSection && gradeValue !== 'Auth') continue;
        
        // For Auth grade, it might be labeled differently
        const authSection = gradeValue === 'Auth' ? document.querySelector('#grade-authentic') : null;
        const currentSection = gradeValue === 'Auth' && authSection ? authSection.closest('.tab-pane') : gradeSection.closest('.tab-pane');
        
        if (!currentSection) continue;
        
        // Extract basic grade information
        const gradeName = `PSA ${gradeValue}`;
        
        // Extract values
        const priceElement = currentSection.querySelector('.price-value');
        const recentPrice = priceElement ? parseFloat(priceElement.textContent.replace(/[^0-9.]/g, '')) : null;
        
        const avgPriceElement = currentSection.querySelector('.avg-price-value');
        const averagePrice = avgPriceElement ? parseFloat(avgPriceElement.textContent.replace(/[^0-9.]/g, '')) : null;
        
        const popElement = currentSection.querySelector('.population-value');
        const population = popElement ? parseInt(popElement.textContent.replace(/,/g, ''), 10) : null;
        
        // Extract auction results
        const auctions = [];
        const auctionRows = currentSection.querySelectorAll('table.auction-results-table tbody tr');
        
        auctionRows.forEach(row => {
          const columns = row.querySelectorAll('td');
          if (columns.length >= 5) {
            const dateText = columns[0].textContent.trim();
            const auctionHouse = columns[1].textContent.trim();
            const type = columns[2].textContent.trim();
            const certification = columns[3].textContent.trim();
            const priceText = columns[4].textContent.trim();
            
            // Parse the date
            let date = null;
            try {
              // Assuming date format is MM/DD/YYYY
              const [month, day, year] = dateText.split('/');
              date = new Date(parseInt(year), parseInt(month) - 1, parseInt(day)).toISOString();
            } catch (error) {
              console.error(`Error parsing date: ${dateText}`);
            }
            
            // Parse the price
            const price = parseFloat(priceText.replace(/[^0-9.]/g, '')) || 0;
            
            if (date && price) {
              auctions.push({
                date,
                auctionHouse,
                type,
                certification,
                price
              });
            }
          }
        });
        
        // Add the grade data to our result
        result.grades.push({
          grade: gradeName,
          recentPrice,
          averagePrice,
          population,
          auctions
        });
      }
      
      return result;
    });
    
    // Close the browser
    await browser.close();
    
    // Add the card name and URL to the result
    cardData.name = cardName;
    cardData.psaUrl = url;
    
    // Return the scraped data
    res.json({ 
      success: true, 
      message: 'Data scraped successfully', 
      data: cardData 
    });
    
  } catch (error) {
    console.error('Scraping error:', error);
    res.status(500).json({ 
      error: 'Failed to scrape data', 
      message: error.message 
    });
  }
});

// Start the server
app.listen(PORT, () => {
  console.log(`Scraping server running on port ${PORT}`);
});