// src/app/api/save-card/route.js
import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { processScrapedData } from '@/lib/calculator';

// Mark as dynamic
export const dynamic = 'force-dynamic';

export async function POST(request) {
  try {
    const cardData = await request.json();
    
    if (!cardData || !cardData.name || !cardData.psaUrl || !cardData.grades) {
      return NextResponse.json(
        { error: 'Invalid card data' },
        { status: 400 }
      );
    }
    
    // Process the data and calculate metrics
    const processedData = processScrapedData(cardData);
    
    // Store data in the database (same logic as in your original scrape endpoint)
    // ... (your existing database storage code)
    
    return NextResponse.json({
      success: true,
      message: 'Data saved successfully',
      data: processedData
    });
  } catch (error) {
    console.error('Error saving card data:', error);
    return NextResponse.json(
      { error: 'Failed to save data', message: error.message },
      { status: 500 }
    );
  }
}