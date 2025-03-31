export async function POST(request) {
  // Add CORS headers
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  };

  // Handle preflight requests
  if (request.method === 'OPTIONS') {
    return new NextResponse(null, { status: 204, headers });
  }

  try {
    console.log('Received scrape request');
    
    // Parse request body
    let body;
    try {
      body = await request.json();
      console.log('Request body:', body);
    } catch (error) {
      console.error('Error parsing request body:', error);
      return NextResponse.json(
        { error: 'Invalid request body', message: 'Could not parse JSON body' },
        { status: 400, headers }
      );
    }
    
    // Validate input
    const result = scrapeRequestSchema.safeParse(body);
    if (!result.success) {
      console.error('Validation error:', result.error.format());
      return NextResponse.json(
        { error: 'Invalid input', details: result.error.format() },
        { status: 400, headers }
      );
    }
    
    const { url, cardName } = result.data;
    console.log(`Processing request for card: ${cardName}, URL: ${url}`);

    // Check if URL is a valid PSA Auction Prices URL
    if (!url.includes('psacard.com/auctionprices')) {
      console.error(`Invalid URL: ${url}`);
      return NextResponse.json(
        { error: 'Invalid URL', message: 'The URL must be from PSA Auction Prices website' },
        { status: 400, headers }
      );
    }
    console.log(`Successfully scraped and stored data for ${cardName}`);
    
    // Return the processed data
    return NextResponse.json({
      success: true,
      message: 'Data scraped and stored successfully',
      data: processedData
    }, { headers });
  } catch (error) {
    console.error('Error processing scrape request:', error);
    
    // Determine if this is a client or server error
    let statusCode = 500;
    let errorMessage = error.message || 'An unknown error occurred';
    
    // Common client errors
    if (
      errorMessage.includes('Invalid PSA URL') || 
      errorMessage.includes('Unable to extract card ID') ||
      errorMessage.includes('No auction data found')
    ) {
      statusCode = 400;
    }
    
    // Return detailed error for debugging
    return NextResponse.json(
      { 
        error: 'Failed to scrape data', 
        message: errorMessage,
        stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
      },
      { status: statusCode, headers }
    );
  }
}