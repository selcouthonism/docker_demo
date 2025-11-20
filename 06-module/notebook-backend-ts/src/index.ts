import { createApp } from "./server.js";
import { config } from "./config/index.js";

const app = createApp();

app.listen(config.port, () => {
  console.log(`Server running on port ${config.port}`);
});
