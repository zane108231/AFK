const mineflayer = require("mineflayer");
const { pathfinder, Movements, goals } = require("mineflayer-pathfinder");
const pvp = require("mineflayer-pvp").plugin;
const armorManager = require("mineflayer-armor-manager");
const AutoAuth = require("mineflayer-auto-auth");
const express = require("express");
const app = express();
const port = process.env.PORT || 3000;

// Serve the HTML file
app.get("/", (req, res) => {
  res.sendFile(__dirname + "/index.html");
});

// Start the server
app.listen(port, () => {
  console.log(`Express server running on port ${port}`);
});
function createBot() {
  const bot = mineflayer.createBot({
    host: "minekrapjihyo.aternos.me", // Server address
    port: 53281, // Server port
    username: "DaddyAfkbotJihyo", // Bot username
    version: false, // Use false to auto-detect the version
    plugins: [AutoAuth], // Plugins for the bot
    AutoAuth: "bot1122033", // Password for AutoAuth
  });

  // Load additional plugins
  bot.loadPlugin(pathfinder);
  bot.loadPlugin(pvp);
  bot.loadPlugin(armorManager);

  let guardPos = null;

  // Guard area functionality
  function guardArea(pos) {
    guardPos = pos.clone();

    if (!bot.pvp.target) {
      moveToGuardPos();
    }
  }

  function stopGuarding() {
    guardPos = null;
    bot.pvp.stop();
    bot.pathfinder.setGoal(null);
  }

  function moveToGuardPos() {
    const mcData = require("minecraft-data")(bot.version);
    const movements = new Movements(bot, mcData);
    bot.pathfinder.setMovements(movements);
    bot.pathfinder.setGoal(new goals.GoalBlock(guardPos.x, guardPos.y, guardPos.z));
  }

  bot.on("stoppedAttacking", () => {
    if (guardPos) moveToGuardPos();
  });

  bot.on("physicTick", () => {
    if (!guardPos) return;

    const filter = (e) =>
      e.type === "mob" &&
      e.position.distanceTo(bot.entity.position) < 16 &&
      e.mobType !== "Armor Stand";
    const entity = bot.nearestEntity(filter);

    if (entity) {
      bot.pvp.attack(entity);
    }
  });

  // Chat command handlers
  bot.on("chat", (username, message) => {
    const player = bot.players[username]?.entity;

    if (message === "guard" && player) {
      bot.chat("I will guard this area!");
      guardArea(player.position);
    }

    if (message === "love you") {
      bot.chat("I love you too, meri jaan! ❤️");
      stopGuarding();
    }
  });

  // Log disconnections and reconnect
  bot.on("end", (reason) => {
    console.log(`Bot disconnected: ${reason}`);
    console.log("Reconnecting in 5 seconds...");
    setTimeout(createBot, 5000);
  });

  // Log kicks and errors
  bot.on("kicked", (reason, loggedIn) => {
    console.log(`Bot kicked: ${reason}`);
    console.log(`Logged in: ${loggedIn}`);
  });

  bot.on("error", (err) => {
    console.error(`Bot error: ${err.message}`);
  });

  console.log("Bot has been started and connected!");
}

createBot();
