/**
 * PSA API client for accessing internal PSA endpoints
 */

const AUCTION_API_URL = "https://www.psacard.com/auctionprices/GetItemLots";
const POP_API_URL = "https://www.psacard.com/Pop/GetSetItems";

/**
 * Extract card ID from PSA auction URL
 * @param {string} url - PSA auction URL
 * @returns {number|null} - Card ID or null if not found
 */
export function extractCardId(url) {
  try {
    return parseInt(url.split("/").pop());
  } catch (error) {
    console.error('Error extracting card ID:', error);
    return null;
  }
}

/**
 * Fetch all auction data for a card
 * @param {number} cardId - PSA card ID
 * @returns {Promise<Array>} - Array of auction results
 */
export async function fetchAuctionData(cardId) {
  try {
    const pageSize = 250;
    let start = 0;
    let allSales = [];
    let hasMore = true;
    let pageCounter = 1;

    // Get first page of results
    const formData = new URLSearchParams({
      "specID": cardId.toString(),
      "draw": pageCounter.toString(),
      "start": start.toString(),
      "length": pageSize.toString()
    });

    const response = await fetch(AUCTION_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
      },
      body: formData
    });

    if (!response.ok) {
      throw new Error(`API request failed with status ${response.status}`);
    }

    const jsonData = await response.json();
    allSales = jsonData.data;
    const totalSales = jsonData.recordsTotal;

    // If there are more results, fetch additional pages
    if (totalSales > pageSize) {
      const additionalPages = Math.ceil((totalSales - pageSize) / pageSize);
      
      for (let i = 0; i < additionalPages; i++) {
        pageCounter++;
        start += pageSize;
        
        const nextFormData = new URLSearchParams({
          "specID": cardId.toString(),
          "draw": pageCounter.toString(),
          "start": start.toString(),
          "length": pageSize.toString()
        });

        // Add delay to avoid rate limiting
        await new Promise(resolve => setTimeout(resolve, 1000));

        const nextResponse = await fetch(AUCTION_API_URL, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
          },
          body: nextFormData
        });

        if (!nextResponse.ok) {
          throw new Error(`API request failed with status ${nextResponse.status}`);
        }

        const nextJsonData = await nextResponse.json();
        allSales = [...allSales, ...nextJsonData.data];
      }
    }

    return allSales;
  } catch (error) {
    console.error('Error fetching auction data:', error);
    throw error;
  }
}

/**
 * Process raw auction data into structured format grouped by grade
 * @param {Array} auctionData - Raw auction data from PSA API
 * @param {string} cardName - Name of the card
 * @param {string} psaUrl - Original PSA URL
 * @returns {Object} - Structured card data with grades
 */
export function processAuctionData(auctionData, cardName, psaUrl) {
  // Initialize card object
  const cardData = {
    name: cardName,
    psaUrl: psaUrl,
    grades: []
  };

  // Group auction data by grade
  const gradeMap = new Map();
  
  auctionData.forEach(sale => {
    const grade = sale.GradeString || "Unknown";
    
    // Get or initialize grade group
    if (!gradeMap.has(grade)) {
      gradeMap.set(grade, {
        grade: grade,
        auctions: [],
        recentPrice: null,
        averagePrice: null,
        population: null
      });
    }
    
    const gradeGroup = gradeMap.get(grade);
    
    // Add auction to grade group
    const auctionEntry = {
      date: sale.EndDate,
      auctionHouse: sale.Name || "Unknown",
      type: sale.AuctionType || "Unknown",
      certification: sale.CertNo || "",
      price: parseFloat(sale.SalePrice?.replace(/[^0-9.]/g, '') || 0)
    };
    
    gradeGroup.auctions.push(auctionEntry);
  });
  
  // Calculate recent price and average price for each grade
  gradeMap.forEach(gradeData => {
    // Sort auctions by date (most recent first)
    gradeData.auctions.sort((a, b) => new Date(b.date) - new Date(a.date));
    
    // Set most recent price
    if (gradeData.auctions.length > 0) {
      gradeData.recentPrice = gradeData.auctions[0].price;
    }
    
    // Calculate average price
    if (gradeData.auctions.length > 0) {
      const totalPrice = gradeData.auctions.reduce((sum, auction) => sum + auction.price, 0);
      gradeData.averagePrice = totalPrice / gradeData.auctions.length;
    }
  });
  
  // Add grade data to card
  cardData.grades = Array.from(gradeMap.values());
  
  return cardData;
}

/**
 * Fetch population data for a card
 * @param {number} cardId - PSA card ID
 * @returns {Promise<Object>} - Population data by grade
 */
export async function fetchPopulationData(cardId) {
  // This would need to be implemented if we need population data
  // For now, we'll return an empty object since it's unclear how to map 
  // the card ID to the population data in the SetItems API
  return {};
}