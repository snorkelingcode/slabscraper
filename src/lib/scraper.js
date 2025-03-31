import axios from 'axios';
import cheerio from 'cheerio';
import { parseISO } from 'date-fns';

/**
 * Scrapes PSA card data from a given URL
 * @param {string} url - The PSA URL to scrape
 * @param {string} cardName - The name of the card
 * @returns {Promise<Object>} - The scraped data
 */
export async function scrapePsaData(url, cardName) {
  try {
    // Fetch the HTML content from the URL
    const { data } = await axios.get(url);
    const $ = cheerio.load(data);
    
    // Extract card information
    const cardData = {
      name: cardName,
      psaUrl: url,
      grades: []
    };

    // Define the grades we need to extract
    const grades = ['10', '9', '8', '7', '6', '5', '4', '3', '2', '1.5', '1', 'Auth'];

    // Extract data for each grade
    for (const gradeValue of grades) {
      // Find the section for this grade
      const gradeSection = $(`#grade-${gradeValue}`).closest('.tab-pane');
      if (gradeSection.length === 0 && gradeValue !== 'Auth') {
        // If we can't find the specific grade section, skip it
        continue;
      }

      // For Auth grade, it might be labeled differently
      const authSection = gradeValue === 'Auth' ? $('#grade-authentic').closest('.tab-pane') : null;
      const currentSection = gradeValue === 'Auth' && authSection ? authSection : gradeSection;

      // Extract basic grade information
      const gradeName = `PSA ${gradeValue}`;
      let recentPrice = null;
      let averagePrice = null;
      let population = null;

      // Extract recent price
      const priceElement = currentSection.find('.price-value');
      if (priceElement.length > 0) {
        recentPrice = parseFloat(priceElement.text().replace(/[^0-9.]/g, '')) || null;
      }

      // Extract average price
      const avgPriceElement = currentSection.find('.avg-price-value');
      if (avgPriceElement.length > 0) {
        averagePrice = parseFloat(avgPriceElement.text().replace(/[^0-9.]/g, '')) || null;
      }

      // Extract population
      const popElement = currentSection.find('.population-value');
      if (popElement.length > 0) {
        population = parseInt(popElement.text().replace(/,/g, ''), 10) || null;
      }

      // Extract auction results
      const auctions = [];
      currentSection.find('table.auction-results-table tbody tr').each((i, elem) => {
        const columns = $(elem).find('td');
        if (columns.length >= 5) {
          const dateText = $(columns[0]).text().trim();
          const auctionHouse = $(columns[1]).text().trim();
          const type = $(columns[2]).text().trim();
          const certification = $(columns[3]).text().trim();
          const priceText = $(columns[4]).text().trim();

          // Parse the date
          let date = null;
          try {
            // Assuming date format is MM/DD/YYYY
            const [month, day, year] = dateText.split('/');
            date = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
          } catch (error) {
            console.error(`Error parsing date: ${dateText}`, error);
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
      cardData.grades.push({
        grade: gradeName,
        recentPrice,
        averagePrice,
        population,
        auctions
      });
    }

    return cardData;
  } catch (error) {
    console.error('Error scraping PSA data:', error);
    throw new Error(`Failed to scrape PSA data: ${error.message}`);
  }
}