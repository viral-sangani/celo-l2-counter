// Get RPC URL from environment variable or use default
const getRpcUrl = () => {
  // For Vite, environment variables are exposed via import.meta.env
  // They must be prefixed with VITE_
  if (typeof import.meta !== "undefined" && import.meta.env?.VITE_RPC_URL) {
    return import.meta.env.VITE_RPC_URL;
  }

  // Fallback to default RPC URL
  return "https://forno.celo.org";
};

export const CONSTANTS = {
  TARGET_BLOCK: 31056500,
  AVERAGE_BLOCK_TIME: 5, // in seconds
  ESTIMATED_DATE: new Date("2025-03-26T03:21:00Z"),
  // Custom RPC URL - will use environment variable VITE_RPC_URL if available
  CUSTOM_RPC_URL: getRpcUrl(),
} as const;
