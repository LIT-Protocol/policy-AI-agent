import { NextResponse } from 'next/server';
import { prisma } from '../../../../../lib/prisma';

export async function GET(
  request: Request,
  { params }: { params: { txHash: string } }
) {
  try {
    console.log("Fetching transaction:", params.txHash);
    const transaction = await prisma.transaction.findUnique({
      where: {
        txHash: params.txHash,
      },
    });

    console.log("Found transaction:", transaction);

    if (!transaction) {
      return NextResponse.json({ 
        success: false, 
        error: 'Transaction not found' 
      }, { status: 404 });
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
    }, { status: 500 });
  }
} 

export async function POST(
  request: Request,
  { params }: { params: { txHash: string } }
) {
  try {
    const body = await request.json();
    console.log("Updating transaction:", params.txHash, body);

    const transaction = await prisma.transaction.update({
      where: {
        txHash: params.txHash,
      },
      data: body
    });

    console.log("Updated transaction:", transaction);

    return NextResponse.json({ 
      success: true,
      transaction
    });

  } catch (error) {
    console.error('Failed to update transaction:', error);
    return NextResponse.json({ 
      success: false, 
      error: error instanceof Error ? error.message : 'Failed to update transaction' 
    }, { status: 500 });
  }
} 