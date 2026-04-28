import { defineConfig } from "vite";
import solidPlugin from "vite-plugin-solid";
import devtools from "solid-devtools/vite";

export default defineConfig({
  plugins: [devtools(), solidPlugin()],
  preview: {
    host: true,
    port: 3000,
    // Сделать доступ к серверу через внешний порт
    allowedHosts: ["jiene.462292.xyz"],
  },
  server: {
    port: 3000,
  },
  build: {
    target: "esnext",
  },
});
