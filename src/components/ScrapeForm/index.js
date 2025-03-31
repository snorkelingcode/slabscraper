'use client';

import { useState } from 'react';

export default function ScrapeForm({ onScrapeStart, onScrapeResult, onScrapeError }) {
  const [url, setUrl] = useState('');
  const [cardName, setCardName] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isTesting, setIsTesting] = useState(false);
  const [testResult, setTestResult] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!url || !cardName) {
      return onScrapeError(new Error('Please enter both a URL and card name'));
    }

    setIsSubmitting(true);
    onScrapeStart();

    try {
      const response = await fetch('/api/scrape', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ url, cardName }),
      });

      let data;
      
      try {
        data = await response.json();
      } catch (jsonError) {
        // Handle JSON parsing errors
        console.error('Failed to parse JSON response:', jsonError);
        throw new Error(
          'The server returned an invalid response. This might be due to high traffic or rate limiting. ' +
          'Please try again in a few minutes.'
        );
      }

      if (!response.ok) {
        throw new Error(data.error || data.message || 'Failed to scrape data');
      }

      onScrapeResult(data);
    } catch (error) {
      onScrapeError(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleTestConnection = async () => {
    setIsTesting(true);
    setTestResult(null);
    
    try {
      const response = await fetch('/api/test-scrape');
      
      let data;
      try {
        data = await response.json();
      } catch (jsonError) {
        throw new Error('Failed to parse test response. The server might be experiencing issues.');
      }
      
      setTestResult({
        success: data.success,
        message: data.success 
          ? `Connection test successful! Found ${data.dataCount} records.` 
          : `Test failed: ${data.error || data.message || 'Unknown error'}`
      });
    } catch (error) {
      setTestResult({
        success: false,
        message: `Test error: ${error.message}`
      });
    } finally {
      setIsTesting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="cardName" className="block text-sm font-medium text-gray-700 mb-1">
          Card Name
        </label>
        <input
          id="cardName"
          type="text"
          value={cardName}
          onChange={(e) => setCardName(e.target.value)}
          placeholder="e.g., 1952 Topps Mickey Mantle #311"
          className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          disabled={isSubmitting}
        />
      </div>
      
      <div>
        <label htmlFor="url" className="block text-sm font-medium text-gray-700 mb-1">
          PSA Auction Prices URL
        </label>
        <input
          id="url"
          type="url"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder="https://www.psacard.com/auctionprices/baseball-cards/..."
          className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          disabled={isSubmitting}
        />
        <p className="mt-1 text-xs text-gray-500">Example: https://www.psacard.com/auctionprices/baseball-cards/1967-topps/mets-rookies/values/187370</p>
      </div>
      
      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-blue-300"
      >
        {isSubmitting ? 'Scraping...' : 'Scrape Data'}
      </button>
      
      <div className="mt-4 flex flex-col">
        <button
          type="button"
          onClick={handleTestConnection}
          disabled={isTesting}
          className="w-full bg-gray-600 text-white py-2 px-4 rounded-md hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500 disabled:bg-gray-300"
        >
          {isTesting ? 'Testing Connection...' : 'Test PSA API Connection'}
        </button>
        
        {testResult && (
          <div className={`mt-2 p-2 rounded text-sm ${testResult.success ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
            {testResult.message}
          </div>
        )}
      </div>
    </form>
  );
}