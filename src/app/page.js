'use client';

import { useState } from 'react';
import ScrapeForm from '@/components/ScrapeForm';
import ResultDisplay from '@/components/ResultDisplay';

export default function Home() {
  const [scrapeResult, setScrapeResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleScrapeResult = (result) => {
    setScrapeResult(result);
    setLoading(false);
    setError(null);
  };

  const handleScrapeError = (err) => {
    setScrapeResult(null);
    setLoading(false);
    setError(err);
  };

  const handleScrapeStart = () => {
    setScrapeResult(null);
    setLoading(true);
    setError(null);
  };

  return (
    <main className="min-h-screen p-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold mb-8 text-center">PSA Card Data Scraper</h1>
        
        <div className="bg-white p-6 rounded-lg shadow-md mb-8">
          <h2 className="text-xl font-semibold mb-4">Enter PSA Card URL</h2>
          <ScrapeForm 
            onScrapeStart={handleScrapeStart}
            onScrapeResult={handleScrapeResult} 
            onScrapeError={handleScrapeError} 
          />
        </div>
        
        {loading && (
          <div className="flex justify-center my-8">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        )}
        
        {error && (
          <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 my-8">
            <p className="font-bold">Error</p>
            <p>{error.message}</p>
          </div>
        )}
        
        {scrapeResult && (
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-semibold mb-4">Scrape Results</h2>
            <ResultDisplay result={scrapeResult} />
          </div>
        )}
        
        <div className="mt-12 text-center text-sm text-gray-600">
          <p>API Endpoint: <code className="bg-gray-100 px-2 py-1 rounded">/api/scrape</code> (POST)</p>
          <p>API Endpoint: <code className="bg-gray-100 px-2 py-1 rounded">/api/cards</code> (GET)</p>
        </div>
      </div>
    </main>
  );
}