import { NextResponse } from 'next/server';
import OpenAI from 'openai';

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY
});

export async function POST(request: Request) {
    try {
        const { metrics } = await request.json();
        const decision = await makeSwapDecision(metrics);
        
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

async function makeSwapDecision(metrics: any) {
    const AMOUNT_THRESHOLD = process.env.AMOUNT_THRESHOLD // gwei threshold for verification
    let shouldTransact = true;
    let requiresVerification = false;
    let urgency = "medium";
    let reasoning = "";

    // Generate amount using OpenAI
    const prompt = `Given the current Yellowstone network conditions:
        - Gas Price: ${metrics.gasPrice} gwei
        - Network Load: ${metrics.networkLoad}
        - Transactions in last block: ${metrics.transactionCount}
        
        Generate a suitable gwei amount to send in a transaction. The amount should be between 1 and 40 gwei.
        Consider the following:
        - If network load is High, suggest lower amounts
        - If gas price is high (>50 gwei), suggest lower amounts
        - If conditions are favorable (low load, low gas), you can suggest higher amounts
        
        Return in JSON format: { "amount": number, "reasoning": "string" }`;

    const completion = await openai.chat.completions.create({
        messages: [{ role: "user", content: prompt }],
        model: "gpt-4o-mini",
        response_format: { type: "json_object" },
    });

    const aiResponse = JSON.parse(completion.choices[0].message.content!);
    const baseAmount = parseFloat(aiResponse.amount);
    reasoning = aiResponse.reasoning;
    console.log("AI Response:", aiResponse);

    // Check if amount requires verification
    if (baseAmount > parseFloat(AMOUNT_THRESHOLD!)) {
        requiresVerification = true;
        reasoning += "\n⚠️ Amount exceeds threshold - requires human verification.";
    }

    // Add network condition analysis
    if (metrics.networkLoad === "High") {
        reasoning += "\n⚠️ High network congestion but proceeding.";
    } else if (metrics.networkLoad === "Low") {
        urgency = "high";
        reasoning += "\n✅ Network congestion low.";
    }

    if (metrics.gasPrice > 50) {
        reasoning += "\n⚠️ Gas prices are high.";
        urgency = "low";
    } else if (metrics.gasPrice < 20) {
        urgency = "high";
        reasoning += "\n✅ Gas prices are favorable.";
    }

    reasoning += `\nCurrent conditions:
        - Gas Price: ${metrics.gasPrice} gwei
        - Network Load: ${metrics.networkLoad}
        - Transactions in last block: ${metrics.transactionCount}
        - Amount to send: ${baseAmount} gwei
        - Requires Verification: ${requiresVerification}`;

    return {
        shouldTransact,
        amount: baseAmount.toString(),
        reasoning,
        urgency,
        requiresVerification,
        metrics
    };
} 