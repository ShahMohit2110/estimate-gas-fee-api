import { Router } from 'express';
import { JsonRpcProvider, Contract, formatUnits, formatEther, isAddress } from 'ethers';
import axios from 'axios';

const router = Router();

// Interface for CoinGecko API response
interface CoinGeckoResponse {
  ethereum: {
    usd: number;
  };
}

interface RequestBody {
  contractAddress?: string;
  abi?: any[];
  functionName: string;
  args?: any[];
  from?: string;
}

router.post('/estimate', async (req: { body: RequestBody }, res) => {
  const { contractAddress, abi, functionName, args = [], from } = req.body;

  // Special case for fetching latest blocks
  if (functionName === 'getLatestBlocks' && !contractAddress && !abi) {
    try {
      const provider = new JsonRpcProvider(process.env.INFURA_URL);
      const latestBlockNumber = await provider.getBlockNumber();
      const numBlocks = args[0] ? parseInt(args[0], 10) : 5; // Default to 5 blocks
      if (numBlocks < 1 || numBlocks > 100) {
        return res.status(400).json({ error: 'Number of blocks must be between 1 and 100' });
      }

      const blocks = [];
      for (let i = 0; i < numBlocks; i++) {
        const block = await provider.getBlock(latestBlockNumber - i);
        if (block) {
          blocks.push({
            number: block.number,
            timestamp: new Date(block.timestamp * 1000).toISOString(),
            transactions: block.transactions.length,
            hash: block.hash,
            validator: block.miner, // or block.author for some providers
          });
        }
      }

      return res.json({
        message: `Latest ${blocks.length} Ethereum blocks.`,
        estimatedGas: '0',
        gasPrice: '0 gwei',
        estimatedFeeInETH: '0',
        result: blocks,
      });
    } catch (err: any) {
      console.error(err);
      return res.status(500).json({ error: `Failed to fetch blocks: ${err.message}` });
    }
  }

  // Special case for fetching ETH price
  if (functionName === 'getEthPrice' && !contractAddress && !abi) {
    try {
      const response = await axios.get<CoinGeckoResponse>(
        'https://api.coingecko.com/api/v3/simple/price?ids=ethereum&vs_currencies=usd'
      );
      const ethPrice = response.data.ethereum.usd;

      return res.json({
        message: 'Current Ethereum price in USD.',
        estimatedGas: '0',
        gasPrice: '0 gwei',
        estimatedFeeInETH: '0',
        result: ethPrice.toString(),
      });
    } catch (err: any) {
      console.error(err);
      return res.status(500).json({ error: `Failed to fetch ETH price: ${err.message}` });
    }
  }

  // Special case for fetching current gas price
  if (functionName === 'getGasPrice' && !contractAddress && !abi) {
    try {
      const provider = new JsonRpcProvider(process.env.INFURA_URL);
      const feeData = await provider.getFeeData();
      const gasPrice = feeData.gasPrice;

      if (!gasPrice) {
        return res.status(500).json({ error: 'Unable to fetch gas price' });
      }

      return res.json({
        message: 'Current Ethereum network gas price.',
        estimatedGas: '0',
        gasPrice: formatUnits(gasPrice, 'gwei') + ' gwei',
        estimatedFeeInETH: '0',
      });
    } catch (err: any) {
      console.error(err);
      return res.status(500).json({ error: `Failed to fetch gas price: ${err.message}` });
    }
  }

  // Existing contract interaction logic
  if (!contractAddress || !abi || !functionName) {
    return res.status(400).json({ error: 'Missing required parameters for contract interaction.' });
  }

  if (!isAddress(contractAddress)) {
    return res.status(400).json({ error: 'Invalid contract address.' });
  }

  if (args[0] && !isAddress(args[0])) {
    return res.status(400).json({ error: 'Invalid address in arguments.' });
  }

  try {
    const provider = new JsonRpcProvider(process.env.INFURA_URL);
    const contract = new Contract(contractAddress, abi, provider);

    let method;
    try {
      method = contract.getFunction(functionName); // Ethers.js v6
      // For Ethers.js v5, use: method = contract[functionName];
    } catch {
      return res.status(400).json({ error: `Function ${functionName} not found in ABI` });
    }

    const functionFragment = contract.interface.getFunction(functionName);
    if (functionFragment?.stateMutability === 'view' || functionFragment?.stateMutability === 'pure') {
      try {
        const result = await method(...args);
        const output = functionFragment.outputs?.[0]?.type;
        let formattedResult;
        if (output === 'uint256' && functionName === 'balanceOf') {
          formattedResult = formatUnits(result, 6); // USDT has 6 decimals
        } else if (output?.startsWith('uint') || output?.startsWith('int')) {
          formattedResult = result.toString(); // Integers (e.g., decimals)
        } else {
          formattedResult = result; // Strings (e.g., symbol, name) or other types
        }
        return res.json({
          message: `Function ${functionName} is a view or pure function and does not consume gas.`,
          estimatedGas: '0',
          gasPrice: '0 gwei',
          estimatedFeeInETH: '0',
          result: formattedResult,
        });
      } catch (err: any) {
        return res.status(500).json({ error: `Failed to execute view function: ${err.message}` });
      }
    }

    const gasEstimateOptions = from && isAddress(from) ? { from } : {};
    let estimatedGas;
    try {
      estimatedGas = await method.estimateGas(...args, gasEstimateOptions);
    } catch (err: any) {
      if (err.code === 'CALL_EXCEPTION' && err.reason?.includes('require')) {
        return res.status(400).json({
          error: 'Transaction would revert, likely due to insufficient balance or invalid parameters.',
          details: err.message,
        });
      }
      throw err;
    }

    const feeData = await provider.getFeeData();
    const gasPrice = feeData.gasPrice;

    if (!gasPrice) {
      return res.status(500).json({ error: 'Unable to fetch gas price' });
    }

    const estimatedFee = estimatedGas * gasPrice;

    return res.json({
      estimatedGas: estimatedGas.toString(),
      gasPrice: formatUnits(gasPrice, 'gwei') + ' gwei',
      estimatedFeeInETH: formatEther(estimatedFee),
    });
  } catch (err: any) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

export default router;