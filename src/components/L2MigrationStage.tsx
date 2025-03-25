import { onValue, ref } from "firebase/database";
import React, { useEffect, useState } from "react";
import { database } from "../firebase";

interface L2Stage {
  name: string;
  status: "InProgress" | "Complete";
}

export const L2MigrationStage: React.FC = () => {
  const [stages, setStages] = useState<L2Stage[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch stages from Firebase
  useEffect(() => {
    try {
      console.log("Attempting to connect to Firebase and fetch l2stage data");
      const l2StagesRef = ref(database, "l2stage");

      const unsubscribe = onValue(
        l2StagesRef,
        (snapshot) => {
          console.log(
            "Firebase snapshot received:",
            snapshot.exists() ? "Data exists" : "No data"
          );
          if (snapshot.exists()) {
            const data = snapshot.val();
            console.log("Firebase data:", data);

            // Convert object to array and sort by any order property if it exists
            const stagesArray = Object.entries(data).map(
              ([key, value]: [string, any]) => ({
                id: key,
                ...(value as L2Stage),
              })
            );

            console.log("Processed stages array:", stagesArray);
            setStages(stagesArray);
          } else {
            console.log("No data in l2stage path, setting empty array");
            setStages([]);
          }
          setLoading(false);
        },
        (error) => {
          console.error("Firebase error:", error);
          setError("Error fetching L2 stages: " + error.message);
          setLoading(false);
        }
      );

      return () => unsubscribe();
    } catch (err) {
      console.error("Exception in Firebase connection:", err);
      setError(
        "Failed to connect to database: " +
          (err instanceof Error ? err.message : String(err))
      );
      setLoading(false);
    }
  }, []);

  // Check if loading has been stuck for too long (5 seconds)
  useEffect(() => {
    if (loading) {
      const timer = setTimeout(() => {
        // Create a fallback entry if loading is taking too long
        if (loading && stages.length === 0) {
          console.log("Loading timeout - creating fallback stage entry");
          setStages([
            {
              id: "fallback",
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

  if (loading) {
    return (
      <div className="bg-white rounded-lg p-8 shadow-lg text-center">
        <h2 className="text-2xl font-bold text-[#476520] mb-6">
          L2 Migration Progress
        </h2>
        <div className="flex flex-col justify-center items-center h-24">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#476520] mb-4"></div>
          <p className="text-gray-600">
            Loading migration stages from Firebase...
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-lg p-8 shadow-lg">
        <h2 className="text-2xl font-bold text-[#476520] mb-6 text-center">
          L2 Migration Progress
        </h2>
        <div className="text-red-600 text-center space-y-4">
          <p className="font-bold">Error loading migration stages:</p>
          <p>{error}</p>
          <p className="text-sm text-gray-700 mt-4">
            Please check your browser console for more details. There may be
            issues with Firebase connectivity.
          </p>
          <button
            className="bg-[#476520] hover:bg-[#3a531a] text-white px-4 py-2 rounded mt-4"
            onClick={() => window.location.reload()}
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg p-8 shadow-lg">
      <h2 className="text-2xl font-bold text-[#476520] mb-8 text-center">
        L2 Migration Progress
      </h2>

      {stages.length === 0 ? (
        <p className="text-center text-gray-600">
          No migration stages found. Please check back later.
        </p>
      ) : (
        <div className="space-y-6">
          {stages.map((stage) => (
            <div key={stage.id} className="flex items-center border-b pb-4">
              {stage.status === "InProgress" ? (
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-[#476520] mr-4"></div>
              ) : (
                <div className="text-green-600 mr-4">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-6 w-6"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                </div>
              )}
              <div className="flex-1">
                <h3 className="text-lg font-medium text-gray-800">
                  {stage.name}
                </h3>
                <p
                  className={`text-sm ${
                    stage.status === "InProgress"
                      ? "text-orange-500"
                      : "text-green-600"
                  }`}
                >
                  {stage.status === "InProgress" ? "In Progress" : "Complete"}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
