import { onValue, ref } from "firebase/database";
import { useEffect, useState } from "react";
import { BenefitsSection } from "./components/BenefitsSection";
import { BlockCountdownTimer } from "./components/BlockCountdownTimer";
import { Confetti } from "./components/Confetti";
import { Day1Partners } from "./components/Day1Partners";
import { L2MigrationStage } from "./components/L2MigrationStage";
import { CONSTANTS } from "./constants";
import { database } from "./firebase";
import { useConfetti } from "./hooks/useConfetti";
import { useLatestBlock } from "./hooks/useLatestBlock";

function App() {
  // Use the hook to get the latest block
  const { latestBlock, isLoading, error, isRpcDown } = useLatestBlock();
  const [showTimers, setShowTimers] = useState(true);
  const [isHardforkReached, setIsHardforkReached] = useState(false);
  const [isL2Live, setIsL2Live] = useState(false);
  const { isActive: isConfettiActive, triggerConfetti } = useConfetti(10000);

  // Check if we need to show the timers based on current block or RPC status
  useEffect(() => {
    // Case 1: Hardfork reached normally (block >= target)
    if (!isLoading && !error && latestBlock && latestBlock >= CONSTANTS.TARGET_BLOCK) {
      setShowTimers(false);
      setIsHardforkReached(true);
    }
    
    // Case 2: RPC is down, which could indicate migration in progress
    if (isRpcDown) {
      console.log("RPC is down, setting hardfork as reached");
      setShowTimers(false);
      setIsHardforkReached(true);
    }
  }, [latestBlock, isLoading, error, isRpcDown]);

  // Check IsL2Live flag from Firebase
  useEffect(() => {
    const isL2LiveRef = ref(database, "IsL2Live");

    const unsubscribeIsL2Live = onValue(isL2LiveRef, (snapshot) => {
      if (snapshot.exists()) {
        const isLiveValue = snapshot.val();
        let newIsL2Live = false;

        // If IsL2Live is a boolean value directly
        if (typeof isLiveValue === "boolean") {
          newIsL2Live = isLiveValue;
        }
        // If IsL2Live is an object with a value property
        else if (isLiveValue && typeof isLiveValue.value === "boolean") {
          newIsL2Live = isLiveValue.value;
        }
        // Any other truthy value
        else if (isLiveValue) {
          newIsL2Live = true;
        }

        // If isL2Live changed from false to true, trigger confetti
        if (newIsL2Live && !isL2Live) {
          triggerConfetti();
        }

        setIsL2Live(newIsL2Live);
      }
    });

    return () => {
      unsubscribeIsL2Live();
    };
  }, [isL2Live, triggerConfetti]);

  const handleBlockUpdate = (block: number | null, rpcFailure = false) => {
    // Case 1: Target block reached
    if (block && block >= CONSTANTS.TARGET_BLOCK) {
      setIsHardforkReached(true);
      triggerConfetti(); // Trigger confetti when target block is reached
      return;
    }
    
    // Case 2: RPC failure detected
    if (rpcFailure) {
      setIsHardforkReached(true);
      // Note: We don't trigger confetti here as RPC failure doesn't guarantee the hardfork has occurred
    }
  };

  const handleTimerEnd = () => {
    setShowTimers(false);
    setIsHardforkReached(true);
    triggerConfetti(); // Trigger confetti when timer ends
  };

  return (
    <div className="min-h-screen bg-[#FCF6F1]">
      <Confetti isActive={isConfettiActive} duration={10000} />
      <div className="container mx-auto px-4 py-6 md:py-12">
        <div className="text-center mb-12">
          <img
            src="https://images.ctfassets.net/wr0no19kwov9/4SBboHNAVGDL6iSUBtzwf5/99bffcbe8a37dcb9a8cdb34b2b2054a4/brand-kit-wordmark-image-01.png?fm=webp&w=3840&q=70"
            alt="Celo Logo"
            className="h-16 mx-auto mb-8"
          />
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Celo L2 Migration Status
          </h1>
          <p className="text-base md:text-xl text-gray-600 max-w-3xl mx-auto">
            Celo is transitioning from a standalone EVM-compatible Layer 1
            blockchain to an Ethereum Layer 2, enhancing security and ecosystem
            integration while maintaining our commitment to accessibility.
          </p>
        </div>

        <div className="grid gap-8 mb-12">
          {/* Only show timers if not completed */}
          {showTimers && (
            <BlockCountdownTimer
              onBlockUpdate={handleBlockUpdate}
              onTimerEnd={handleTimerEnd}
            />
          )}

          {/* Show L2 migration stages when hardfork is reached but IsL2Live is false */}
          {isHardforkReached && !isL2Live && (
            <L2MigrationStage 
              isHardforkReached={isHardforkReached} 
              isRpcDown={isRpcDown}
            />
          )}

          {/* Show L2 Live message when IsL2Live is true */}
          {isL2Live && (
            <>
              <div className="bg-[#476520] text-white p-8 shadow-lg text-center">
                <h2 className="text-2xl font-bold mb-4">
                  Celo L2 Migration Complete! 🎉
                </h2>
                <p className="text-lg">
                  The Celo L2 migration has been successfully completed. Celo is
                  now live as an Ethereum Layer 2!
                </p>
                <div className="mt-6 flex justify-center">
                  <a
                    href="https://explorer.celo.org"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="bg-white text-[#476520] font-bold px-6 py-3 shadow hover:bg-gray-100 transition-colors"
                  >
                    Explore Celo L2
                  </a>
                </div>
              </div>

              <div className="mt-8">
                <Day1Partners />
              </div>
            </>
          )}
        </div>

        <div className="mb-12">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-8">
            Benefits of L2 Migration
          </h2>
          <BenefitsSection />
        </div>

        <div className="bg-[#E7E3D4] p-4 md:p-8">
          <h2 className="text-xl md:text-2xl font-bold text-[#476520] mb-4 md:mb-6">
            Technical Specifications
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 md:gap-8">
            <div>
              <h3 className="text-lg font-semibold mb-3">Node Requirements</h3>
              <ul className="list-disc list-inside text-gray-700">
                <li>celo-blockchain v1.8.9</li>
                <li>op-geth: celo-v2.0.0</li>
                <li>op-node: celo-v2.0.0</li>
              </ul>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-3">
                Performance Metrics
              </h3>
              <ul className="list-disc list-inside text-gray-700">
                <li>1s Block Time</li>
                <li>30M Gas Limit</li>
                <li>Native Bridging Support</li>
              </ul>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-3">Active L2 Testners</h3>
              <ul className="list-disc list-inside text-gray-700">
                <li>Alfajores (Sept 26, 2024)</li>
                <li>Baklava (Feb 20, 2025)</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
