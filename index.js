const mineflayer = require("mineflayer");

// Function to create the bot and handle connection
function createBot() {
  const bot = mineflayer.createBot({
    host: "minekrapjihyo.aternos.me", // Server address
    port: 53281, // Server port
    username: "DaddyAfkbotJihyo", // Bot username
    version: false, // Auto-detect version
  });

  // Log when the bot connects to the server
  bot.on("spawn", () => {
    console.log("Bot has successfully spawned and connected!");
  });

  // Log when the bot is disconnected (either manually or by server)
  bot.on("end", (reason) => {
    console.log(`Bot disconnected from server. Reason: ${reason}`);
    console.log("Attempting to reconnect in 5 seconds...");
    setTimeout(createBot, 5000); // Reconnect after 5 seconds
  });

  // Log if the bot is kicked from the server
  bot.on("kicked", (reason, loggedIn) => {
    console.log(`Bot kicked from the server. Reason: ${reason}`);
    console.log(`Was logged in? ${loggedIn}`);
    console.log("Attempting to reconnect in 5 seconds...");
    setTimeout(createBot, 5000); // Reconnect after 5 seconds
  });

  // Enhanced error logging
  bot.on("error", (err) => {
    console.error("Bot encountered an error:", err.message);
    console.error("Stack trace:", err.stack);
  });

  // Log bot status
  bot.on("chat", (username, message) => {
    console.log(`[Chat] ${username}: ${message}`);
  });

  // Log bot status when it starts interacting with entities
  bot.on("health", (health) => {
    console.log(`Bot health: ${health}`);
  });

  // Log bot movements and actions (e.g., when it starts placing or breaking blocks)
  bot.on("move", (position) => {
    console.log(`Bot moved to position: ${JSON.stringify(position)}`);
  });

  // Catch any uncaught exceptions and log them
  process.on("uncaughtException", (err) => {
    console.error("Uncaught Exception:", err.message);
    console.error(err.stack);
  });

  // Catch unhandled promise rejections and log them
  process.on("unhandledRejection", (reason, promise) => {
    console.error("Unhandled Rejection at:", promise, "reason:", reason);
  });
}

createBot();
