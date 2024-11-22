import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
    try {
        const transaction = await prisma.transaction.findFirst({
            where: {
                status: 'PENDING'
            },
            orderBy: {
                timestamp: 'desc'
            }
        });

        if (!transaction) {
            return NextResponse.json({ 
                success: false, 
                error: 'No pending transaction found' 
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