import { NextResponse } from 'next/server';

export async function POST(request: Request) {
    try {
        const { metrics } = await request.json();
        const decision = makeSwapDecision(metrics);
        
        return NextResponse.json({
            success: true,
            decision: decision
        });
        
    } catch (error) {
        console.error('AI decision failed:', error);
        return NextResponse.json({ 
            success: false, 
            error: 'Failed to make AI decision' 
        });
    }
}

function makeSwapDecision(metrics: any) {
    // Base amount in USDC
    let baseAmount = 5; // 5 USDC
    const shouldTransact = true; // Always true for testing
    let urgency = "medium";
    let reasoning = "";

    if (metrics.gasPrice > 100) {
        reasoning += "⚠️ Gas prices high but proceeding. ";
    } else if (metrics.gasPrice < 30) {
        urgency = "high";
        reasoning += "✅ Gas prices favorable. ";
    }

    if (metrics.networkLoad === "High") {
        reasoning += "⚠️ High network congestion but proceeding. ";
    } else if (metrics.networkLoad === "Low") {
        urgency = "high";
        reasoning += "✅ Network congestion low. ";
    }

    if (metrics.ethPrice < 2000) {
        urgency = "high";
        reasoning += "✅ ETH price favorable for buying. ";
    } else if (metrics.ethPrice > 2500) {
        reasoning += "⚠️ ETH price relatively high but proceeding. ";
    }

    reasoning += `\nCurrent conditions:
        - Gas Price: ${metrics.gasPrice} gwei
        - Network Load: ${metrics.networkLoad}
        - ETH Price: $${metrics.ethPrice.toFixed(2)}
        - Amount to swap: ${baseAmount} USDC
        - Transactions in last block: ${metrics.transactionCount}`;

    return {
        shouldTransact,
        amount: baseAmount.toString(),
        reasoning,
        urgency,
        metrics
    };
} 