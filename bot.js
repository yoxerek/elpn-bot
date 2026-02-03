// bot.js v8.0 - z nowym systemem weryfikacji
const { Client, GatewayIntentBits, Events, EmbedBuilder, ActionRowBuilder, StringSelectMenuBuilder, ButtonBuilder, ButtonStyle, PermissionsBitField, ActivityType } = require('discord.js');
const config = require('./config');
const db = require('./database');

process.on('unhandledRejection', error => {
    console.error('Unhandled promise rejection:', error);
});
process.on('uncaughtException', error => {
    console.error('Uncaught exception:', error);
});

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMembers,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent
    ]
});

// LISTA ADMINÓW (Discord ID)
const ALLOWED_USERS = [
    '1110877053022117888',  // TWOJE ID DISCORD
    '1424731659139416147'   // ID KOLEGI DISCORD
];

// MAPA KODÓW: kod -> { robloxId, robloxUsername, discordId?, timestamp }
const codes = new Map();

// Funkcja eksportowana dla server.js
function generateCode(robloxId, robloxUsername) {
    const code = Math.random().toString(36).substring(2, 8).toUpperCase();
    codes.set(code, {
        robloxId: robloxId,
        robloxUsername: robloxUsername,
        timestamp: Date.now()
    });
    setTimeout(() => codes.delete(code), 600000);
    return code;
}

const createEmbed = (title, description, color = 0x0099FF) => {
    return new EmbedBuilder()
        .setTitle(title)
        .setDescription(description)
        .setColor(color)
        .setTimestamp();
};

async function createTicketPanel() {
    try {
        const channel = await client.channels.fetch(config.discord.channels.ticketPanel);
        if (!channel) return console.error('Nie znaleziono kanału ticketów!');
        
        const messages = await channel.messages.fetch({ limit: 10 });
        await channel.bulkDelete(messages).catch(() => {});
        
        const embed = new EmbedBuilder()
            .setTitle('🎫 System Ticketów ELPN')
            .setDescription('**Witaj na Administracji | ELPN!**')
            .setColor(0xFF0000)
            .setFooter({ text: 'Administracja ELPN' });
        
        const selectMenu = new StringSelectMenuBuilder()
            .setCustomId('create_ticket')
            .setPlaceholder('Wybierz kategorię...')
            .addOptions(config.ticketTypes.map(t => ({
                label: t.label,
                value: t.value,
                emoji: t.emoji,
                description: t.description
            })));
        
        const row = new ActionRowBuilder().addComponents(selectMenu);
        await channel.send({ embeds: [embed], components: [row] });
        console.log('✅ Panel ticketów utworzony!');
    } catch (err) {
        console.error('Błąd tworzenia panelu:', err);
    }
}

client.on(Events.InteractionCreate, async interaction => {
    try {
        if (!interaction.isStringSelectMenu()) return;
        if (interaction.customId !== 'create_ticket') return;
        
        const ticketType = interaction.values[0];
        const typeConfig = config.ticketTypes.find(t => t.value === ticketType);
        
        const existing = db.prepare('SELECT * FROM tickets WHERE user_id = ? AND status = "open"').get(interaction.user.id);
        if (existing) {
            return interaction.reply({ content: `❌ Masz już otwarty ticket`, ephemeral: true });
        }
        
        await interaction.deferReply({ ephemeral: true });
        
        const guild = interaction.guild;
        const category = await guild.channels.fetch(config.discord.channels.ticketCategory);
        
        const channel = await guild.channels.create({
            name: `ticket-${interaction.user.username}`,
            type: 0,
            parent: category.id,
            permissionOverwrites: [
                { id: guild.id, deny: [PermissionsBitField.Flags.ViewChannel] },
                { id: interaction.user.id, allow: [PermissionsBitField.Flags.ViewChannel, PermissionsBitField.Flags.SendMessages, PermissionsBitField.Flags.ReadMessageHistory] },
                { id: config.discord.roles.admin, allow: [PermissionsBitField.Flags.ViewChannel, PermissionsBitField.Flags.SendMessages, PermissionsBitField.Flags.ReadMessageHistory] }
            ]
        });
        
        db.createTicket(channel.id, interaction.user.id, ticketType);
        
        const ticketEmbed = new EmbedBuilder()
            .setTitle(`${typeConfig.emoji} Ticket: ${typeConfig.label}`)
            .setDescription(`Użytkownik: ${interaction.user}`)
            .setColor(0x00FF00);
        
        const closeBtn = new ActionRowBuilder().addComponents(
            new ButtonBuilder().setCustomId('close_ticket').setLabel('Zamknij').setStyle(ButtonStyle.Danger).setEmoji('🔒')
        );
        
        await channel.send({ content: `${interaction.user} <@&${config.discord.roles.admin}>`, embeds: [ticketEmbed], components: [closeBtn] });
        await interaction.editReply({ content: `✅ Ticket utworzony: ${channel}` });
        
        const logChannel = await client.channels.fetch(config.discord.channels.ticketLog);
        if (logChannel) {
            logChannel.send({ embeds: [createEmbed('🎫 Nowy Ticket', `Użytkownik: ${interaction.user.tag}\nTyp: ${typeConfig.label}`, 0x00FF00)] });
        }
    } catch (err) {
        console.error(err);
    }
});

client.on(Events.InteractionCreate, async interaction => {
    try {
        if (!interaction.isButton()) return;
        if (interaction.customId !== 'close_ticket') return;
        
        const channel = interaction.channel;
        const ticketData = db.getTicket(channel.id);
        if (!ticketData) return interaction.reply({ content: '❌ To nie jest ticket!', ephemeral: true });
        
        await interaction.reply({ content: '🔒 Zamykam za 5 sekund...' });
        setTimeout(async () => {
            db.closeTicket(channel.id);
            await channel.delete().catch(() => {});
        }, 5000);
    } catch (err) {
        console.error(err);
    }
});

client.on(Events.InteractionCreate, async interaction => {
    try {
        if (!interaction.isChatInputCommand()) return;
        
        const { commandName } = interaction;
        
        if (commandName === 'nadajrole' || commandName === 'usunrole') {
            const hasRole = interaction.member.roles.cache.has(config.discord.roles.admin);
            const isWhitelisted = ALLOWED_USERS.includes(interaction.user.id);
            if (!hasRole && !isWhitelisted) {
                return interaction.reply({ content: '❌ Brak uprawnień!', ephemeral: true });
            }
        }
        
        if (commandName === 'nadajrole') {
            const user = interaction.options.getUser('uzytkownik');
            const rola = interaction.options.getString('rola');
            
            // 🔴 BLOKADA: Sprawdź czy ma połączone konto
            const linked = db.getByDiscord(user.id);
            if (!linked) {
                return interaction.reply({ 
                    content: `❌ **Brak weryfikacji!**\n\nUżytkownik ${user.tag} nie ma połączonego konta Roblox.\n\n📝 **Jak połączyć:**\n1. Wpisz w grze Roblox: \`!weryfikacja\`\n2. Otrzymasz kod w czacie\n3. Wpisz na Discordzie: \`!weryfikacja [kod]\``, 
                    ephemeral: true 
                });
            }
            
            const member = await interaction.guild.members.fetch(user.id);
            const entry = Object.entries(config.discord.roleMapping).find(([id, name]) => name === rola);
            if (!entry) return interaction.reply({ content: '❌ Nieznana rola!', ephemeral: true });
            
            await member.roles.add(entry[0]);
            db.setPendingRole(linked.roblox_id, rola);
            
            const embed = createEmbed('✅ Nadano rolę', `Użytkownik: ${user}\nRola: **${rola}**\n\n✅ Konta połączone - sync z Roblox aktywny!`, 0x00FF00);
            await interaction.reply({ embeds: [embed] });
        }
        
        if (commandName === 'usunrole') {
            const user = interaction.options.getUser('uzytkownik');
            const rola = interaction.options.getString('rola');
            
            const member = await interaction.guild.members.fetch(user.id);
            const entry = Object.entries(config.discord.roleMapping).find(([id, name]) => name === rola);
            if (!entry) return interaction.reply({ content: '❌ Nieznana rola!', ephemeral: true });
            
            await member.roles.remove(entry[0]);
            const embed = createEmbed('🗑️ Usunięto rolę', `Użytkownik: ${user}\nRola: **${rola}**`, 0xFF0000);
            await interaction.reply({ embeds: [embed] });
        }
    } catch (err) {
        console.error(err);
    }
});

// 🔴 NOWA KOMENDA TEKSTOWA: !weryfikacja [kod] (KROK 2)
client.on(Events.MessageCreate, async message => {
    try {
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
            
            // Sprawdź czy Discord konto już nie jest połączone
            if (db.getByDiscord(message.author.id)) {
                return message.reply('❌ Twoje konto Discord jest już połączone z Robloxem!');
            }
            
            // LINKUJEMY!
            db.link(message.author.id, data.robloxId, data.robloxUsername);
            codes.delete(code.toUpperCase());
            
            const embed = new EmbedBuilder()
                .setTitle('✅ Weryfikacja udana!')
                .setDescription(`**Połączono konta:**\n• **Discord:** ${message.author.tag}\n• **Roblox:** ${data.robloxUsername}\n\n🎉 Teraz możesz otrzymać rolę klubową!`)
                .setColor(0x00FF00)
                .setTimestamp();
                
            message.reply({ embeds: [embed] });
        }
        
        if (command === 'setup-tickets') {
            const hasRole = message.member.roles.cache.has(config.discord.roles.admin);
            const isWhitelisted = ALLOWED_USERS.includes(message.author.id);
            if (!hasRole && !isWhitelisted) return;
            await createTicketPanel();
            message.reply('✅ Panel utworzony!');
        }
    } catch (err) {
        console.error(err);
    }
});

async function sendBanWebhook(robloxName, robloxId, reason, adminName) {
    if (!config.discord.channels.banWebhook) return;
    const embed = new EmbedBuilder()
        .setTitle('⛔ Nowy Ban')
        .setDescription(`**Gracz:** ${robloxName}\n**Powód:** ${reason}\n**Admin:** ${adminName}`)
        .setColor(0xFF0000);
    try {
        await fetch(config.discord.channels.banWebhook, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username: 'System Banów ELPN', embeds: [embed] })
        });
    } catch (err) {}
}

client.on('error', error => console.error('Discord Error:', error));

client.once(Events.ClientReady, async () => {
    client.user.setPresence({ activities: [{ name: 'ELPN [BETA]', type: ActivityType.Playing }], status: 'dnd' });
    console.log(`[DISCORD] Bot gotowy jako ${client.user.tag}`);
});

client.login(config.discord.token).catch(err => console.error('Błąd logowania:', err));

module.exports = { client, codes, generateCode, sendBanWebhook, db };
