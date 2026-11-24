import { defineConfig, type ResolvedConfig } from "vite";
import react from "@vitejs/plugin-react";
import { cloudflare } from "@cloudflare/vite-plugin";
import { generateCourseAssets } from "./scripts/courseAssets";

export default defineConfig({
  plugins: [
    react(),
    ...(process.env.VITEST ? [] : [
      {
        name: "course-page-assets",
        async configResolved(config: ResolvedConfig) {
          await generateCourseAssets(config.publicDir);
        },
      },
      cloudflare(),
    ]),
  ],
});
