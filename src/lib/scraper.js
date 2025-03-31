/**
 * Scrapes PSA card data from a given URL
 * @param {string} url - The PSA URL to scrape
 * @param {string} cardName - The name of the card
 * @returns {Promise<Object>} - The scraped data
 */
export async function scrapePsaData(url, cardName) {
  try {
    console.log(`Starting to scrape data for ${url}`);
    
    // Extract the card ID from the URL
    const cardId = extractCardId(url);
    
    if (!cardId) {
      console.error(`Failed to extract card ID from URL: ${url}`);
      throw new Error('Invalid PSA URL. Unable to extract card ID. The URL should end with a numeric value.');
    }
    
    console.log(`Extracted card ID: ${cardId}`);
    
    // Fetch auction data from PSA API
    const auctionData = await fetchAuctionData(cardId);
    
    if (!auctionData || !Array.isArray(auctionData) || auctionData.length === 0) {
      console.error(`No auction data returned for card ID ${cardId}`);
      throw new Error('No auction data found for this card.');
    }
    
    console.log(`Received ${auctionData.length} auction records. Processing...`);
    
    // Process the auction data into our format
    const cardData = processAuctionData(auctionData, cardName, url);
    
    // Check if we have valid data
    if (!cardData.grades || cardData.grades.length === 0) {
      console.error(`No grade data processed for card ID ${cardId}`);
      throw new Error('No auction data could be processed for this card.');
    }
    
    console.log(`Successfully processed data with ${cardData.grades.length} grade categories`);
    
    // Return the processed data
    return cardData;
  } catch (error) {
    console.error('Error scraping PSA data:', error);
    throw new Error(`Failed to scrape PSA data: ${error.message}`);
  }
}