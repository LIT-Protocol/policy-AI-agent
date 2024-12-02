import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { v4 as uuidv4 } from 'uuid';

export async function POST(request: Request) {
    try {
        const { amount, status } = await request.json();
        
        if (amount === undefined) {
            throw new Error('Amount is required');
        }

        const amountInGwei = Math.floor(parseFloat(amount));
        
        const timestamp = Date.now();
        const randomId = uuidv4().slice(0, 12);
        const txHash = `tx_${timestamp}_${randomId}_${Math.floor(Math.random() * 10)}`;
        
        console.log('Creating transaction with:', {
            txHash,
            amountInGwei,
            status
        });

        const transaction = await prisma.transaction.create({
            data: {
                txHash,
                amount: amountInGwei,
                timestamp: new Date(timestamp),
                status: status || 'PENDING'
            }
        });
        
        console.log('Transaction created:', transaction);

        return NextResponse.json({ 
            success: true,
            transaction: {
                ...transaction,
                amount: parseFloat(amount)
            }
        });
        
    } catch (error) {
        console.error('Failed to store transaction:', error);
        return NextResponse.json({ 
            success: false, 
            error: error instanceof Error ? error.message : 'Failed to store transaction',
            details: error
        }, { status: 400 });
    }
} 