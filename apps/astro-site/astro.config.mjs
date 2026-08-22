import { fileURLToPath } from "node:url";
import react from "@astrojs/react";
import vercel from "@astrojs/vercel";
import tailwindcss from "@tailwindcss/vite";
import { defineConfig } from "astro/config";

const fromHere = (path) => fileURLToPath(new URL(path, import.meta.url));

export default defineConfig({
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
    server: {
      fs: {
        allow: [fromHere("../..")],
      },
    },
  },
});
