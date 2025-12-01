import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  base: "/", // <-- सबसे ज़रूरी लाइन!
  plugins: [react()],
  server: {
    proxy: {
      "/api": "https://chat-full-system.onrender.com",
      "/socket.io": {
        target: "https://chat-full-system.onrender.com",
        ws: true
      }
    }
  }
});
