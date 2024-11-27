const mineflayer = require("mineflayer");
const express = require("express");
const app = express();
const port = process.env.PORT || 3000;  // Use port 3000 or environment-defined port

// Serve the status webpage
let botStatus = "Disconnected"; // Initialize status as disconnected

app.get("/", (req, res) => {
  res.send(`
    <html>
      <head>
        <title>Bot Status</title>
        <style>
          body { font-family: Arial, sans-serif; text-align: center; padding: 50px; }
          h1 { color: #4CAF50; }
          .status { font-size: 20px; font-weight: bold; color: ${botStatus === "Connected" ? 'green' : 'red'}; }
        </style>
      </head>
      <body>
        <h1>Bot Status</h1>
        <p class="status">The bot is currently: ${botStatus}</p>
      </body>
    </html>
  `);
});

// Start the web server
app.listen(port, () => {
  console.log(`Express server running on port ${port}`);
});

// Function to create the bot and handle connection
function createBot() {
  const bot = mineflayer.createBot({
    host: "minekrapjihyo.aternos.me", // Server address
    port: 53281, // Server port
    username: "DaddyAfkbotJihyo", // Bot username
    version: false, // Auto-detect version
  });

  // Update status when bot connects
  bot.on("spawn", () => {
    console.log("Bot has successfully spawned and connected!");
    botStatus = "Connected"; // Update status to "Connected"
  });

  // Update status when bot is disconnected (either manually or by server)
  bot.on("end", (reason) => {
    console.log(`Bot disconnected from server. Reason: ${reason}`);
    botStatus = "Disconnected"; // Update status to "Disconnected"
    console.log("Attempting to reconnect in 5 seconds...");
    setTimeout(createBot, 5000); // Reconnect after 5 seconds
  });

  // Update status if the bot is kicked from the server
  bot.on("kicked", (reason, loggedIn) => {
    console.log(`Bot kicked from the server. Reason: ${reason}`);
    console.log(`Was logged in? ${loggedIn}`);
    botStatus = "Disconnected"; // Update status to "Disconnected"
    console.log("Attempting to reconnect in 5 seconds...");
    setTimeout(createBot, 5000); // Reconnect after 5 seconds
  });

  // Enhanced error logging
  bot.on("error", (err) => {
    console.error("Bot encountered an error:", err.message);
    console.error("Stack trace:", err.stack);
  });

  // Log server chat messages
  bot.on("chat", (username, message) => {
    console.log(`[Chat] ${username}: ${message}`);
  });

  // Log bot health changes
  bot.on("health", () => {
    console.log(`Bot health: ${bot.health}`);
  });

  // Log bot movements
  bot.on("move", () => {
    console.log(`Bot moved to position: ${JSON.stringify(bot.entity.position)}`);
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

// Start the bot
createBot();
