const express = require("express");
const http = require("http");
const mineflayer = require('mineflayer');
const pvp = require('mineflayer-pvp').plugin;
const { pathfinder, Movements, goals } = require('mineflayer-pathfinder');
const armorManager = require('mineflayer-armor-manager');
const mc = require('minecraft-protocol');
const AutoAuth = require('mineflayer-auto-auth');
const app = express();

app.use(express.json());

// Serve the index.html file on the root endpoint
app.get("/", (_, res) => res.sendFile(__dirname + "/index.html"));
app.listen(process.env.PORT, () => {
  console.log('Server is live!');
});

// Create the bot and load plugins
function createBot() {
  const bot = mineflayer.createBot({
    host: 'sixseven98.aternos.me',
    version: false, // Set to a specific version if needed, e.g. '1.16.5'
    username: 'Afkbot', 
    port: 54723, 
    plugins: [AutoAuth],
    AutoAuth: 'bot1122033'
  });

  // Load additional plugins
  bot.loadPlugin(pvp);
  bot.loadPlugin(armorManager);
  bot.loadPlugin(pathfinder);

  // Handle player collection events and equip sword/shield
  bot.on('playerCollect', (collector, itemDrop) => {
    if (collector !== bot.entity) return;

    setTimeout(() => {
      const sword = bot.inventory.items().find(item => item.name.includes('sword'));
      if (sword) bot.equip(sword, 'hand');
    }, 150);

    setTimeout(() => {
      const shield = bot.inventory.items().find(item => item.name.includes('shield'));
      if (shield) bot.equip(shield, 'off-hand');
    }, 250);
  });

  let guardPos = null;

  // Guarding functionality
  function guardArea(pos) {
    guardPos = pos.clone();

    if (!bot.pvp.target) {
      moveToGuardPos();
    }
  }

  function stopGuarding() {
    guardPos = null;
    bot.pvp.start();
    bot.pathfinder.setGoal(null);
  }

  function moveToGuardPos() {
    const mcData = require('minecraft-data')(bot.version);
    bot.pathfinder.setMovements(new Movements(bot, mcData));
    bot.pathfinder.setGoal(new goals.GoalBlock(guardPos.x, guardPos.y, guardPos.z));
  }

  bot.on('stoppedAttacking', () => {
    if (guardPos) {
      moveToGuardPos();
    }
  });

  bot.on('physicTick', () => {
    if (bot.pvp.target) return;
    if (bot.pathfinder.isMoving()) return;

    const entity = bot.nearestEntity();
    if (entity) bot.lookAt(entity.position.offset(0, entity.height, 0));
  });

  bot.on('physicTick', () => {
    if (!guardPos) return;

    const filter = e => e.type === 'mob' && e.position.distanceTo(bot.entity.position) < 16 &&
                        e.mobType !== 'Armor Stand';
    const entity = bot.nearestEntity(filter);
    if (entity) {
      bot.pvp.attack(entity);
    }
  });

  // Handle bot chat commands
  bot.on('chat', (username, message) => {
    if (message === 'guard') {
      const player = bot.players[username];

      if (!player) {
        bot.chat('I will!');
        guardArea(player.entity.position);
      }
    }

    if (message === 'love you') {
      bot.chat('I Love you Too Meri jaan :)');
      stopGuarding();
    }
  });

  // Error and kick handling
  bot.on('kicked', console.log);
  bot.on('error', console.log);
  bot.on('end', createBot);
}

// Start the bot and ensure it's running
createBot();

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});

// Keep the bot active by swinging its arm every 5 seconds
setInterval(() => {
  const bot = mineflayer.createBot({
    host: 'sixseven98.aternos.me',
    version: false,
    username: 'Afkbot',
    port: 54723,
    plugins: [AutoAuth],
    AutoAuth: 'bot1122033'
  });

  if (bot) { // Ensure bot is defined
    bot.swingArm();
  }
}, 5000);  // Swing the arm every 5 seconds

// Start an Express server to serve the index page
app.listen(3000, () => {
  console.log('Server running on port 3000');
});
