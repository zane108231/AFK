const mineflayer = require("mineflayer");

function createBot() {
  const bot = mineflayer.createBot({
    host: "minekrapjihyo.aternos.me", // Server address
    port: 53281, // Server port
    username: "DaddyAfkbotJihyo", // Bot username
    version: false, // Use false to auto-detect the version
  });

  // Move forward and backward alternately
  let moveForward = true;

  function toggleMovement() {
    if (moveForward) {
      bot.setControlState("forward", true);
      setTimeout(() => bot.setControlState("forward", false), 500); // Stop after a short press
    } else {
      bot.setControlState("back", true);
      setTimeout(() => bot.setControlState("back", false), 500); // Stop after a short press
    }
    moveForward = !moveForward; // Switch direction for next time
  }

  // Execute movement every 5-10 seconds
  setInterval(() => {
    toggleMovement();
  }, Math.random() * 5000 + 5000); // Random interval between 5-10 seconds

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
