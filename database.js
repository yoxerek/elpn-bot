const Database = require('better-sqlite3');
const path = require('path');

const db = new Database(path.join(__dirname, 'data.db'));

db.exec(`
    CREATE TABLE IF NOT EXISTS verified_users (
        discord_id TEXT PRIMARY KEY,
        roblox_id TEXT UNIQUE,
        roblox_username TEXT,
        verified_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
    
    CREATE TABLE IF NOT EXISTS tickets (
        ticket_id INTEGER PRIMARY KEY AUTOINCREMENT,
        channel_id TEXT UNIQUE,
        user_id TEXT,
        type TEXT,
        status TEXT DEFAULT 'open',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        closed_at DATETIME
    );
    
    CREATE TABLE IF NOT EXISTS bans (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        roblox_id TEXT,
        roblox_name TEXT,
        reason TEXT,
        banned_by TEXT,
        banned_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
`);

module.exports = {
    link: (discordId, robloxId, robloxUsername) => {
        const stmt = db.prepare('INSERT OR REPLACE INTO verified_users VALUES (?, ?, ?, datetime("now"))');
        return stmt.run(discordId, robloxId, robloxUsername);
    },
    
    getByDiscord: (discordId) => {
        return db.prepare('SELECT * FROM verified_users WHERE discord_id = ?').get(discordId);
    },
    
    getByRoblox: (robloxId) => {
        return db.prepare('SELECT * FROM verified_users WHERE roblox_id = ?').get(robloxId);
    },
    
    createTicket: (channelId, userId, type) => {
        const stmt = db.prepare('INSERT INTO tickets (channel_id, user_id, type) VALUES (?, ?, ?)');
        return stmt.run(channelId, userId, type);
    },
    
    closeTicket: (channelId) => {
        const stmt = db.prepare('UPDATE tickets SET status = "closed", closed_at = datetime("now") WHERE channel_id = ?');
        return stmt.run(channelId);
    },
    
    getTicket: (channelId) => {
        return db.prepare('SELECT * FROM tickets WHERE channel_id = ?').get(channelId);
    },
    
    addBan: (robloxId, robloxName, reason, bannedBy) => {
        const stmt = db.prepare('INSERT INTO bans (roblox_id, roblox_name, reason, banned_by) VALUES (?, ?, ?, ?)');
        return stmt.run(robloxId, robloxName, reason, bannedBy);
    }
};