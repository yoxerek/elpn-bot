// config.js - GOTOWY PLIK Z ID RÓL
require('dotenv').config();

module.exports = {
    discord: {
        token: process.env.DISCORD_TOKEN,
        guildId: process.env.DISCORD_GUILD_ID,
        clientId: process.env.DISCORD_CLIENT_ID,
        
        // Mapowanie dla komendy /nadajrole (ID roli Discord -> nazwa w Roblox)
        roleMapping: {
            '1466173053410213942': 'Arka Gdynia',
            '1466173053397504099': 'Bruk-BET Termalica',
            '1466173053422800896': 'Cracovia',
            '1466173053410213938': 'GKS Katowice',
            '1466173053422800900': 'Górnik Zabrze',
            '1466173053422800899': 'Jagiellonia Białystok',
            '1466173053410213945': 'Korona Kielce',
            '1466173053410213946': 'Lech Poznań',
            '1466173053410213941': 'Lechia Gdańsk',
            '1466173053397504100': 'Legia Warszawa',
            '1466173053410213943': 'Motor Lublin',
            '1466173053410213940': 'Piast Gliwice',
            '1466173053410213944': 'Pogoń Szczecin',
            '1466173053410213947': 'Radomiak Radom',
            '1466173053422800898': 'Raków Częstochowa',
            '1466173053410213939': 'Widzew Łódź',
            '1466173053422800901': 'Wisła Płock',
            '1466173053422800897': 'Zagłębie Lublin'
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
    
    // Synchronizacja automatyczna Discord -> Roblox
    // Turysta pominięta - jest domyślna w Roblox przy wejściu na serwer
    roleSync: {
        '1466173053410213942': 'Arka Gdynia',
        '1466173053397504099': 'Bruk-BET Termalica',
        '1466173053422800896': 'Cracovia',
        '1466173053410213938': 'GKS Katowice',
        '1466173053422800900': 'Górnik Zabrze',
        '1466173053422800899': 'Jagiellonia Białystok',
        '1466173053410213945': 'Korona Kielce',
        '1466173053410213946': 'Lech Poznań',
        '1466173053410213941': 'Lechia Gdańsk',
        '1466173053397504100': 'Legia Warszawa',
        '1466173053410213943': 'Motor Lublin',
        '1466173053410213940': 'Piast Gliwice',
        '1466173053410213944': 'Pogoń Szczecin',
        '1466173053410213947': 'Radomiak Radom',
        '1466173053422800898': 'Raków Częstochowa',
        '1466173053410213939': 'Widzew Łódź',
        '1466173053422800901': 'Wisła Płock',
        '1466173053422800897': 'Zagłębie Lublin'
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
