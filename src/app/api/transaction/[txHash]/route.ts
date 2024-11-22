import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(
  request: Request,
  { params }: { params: { txHash: string } }
) {
  try {
    const transaction = await prisma.transaction.findUnique({
      where: {
        txHash: params.txHash,
      },
    });

    if (!transaction) {
      return NextResponse.json({ 
        success: false, 
        error: 'Transaction not found' 
      });
    }

    return NextResponse.json({ 
      success: true, 
      transaction: transaction 
    });
  } catch (error) {
    console.error('Failed to fetch transaction:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Failed to fetch transaction' 
    });
  }
} 