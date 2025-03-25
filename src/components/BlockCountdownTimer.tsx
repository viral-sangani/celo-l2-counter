import React, { useEffect, useState } from "react";
import { createPublicClient, http } from "viem";
import { celo } from "viem/chains";
import { CONSTANTS } from "../constants";
import { useConfetti } from "../hooks/useConfetti";

interface BlockCountdownTimerProps {
  onTimerEnd?: () => void;
  onBlockUpdate?: (block: number | null, rpcFailure?: boolean) => void;
}

export const BlockCountdownTimer: React.FC<BlockCountdownTimerProps> = ({
  onTimerEnd,
  onBlockUpdate,
}) => {
  const [currentBlock, setCurrentBlock] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isCompleted, setIsCompleted] = useState(false);
  const { triggerConfetti } = useConfetti(10000);

  // Timer state
  const [hours, setHours] = useState("00");
  const [minutes, setMinutes] = useState("00");
  const [seconds, setSeconds] = useState("00");

  // Fetch initial block
  useEffect(() => {
    const fetchInitialBlock = async () => {
      try {
        const client = createPublicClient({
          chain: celo,
          transport: http(CONSTANTS.CUSTOM_RPC_URL),
        });

        const blockNumber = await client.getBlockNumber();
        const blockNum = Number(blockNumber);
        setCurrentBlock(blockNum);
        if (onBlockUpdate) onBlockUpdate(blockNum);

        // Check if we've already passed the target block
        if (blockNum >= CONSTANTS.TARGET_BLOCK) {
          setIsCompleted(true);
          triggerConfetti();
          if (onTimerEnd) onTimerEnd();
        }

        setLoading(false);
      } catch (err) {
        console.error("BlockCountdownTimer RPC Error:", err);
        setError("Failed to fetch block number: " + err);
        setLoading(false);
        setIsCompleted(true);
        
        // Report the RPC failure to parent component
        if (onBlockUpdate) onBlockUpdate(null, true); // Pass true to indicate RPC failure
        
        if (onTimerEnd) onTimerEnd();
      }
    };

    fetchInitialBlock();
  }, [onTimerEnd, onBlockUpdate, triggerConfetti]);

  // Setup countdown timer
  useEffect(() => {
    if (!currentBlock || isCompleted) return;

    // Calculate initial remaining time
    const blocksRemaining = Math.max(0, CONSTANTS.TARGET_BLOCK - currentBlock);
    const totalSeconds = blocksRemaining * CONSTANTS.AVERAGE_BLOCK_TIME;

    // If no time remaining, mark as completed
    if (totalSeconds <= 0) {
      setIsCompleted(true);
      triggerConfetti();
      if (onTimerEnd) onTimerEnd();
      return;
    }

    let remainingSeconds = totalSeconds;

    // Update the timer display
    const updateTimer = () => {
      const hrs = Math.floor(remainingSeconds / 3600);
      const mins = Math.floor((remainingSeconds % 3600) / 60);
      const secs = Math.floor(remainingSeconds % 60);

      setHours(hrs.toString().padStart(2, "0"));
      setMinutes(mins.toString().padStart(2, "0"));
      setSeconds(secs.toString().padStart(2, "0"));

      remainingSeconds -= 1;

      // Stop at zero
      if (remainingSeconds < 0) {
        remainingSeconds = 0;
        clearInterval(interval);
        setIsCompleted(true);
        triggerConfetti();
        if (onTimerEnd) onTimerEnd();
      }
    };

    // Initial update
    updateTimer();

    // Setup interval for countdown
    const interval = setInterval(updateTimer, 1000);

    return () => clearInterval(interval);
  }, [currentBlock, isCompleted, onTimerEnd, triggerConfetti]);

  // If completed or error, don't render
  if (isCompleted) {
    return null;
  }

  return (
    <div className="bg-[#476520] rounded-lg p-6 max-w-[400px] mx-auto">
      {loading ? (
        <div className="text-center text-white">Loading current block...</div>
      ) : error ? (
        <div className="text-center text-red-200">{error}</div>
      ) : (
        <>
          <div className="grid grid-cols-3 gap-2 md:gap-4 mb-4">
            <div className="bg-white rounded-lg p-2 md:p-4 text-center">
              <div className="text-2xl md:text-4xl font-bold text-[#476520]">{hours}</div>
              <div className="text-xs md:text-sm text-gray-600">Hours</div>
            </div>
            <div className="bg-white rounded-lg p-2 md:p-4 text-center">
              <div className="text-2xl md:text-4xl font-bold text-[#476520]">{minutes}</div>
              <div className="text-xs md:text-sm text-gray-600">Minutes</div>
            </div>
            <div className="bg-white rounded-lg p-2 md:p-4 text-center">
              <div className="text-2xl md:text-4xl font-bold text-[#476520]">{seconds}</div>
              <div className="text-xs md:text-sm text-gray-600">Seconds</div>
            </div>
          </div>

          <div className="text-center text-white">
            <p className="text-sm mb-1">
              Hardfork Block Height: {CONSTANTS.TARGET_BLOCK.toLocaleString()}
            </p>
            <p className="text-sm">March 26, 2025, 3:00 AM UTC</p>
          </div>
        </>
      )}
    </div>
  );
};
