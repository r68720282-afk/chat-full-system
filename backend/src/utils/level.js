// backend/src/utils/level.js

// XP formula → simple & clean
// Level 1 → 0 XP
// Level 2 → 100 XP
// Level 3 → 300 XP
// Level 4 → 600 XP … etc

function levelFromXP(xp) {
  let level = 1;
  let need = 100;

  while (xp >= need) {
    level++;
    xp -= need;
    need += 100;
  }
  return level;
}

module.exports = { levelFromXP };
