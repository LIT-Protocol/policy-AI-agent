import { LitNodeClient } from "@lit-protocol/lit-node-client"
import { LIT_NETWORK } from '@lit-protocol/constants';
import * as ethers from 'ethers';

import { litActionCode } from '../LitActions/humanVerificationAction';
import { litActionCodeTx } from '../LitActions/litActionTx';
import { getChainInfo, getPkpSessionSigs } from './utils';

const LIT_PKP_PUBLIC_KEY = process.env.NEXT_PUBLIC_LIT_PKP_PUBLIC_KEY;

export async function humanVerification(amount: number) {
    console.log("🔄 Connecting to Lit network...");
    const litNodeClient = new LitNodeClient({
      litNetwork: LIT_NETWORK.DatilDev,
      debug: false,
    });
    await litNodeClient.connect();
    console.log("✅ Connected to Lit network");

    const sessionSigs = await getPkpSessionSigs(litNodeClient);

    console.log("🔄 Executing Lit Action for verification...");
    const litActionResponse = await litNodeClient.executeJs({
        sessionSigs,
        code: litActionCode,
        jsParams: {
          publicKey: LIT_PKP_PUBLIC_KEY!,
          sigName: "sig",
          amount: amount
        },
    });
    console.log("✅ Executed Lit Action");
      
    if (litActionResponse.response !== "true") {
        console.error("❌ Transaction process failed");
        return false;
    }

    console.log("📧 Please check your email for verification");
      
    return true;
}

export async function signAndBroadcastTransaction(humanVerification: boolean, txHash?: string, amount?: number) {
    try {
        let finalAmount: number;
        
        if (humanVerification) {
            const response = await fetch(`/api/database/fetch-transaction/${txHash}`);
            const data = await response.json();
            
            if (!data.success || !data.transaction) {
                throw new Error('Failed to fetch transaction details');
            }
            
            finalAmount = data.transaction.amount;
        } else {
            if (amount === undefined) {
                throw new Error('Amount must be provided when human verification is disabled');
            }
            finalAmount = amount;
        }

        console.log("🔄 Connecting to Lit network...");
        const litNodeClient = new LitNodeClient({
            litNetwork: LIT_NETWORK.DatilDev,
            debug: false,
        });
        await litNodeClient.connect();
        console.log("✅ Connected to Lit network");

        const chainInfo = getChainInfo("yellowstone");
        const ethersProvider = new ethers.providers.JsonRpcProvider(chainInfo.rpcUrl);

        const sessionSigs = await getPkpSessionSigs(litNodeClient);
        const gasPrice = await ethersProvider.getGasPrice();
        console.log("Current gas price:", ethers.utils.formatUnits(gasPrice, "gwei"), "gwei");

        const unsignedTransaction = {
            to: "0xa7D7BC15FCD782A5f2217d1Df20DFD14C1d218e9",
            gasLimit: 21000, 
            gasPrice: gasPrice.toHexString(),
            nonce: await ethersProvider.getTransactionCount(ethers.utils.computeAddress(`0x${LIT_PKP_PUBLIC_KEY}`)),
            chainId: chainInfo.chainId,
            value: ethers.utils.parseUnits(finalAmount.toString(), 'gwei').toHexString()
        };

        const unsignedTransactionHash = ethers.utils.keccak256(
            ethers.utils.serializeTransaction(unsignedTransaction)
          );
  
          const litActionResponse = await litNodeClient.executeJs({
              code: litActionCodeTx,
              jsParams: {
                  toSign: ethers.utils.arrayify(unsignedTransactionHash),
                  publicKey: LIT_PKP_PUBLIC_KEY!,
                  sigName: "signedtx",
                  chain: "yellowstone",
                  unsignedTransaction
              },
              sessionSigs: sessionSigs
          });
          console.log("Lit Action Response:", litActionResponse);
  
          if (litActionResponse.response) {
              await fetch('/api/database/update-transaction', {
                  method: 'POST',
                  headers: {
                      'Content-Type': 'application/json',
                  },
                  body: JSON.stringify({ 
                      txHash: txHash,
                      status: 'COMPLETED',
                      approved: true,
                  })
              });
          }
  
          return litActionResponse.response;
    } catch (error) {
        console.error("Failed to sign and broadcast transaction:", error);
        throw error;
    }
}
