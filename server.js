// server.js - CAŁY PLIK
const express = require('express');
const bodyParser = require('body-parser');
const config = require('./config');
const { codes, sendBanWebhook, db } = require('./bot');

const app = express();
app.use(bodyParser.json());

// Endpoint weryfikacji
app.post('/verify', (req, res) => {
    const { robloxId, robloxUsername, verificationCode } = req.body;
    
    const data = codes.get(verificationCode);
    if (!data) {
        return res.status(400).json({ success: false, error: 'Nieprawidłowy kod' });
    }
    
    db.link(data.discordId, robloxId, robloxUsername);
    codes.delete(verificationCode);
    
    console.log(`[VERIFY] Powiązano: Discord ${data.discordId} <-> Roblox ${robloxUsername}`);
    res.json({ success: true });
});

// Endpoint bana
app.post('/ban-from-roblox', async (req, res) => {
    const { robloxId, robloxUsername, reason, adminName } = req.body;
    if (!robloxId || !reason) return res.status(400).json({ error: 'Brak danych' });
    
    db.addBan(robloxId, robloxUsername, reason, adminName);
    await sendBanWebhook(robloxUsername, robloxId, reason, adminName);
    res.json({ success: true });
});

// 🔥 ENDPOINTY DO SYNCHRONIZACJI RÓL DISCORD -> ROBLOX

// 1. Roblox pyta: "Czy mam coś dla gracza X?"
app.get('/pending-role/:robloxId', (req, res) => {
    const { robloxId } = req.params;
    const roleName = db.getPendingRole(robloxId);
    
    res.json({ 
        hasRole: !!roleName,
        roleName: roleName 
    });
});

// 2. Roblox mówi: "Dostałem, usuń z kolejki"
app.post('/clear-pending-role/:robloxId', (req, res) => {
    db.clearPendingRole(req.params.robloxId);
    res.json({ success: true });
});

// 3. Sprawdź rolę na Discordzie (dla auto-sync przy wejściu do gry)
app.get('/user-discord-roles', async (req, res) => {
    const { robloxId } = req.query;
    const user = db.getByRoblox(robloxId);
    
    if (!user) return res.json({ team: null });
    
    try {
        const guild = await client.guilds.fetch(config.discord.guildId);
        const member = await guild.members.fetch(user.discord_id);
        
        // Sprawdź które role z configu ma użytkownik
        const roleSync = config.roleSync || {};
        for (const [discordRoleId, robloxTeamName] of Object.entries(roleSync)) {
            if (member.roles.cache.has(discordRoleId)) {
                return res.json({ team: robloxTeamName });
            }
        }
        
        res.json({ team: null });
    } catch (err) {
        res.json({ team: null });
    }
});

app.get('/', (req, res) => {
    res.send('✅ ELPN Bot działa!');
});

app.listen(config.server.port, () => {
    console.log(`[SERVER] Serwer gotowy na porcie ${config.server.port}`);
});
