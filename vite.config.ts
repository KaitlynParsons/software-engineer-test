import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    // Custom middleware to proxy arbitrary URLs server-side, bypassing CORS
    // Usage: GET /api/proxy?url=https://example.com
    {
      name: "cors-proxy",
      configureServer(server) {
        server.middlewares.use("/api/proxy", async (req, res) => {
          const target = new URL(req.url!, `http://${req.headers.host}`).searchParams.get("url");
          if (!target) {
            res.statusCode = 400;
            res.end("Missing url parameter");
            return;
          }
          const response = await fetch(target);
          const html = await response.text();
          res.setHeader("Content-Type", "text/html");
          res.end(html);
        });
      },
    },
  ],
});
