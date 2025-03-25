import React, { useEffect, useState } from "react";
import { createPublicClient, http } from "viem";
import { celo } from "viem/chains";
import { CONSTANTS } from "../constants";

interface BlockCountdownTimerProps {
  onTimerEnd?: () => void;
}

export const BlockCountdownTimer: React.FC<BlockCountdownTimerProps> = ({
  onTimerEnd,
}) => {
  const [currentBlock, setCurrentBlock] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isCompleted, setIsCompleted] = useState(false);

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
          transport: http(),
        });

        const blockNumber = await client.getBlockNumber();
        const blockNum = Number(blockNumber);
        setCurrentBlock(blockNum);

        // Check if we've already passed the target block
        if (blockNum >= CONSTANTS.TARGET_BLOCK) {
          setIsCompleted(true);
          if (onTimerEnd) onTimerEnd();
        }

        setLoading(false);
      } catch (err) {
        setError("Failed to fetch block number: " + err);
        setLoading(false);
        setIsCompleted(true);
        if (onTimerEnd) onTimerEnd();
      }
    };

    fetchInitialBlock();
  }, [onTimerEnd]);

  // Setup countdown timer
  useEffect(() => {
    if (!currentBlock || isCompleted) return;

    // Calculate initial remaining time
    const blocksRemaining = Math.max(0, CONSTANTS.TARGET_BLOCK - currentBlock);
    const totalSeconds = blocksRemaining * CONSTANTS.AVERAGE_BLOCK_TIME;

    // If no time remaining, mark as completed
    if (totalSeconds <= 0) {
      setIsCompleted(true);
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
        if (onTimerEnd) onTimerEnd();
      }
    };

    // Initial update
    updateTimer();

    // Setup interval for countdown
    const interval = setInterval(updateTimer, 1000);

    return () => clearInterval(interval);
  }, [currentBlock, isCompleted, onTimerEnd]);

  // If completed or error, don't render
  if (isCompleted) {
    return null;
  }

  return (
    <div className="bg-white p-8 shadow-lg">
      <h2 className="text-2xl font-bold text-[#476520] mb-6 text-center">
        Celo L2 Hardfork Countdown
      </h2>

      {loading ? (
        <div className="text-center text-gray-600">
          Loading current block...
        </div>
      ) : error ? (
        <div className="text-center text-red-600">{error}</div>
      ) : (
        <>
          <div className="grid grid-cols-3 gap-4 max-w-md mx-auto mb-8">
            <div className="bg-[#476520] p-4 text-white text-center">
              <div className="text-3xl font-bold">{hours}</div>
              <div className="text-sm">Hours</div>
            </div>
            <div className="bg-[#476520] p-4 text-white text-center">
              <div className="text-3xl font-bold">{minutes}</div>
              <div className="text-sm">Minutes</div>
            </div>
            <div className="bg-[#476520] p-4 text-white text-center">
              <div className="text-3xl font-bold">{seconds}</div>
              <div className="text-sm">Seconds</div>
            </div>
          </div>

          <div className="text-center">
            <p className="font-medium text-gray-700">
              Blocks remaining:{" "}
              <span className="text-[#476520]">
                {currentBlock
                  ? Math.max(
                      0,
                      CONSTANTS.TARGET_BLOCK - currentBlock
                    ).toLocaleString()
                  : "0"}
              </span>
            </p>
          </div>
        </>
      )}
    </div>
  );
};
