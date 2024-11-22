import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(request: Request) {
    try {
        const { txHash, status, blockchainTxHash } = await request.json();
        
        // Update transaction status and blockchain txHash if provided
        const transaction = await prisma.transaction.update({
            where: {
                txHash: txHash
            },
            data: {
                status: status,
                approved: status === 'APPROVED',
                ...(blockchainTxHash && { txHash: blockchainTxHash }),
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
            error: 'Failed to update transaction status' 
        });
    }
} 