
// server/modules/logs.js
let ACTIVITY_LOGS = [];

function addLog(type, data){
  ACTIVITY_LOGS.push({ id: Date.now()+"_"+Math.random().toString(36).slice(2,8), type, data, time: Date.now() });
  if (ACTIVITY_LOGS.length > 5000) ACTIVITY_LOGS.shift();
}
function getLogs(limit=200){
  return ACTIVITY_LOGS.slice(-limit).reverse();
}
module.exports = { addLog, getLogs };
