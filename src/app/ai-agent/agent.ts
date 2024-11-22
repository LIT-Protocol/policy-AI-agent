import { getBaseChainMetrics } from '../utils';

export async function autonomousAgent() {
  try {
    // Get chain metrics first
    const metrics = await getBaseChainMetrics();
    
    // Get AI decision from server endpoint with metrics
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
    console.log("AI Agent decision:", decision);
    
    if (decision.shouldTransact) {
      console.log("AI Agent initiating transaction:", decision);
      const makeTransaction = (await import('../agent')).makeTransaction;
      await makeTransaction(decision.amount);
    }

    return decision;
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