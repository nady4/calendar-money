import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vite.dev/config/
export default defineConfig({
  css: {
    preprocessorOptions: {
      scss: {
        api: "modern",
      },
    },
  },
  plugins: [react()],
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (!id.includes("node_modules")) return undefined;
          if (
            id.includes("@mui") ||
            id.includes("@emotion") ||
            id.includes("react-color")
          )
            return "vendor-mui";
          if (id.includes("chart.js") || id.includes("react-chartjs-2"))
            return "vendor-charts";
          if (
            id.includes("jspdf") ||
            id.includes("html2canvas") ||
            id.includes("dompurify") ||
            id.includes("canvg")
          )
            return "vendor-pdf";
          if (id.includes("heic-decode") || id.includes("libheif"))
            return "vendor-scan";
          if (id.includes("moment")) return "vendor-moment";
          if (
            id.includes("react-router") ||
            id.includes("react-dom") ||
            id.includes("scheduler") ||
            id.includes("react/")
          )
            return "vendor-react";
          return "vendor-misc";
        },
      },
    },
  },
});
