export async function fetchHtml(url) {
    try {
      // Use our proxy API instead of direct fetching
      const response = await fetch('/api/proxy', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ url }),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        return {
          data: null,
          error: errorData.error || `Failed to fetch data: ${response.status} ${response.statusText}`
        };
      }
      
      const { html } = await response.json();
      return { data: html, error: null };
    } catch (error) {
      return {
        data: null,
        error: `Error fetching URL: ${error.message}`
      };
    }
  }