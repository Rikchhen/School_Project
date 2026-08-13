import http from "node:http";
import { createApp } from "./app";
import { connectDB } from "./config/db";
import { env } from "./config/env";
import { initSocket } from "./sockets";

async function bootstrap() {
  await connectDB();

  const app = createApp();
  const server = http.createServer(app);

  // Attach socket.io to the same HTTP server.
  initSocket(server);

  server.listen(env.PORT, () => {
    console.log(`🚀 API running at http://localhost:${env.PORT}`);
    console.log(`   Health:  http://localhost:${env.PORT}/api/health`);
    console.log(`   CORS origin: ${env.CLIENT_URL}`);
  });

  const shutdown = (signal: string) => {
    console.log(`\n${signal} received — shutting down.`);
    server.close(() => process.exit(0));
  };
  process.on("SIGINT", () => shutdown("SIGINT"));
  process.on("SIGTERM", () => shutdown("SIGTERM"));
}

bootstrap().catch((err) => {
  console.error("❌ Failed to start server:", err);
  process.exit(1);
});
