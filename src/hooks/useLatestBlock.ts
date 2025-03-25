import { useEffect, useState } from "react";
import { createPublicClient, http } from "viem";
import { celo } from "viem/chains";
import { CONSTANTS } from "../constants";

export const useLatestBlock = () => {
  const [latestBlock, setLatestBlock] = useState<number>(CONSTANTS.CURRENT_BLOCK);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  // Fetch block from the chain
  useEffect(() => {
    const client = createPublicClient({
      chain: celo,
      transport: http(),
    });

    const fetchLatestBlock = async () => {
      try {
        const blockNumber = await client.getBlockNumber();
        setLatestBlock(Number(blockNumber));
        setIsLoading(false);
      } catch (err) {
        setError(
          err instanceof Error ? err : new Error("Failed to fetch latest block")
        );
        setIsLoading(false);
      }
    };

    fetchLatestBlock();
    const interval = setInterval(fetchLatestBlock, 5000); // Fetch block every 5 seconds

    return () => clearInterval(interval);
  }, []);

  return { latestBlock, isLoading, error };
};
