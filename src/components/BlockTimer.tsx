import React from "react";

interface BlockTimerProps {
  currentBlock: number;
  targetBlock: number;
  averageBlockTime: number;
}

export const BlockTimer: React.FC<BlockTimerProps> = ({
  currentBlock,
  targetBlock,
  averageBlockTime,
}) => {
  // Calculate blocks remaining
  const blocksRemaining = Math.max(0, targetBlock - currentBlock);
  
  // Calculate estimated date
  const secondsRemaining = blocksRemaining * averageBlockTime;
  const estimatedDate = new Date(Date.now() + secondsRemaining * 1000);

  return (
    <div className="text-center">
      <div className="mt-4 space-y-4">
        <p className="text-lg text-gray-700">
          Current Block:{" "}
          <span className="font-bold text-[#476520]">{currentBlock.toLocaleString()}</span>
        </p>
        <p className="text-lg text-gray-700">
          Target Block:{" "}
          <span className="font-bold text-[#476520]">{targetBlock.toLocaleString()}</span>
        </p>
        <p className="text-lg text-gray-700">
          Blocks Remaining:{" "}
          <span className="font-bold text-[#476520]">{blocksRemaining.toLocaleString()}</span>
        </p>
        <p className="text-lg text-gray-700">
          Estimated Date:{" "}
          <span className="font-bold text-[#476520]">{estimatedDate.toLocaleString()}</span>
        </p>
      </div>
    </div>
  );
};
