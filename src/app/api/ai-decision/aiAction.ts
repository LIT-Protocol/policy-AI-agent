//@ts-nocheck

const _litAIActionCode = async () => {
    try {
        // 1. Prepare the prompt with network metrics
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

        // 2. Make OpenAI API call within Lit Action
        const openAIResponse = await LitActions.runOnce(
            { waitForResponse: true, name: "AI_Decision" },
            async () => {
                try {
                    const response = await fetch(
                        "https://api.openai.com/v1/chat/completions",
                        {
                            method: "POST",
                            headers: {
                                "Content-Type": "application/json",
                                Authorization: `Bearer ${apiKey}`,
                            },
                            body: JSON.stringify({
                                model: "gpt-4o-mini",
                                messages: [{ role: "user", content: prompt }],
                                response_format: { type: "json_object" }
                            }),
                        }
                    );

                    if (!response.ok) {
                        throw new Error(`OpenAI API error: ${response.statusText}`);
                    }

                    const data = await response.json();
                    
                    if (!data.choices?.[0]?.message?.content) {
                        throw new Error('Invalid response format from OpenAI');
                    }

                    return data.choices[0].message.content;
                } catch (error) {
                    console.error('OpenAI API Error:', error);
                    throw new Error(`OpenAI API Error: ${error.message}`);
                }
            }
        );

        // Validate OpenAI response
        if (!openAIResponse) {
            throw new Error('No response received from OpenAI');
        }

        let decision;
        try {
            decision = JSON.parse(openAIResponse);
        } catch (error) {
            console.error('JSON Parse Error:', openAIResponse);
            throw new Error(`Failed to parse OpenAI response: ${error.message}`);
        }

        // Validate decision object
        if (!decision.amount || !decision.reasoning) {
            throw new Error('Invalid decision format from OpenAI');
        }

        const baseAmount = parseFloat(decision.amount);
        if (isNaN(baseAmount)) {
            throw new Error('Invalid amount value from OpenAI');
        }

        let reasoning = decision.reasoning;
        let requiresVerification = false;
        let urgency = "medium";
        let shouldTransact = true;

        // 4. Apply business logic and build final response
        if (baseAmount > parseFloat(amount_threshold)) {
            requiresVerification = true;
            reasoning += "\n⚠️ Amount exceeds threshold - requires human verification.";
        }

        // Network load considerations
        if (metrics.networkLoad === "High") {
            reasoning += "\n⚠️ High network congestion but proceeding.";
        } else if (metrics.networkLoad === "Low") {
            urgency = "high";
            reasoning += "\n✅ Network congestion low.";
        }

        // Gas price considerations
        if (metrics.gasPrice > 50) {
            reasoning += "\n⚠️ Gas prices are high.";
            urgency = "low";
        } else if (metrics.gasPrice < 20) {
            urgency = "high";
            reasoning += "\n✅ Gas prices are favorable.";
        }

        // 5. Build summary
        reasoning += `\nCurrent conditions:
            - Gas Price: ${metrics.gasPrice} gwei
            - Network Load: ${metrics.networkLoad}
            - Transactions in last block: ${metrics.transactionCount}
            - Amount to send: ${baseAmount} gwei
            - Requires Verification: ${requiresVerification}`;

        // 6. Set Lit Action response
        const response = {
            shouldTransact,
            amount: baseAmount.toString(),
            reasoning,
            urgency,
            requiresVerification,
            metrics
        };

        Lit.Actions.setResponse({ response: JSON.stringify(response) });

    } catch (error) {
        console.error("❌ Error in Lit Action:", error);
        Lit.Actions.setResponse({ 
            response: {
                shouldTransact: false,
                error: error.message,
                details: error.stack
            }
        });
    }
};
            
export const litAIActionCode = `(${_litAIActionCode.toString()})();`;