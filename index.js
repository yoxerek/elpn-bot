console.log('ENV TOKEN:', process.env.DISCORD_TOKEN ? 'ISTNIEJE' : 'BRAK');
console.log('ENV GUILD:', process.env.DISCORD_GUILD_ID);
const bot = require('./bot');
const server = require('./server');

console.log('🚀 Uruchamianie Systemu ELPN...');
console.log('📱 Bot Discord + 🌐 Serwer HTTP gotowe!');
