import { LitNodeClient } from "@lit-protocol/lit-node-client"
import { LIT_RPC, LIT_NETWORK, LIT_ABILITY } from '@lit-protocol/constants';
import { LitContracts } from '@lit-protocol/contracts-sdk';
import { LitRelay, EthWalletProvider} from "@lit-protocol/lit-auth-client";
import { LitPKPResource, LitActionResource } from "@lit-protocol/auth-helpers";
import * as ethers from 'ethers';

import { litActionCode } from './litAction';
import { litActionCodeTx } from './litActionTx';
import { getChainInfo } from './utils';

const ETHEREUM_PRIVATE_KEY = process.env.NEXT_PUBLIC_ETHEREUM_PRIVATE_KEY;
const LIT_PKP_PUBLIC_KEY = process.env.NEXT_PUBLIC_LIT_PKP_PUBLIC_KEY;
let sessionSigs: any;
let litNodeClient: LitNodeClient;
const chainInfo = getChainInfo("base");

const USDC_ADDRESS = "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913";
const USDC_ABI = [
    "function transfer(address to, uint256 amount) returns (bool)",
];

async function makeTransaction(amount: number) {
    console.log("🔄 Connecting to Lit network...");
    litNodeClient = new LitNodeClient({
      litNetwork: LIT_NETWORK.DatilDev,
      debug: false,
    });
    await litNodeClient.connect();
    console.log("✅ Connected to Lit network");

    const ethersWallet = new ethers.Wallet(
        ETHEREUM_PRIVATE_KEY!,
        new ethers.providers.JsonRpcProvider(chainInfo.rpcUrl)
    );

    console.log("🔄 Connecting LitContracts client to network...");
    const litContracts = new LitContracts({
      signer: ethersWallet,
      network: LIT_NETWORK.DatilDev,
      debug: false,
    });
    await litContracts.connect();
    console.log("✅ Connected LitContracts client to network");

    const authMethod = await EthWalletProvider.authenticate({signer: ethersWallet, litNodeClient});

    let pkpInfo;
    if (LIT_PKP_PUBLIC_KEY === undefined || LIT_PKP_PUBLIC_KEY === "") {
      console.log("🔄 PKP wasn't provided, minting a new one...");
      pkpInfo = (await litContracts.pkpNftContractUtils.write.mint()).pkp;
      console.log("✅ PKP successfully minted");
      console.log(`ℹ️  PKP token ID: ${pkpInfo.tokenId}`);
      console.log(`ℹ️  PKP public key: ${pkpInfo.publicKey}`);
      console.log(`ℹ️  PKP ETH address: ${pkpInfo.ethAddress}`);
    } else {
      console.log(`ℹ️  Using provided PKP: ${LIT_PKP_PUBLIC_KEY}`);
      pkpInfo = {
        publicKey: LIT_PKP_PUBLIC_KEY,
        ethAddress: ethers.utils.computeAddress(`0x${LIT_PKP_PUBLIC_KEY}`),
      };
    }

    sessionSigs = await litNodeClient.getPkpSessionSigs({
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
        expiration: new Date(Date.now() + 1000 * 60 * 10).toISOString(), // 10 minutes
      });
      console.log("✅ Got PKP Session Sigs", sessionSigs);

      console.log("🔄 Executing Lit Action...");
      const litActionResponse = await litNodeClient.executeJs({
        sessionSigs,
        code: litActionCode,
        jsParams: {
          publicKey: pkpInfo.publicKey,
          sigName: "sig",
          amount: amount
        },
      });
      console.log("✅ Executed Lit Action");
      console.log("Lit Action Response:", litActionResponse);
      
      console.log("Lit Action Response:", litActionResponse);
      
      if (litActionResponse.response !== "true") {
        console.error("❌ Transaction process failed");
        return false;
      }

      console.log("✅ Transaction processed successfully");
      console.log("📧 Please check your email if verification is needed");
      
      return true;
}

export async function signAndBroadcastTransaction(txHash: string) {
    try {
        // First connect to Lit network
        console.log("🔄 Connecting to Lit network...");
        litNodeClient = new LitNodeClient({
            litNetwork: LIT_NETWORK.DatilDev,
            debug: false,
        });
        await litNodeClient.connect();
        console.log("✅ Connected to Lit network");

        // Get auth session sigs
        const ethersWallet = new ethers.Wallet(
            ETHEREUM_PRIVATE_KEY!,
            new ethers.providers.JsonRpcProvider(chainInfo.rpcUrl)
        );

        const authMethod = await EthWalletProvider.authenticate({signer: ethersWallet, litNodeClient});

        sessionSigs = await litNodeClient.getPkpSessionSigs({
            pkpPublicKey: LIT_PKP_PUBLIC_KEY!,
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
            expiration: new Date(Date.now() + 1000 * 60 * 10).toISOString(), // 10 minutes
        });

        // Get transaction details from database
        const response = await fetch(`/api/transaction/${txHash}`);
        const data = await response.json();
        if (!data.success) {
            throw new Error('Failed to fetch transaction');
        }
        const transaction = data.transaction;

        // Format transaction with correct types
        const ethersProvider = new ethers.providers.JsonRpcProvider(
            chainInfo.rpcUrl
          );

        console.log("🔄 Creating and serializing unsigned transaction...");
        const usdcContract = new ethers.Contract(
            USDC_ADDRESS,
            USDC_ABI,
            ethersProvider
        );

        const pkpAddress = ethers.utils.computeAddress(`0x${LIT_PKP_PUBLIC_KEY}`);

        const transferAmount = ethers.utils.parseUnits("1", 6); // Try 1 USDC first
        console.log("Transfer amount:", ethers.utils.formatUnits(transferAmount, 6), "USDC");

        // Get current gas price
        const gasPrice = await ethersProvider.getGasPrice();
        console.log("Current gas price:", ethers.utils.formatUnits(gasPrice, "gwei"), "gwei");

        const unsignedTransaction = {
            to: USDC_ADDRESS,
            gasLimit: 100000,
            gasPrice: gasPrice.toHexString(),
            nonce: await ethersProvider.getTransactionCount(pkpAddress),
            chainId: chainInfo.chainId,
            value: "0x0",
            data: usdcContract.interface.encodeFunctionData("transfer", [
                ethersWallet.address,
                transferAmount
            ])
        };
    
        // Log the transaction details
        console.log("Transaction details:", {
            to: unsignedTransaction.to,
            from: pkpAddress,
            recipient: ethersWallet.address,
            amount: ethers.utils.formatUnits(transferAmount, 6),
            nonce: unsignedTransaction.nonce,
            gasPrice: ethers.utils.formatUnits(gasPrice, "gwei")
        });
    
        const unsignedTransactionHash = ethers.utils.keccak256(
          ethers.utils.serializeTransaction(unsignedTransaction)
        );
        console.log("✅ Transaction created and serialized");

        // Update transaction status to APPROVED
        await fetch('/api/transaction/update-status', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ 
                txHash: txHash,
                status: 'APPROVED'
            })
        });


        const pkpSigned = await litNodeClient.pkpSign({
          sessionSigs,
          pubKey: LIT_PKP_PUBLIC_KEY!,
          toSign: ethers.utils.arrayify(unsignedTransactionHash)
        });
        console.log("✅ Pkp signed transaction", pkpSigned);

        // Broadcast the signed transaction
        const signedTx = ethers.utils.serializeTransaction(
            unsignedTransaction,
            pkpSigned.signature  // Use the full signature directly
        );
        console.log("Signed transaction:", signedTx);

        console.log("Broadcasting transaction...");
        const tx = await ethersProvider.sendTransaction(signedTx);
        console.log("Transaction sent:", tx.hash);

        // Wait for confirmation
        const receipt = await tx.wait(1);
        console.log("Transaction confirmed:", receipt);

        // Update transaction status
        if (receipt.status === 1) {
            await fetch('/api/transaction/update-status', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ 
                    txHash: txHash,
                    status: 'COMPLETED',
                    blockchainTxHash: tx.hash
                })
            });
        }

        return tx.hash;
    } catch (error) {
        console.error("Failed to sign and broadcast transaction:", error);
        throw error;
    }
}

async function authenticateToken(token: string, txHash: string) {
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

        // Update transaction status
        await fetch('/api/store-transaction/update', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ 
                status: 'AUTHENTICATED',
                txHash: txHash
            })
        });

        console.log("✅ Authentication and transaction broadcast successful");
        return result.session;
    } catch (error) {
        console.error("Authentication failed:", error);
        return null;
    }
}

export { makeTransaction, authenticateToken };