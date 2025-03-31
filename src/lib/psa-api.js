/**
 * Process raw auction data into structured format grouped by grade
 * @param {Array} auctionData - Raw auction data from PSA API
 * @param {string} cardName - Name of the card
 * @param {string} psaUrl - Original PSA URL
 * @returns {Object} - Structured card data with grades
 */
export function processAuctionData(auctionData, cardName, psaUrl) {
    console.log(`Processing ${auctionData.length} auction records for ${cardName}`);
    
    // Initialize card object
    const cardData = {
      name: cardName,
      psaUrl: psaUrl,
      grades: []
    };
  
    // Group auction data by grade
    const gradeMap = new Map();
    
    // Make sure auctionData is an array
    if (!Array.isArray(auctionData)) {
      console.error('Invalid auction data:', auctionData);
      throw new Error('Auction data must be an array');
    }
    
    auctionData.forEach((sale, index) => {
      try {
        // Skip invalid sales
        if (!sale || typeof sale !== 'object') {
          console.warn(`Skipping invalid sale at index ${index}`);
          return;
        }
        
        // Get the grade, defaulting to "Unknown" if not present
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
        
        // Parse price safely
        let price = 0;
        if (sale.SalePrice) {
          // Remove all non-numeric characters except for decimal point
          const priceStr = sale.SalePrice.replace(/[^0-9.]/g, '');
          price = parseFloat(priceStr || 0);
          
          // Check for valid price
          if (isNaN(price)) {
            console.warn(`Invalid price format at index ${index}: ${sale.SalePrice}`);
            price = 0;
          }
        }
        
        // Add auction to grade group
        const auctionEntry = {
          date: sale.EndDate || new Date().toISOString(),
          auctionHouse: sale.Name || "Unknown",
          type: sale.AuctionType || "Unknown",
          certification: sale.CertNo || "",
          price: price
        };
        
        gradeGroup.auctions.push(auctionEntry);
      } catch (error) {
        console.error(`Error processing sale at index ${index}:`, error, sale);
        // Continue processing other sales
      }
    });
    
    console.log(`Found ${gradeMap.size} different grades`);
    
    // Calculate recent price and average price for each grade
    gradeMap.forEach((gradeData, grade) => {
      try {
        // Sort auctions by date (most recent first)
        gradeData.auctions.sort((a, b) => {
          const dateA = new Date(a.date);
          const dateB = new Date(b.date);
          
          // Handle invalid dates
          if (isNaN(dateA.getTime()) && isNaN(dateB.getTime())) return 0;
          if (isNaN(dateA.getTime())) return 1;
          if (isNaN(dateB.getTime())) return -1;
          
          return dateB - dateA;
        });
        
        // Set most recent price
        if (gradeData.auctions.length > 0) {
          gradeData.recentPrice = gradeData.auctions[0].price;
        }
        
        // Calculate average price
        if (gradeData.auctions.length > 0) {
          const totalPrice = gradeData.auctions.reduce((sum, auction) => sum + auction.price, 0);
          gradeData.averagePrice = totalPrice / gradeData.auctions.length;
        }
        
        console.log(`Grade ${grade}: ${gradeData.auctions.length} auctions, recent price: ${gradeData.recentPrice}, avg price: ${gradeData.averagePrice}`);
      } catch (error) {
        console.error(`Error calculating metrics for grade ${grade}:`, error);
        // Don't throw, just log the error and continue
      }
    });
    
    // Add grade data to card
    cardData.grades = Array.from(gradeMap.values());
    
    return cardData;
  }