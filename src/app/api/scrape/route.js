import { NextResponse } from 'next/server';
import { z } from 'zod';
import prisma from '@/lib/prisma';
import { scrapePsaData } from '@/lib/scraper';
import { processScrapedData } from '@/lib/calculator';

// Input validation schema
const scrapeRequestSchema = z.object({
  url: z.string().url(),
  cardName: z.string().min(1)
});

export async function POST(request) {
  try {
    // Parse request body
    const body = await request.json();
    
    // Validate input
    const result = scrapeRequestSchema.safeParse(body);
    if (!result.success) {
      return NextResponse.json(
        { error: 'Invalid input', details: result.error.format() },
        { status: 400 }
      );
    }
    
    const { url, cardName } = result.data;

    // Scrape data from the URL
    const scrapedData = await scrapePsaData(url, cardName);
    
    // Process the data and calculate metrics
    const processedData = processScrapedData(scrapedData);
    
    // Store data in the database
    const cardRecord = await prisma.card.upsert({
      where: {
        name_psaUrl: {
          name: processedData.name,
          psaUrl: processedData.psaUrl
        }
      },
      update: {
        updatedAt: new Date()
      },
      create: {
        name: processedData.name,
        psaUrl: processedData.psaUrl
      }
    });

    // Store each grade and its data
    for (const gradeData of processedData.grades) {
      // Create or update the grade
      const grade = await prisma.grade.upsert({
        where: {
          cardId_grade: {
            cardId: cardRecord.id,
            grade: gradeData.grade
          }
        },
        update: {
          recentPrice: gradeData.recentPrice,
          averagePrice: gradeData.averagePrice,
          population: gradeData.population,
          marketCap: gradeData.marketCap
        },
        create: {
          cardId: cardRecord.id,
          grade: gradeData.grade,
          recentPrice: gradeData.recentPrice,
          averagePrice: gradeData.averagePrice,
          population: gradeData.population,
          marketCap: gradeData.marketCap
        }
      });

      // Store auction data
      if (gradeData.auctions && gradeData.auctions.length > 0) {
        // Delete existing auctions for this grade to avoid duplicates
        await prisma.auction.deleteMany({
          where: {
            gradeId: grade.id
          }
        });

        // Create new auction records
        await prisma.auction.createMany({
          data: gradeData.auctions.map(auction => ({
            gradeId: grade.id,
            date: new Date(auction.date),
            auctionHouse: auction.auctionHouse,
            type: auction.type,
            certification: auction.certification,
            price: auction.price
          }))
        });
      }

      // Store volume metrics
      await prisma.volumeMetrics.upsert({
        where: {
          gradeId: grade.id
        },
        update: {
          totalVolume: gradeData.volumeMetrics.totalVolume,
          volume10Y: gradeData.volumeMetrics.volume10Y,
          volume5Y: gradeData.volumeMetrics.volume5Y,
          annualVolume: gradeData.volumeMetrics.annualVolume,
          monthlyVolume: gradeData.volumeMetrics.monthlyVolume
        },
        create: {
          gradeId: grade.id,
          totalVolume: gradeData.volumeMetrics.totalVolume,
          volume10Y: gradeData.volumeMetrics.volume10Y,
          volume5Y: gradeData.volumeMetrics.volume5Y,
          annualVolume: gradeData.volumeMetrics.annualVolume,
          monthlyVolume: gradeData.volumeMetrics.monthlyVolume
        }
      });
    }

    // Return the processed data
    return NextResponse.json({
      success: true,
      message: 'Data scraped and stored successfully',
      data: processedData
    });
  } catch (error) {
    console.error('Error processing scrape request:', error);
    return NextResponse.json(
      { error: 'Failed to scrape data', message: error.message },
      { status: 500 }
    );
  }
}