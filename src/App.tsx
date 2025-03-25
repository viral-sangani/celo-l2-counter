import { onValue, ref } from "firebase/database";
import { useEffect, useState } from "react";
import { BenefitsSection } from "./components/BenefitsSection";
import { BlockCountdownTimer } from "./components/BlockCountdownTimer";
import { L2MigrationStage } from "./components/L2MigrationStage";
import { CONSTANTS } from "./constants";
import { database } from "./firebase";
import { useLatestBlock } from "./hooks/useLatestBlock";

function App() {
  // Use the hook to get the latest block
  const { latestBlock, isLoading, error } = useLatestBlock();
  const [showTimers, setShowTimers] = useState(true);
  const [isHardforkReached, setIsHardforkReached] = useState(false);
  const [isL2Live, setIsL2Live] = useState(false);

  // Check if we need to show the timers based on current block
  useEffect(() => {
    if (!isLoading && !error && latestBlock) {
      if (latestBlock >= CONSTANTS.TARGET_BLOCK) {
        setShowTimers(false);
        setIsHardforkReached(true);
      }
    }
  }, [latestBlock, isLoading, error]);

  // Check IsL2Live flag from Firebase
  useEffect(() => {
    const isL2LiveRef = ref(database, "IsL2Live");

    const unsubscribeIsL2Live = onValue(isL2LiveRef, (snapshot) => {
      if (snapshot.exists()) {
        const isLiveValue = snapshot.val();

        // If IsL2Live is a boolean value directly
        if (typeof isLiveValue === "boolean") {
          setIsL2Live(isLiveValue);
        }
        // If IsL2Live is an object with a value property
        else if (isLiveValue && typeof isLiveValue.value === "boolean") {
          setIsL2Live(isLiveValue.value);
        }
        // Any other truthy value
        else if (isLiveValue) {
          setIsL2Live(true);
        }
      }
    });

    return () => {
      unsubscribeIsL2Live();
    };
  }, []);

  const handleBlockUpdate = (block: number | null) => {
    if (block && block >= CONSTANTS.TARGET_BLOCK) {
      setIsHardforkReached(true);
    }
  };

  const handleTimerEnd = () => {
    setShowTimers(false);
    setIsHardforkReached(true);
  };

  return (
    <div className="min-h-screen bg-[#FCF6F1]">
      <div className="container mx-auto px-4 py-12">
        <div className="text-center mb-12">
          <img
            src="https://images.ctfassets.net/wr0no19kwov9/4SBboHNAVGDL6iSUBtzwf5/99bffcbe8a37dcb9a8cdb34b2b2054a4/brand-kit-wordmark-image-01.png?fm=webp&w=3840&q=70"
            alt="Celo Logo"
            className="h-16 mx-auto mb-8"
          />
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Celo L2 Migration Status
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
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
            <L2MigrationStage isHardforkReached={isHardforkReached} />
          )}

          {/* Show L2 Live message when IsL2Live is true */}
          {isL2Live && (
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
          )}
        </div>

        <div className="mb-12">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-8">
            Benefits of L2 Migration
          </h2>
          <BenefitsSection />
        </div>

        <div className="bg-[#E7E3D4] p-8">
          <h2 className="text-2xl font-bold text-[#476520] mb-6">
            Technical Specifications
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
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
