import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  optimizeDeps: {
    include: ["react", "react-dom"],
    exclude: ["lucide-react"],
  },
  resolve: {
    dedupe: ["react", "react-dom"],
  },
});
