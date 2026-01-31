// config.js - CAŁY PLIK
require('dotenv').config();

module.exports = {
    discord: {
        token: process.env.DISCORD_TOKEN,
        guildId: process.env.DISCORD_GUILD_ID,
        clientId: process.env.DISCORD_CLIENT_ID,
        
        // Mapowanie dla komendy /nadajrole (ID roli Discord -> nazwa w Roblox)
        roleMapping: {
            'ID_ROLI_ARKA_GDYNIA': 'Arka Gdynia',
            'ID_ROLI_BRUK_BET': 'Bruk-BET Termalica',
            'ID_ROLI_CRACOVIA': 'Cracovia',
            'ID_ROLI_GKS_KATOWICE': 'GKS Katowice',
            'ID_ROLI_GORNIK_ZABRZE': 'Górnik Zabrze',
            'ID_ROLI_JAGIELLONIA': 'Jagiellonia Białystok',
            'ID_ROLI_KORONA_KIELCE': 'Korona Kielce',
            'ID_ROLI_LECH_POZNAN': 'Lech Poznań',
            'ID_ROLI_LECHIA_GDANSK': 'Lechia Gdańsk',
            'ID_ROLI_LEGIA_WARSZAWA': 'Legia Warszawa',
            'ID_ROLI_MOTOR_LUBLIN': 'Motor Lublin',
            'ID_ROLI_PIAST_GLIWICE': 'Piast Gliwice',
            'ID_ROLI_POGON_SZCZECIN': 'Pogoń Szczecin',
            'ID_ROLI_RADOMIAK_RADOM': 'Radomiak Radom',
            'ID_ROLI_RAKOW_CZESTOCHOWA': 'Raków Częstochowa',
            'ID_ROLI_TURYSTA': 'Turysta',
            'ID_ROLI_WIDZEW_LODZ': 'Widzew Łódź',
            'ID_ROLI_WISLA_PLOCK': 'Wisła Płock',
            'ID_ROLI_ZAGLEBIE_LUBLIN': 'Zagłębie Lublin'
        },
        
        channels: {
            ticketCategory: process.env.TICKET_CATEGORY_ID,
            ticketLog: process.env.TICKET_LOG_CHANNEL_ID,
            ticketPanel: process.env.TICKET_PANEL_CHANNEL_ID,
            banWebhook: process.env.BAN_WEBHOOK_URL
        },
        roles: {
            admin: process.env.ADMIN_ROLE_ID
        }
    },
    
    // Synchronizacja automatyczna (gdy ktoś ma rolę na DC, dostaje w Roblox)
    roleSync: {
        'ID_ROLI_ARKA_GDYNIA': 'Arka Gdynia',
        'ID_ROLI_BRUK_BET': 'Bruk-BET Termalica',
        'ID_ROLI_CRACOVIA': 'Cracovia',
        'ID_ROLI_GKS_KATOWICE': 'GKS Katowice',
        'ID_ROLI_GORNIK_ZABRZE': 'Górnik Zabrze',
        'ID_ROLI_JAGIELLONIA': 'Jagiellonia Białystok',
        'ID_ROLI_KORONA_KIELCE': 'Korona Kielce',
        'ID_ROLI_LECH_POZNAN': 'Lech Poznań',
        'ID_ROLI_LECHIA_GDANSK': 'Lechia Gdańsk',
        'ID_ROLI_LEGIA_WARSZAWA': 'Legia Warszawa',
        'ID_ROLI_MOTOR_LUBLIN': 'Motor Lublin',
        'ID_ROLI_PIAST_GLIWICE': 'Piast Gliwice',
        'ID_ROLI_POGON_SZCZECIN': 'Pogoń Szczecin',
        'ID_ROLI_RADOMIAK_RADOM': 'Radomiak Radom',
        'ID_ROLI_RAKOW_CZESTOCHOWA': 'Raków Częstochowa',
        'ID_ROLI_TURYSTA': 'Turysta',
        'ID_ROLI_WIDZEW_LODZ': 'Widzew Łódź',
        'ID_ROLI_WISLA_PLOCK': 'Wisła Płock',
        'ID_ROLI_ZAGLEBIE_LUBLIN': 'Zagłębie Lublin'
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
