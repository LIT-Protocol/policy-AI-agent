import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(request: Request) {
    try {
        const { status, txHash } = await request.json();
        
        // Update specific transaction by txHash
        const transaction = await prisma.transaction.update({
            where: {
                txHash: txHash
            },
            data: {
                status: status,
                timestamp: new Date()
            }
        });
        
        return NextResponse.json({ 
            success: true,
            transaction: transaction 
        });
        
    } catch (error) {
        console.error('Failed to update transaction:', error);
        return NextResponse.json({ 
            success: false, 
            error: 'Failed to update transaction' 
        });
    }
} 