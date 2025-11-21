import { createApp } from "./server.js";
import { config } from "./config/config.js";

const app = createApp();

async function start() {
  const app = await createApp();
  app.listen(config.port, () => {
    console.log(`Server running on port ${config.port}`);
  });
}

start().catch(err => {
  console.error("Failed to start server", err);
  process.exit(1);
});
