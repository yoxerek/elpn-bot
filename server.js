// server.js
const express = require('express');
const bodyParser = require('body-parser');
const config = require('./config');
const { codes, generateCode, db } = require('./bot');

const app = express();
app.use(bodyParser.json());

app.post('/generate-code', (req, res) => {
    const { robloxId, robloxUsername } = req.body;
    if (!robloxId || !robloxUsername) return res.status(400).json({ error: 'Brak danych' });
    
    const code = generateCode(robloxId, robloxUsername);
    console.log(`[GENERATE] Kod ${code} dla ${robloxUsername}`);
    res.json({ code: code });
});

// Pozostałe endpointy...
app.get('/pending-role/:robloxId', (req, res) => {
    const roleName = db.getPendingRole(req.params.robloxId);
    res.json({ hasRole: !!roleName, roleName: roleName });
});

app.post('/clear-pending-role/:robloxId', (req, res) => {
    db.clearPendingRole(req.params.robloxId);
    res.json({ success: true });
});

app.listen(config.server.port, () => {
    console.log(`[SERVER] Gotowy na porcie ${config.server.port}`);
});
