import { LIT_CHAINS, LIT_RPC, LIT_ABILITY, LIT_NETWORK } from "@lit-protocol/constants";
import { LitPKPResource, LitActionResource } from "@lit-protocol/auth-helpers";
import { LitNodeClient } from "@lit-protocol/lit-node-client"
import { EthWalletProvider} from "@lit-protocol/lit-auth-client";

import * as ethers from 'ethers';

const ETHEREUM_PRIVATE_KEY = process.env.NEXT_PUBLIC_ETHEREUM_PRIVATE_KEY;
const LIT_PKP_PUBLIC_KEY = process.env.NEXT_PUBLIC_LIT_PKP_PUBLIC_KEY;

export async function getYellowstoneChainMetrics() {
  try {
    const provider = new ethers.providers.JsonRpcProvider(LIT_RPC.CHRONICLE_YELLOWSTONE);
    
    const gasPrice = await provider.getGasPrice();
    const gasPriceGwei = parseFloat(ethers.utils.formatUnits(gasPrice, "gwei"));

    const block = await provider.getBlock("latest");
    const transactionCount = block.transactions.length;
    
    let networkLoad = "Low";
    if (transactionCount > 100) networkLoad = "High";
    else if (transactionCount > 50) networkLoad = "Medium";

    return {
      gasPrice: gasPriceGwei,
      networkLoad,
      transactionCount
    };
  } catch (error) {
    console.error('Failed to fetch chain metrics:', error);
    return {
      gasPrice: 0,
      networkLoad: "Unknown", 
      transactionCount: 0
    };
  }
}

  export const getChainInfo = (
    chain: string
  ): { rpcUrl: string; chainId: number } => {
    if (LIT_CHAINS[chain] === undefined)
      throw new Error(`Chain: ${chain} is not supported by Lit`);
  
    return {
      rpcUrl: LIT_CHAINS[chain].rpcUrls[0],
      chainId: LIT_CHAINS[chain].chainId,
    };
  };
  
  export async function getPkpSessionSigs(litNodeClient: LitNodeClient) {
    const ethersWallet = new ethers.Wallet(
        ETHEREUM_PRIVATE_KEY!,
        new ethers.providers.JsonRpcProvider(LIT_RPC.CHRONICLE_YELLOWSTONE)
    );

    const authMethod = await EthWalletProvider.authenticate({signer: ethersWallet, litNodeClient});

    let pkpInfo = {
        publicKey: LIT_PKP_PUBLIC_KEY!,
        ethAddress: ethers.utils.computeAddress(`0x${LIT_PKP_PUBLIC_KEY}`),
    };

    const sessionSigs = await litNodeClient.getPkpSessionSigs({
        pkpPublicKey: pkpInfo.publicKey,
        authMethods: [authMethod],
        resourceAbilityRequests: [
          {
            resource: new LitPKPResource("*"),
            ability: LIT_ABILITY.PKPSigning,
          },
          {
            resource: new LitActionResource("*"),
            ability: LIT_ABILITY.LitActionExecution,
          },
        ],
        expiration: new Date(Date.now() + 1000 * 60 * 10).toISOString(),
    });
    console.log("✅ Got PKP Session Sigs");
    return sessionSigs;
  }

  export async function authenticateToken(token: string, txHash: string) {
    try {
        const response = await fetch('/api/auth/authenticate', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ token })
        });

        const result = await response.json();
        if (!result.success) {
            throw new Error(result.error);
        }

        await fetch('/api/database/update-transaction', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ 
                status: 'AUTHENTICATED',
                approved: false,
                txHash: txHash
            })
        });

        console.log("✅ Authentication successful");
        return result.session;
    } catch (error) {
        console.error("Authentication failed:", error);
        return null;
    }
}
