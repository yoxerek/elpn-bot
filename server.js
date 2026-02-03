// server.js v8.0 - z endpointem /generate-code
const express = require('express');
const bodyParser = require('body-parser');
const config = require('./config');
const { codes, sendBanWebhook, db, generateCode } = require('./bot');

const app = express();
app.use(bodyParser.json());

// Endpoint weryfikacji (stary - gdy gracz wpisze kod z Discorda w grze)
app.post('/verify', (req, res) => {
    const { robloxId, robloxUsername, verificationCode } = req.body;
    
    const data = codes.get(verificationCode);
    if (!data) {
        return res.status(400).json({ success: false, error: 'Nieprawidłowy lub wygasły kod' });
    }
    
    db.link(data.discordId, robloxId, robloxUsername);
    codes.delete(verificationCode);
    
    console.log(`[VERIFY] Powiązano: Discord ${data.discordId} <-> Roblox ${robloxUsername}`);
    res.json({ success: true, message: 'Konta powiązane!' });
});

// 🔴 NOWY ENDPOINT: Generowanie kodu z Robloxa (KROK 1)
app.post('/generate-code', (req, res) => {
    const { robloxId, robloxUsername } = req.body;
    
    if (!robloxId || !robloxUsername) {
        return res.status(400).json({ error: 'Brak robloxId lub robloxUsername' });
    }
    
    // Sprawdź czy już nie ma kodu dla tego gracza (opcjonalnie)
    // Generuj nowy kod
    const code = Math.random().toString(36).substring(2, 8).toUpperCase();
    
    // Zapisz w mapie codes (tymczasowo, czeka na Discord ID)
    codes.set(code, {
        robloxId: robloxId,
        robloxUsername: robloxUsername,
        timestamp: Date.now()
        // discordId będzie dodane później gdy ktoś wpisze kod na Discordzie
    });
    
    // Usuń kod po 10 minutach
    setTimeout(() => {
        codes.delete(code);
    }, 600000);
    
    console.log(`[GENERATE] Kod ${code} dla ${robloxUsername} (Roblox ID: ${robloxId})`);
    res.json({ code: code });
});

// Endpoint bana
app.post('/ban-from-roblox', async (req, res) => {
    const { robloxId, robloxUsername, reason, adminName } = req.body;
    if (!robloxId || !reason) return res.status(400).json({ error: 'Brak danych' });
    
    db.addBan(robloxId, robloxUsername, reason, adminName);
    await sendBanWebhook(robloxUsername, robloxId, reason, adminName);
    res.json({ success: true });
});

// Synchronizacja ról Discord -> Roblox
app.get('/pending-role/:robloxId', (req, res) => {
    const { robloxId } = req.params;
    const roleName = db.getPendingRole(robloxId);
    res.json({ hasRole: !!roleName, roleName: roleName });
});

app.post('/clear-pending-role/:robloxId', (req, res) => {
    db.clearPendingRole(req.params.robloxId);
    res.json({ success: true });
});

// Sprawdź rolę na Discordzie (dla auto-sync)
app.get('/user-discord-roles', async (req, res) => {
    const { robloxId } = req.query;
    const user = db.getByRoblox(robloxId);
    if (!user) return res.json({ team: null });
    
    try {
        const guild = await client.guilds.fetch(config.discord.guildId);
        const member = await guild.members.fetch(user.discord_id);
        
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
    res.send('✅ ELPN Bot v8.0 działa! System weryfikacji: Roblox → Kod → Discord');
});

app.listen(config.server.port, () => {
    console.log(`[SERVER] Serwer gotowy na porcie ${config.server.port}`);
    console.log(`[SYSTEM] Weryfikacja: Gracz wpisuje !weryfikacja w Roblox → dostaje kod → wpisuje na Discordzie`);
});
