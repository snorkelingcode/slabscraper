'use client';

import { useState } from 'react';

export default function ResultDisplay({ result }) {
  const [selectedGrade, setSelectedGrade] = useState(result?.data?.grades?.[0]?.grade || null);

  if (!result || !result.data) {
    return <div>No data available</div>;
  }

  const { data } = result;
  const currentGradeData = data.grades.find(g => g.grade === selectedGrade) || data.grades[0];

  const formatCurrency = (amount) => {
    if (amount === null || amount === undefined) return 'N/A';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(amount);
  };

  const formatNumber = (num) => {
    if (num === null || num === undefined) return 'N/A';
    return new Intl.NumberFormat('en-US').format(num);
  };

  return (
    <div>
      <div className="mb-6">
        <h3 className="text-lg font-medium">{data.name}</h3>
        <a 
          href={data.psaUrl} 
          target="_blank" 
          rel="noopener noreferrer"
          className="text-blue-500 hover:underline text-sm"
        >
          View on PSA
        </a>
      </div>

      <div className="mb-6">
        <label htmlFor="grade-select" className="block text-sm font-medium text-gray-700 mb-1">
          Select Grade
        </label>
        <select
          id="grade-select"
          value={selectedGrade || ''}
          onChange={(e) => setSelectedGrade(e.target.value)}
          className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          {data.grades.map((grade) => (
            <option key={grade.grade} value={grade.grade}>
              {grade.grade}
            </option>
          ))}
        </select>
      </div>

      {currentGradeData && (
        <>
          <div className="grid md:grid-cols-2 gap-4 mb-6">
            <div className="bg-gray-50 p-4 rounded-md">
              <h4 className="font-medium mb-2">Basic Information</h4>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-600">Grade:</span>
                  <span>{currentGradeData.grade}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Most Recent Price:</span>
                  <span>{formatCurrency(currentGradeData.recentPrice)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Average Price:</span>
                  <span>{formatCurrency(currentGradeData.averagePrice)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Population:</span>
                  <span>{formatNumber(currentGradeData.population)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Market Cap:</span>
                  <span>{formatCurrency(currentGradeData.marketCap)}</span>
                </div>
              </div>
            </div>

            <div className="bg-gray-50 p-4 rounded-md">
              <h4 className="font-medium mb-2">Volume Metrics</h4>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-600">Total Volume:</span>
                  <span>{formatCurrency(currentGradeData.volumeMetrics?.totalVolume)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">10Y Volume:</span>
                  <span>{formatCurrency(currentGradeData.volumeMetrics?.volume10Y)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">5Y Volume:</span>
                  <span>{formatCurrency(currentGradeData.volumeMetrics?.volume5Y)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Annual Volume:</span>
                  <span>{formatCurrency(currentGradeData.volumeMetrics?.annualVolume)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Monthly Volume:</span>
                  <span>{formatCurrency(currentGradeData.volumeMetrics?.monthlyVolume)}</span>
                </div>
              </div>
            </div>
          </div>

          {currentGradeData.auctions && currentGradeData.auctions.length > 0 && (
            <div>
              <h4 className="font-medium mb-2">Auction Results</h4>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Auction House</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Certification</th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Price</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {currentGradeData.auctions.map((auction, index) => (
                      <tr key={index}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          {new Date(auction.date).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">{auction.auctionHouse || 'N/A'}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">{auction.type || 'N/A'}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">{auction.certification || 'N/A'}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-right">{formatCurrency(auction.price)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}