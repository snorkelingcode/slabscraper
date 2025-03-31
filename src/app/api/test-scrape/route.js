import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

// Simple test endpoint to verify PSA API connectivity
export async function GET(request) {
  // Add CORS headers
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  };

  // Handle preflight requests
  if (request.method === 'OPTIONS') {
    return new NextResponse(null, { status: 204, headers });
  }

  try {
    console.log('Testing PSA API connectivity');
    
    // Use a known card ID for testing
    const cardId = 182146; // Carl Yastrzemski 1960 Topps
    
    // Make a minimal request to test connectivity
    const formData = new URLSearchParams({
      "specID": cardId.toString(),
      "draw": "1",
      "start": "0",
      "length": "10" // Just get 10 results to minimize data
    });
    
    console.log('Making test request to PSA API');
    
    const testResponse = await fetch('https://www.psacard.com/auctionprices/GetItemLots', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
        'Accept': 'application/json',
        'Origin': 'https://www.psacard.com',
        'Referer': 'https://www.psacard.com/'
      },
      body: formData,
      // Add timeout
      signal: AbortSignal.timeout(10000)
    });
    
    if (!testResponse.ok) {
      const errorText = await testResponse.text();
      console.error(`API test failed with status ${testResponse.status}:`, errorText);
      return NextResponse.json({
        success: false,
        error: 'API connection test failed',
        details: `Status: ${testResponse.status}, Response: ${errorText.substring(0, 200)}`
      }, { status: 500, headers });
    }
    
    // Try to parse the JSON response
    let responseData;
    try {
      responseData = await testResponse.json();
      console.log('Successfully parsed API response');
    } catch (jsonError) {
      console.error('Failed to parse JSON response:', jsonError);
      return NextResponse.json({
        success: false,
        error: 'Failed to parse API response',
        details: jsonError.message
      }, { status: 500, headers });
    }
    
    // Return first two records as a sample
    const sampleData = responseData.data?.slice(0, 2) || [];
    
    return NextResponse.json({
      success: true,
      message: 'PSA API connectivity test successful',
      dataCount: responseData.data?.length || 0,
      totalRecords: responseData.recordsTotal || 0,
      sample: sampleData
    }, { headers });
    
  } catch (error) {
    console.error('Test API error:', error);
    return NextResponse.json({
      success: false,
      error: 'Test failed',
      message: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    }, { status: 500, headers });
  }
}