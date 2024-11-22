import { LIT_CHAINS } from "@lit-protocol/constants";
import * as ethers from 'ethers';

// Base mainnet addresses
const USDC_ADDRESS = "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913";
const WETH_ADDRESS = "0x4200000000000000000000000000000000000006";
const UNISWAP_V3_POOL = "0x4c36388be6f416a29c8d8eee81c771ce6be14b18";

export async function getBaseChainMetrics() {
  try {
    const provider = new ethers.providers.JsonRpcProvider("https://mainnet.base.org");
    
    // Get gas price
    const gasPrice = await provider.getGasPrice();
    const gasPriceGwei = parseFloat(ethers.utils.formatUnits(gasPrice, "gwei"));

    // Get latest block
    const block = await provider.getBlock("latest");
    const transactionCount = block.transactions.length;
    
    // Get ETH price from an API (you might want to use a different price feed)
    const ethPriceResponse = await fetch('https://api.coingecko.com/api/v3/simple/price?ids=ethereum&vs_currencies=usd');
    const ethPriceData = await ethPriceResponse.json();
    const ethPrice = ethPriceData.ethereum.usd;

    // Determine network load based on transaction count
    let networkLoad = "Low";
    if (transactionCount > 100) networkLoad = "High";
    else if (transactionCount > 50) networkLoad = "Medium";

    return {
      gasPrice: gasPriceGwei,
      networkLoad,
      ethPrice,
      transactionCount,
      blockTimestamp: block.timestamp
    };
  } catch (error) {
    console.error('Failed to fetch chain metrics:', error);
    return {
      gasPrice: 0,
      networkLoad: "Unknown",
      ethPrice: 0,
      transactionCount: 0,
      blockTimestamp: Date.now()
    };
  }
}

async function getEthPrice(provider: ethers.providers.JsonRpcProvider) {
    const poolAbi = [
        "function slot0() external view returns (uint160 sqrtPriceX96, int24 tick, uint16 observationIndex, uint16 observationCardinality, uint16 observationCardinalityNext, uint8 feeProtocol, bool unlocked)"
    ];
    
    const pool = new ethers.Contract(UNISWAP_V3_POOL, poolAbi, provider);
    const { tick } = await pool.slot0();
    
    // Calculate price from tick
    const price = Math.pow(1.0001, tick);
    return price; // Returns price in USDC per ETH
}

async function getNetworkLoad(provider: ethers.providers.JsonRpcProvider) {
    const blockNumber = await provider.getBlockNumber();
    const blocks = await Promise.all(
        Array.from({ length: 5 }, (_, i) => 
            provider.getBlock(blockNumber - i)
        )
    );
    
    const avgTxCount = blocks.reduce((sum, block) => 
        sum + block.transactions.length, 0
    ) / blocks.length;
    
    if (avgTxCount < 50) return "Low";
    if (avgTxCount > 150) return "High";
    return "Medium";
}

export const getEnv = (name: string): string => {
    const env = process.env[name];
    if (env === undefined || env === "")
      throw new Error(
        `${name} ENV is not defined, please define it in the .env file`
      );
    return env;
  };

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
  