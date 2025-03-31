export async function fetchAuctionData(cardId) {
    try {
      console.log(`Fetching auction data for card ID: ${cardId}`);
      
      const pageSize = 50; // Reduced page size to prevent timeouts
      let start = 0;
      let allSales = [];
      let pageCounter = 1;
  
      // Get first page of results
      const formData = new URLSearchParams({
        "specID": cardId.toString(),
        "draw": pageCounter.toString(),
        "start": start.toString(),
        "length": pageSize.toString()
      });
  
      console.log(`Making first API request with params:`, Object.fromEntries(formData));
  
      const response = await fetch(AUCTION_API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
          'Accept': 'application/json',
          'Origin': 'https://www.psacard.com',
          'Referer': 'https://www.psacard.com/'
        },
        body: formData,
        // Add timeout to prevent hanging requests
        signal: AbortSignal.timeout(10000) // 10 second timeout
      });
  
      if (!response.ok) {
        const errorText = await response.text();
        console.error(`API response error (${response.status}):`, errorText);
        throw new Error(`API request failed with status ${response.status}: ${errorText.substring(0, 200)}`);
      }
  
      let jsonData;
      try {
        jsonData = await response.json();
      } catch (error) {
        console.error('Error parsing JSON response:', error);
        throw new Error('Failed to parse API response as JSON. The server might be rate limiting requests.');
      }
  
      console.log(`First page response received. Total records: ${jsonData.recordsTotal || 'unknown'}`);
      
      if (!jsonData.data || !Array.isArray(jsonData.data)) {
        console.error('Unexpected API response format:', jsonData);
        throw new Error('Invalid API response format. Expected data array.');
      }
      
      allSales = jsonData.data;
      const totalSales = jsonData.recordsTotal || 0;
  
      // Limit the number of pages to fetch to avoid timeouts
      const maxPages = 5;
      const additionalPages = Math.min(
        Math.ceil((totalSales - pageSize) / pageSize),
        maxPages
      );
      
      if (additionalPages > 0) {
        console.log(`Will fetch up to ${additionalPages} additional pages`);
        
        for (let i = 0; i < additionalPages; i++) {
          pageCounter++;
          start += pageSize;
          
          // Add a longer delay to avoid rate limiting
          await new Promise(resolve => setTimeout(resolve, 2000));
          
          console.log(`Fetching page ${pageCounter} with start: ${start}`);
          
          try {
            const nextFormData = new URLSearchParams({
              "specID": cardId.toString(),
              "draw": pageCounter.toString(),
              "start": start.toString(),
              "length": pageSize.toString()
            });
  
            const nextResponse = await fetch(AUCTION_API_URL, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
                'Accept': 'application/json',
                'Origin': 'https://www.psacard.com',
                'Referer': 'https://www.psacard.com/'
              },
              body: nextFormData,
              signal: AbortSignal.timeout(10000) // 10 second timeout
            });
  
            if (!nextResponse.ok) {
              console.warn(`API request for page ${pageCounter} failed with status ${nextResponse.status}. Continuing with data collected so far.`);
              break; // Continue with the data we have instead of failing completely
            }
  
            let nextJsonData;
            try {
              nextJsonData = await nextResponse.json();
            } catch (jsonError) {
              console.warn(`Failed to parse JSON for page ${pageCounter}:`, jsonError);
              break; // Stop pagination but continue with data collected so far
            }
  
            if (nextJsonData.data && Array.isArray(nextJsonData.data)) {
              allSales = [...allSales, ...nextJsonData.data];
              console.log(`Added ${nextJsonData.data.length} more sales. Total so far: ${allSales.length}`);
            }
          } catch (pageError) {
            console.warn(`Error fetching page ${pageCounter}:`, pageError);
            break; // Stop pagination but continue with data collected so far
          }
        }
      }
  
      console.log(`Successfully collected ${allSales.length} auction records`);
      
      // Even if we only got a few records, return what we have
      return allSales;
    } catch (error) {
      console.error('Error fetching auction data:', error);
      
      // If we failed completely, throw a user-friendly error
      if (error.name === 'TimeoutError' || error.name === 'AbortError') {
        throw new Error('Request timed out. The PSA API might be experiencing high load or rate limiting.');
      }
      
      throw error;
    }
  }