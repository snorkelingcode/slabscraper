import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

// GET all cards
export async function GET(request) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const id = searchParams.get('id');
    
    // If ID is provided, get a specific card with all its data
    if (id) {
      const card = await prisma.card.findUnique({
        where: { id },
        include: {
          grades: {
            include: {
              auctions: true
            }
          }
        }
      });
      
      if (!card) {
        return NextResponse.json(
          { error: 'Card not found' },
          { status: 404 }
        );
      }
      
      // Get volume metrics for each grade
      const gradesWithMetrics = await Promise.all(
        card.grades.map(async (grade) => {
          const metrics = await prisma.volumeMetrics.findUnique({
            where: { gradeId: grade.id }
          });
          
          return {
            ...grade,
            volumeMetrics: metrics || null
          };
        })
      );
      
      return NextResponse.json({
        ...card,
        grades: gradesWithMetrics
      });
    }
    
    // Otherwise, get all cards (without detailed grade data)
    const cards = await prisma.card.findMany({
      include: {
        grades: {
          select: {
            id: true,
            grade: true,
            recentPrice: true,
            averagePrice: true,
            population: true,
            marketCap: true
          }
        }
      }
    });
    
    return NextResponse.json(cards);
  } catch (error) {
    console.error('Error retrieving cards:', error);
    return NextResponse.json(
      { error: 'Failed to retrieve cards', message: error.message },
      { status: 500 }
    );
  }
}