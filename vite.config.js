import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// base: "./" — относительные пути в сборке, чтобы приложение работало
// и на корне домена, и в подкаталоге (частый случай при деплое Mini App).
export default defineConfig({
  plugins: [react()],
  base: "./",
  build: {
    outDir: "dist",
    assetsInlineLimit: 4096,
  },
});
