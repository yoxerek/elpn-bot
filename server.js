const express = require('express');
const bodyParser = require('body-parser');
const config = require('./config');
const { codes, sendBanWebhook, db } = require('./bot');

const app = express();
app.use(bodyParser.json());

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

app.post('/ban-from-roblox', async (req, res) => {
    const { robloxId, robloxUsername, reason, adminName } = req.body;
    
    if (!robloxId || !reason) {
        return res.status(400).json({ error: 'Brak danych' });
    }
    
    db.addBan(robloxId, robloxUsername, reason, adminName);
    await sendBanWebhook(robloxUsername, robloxId, reason, adminName);
    
    res.json({ success: true, message: 'Ban zapisany i wysłany na Discord' });
});

app.get('/check/:robloxId', (req, res) => {
    const user = db.getByRoblox(req.params.robloxId);
    res.json({ 
        verified: !!user,
        discordId: user ? user.discord_id : null 
    });
});

// NOWE ENDPOINTY DO SYNCHRONIZACJI RÓL

app.get('/pending-role/:robloxId', (req, res) => {
    const { robloxId } = req.params;
    const roleName = db.getPendingRole(robloxId);
    
    res.json({ 
        hasRole: !!roleName,
        roleName: roleName 
    });
});

app.post('/clear-pending-role/:robloxId', (req, res) => {
    const { robloxId } = req.params;
    db.clearPendingRole(robloxId);
    res.json({ success: true });
});

app.post('/sync-role', async (req, res) => {
    const { robloxId, robloxUsername, teamName, action, oldTeam } = req.body;
    
    console.log(`[SYNC] ${action}: ${robloxUsername} - ${teamName || oldTeam || 'brak'}`);
    
    const user = db.getByRoblox(robloxId);
    if (!user) {
        return res.status(404).json({ error: 'Niezweryfikowany użytkownik' });
    }
    
    res.json({ success: true });
});

app.get('/', (req, res) => {
    res.send('✅ ELPN Bot działa!');
});

app.listen(config.server.port, () => {
    console.log(`[SERVER] Serwer ELPN gotowy na porcie ${config.server.port}`);
});
