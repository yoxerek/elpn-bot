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
// Dodaj na końcu pliku server.js, przed app.listen

// Synchronizacja ról Roblox <-> Discord
app.post('/sync-role', async (req, res) => {
    const { robloxId, robloxUsername, teamName, action, oldTeam } = req.body;
    
    console.log(`[SYNC] ${action}: ${robloxUsername} - ${teamName || oldTeam || 'brak'}`);
    
    // Znajdź powiązane konto Discord
    const user = db.getByRoblox(robloxId);
    if (!user) {
        return res.status(404).json({ error: 'Niezweryfikowany użytkownik' });
    }
    
    try {
        if (action === 'add_role' && teamName) {
            // Nadaj rolę na Discordzie
            // Wymaga implementacji giveDiscordRole w bot.js
            // await giveDiscordRole(user.discord_id, teamName);
            console.log(`[DISCORD] Nadano rolę ${teamName} dla ${robloxUsername}`);
        } else if (action === 'remove_role') {
            // Zabierz rolę na Discordzie
            console.log(`[DISCORD] Zabrano rolę dla ${robloxUsername}`);
        }
        
        res.json({ success: true });
    } catch (err) {
        console.error('[SYNC ERROR]', err);
        res.status(500).json({ error: err.message });
    }
});

// Pobierz aktualne role z Discorda (do synchronizacji przy wejściu do gry)
app.get('/get-discord-role', (req, res) => {
    const { robloxId } = req.query;
    const user = db.getByRoblox(robloxId);
    
    if (!user) {
        return res.json({ role: null });
    }
    
    // TODO: Sprawdź jaką rolę ma użytkownik na Discordzie i zwróć jej nazwę
    // Na razie zwracamy null (brak synchronizacji Discord -> Roblox)
    res.json({ role: null });
});
app.listen(config.server.port, () => {
    console.log(`[SERVER] Serwer gotowy na porcie ${config.server.port}`);
});
