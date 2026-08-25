import { fileURLToPath } from "node:url";
import react from "@astrojs/react";
import vercel from "@astrojs/vercel";
import tailwindcss from "@tailwindcss/vite";
import { defineConfig } from "astro/config";

const fromHere = (path) => fileURLToPath(new URL(path, import.meta.url));

export default defineConfig({
  // Keep workspace dependencies inside Astro's project root. Without this,
  // Vite can resolve built-in Astro components through two different paths
  // in monorepo/CI environments and miss their compiled style metadata.
  root: fromHere("../.."),
  srcDir: fromHere("./src"),
  outDir: fromHere("./dist"),
  site: "https://www.thepeak.kz",
  output: "server",
  adapter: vercel(),
  envDir: fromHere("../.."),
  publicDir: fromHere("../../public"),
  integrations: [
    react({
      experimentalReactChildren: true,
    }),
  ],
  vite: {
    plugins: [tailwindcss()],
    ssr: {
      noExternal: ["@astrojs/vercel"],
    },
    define: {
      "process.env.NODE_ENV": JSON.stringify(process.env.NODE_ENV || "production"),
    },
    resolve: {
      dedupe: ["react", "react-dom"],
      alias: {
        "@": fromHere("../../src"),
        "@astro": fromHere("./src"),
        "next/link": fromHere("./src/compat/link.tsx"),
        "next/image": fromHere("./src/compat/image.tsx"),
        "next/navigation": fromHere("./src/compat/navigation.ts"),
        "next/dynamic": fromHere("./src/compat/dynamic.tsx"),
        "next/script": fromHere("./src/compat/script.tsx"),
        "next/server": fromHere("./src/compat/server.ts"),
        "server-only": fromHere("./src/compat/server-only.ts"),
      },
    },
    build: {
      cssCodeSplit: true,
      rollupOptions: {
        output: {
          manualChunks(id) {
            if (id.includes("node_modules/three") || id.includes("node_modules/@react-three")) {
              return "three-vendor";
            }
            if (id.includes("node_modules/@tabler/icons-react") || id.includes("node_modules/lucide-react")) {
              return "icons-vendor";
            }
            if (id.includes("node_modules/framer-motion")) {
              return "framer-motion-vendor";
            }
          },
        },
      },
    },
    server: {
      port: 3000,
      fs: {
        allow: [fromHere("../..")],
      },
    },
  },
});
