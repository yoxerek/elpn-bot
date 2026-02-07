// bot.js v9.0 - z blokadą wielu ról klubowych
const { Client, GatewayIntentBits, Events, EmbedBuilder, PermissionsBitField, ActivityType } = require('discord.js');
const config = require('./config');
const db = require('./database');

process.on('unhandledRejection', error => console.error(error));

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMembers,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent
    ]
});

const ALLOWED_USERS = ['1110877053022117888', '1424731659139416147'];
const codes = new Map();

// Lista wszystkich ról klubowych (bez Turysty)
const CLUB_ROLES = [
    'Arka Gdynia', 'Bruk-BET Termalica', 'Cracovia', 'GKS Katowice',
    'Górnik Zabrze', 'Jagiellonia Białystok', 'Korona Kielce', 'Lech Poznań',
    'Lechia Gdańsk', 'Legia Warszawa', 'Motor Lublin', 'Piast Gliwice',
    'Pogoń Szczecin', 'Radomiak Radom', 'Raków Częstochowa', 
    'Widzew Łódź', 'Wisła Płock', 'Zagłębie Lublin'
];

function generateCode(robloxId, robloxUsername) {
    const code = Math.random().toString(36).substring(2, 8).toUpperCase();
    codes.set(code, { robloxId, robloxUsername, timestamp: Date.now() });
    setTimeout(() => codes.delete(code), 600000);
    return code;
}

// Sprawdź czy użytkownik ma już rolę klubową
async function hasClubRole(member) {
    const roles = await member.roles.cache;
    for (const roleName of CLUB_ROLES) {
        const hasRole = roles.some(r => r.name === roleName);
        if (hasRole) return roleName;
    }
    return null;
}

client.on(Events.InteractionCreate, async interaction => {
    try {
        if (!interaction.isChatInputCommand()) return;
        
        const { commandName } = interaction;
        
        if (commandName === 'nadajrole') {
            // Sprawdź uprawnienia
            const hasRole = interaction.member.roles.cache.has(config.discord.roles.admin);
            const isWhitelisted = ALLOWED_USERS.includes(interaction.user.id);
            if (!hasRole && !isWhitelisted) {
                return interaction.reply({ content: '❌ Brak uprawnień!', ephemeral: true });
            }
            
            const user = interaction.options.getUser('uzytkownik');
            const rola = interaction.options.getString('rola');
            const member = await interaction.guild.members.fetch(user.id);
            
            // 🔴 BLOKADA 1: Sprawdź czy ma połączone konto Roblox
            const linked = db.getByDiscord(user.id);
            if (!linked) {
                return interaction.reply({ 
                    content: `❌ ${user.tag} nie ma połączonego konta Roblox!\n\n📝 **Jak połączyć:**\n1. Wpisz w grze Roblox: \`!weryfikacja\`\n2. Otrzymasz kod w czacie\n3. Wpisz na Discordzie: \`!weryfikacja [kod]\``, 
                    ephemeral: true 
                });
            }
            
            // 🔴 BLOKADA 2: Sprawdź czy już ma inną rolę klubową
            const existingRole = await hasClubRole(member);
            if (existingRole) {
                return interaction.reply({ 
                    content: `❌ ${user.tag} już ma rolę klubową: **${existingRole}**!\n\nNajpierw usuń mu obecną rolę komendą \`/usunrole\`, potem dodaj nową.`, 
                    ephemeral: true 
                });
            }
            
            // Nadaj rolę
            const entry = Object.entries(config.discord.roleMapping).find(([id, name]) => name === rola);
            if (!entry) return interaction.reply({ content: '❌ Nieznana rola!', ephemeral: true });
            
            await member.roles.add(entry[0]);
            db.setPendingRole(linked.roblox_id, rola);
            
            const embed = new EmbedBuilder()
                .setTitle('✅ Nadano rolę')
                .setDescription(`Użytkownik: ${user}\nRola: **${rola}**\n\n🎉 Konta połączone - synchronizacja aktywna!`)
                .setColor(0x00FF00);
            await interaction.reply({ embeds: [embed] });
        }
        
        if (commandName === 'usunrole') {
            const hasRole = interaction.member.roles.cache.has(config.discord.roles.admin);
            const isWhitelisted = ALLOWED_USERS.includes(interaction.user.id);
            if (!hasRole && !isWhitelisted) return interaction.reply({ content: '❌ Brak uprawnień!', ephemeral: true });
            
            const user = interaction.options.getUser('uzytkownik');
            const rola = interaction.options.getString('rola');
            const member = await interaction.guild.members.fetch(user.id);
            
            const entry = Object.entries(config.discord.roleMapping).find(([id, name]) => name === rola);
            if (!entry) return interaction.reply({ content: '❌ Nieznana rola!', ephemeral: true });
            
            await member.roles.remove(entry[0]);
            
            const embed = new EmbedBuilder()
                .setTitle('🗑️ Usunięto rolę')
                .setDescription(`Użytkownik: ${user}\nRola: **${rola}**`)
                .setColor(0xFF0000);
            await interaction.reply({ embeds: [embed] });
        }
    } catch (err) {
        console.error(err);
    }
});

// WERYFIKACJA Z DISCORDA (krok 2)
client.on(Events.MessageCreate, async message => {
    if (message.author.bot) return;
    if (!message.content.startsWith('!')) return;
    
    const args = message.content.slice(1).trim().split(/ +/);
    const command = args.shift().toLowerCase();
    
    if (command === 'weryfikacja' || command === 'verify') {
        const code = args[0];
        
        if (!code) {
            return message.reply('❌ Użycie: `!weryfikacja [kod_z_gry]`\n\nWpierw wpisz `!weryfikacja` w grze Roblox.');
        }
        
        const data = codes.get(code.toUpperCase());
        if (!data) {
            return message.reply('❌ Nieprawidłowy lub wygasły kod (ważny 10 minut).');
        }
        
        if (db.getByDiscord(message.author.id)) {
            return message.reply('❌ Twoje konto Discord jest już połączone z Robloxem!');
        }
        
        // LINKUJEMY!
        db.link(message.author.id, data.robloxId, data.robloxUsername);
        codes.delete(code.toUpperCase());
        
        const embed = new EmbedBuilder()
            .setTitle('✅ Weryfikacja udana!')
            .setDescription(`**Połączono konta:**\n• **Discord:** ${message.author.tag}\n• **Roblox:** ${data.robloxUsername}\n\n🎉 Teraz możesz otrzymać rolę klubową!`)
            .setColor(0x00FF00);
        message.reply({ embeds: [embed] });
    }
});

client.once(Events.ClientReady, () => {
    client.user.setPresence({ activities: [{ name: 'ELPN v9.0', type: ActivityType.Playing }], status: 'dnd' });
    console.log(`[DISCORD] Bot gotowy!`);
});

client.login(config.discord.token).catch(err => console.error('Błąd logowania:', err));

module.exports = { client, codes, generateCode, db };
