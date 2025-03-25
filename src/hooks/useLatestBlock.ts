import { useEffect, useState, useRef } from "react";
import { createPublicClient, http } from "viem";
import { celo } from "viem/chains";
import { CONSTANTS } from "../constants";

export const useLatestBlock = () => {
  const [latestBlock, setLatestBlock] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [isRpcDown, setIsRpcDown] = useState(false);
  const rpcFailureRef = useRef(false);

  // Fetch block from the chain
  useEffect(() => {
    const client = createPublicClient({
      chain: celo,
      transport: http(CONSTANTS.CUSTOM_RPC_URL),
    });

    const fetchLatestBlock = async () => {
      try {
        const blockNumber = await client.getBlockNumber();
        setLatestBlock(Number(blockNumber));
        setIsLoading(false);
        setError(null);
      } catch (err) {
        console.error("RPC Error:", err);
        
        // Set error state
        setError(
          err instanceof Error ? err : new Error("Failed to fetch latest block")
        );
        
        // If this is the first RPC failure, mark the RPC as down
        if (!rpcFailureRef.current) {
          console.log("RPC appears to be down - potential migration in progress");
          rpcFailureRef.current = true;
          setIsRpcDown(true);
        }
        
        setIsLoading(false);
      }
    };

    fetchLatestBlock();
    const interval = setInterval(fetchLatestBlock, 5000); // Fetch block every 5 seconds

    return () => clearInterval(interval);
  }, []);

  return { latestBlock, isLoading, error, isRpcDown };
};
