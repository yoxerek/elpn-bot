require('dotenv').config();

module.exports = {
    discord: {
        token: process.env.DISCORD_TOKEN,
        guildId: process.env.DISCORD_GUILD_ID,
        clientId: process.env.DISCORD_CLIENT_ID,
        roleMapping: {
            'ID_ROLI_INTER': 'InterFan',
            'ID_ROLI_MILAN': 'MilanFan',
            'ID_ROLI_JUVE': 'JuveFan'
        },
        channels: {
            ticketCategory: process.env.TICKET_CATEGORY_ID,
            ticketLog: process.env.TICKET_LOG_CHANNEL_ID,
            ticketPanel: process.env.TICKET_PANEL_CHANNEL_ID,
            banWebhook: process.env.BAN_WEBHOOK_URL
        },
        roles: {
            admin: process.env.ADMIN_ROLE_ID,
            mod: process.env.MOD_ROLE_ID
        }
    },
    server: {
        port: process.env.PORT || 3000
    },
    ticketTypes: [
        { label: 'UNBAN', value: 'unban', emoji: '🔓', description: 'Chcesz wykupić/odwołać swojego bana?' },
        { label: 'ZAKUPY', value: 'zakupy', emoji: '🛒', description: 'Zakupiłeś produkt ze sklepu ELPN?' },
        { label: 'KONTAKT Z ADMINISTRACJĄ', value: 'admin', emoji: '👮', description: 'Pilny kontakt z administratorem' },
        { label: 'SKARGA NA ADMINISTRATORA', value: 'skarga_admin', emoji: '🚨', description: 'Administrator łamie regulamin?' },
        { label: 'SKARGA NA GRACZA', value: 'skarga_gracz', emoji: '📝', description: 'Gracz złamał regulamin?' },
        { label: 'ROLA', value: 'rola', emoji: '🎭', description: 'Nadanie/odebranie roli' },
        { label: 'DO OBSŁUGI', value: 'obsluga', emoji: '🔧', description: 'Pomoc Techniczna' },
        { label: 'STROJE', value: 'stroje', emoji: '👕', description: 'Wstawienie/stworzenie strojów' },
        { label: 'KOD TWÓRCY', value: 'creator', emoji: '💳', description: 'Własny kod twórcy' },
        { label: 'KONTAKT HR', value: 'hr', emoji: '💼', description: 'Kontakt z HR' },
        { label: 'ORGANIZACJA WYDARZEŃ', value: 'event', emoji: '🎉', description: 'Zgłoszenie do organizacji' },
        { label: 'BAN ID 600', value: 'ban600', emoji: '⛔', description: 'Otrzymałeś bana ID 600?' },
        { label: 'ROZŁĄCZENIE KONTA', value: 'unlink', emoji: '🔌', description: 'Rozłączenie Roblox z Discord' }
    ]
};