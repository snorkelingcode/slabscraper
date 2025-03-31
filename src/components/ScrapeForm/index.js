'use client';

import { useState } from 'react';

export default function ScrapeForm({ onScrapeStart, onScrapeResult, onScrapeError }) {
  const [url, setUrl] = useState('');
  const [cardName, setCardName] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

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

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to scrape data');
      }

      onScrapeResult(data);
    } catch (error) {
      onScrapeError(error);
    } finally {
      setIsSubmitting(false);
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
          PSA URL
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
      </div>
      
      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-blue-300"
      >
        {isSubmitting ? 'Scraping...' : 'Scrape Data'}
      </button>
    </form>
  );
}