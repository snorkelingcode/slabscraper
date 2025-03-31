import { extractCardId, fetchAuctionData, processAuctionData } from './psa-api';

/**
 * Scrapes PSA card data from a given URL
 * @param {string} url - The PSA URL to scrape
 * @param {string} cardName - The name of the card
 * @returns {Promise<Object>} - The scraped data
 */
export async function scrapePsaData(url, cardName) {
  try {
    // Extract the card ID from the URL
    const cardId = extractCardId(url);
    
    if (!cardId) {
      throw new Error('Invalid PSA URL. Unable to extract card ID.');
    }
    
    // Fetch auction data from PSA API
    const auctionData = await fetchAuctionData(cardId);
    
    // Process the auction data into our format
    const cardData = processAuctionData(auctionData, cardName, url);
    
    // Check if we have valid data
    if (!cardData.grades || cardData.grades.length === 0) {
      throw new Error('No auction data found for this card.');
    }
    
    // Return the processed data
    return cardData;
  } catch (error) {
    console.error('Error scraping PSA data:', error);
    throw new Error(`Failed to scrape PSA data: ${error.message}`);
  }
}