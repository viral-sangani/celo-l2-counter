import { onValue, ref } from "firebase/database";
import React, { useEffect, useState } from "react";
import { database } from "../firebase";

interface L2Stage {
  name: string;
  status: "InProgress" | "Complete";
}

interface L2MigrationStageProps {
  isHardforkReached: boolean;
}

export const L2MigrationStage: React.FC<L2MigrationStageProps> = ({
  isHardforkReached,
}) => {
  const [stages, setStages] = useState<L2Stage[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch stages from Firebase
  useEffect(() => {
    if (!isHardforkReached) return;

    try {
      const l2StagesRef = ref(database, "l2stage");

      const unsubscribe = onValue(
        l2StagesRef,
        (snapshot) => {
          if (snapshot.exists()) {
            const data = snapshot.val();
            const stagesArray = Object.values(data) as L2Stage[];
            setStages(stagesArray);
          } else {
            setStages([]);
          }
          setLoading(false);
        },
        (error) => {
          setError("Error fetching L2 stages: " + error.message);
          setLoading(false);
        }
      );

      return () => unsubscribe();
    } catch (err) {
      setError(
        "Failed to connect to database: " +
          (err instanceof Error ? err.message : String(err))
      );
      setLoading(false);
    }
  }, [isHardforkReached]);

  // Check if loading has been stuck for too long (5 seconds)
  useEffect(() => {
    if (loading) {
      const timer = setTimeout(() => {
        // Create a fallback entry if loading is taking too long
        if (loading && stages.length === 0) {
          setStages([
            {
              name: "Migrating L1 data",
              status: "InProgress",
            },
          ]);
          setLoading(false);
        }
      }, 5000);

      return () => clearTimeout(timer);
    }
  }, [loading, stages]);

  if (!isHardforkReached) return null;

  if (loading) {
    return (
      <div className="flex justify-center items-center h-12">
        <div className="animate-spin rounded-full h-5 w-5 border-2 border-[#476520] border-t-transparent"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-red-600 text-center text-sm">
        <p>{error}</p>
      </div>
    );
  }

  return (
    <div className="mt-8">
      <div className="bg-[#476520] p-8 text-white mb-8">
        <h2 className="text-2xl font-bold mb-2">
          Celo L2 Hardfork Block Reached
        </h2>
        <p className="text-lg">
          The Celo L2 hardfork block has been reached. Migration process is now
          in progress. Follow the steps below.
        </p>
      </div>

      <div className="space-y-4 flex flex-col items-center">
        {stages.map((stage) => (
          <div key={stage.name} className="flex items-center gap-3">
            {stage.status === "InProgress" ? (
              <div className="animate-spin rounded-full h-5 w-5 border-2 border-[#476520] border-t-transparent" />
            ) : (
              <div className="text-[#476520]">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
            )}
            <span className="text-gray-700 text-lg font-bold">
              {stage.name}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};
