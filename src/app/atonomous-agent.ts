import { getYellowstoneChainMetrics } from './utils';
import { humanVerification, signAndBroadcastTransaction } from './agent-helpers';

export async function autonomousAgent() {
  try {
    const metrics = await getYellowstoneChainMetrics();
    
    const response = await fetch('/api/ai-decision', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ metrics })
    });
    const data = await response.json();
    
    if (!data.success) {
      throw new Error('Failed to get AI decision');
    }

    const { decision } = data;
    
    if (decision.shouldTransact) {
      if (decision.requiresVerification) {
        console.log("Amount exceeds threshold - requesting human verification");
        console.log(decision.reasoning);
        await humanVerification(parseFloat(decision.amount));
        return decision;
      }
      
      console.log("AI Agent initiating direct transaction:", decision.reasoning);
      const txHash = await signAndBroadcastTransaction(false, undefined, decision.amount);
      console.log("Transaction completed with hash:", txHash);
      return decision;
    }
  } catch (error) {
    console.error('AI agent error:', error);
    throw error;
  }
}

export async function startAutonomousAgent() {
  setInterval(async () => {
    try {
      await autonomousAgent();
    } catch (error) {
      console.error('Autonomous cycle error:', error);
    }
  }, 1 * 60 * 1000); // Run every minute
} 