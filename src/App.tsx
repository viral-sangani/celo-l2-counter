import { onValue, ref } from "firebase/database";
import { useEffect, useState } from "react";
import { BenefitsSection } from "./components/BenefitsSection";
import { BlockCountdownTimer } from "./components/BlockCountdownTimer";
import { BlockTimer } from "./components/BlockTimer";
import { MigrationStages } from "./components/MigrationStages";
import { CONSTANTS } from "./constants";
import { database } from "./firebase";
import { useLatestBlock } from "./hooks/useLatestBlock";
import type { CeloL2Live, MigrationStage } from "./types";

function App() {
  // Use the hook to get the latest block
  const { latestBlock, isLoading, error } = useLatestBlock();
  const [stages, setStages] = useState<MigrationStage[]>([]);
  const [showTimers, setShowTimers] = useState(true);

  // Check if we need to show the timers based on current block
  useEffect(() => {
    if (!isLoading && !error && latestBlock) {
      if (latestBlock >= CONSTANTS.TARGET_BLOCK) {
        setShowTimers(false);
      }
    }
  }, [latestBlock, isLoading, error]);

  // Load migration stages from Firebase
  useEffect(() => {
    const stagesRef = ref(database, "migrationStages");
    const l2LiveRef = ref(database, "celoL2Live");

    const unsubscribeStages = onValue(stagesRef, (snapshot) => {
      if (snapshot.exists()) {
        setStages(Object.values(snapshot.val()));
      }
    });

    const unsubscribeL2Live = onValue(l2LiveRef, (snapshot) => {
      if (snapshot.exists()) {
        const l2LiveData = snapshot.val() as CeloL2Live;
        if (l2LiveData.is_live) {
          setStages((prevStages) =>
            prevStages.map((stage) => ({
              ...stage,
              status: "Complete",
            }))
          );
        }
      }
    });

    return () => {
      unsubscribeStages();
      unsubscribeL2Live();
    };
  }, []);

  const handleTimerEnd = () => {
    setShowTimers(false);
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
            <>
              {/* Block Countdown Timer - initial fetch + countdown */}
              <BlockCountdownTimer onTimerEnd={handleTimerEnd} />
              
              {/* Real-time Block Status - updates every 5 seconds */}
              <div className="bg-white rounded-lg p-8 shadow-lg">
                <h2 className="text-2xl font-bold text-[#476520] mb-6 text-center">
                  Live Block Status
                </h2>
                {isLoading ? (
                  <div className="text-center text-gray-600">
                    Loading current block...
                  </div>
                ) : error ? (
                  <div className="text-center text-red-600">
                    Error fetching current block: {error.message}
                  </div>
                ) : (
                  <BlockTimer
                    currentBlock={latestBlock ?? 0}
                    targetBlock={CONSTANTS.TARGET_BLOCK}
                    averageBlockTime={CONSTANTS.AVERAGE_BLOCK_TIME}
                  />
                )}
              </div>
            </>
          )}
          
          {/* If timers are hidden, show completion message */}
          {!showTimers && (
            <div className="bg-[#476520] text-white rounded-lg p-8 shadow-lg text-center">
              <h2 className="text-2xl font-bold mb-4">
                Celo L2 Hardfork Complete! 🎉
              </h2>
              <p className="text-lg">
                The Celo L2 migration has successfully reached its target block.
                Celo is now operating as an Ethereum Layer 2!
              </p>
            </div>
          )}
          
          <MigrationStages stages={stages} />
        </div>

        <div className="mb-12">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-8">
            Benefits of L2 Migration
          </h2>
          <BenefitsSection />
        </div>

        <div className="bg-[#E7E3D4] rounded-lg p-8 shadow-lg">
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
