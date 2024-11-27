const express = require("express");
const mineflayer = require('mineflayer');
const pvp = require('mineflayer-pvp').plugin;
const { pathfinder, Movements, goals } = require('mineflayer-pathfinder');
const armorManager = require('mineflayer-armor-manager');
const mc = require('minecraft-protocol');
const AutoAuth = require('mineflayer-auto-auth');
const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());

app.get("/", (_, res) => res.sendFile(__dirname + "/index.html"));

// Ensure app listens on the specified port
app.listen(port, () => {
  console.log(`Web server listening on port ${port}`);
});

function createBot() {
  const bot = mineflayer.createBot({
    host: 'minekrapjihyo.aternos.me',
    version: false, // U can replace with 1.16.5 for example, remember to use ', = '1.16.5'
    username: 'AfkbotMommyJihyo',
    port: 53281,
    plugins: [AutoAuth],
    AutoAuth: 'bot1122033',
  });

  bot.loadPlugin(pvp);
  bot.loadPlugin(armorManager);
  bot.loadPlugin(pathfinder);

  bot.on('playerCollect', (collector, itemDrop) => {
    if (collector !== bot.entity) return;

    setTimeout(() => {
      const sword = bot.inventory.items().find(item => item.name.includes('sword'));
      if (sword) bot.equip(sword, 'hand');
    }, 150);
  });

  bot.on('playerCollect', (collector, itemDrop) => {
    if (collector !== bot.entity) return;

    setTimeout(() => {
      const shield = bot.inventory.items().find(item => item.name.includes('shield'));
      if (shield) bot.equip(shield, 'off-hand');
    }, 250);
  });

  let guardPos = null;

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
    const filter = (e) =>
      e.type === 'mob' &&
      e.position.distanceTo(bot.entity.position) < 16 &&
      e.mobType !== 'Armor Stand';
    const entity = bot.nearestEntity(filter);
    if (entity) {
      bot.pvp.attack(entity);
    }
  });

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

  bot.on('kicked', console.log);
  bot.on('error', console.log);
  bot.on('end', createBot);
}

createBot();
