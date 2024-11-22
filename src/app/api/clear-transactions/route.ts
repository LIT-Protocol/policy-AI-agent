import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(request: Request) {
    try {
        // Delete all records from the Transaction table
        await prisma.transaction.deleteMany({});
        
        return NextResponse.json({ 
            success: true,
            message: "All transactions cleared" 
        });
        
    } catch (error) {
        console.error('Failed to clear transactions:', error);
        return NextResponse.json({ 
            success: false, 
            error: 'Failed to clear transactions' 
        });
    }
} 