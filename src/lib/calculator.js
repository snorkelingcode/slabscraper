import { subYears, subMonths } from 'date-fns';

/**
 * Calculate market cap (Population × Average Price)
 * @param {number} population - The card population
 * @param {number} averagePrice - The average price
 * @returns {number|null} - The calculated market cap or null
 */
export function calculateMarketCap(population, averagePrice) {
  if (population === null || averagePrice === null) {
    return null;
  }
  return population * averagePrice;
}

/**
 * Calculate total auction volume
 * @param {Array} auctions - The auction data
 * @returns {number} - The total volume
 */
export function calculateTotalVolume(auctions) {
  if (!auctions || auctions.length === 0) {
    return 0;
  }
  return auctions.reduce((sum, auction) => sum + auction.price, 0);
}

/**
 * Calculate volume for a specific time period
 * @param {Array} auctions - The auction data
 * @param {Date} startDate - The start date
 * @returns {number} - The volume for the specified period
 */
export function calculateVolumeForPeriod(auctions, startDate) {
  if (!auctions || auctions.length === 0) {
    return 0;
  }
  
  const filteredAuctions = auctions.filter(auction => {
    const auctionDate = new Date(auction.date);
    return auctionDate >= startDate;
  });
  
  return filteredAuctions.reduce((sum, auction) => sum + auction.price, 0);
}

/**
 * Calculate volume metrics for all time periods
 * @param {Array} auctions - The auction data
 * @returns {Object} - An object containing all volume metrics
 */
export function calculateAllVolumeMetrics(auctions) {
  if (!auctions || auctions.length === 0) {
    return {
      totalVolume: 0,
      volume10Y: 0,
      volume5Y: 0,
      annualVolume: 0,
      monthlyVolume: 0
    };
  }

  const now = new Date();
  const tenYearsAgo = subYears(now, 10);
  const fiveYearsAgo = subYears(now, 5);
  const oneYearAgo = subYears(now, 1);
  const oneMonthAgo = subMonths(now, 1);

  return {
    totalVolume: calculateTotalVolume(auctions),
    volume10Y: calculateVolumeForPeriod(auctions, tenYearsAgo),
    volume5Y: calculateVolumeForPeriod(auctions, fiveYearsAgo),
    annualVolume: calculateVolumeForPeriod(auctions, oneYearAgo),
    monthlyVolume: calculateVolumeForPeriod(auctions, oneMonthAgo)
  };
}

/**
 * Process scraped data and calculate all derived metrics
 * @param {Object} scrapedData - The raw scraped data
 * @returns {Object} - The processed data with calculated metrics
 */
export function processScrapedData(scrapedData) {
  const processedData = {
    ...scrapedData,
    grades: scrapedData.grades.map(grade => {
      // Calculate market cap
      const marketCap = calculateMarketCap(grade.population, grade.averagePrice);
      
      // Calculate volume metrics
      const volumeMetrics = calculateAllVolumeMetrics(grade.auctions);
      
      return {
        ...grade,
        marketCap,
        volumeMetrics
      };
    })
  };

  return processedData;
}