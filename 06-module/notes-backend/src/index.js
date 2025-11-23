import { createApp } from "./server.js";

const app = createApp();

async function start() {
  const app = await createApp();

  const PORT = process.env.PORT || 3000;

  // --- Server Start ---
    app.listen(PORT, () => {
        console.log(`Server running on Node ${process.version}`);
        console.log(`Listening on port ${PORT}`);
    });
}

start().catch(err => {
  console.error("Failed to start server", err);
  process.exit(1);
});
