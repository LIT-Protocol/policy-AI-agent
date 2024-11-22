import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { v4 as uuidv4 } from 'uuid';

export async function POST(request: Request) {
    try {
        const { amount, status } = await request.json();
        
        // Validate input
        if (amount === undefined) {
            throw new Error('Amount is required');
        }

        // Convert amount to integer (assuming amount is in USDC with 6 decimals)
        const amountInInt = Math.floor(parseFloat(amount) * 1_000_000);
        
        // Generate unique transaction hash
        const timestamp = Date.now();
        const randomId = uuidv4().slice(0, 12);
        const txHash = `tx_${timestamp}_${randomId}_${Math.floor(Math.random() * 10)}`;
        
        console.log('Creating transaction with:', {
            txHash,
            amountInInt,
            status
        });

        // Create transaction record
        const transaction = await prisma.transaction.create({
            data: {
                txHash,
                amount: amountInInt,
                timestamp: new Date(timestamp),
                status: status || 'PENDING'
            }
        });
        
        console.log('Transaction created:', transaction);

        // Return response with original amount format
        return NextResponse.json({ 
            success: true,
            transaction: {
                ...transaction,
                amount: parseFloat(amount) // Return original amount for display
            }
        });
        
    } catch (error) {
        console.error('Failed to store transaction:', error);
        // Return more detailed error message
        return NextResponse.json({ 
            success: false, 
            error: error instanceof Error ? error.message : 'Failed to store transaction',
            details: error
        }, { status: 400 });
    }
} 