/**
 * Fetch HTML from a URL with browser-like headers to avoid being blocked
 * @param {string} url - The URL to fetch
 * @returns {Promise<{html: string|null, error: string|null}>}
 */
export async function fetchWithBrowserHeaders(url) {
    try {
      // Add browser-like headers to avoid being blocked
      const response = await fetch(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
          'Accept-Language': 'en-US,en;q=0.5',
          'Referer': 'https://www.google.com/',
          'DNT': '1',
          'Connection': 'keep-alive',
          'Upgrade-Insecure-Requests': '1',
          'Cache-Control': 'max-age=0'
        }
      });
      
      if (!response.ok) {
        return {
          html: null,
          error: `Failed to fetch data: ${response.status} ${response.statusText}`
        };
      }
      
      const html = await response.text();
      return { html, error: null };
    } catch (error) {
      return {
        html: null,
        error: `Error fetching URL: ${error.message}`
      };
    }
  }
  
  /**
   * Fetch HTML using a scraping service if configured
   * @param {string} url - The URL to scrape
   * @returns {Promise<{html: string|null, error: string|null}>}
   */
  export async function fetchWithScrapingService(url) {
    try {
      // ScrapingBee API key (should be set in environment variables)
      const apiKey = process.env.SCRAPING_BEE_API_KEY;
      
      if (!apiKey) {
        return {
          html: null,
          error: 'ScrapingBee API key not set in environment variables'
        };
      }
      
      // ScrapingBee API endpoint
      const scrapingBeeUrl = `https://app.scrapingbee.com/api/v1/?api_key=${apiKey}&url=${encodeURIComponent(url)}&render_js=false`;
      
      const response = await fetch(scrapingBeeUrl);
      
      if (!response.ok) {
        return {
          html: null,
          error: `Failed to fetch data via scraping service: ${response.status} ${response.statusText}`
        };
      }
      
      const html = await response.text();
      return { html, error: null };
    } catch (error) {
      return {
        html: null,
        error: `Error using scraping service: ${error.message}`
      };
    }
  }