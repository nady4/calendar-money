import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

function packageName(id: string): string {
  const parts = id.split(/[\\/]/);
  const i = parts.lastIndexOf("node_modules");
  if (i === -1 || i + 1 >= parts.length) return "";
  let name = parts[i + 1];
  if (name.startsWith("@") && i + 2 < parts.length) {
    name = `${name}/${parts[i + 2]}`;
  }
  return name;
}

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
          const pkg = packageName(id);
          if (
            pkg === "react" ||
            pkg === "react-dom" ||
            pkg === "scheduler" ||
            pkg.startsWith("react-router")
          )
            return "vendor-react";
          if (
            pkg.startsWith("@mui") ||
            pkg.startsWith("@emotion") ||
            pkg === "react-color"
          )
            return "vendor-mui";
          if (pkg === "chart.js" || pkg === "react-chartjs-2")
            return "vendor-charts";
          if (
            pkg === "jspdf" ||
            pkg === "html2canvas" ||
            pkg === "dompurify" ||
            pkg === "canvg"
          )
            return "vendor-pdf";
          if (
            pkg === "heic-decode" ||
            pkg === "libheif-js" ||
            pkg === "fast-png"
          )
            return "vendor-scan";
          if (pkg === "moment") return "vendor-moment";
          return "vendor-misc";
        },
      },
    },
  },
});
