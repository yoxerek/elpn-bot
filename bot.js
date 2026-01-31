// bot.js - CAŁY PLIK
const { Client, GatewayIntentBits, Events, EmbedBuilder, ActionRowBuilder, StringSelectMenuBuilder, ButtonBuilder, ButtonStyle, PermissionsBitField, ActivityType } = require('discord.js');
const config = require('./config');
const db = require('./database');

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMembers,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent
    ]
});

const codes = new Map();

const createEmbed = (title, description, color = 0x0099FF) => {
    return new EmbedBuilder()
        .setTitle(title)
        .setDescription(description)
        .setColor(color)
        .setTimestamp();
};

async function createTicketPanel() {
    const channel = await client.channels.fetch(config.discord.channels.ticketPanel);
    if (!channel) return console.error('Nie znaleziono kanału ticketów!');
    
    const messages = await channel.messages.fetch({ limit: 10 });
    await channel.bulkDelete(messages).catch(() => {});
    
    const embed = new EmbedBuilder()
        .setTitle('🎫 System Ticketów ELPN')
        .setDescription('**Witaj na Administracji | ELPN!**\n\nAby stworzyć ticket zaznacz jedną z opcji poniżej.')
        .setColor(0xFF0000)
        .setFooter({ text: 'Administracja ELPN' });
    
    const selectMenu = new StringSelectMenuBuilder()
        .setCustomId('create_ticket')
        .setPlaceholder('Wybierz kategorię ticketu...')
        .addOptions(config.ticketTypes.map(t => ({
            label: t.label,
            value: t.value,
            emoji: t.emoji,
            description: t.description
        })));
    
    const row = new ActionRowBuilder().addComponents(selectMenu);
    
    await channel.send({ embeds: [embed], components: [row] });
    console.log('✅ Panel ticketów utworzony!');
}

client.on(Events.InteractionCreate, async interaction => {
    if (!interaction.isStringSelectMenu()) return;
    if (interaction.customId !== 'create_ticket') return;
    
    const ticketType = interaction.values[0];
    const typeConfig = config.ticketTypes.find(t => t.value === ticketType);
    
    const existing = db.prepare('SELECT * FROM tickets WHERE user_id = ? AND status = "open"').get(interaction.user.id);
    if (existing) {
        return interaction.reply({ 
            content: `❌ Masz już otwarty ticket: <#${existing.channel_id}>`, 
            ephemeral: true 
        });
    }
    
    await interaction.deferReply({ ephemeral: true });
    
    try {
        const guild = interaction.guild;
        const category = await guild.channels.fetch(config.discord.channels.ticketCategory);
        
        const channel = await guild.channels.create({
            name: `ticket-${interaction.user.username}`,
            type: 0,
            parent: category.id,
            permissionOverwrites: [
                {
                    id: guild.id,
                    deny: [PermissionsBitField.Flags.ViewChannel]
                },
                {
                    id: interaction.user.id,
                    allow: [PermissionsBitField.Flags.ViewChannel, PermissionsBitField.Flags.SendMessages, PermissionsBitField.Flags.ReadMessageHistory]
                },
                {
                    id: config.discord.roles.admin,
                    allow: [PermissionsBitField.Flags.ViewChannel, PermissionsBitField.Flags.SendMessages, PermissionsBitField.Flags.ReadMessageHistory]
                }
            ]
        });
        
        db.createTicket(channel.id, interaction.user.id, ticketType);
        
        const ticketEmbed = new EmbedBuilder()
            .setTitle(`${typeConfig.emoji} Ticket: ${typeConfig.label}`)
            .setDescription(`Użytkownik: ${interaction.user}\nTyp: **${typeConfig.label}**\n\nOpisz szczegółowo swoją sprawę.`)
            .setColor(0x00FF00);
        
        const closeBtn = new ActionRowBuilder().addComponents(
            new ButtonBuilder()
                .setCustomId('close_ticket')
                .setLabel('Zamknij ticket')
                .setStyle(ButtonStyle.Danger)
                .setEmoji('🔒')
        );
        
        await channel.send({ content: `${interaction.user} <@&${config.discord.roles.admin}>`, embeds: [ticketEmbed], components: [closeBtn] });
        await interaction.editReply({ content: `✅ Ticket utworzony: ${channel}` });
        
        const logChannel = await client.channels.fetch(config.discord.channels.ticketLog);
        if (logChannel) {
            const logEmbed = createEmbed('🎫 Nowy Ticket', `Użytkownik: ${interaction.user.tag}\nTyp: ${typeConfig.label}`, 0x00FF00);
            logChannel.send({ embeds: [logEmbed] });
        }
        
    } catch (err) {
        console.error(err);
        await interaction.editReply({ content: '❌ Błąd!' });
    }
});

client.on(Events.InteractionCreate, async interaction => {
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
});

client.on(Events.InteractionCreate, async interaction => {
    if (!interaction.isChatInputCommand()) return;
    
    const { commandName } = interaction;
    
    if (commandName === 'nadajrole') {
        if (!interaction.member.roles.cache.has(config.discord.roles.admin)) {
            return interaction.reply({ content: '❌ Brak uprawnień!', ephemeral: true });
        }
        
        const user = interaction.options.getUser('uzytkownik');
        const rola = interaction.options.getString('rola');
        
        const member = await interaction.guild.members.fetch(user.id);
        const entry = Object.entries(config.discord.roleMapping).find(([id, name]) => name === rola);
        
        if (!entry) return interaction.reply({ content: '❌ Nieznana rola!', ephemeral: true });
        
        await member.roles.add(entry[0]);
        
        // 🔥 SYNCHRONIZACJA Z ROBLOX - ZAPISZ DO BAZY
        const linked = db.getByDiscord(user.id);
        if (linked) {
            db.setPendingRole(linked.roblox_id, rola);
            console.log(`[SYNC] Ustawiono rolę ${rola} dla Roblox ID: ${linked.roblox_id}`);
        }
        
        const syncText = linked ? "Synchronizacja z Roblox..." : "Niezweryfikowany w Roblox";
        const embed = createEmbed('✅ Nadano rolę', `Użytkownik: ${user}\nRola: **${rola}**\n\n${syncText}`, 0x00FF00);
        await interaction.reply({ embeds: [embed] });
    }
    
    if (commandName === 'usunrole') {
        if (!interaction.member.roles.cache.has(config.discord.roles.admin)) {
            return interaction.reply({ content: '❌ Brak uprawnień!', ephemeral: true });
        }
        
        const user = interaction.options.getUser('uzytkownik');
        const rola = interaction.options.getString('rola');
        
        const member = await interaction.guild.members.fetch(user.id);
        const entry = Object.entries(config.discord.roleMapping).find(([id, name]) => name === rola);
        
        if (!entry) return interaction.reply({ content: '❌ Nieznana rola!', ephemeral: true });
        
        await member.roles.remove(entry[0]);
        
        const embed = createEmbed('🗑️ Usunięto rolę', `Użytkownik: ${user}\nRola: **${rola}**`, 0xFF0000);
        await interaction.reply({ embeds: [embed] });
    }
});

async function sendBanWebhook(robloxName, robloxId, reason, adminName) {
    if (!config.discord.channels.banWebhook) return;
    
    const embed = new EmbedBuilder()
        .setTitle('⛔ Nowy Ban')
        .setDescription(`**Gracz:** ${robloxName}\n**Powód:** ${reason}\n**Admin:** ${adminName}`)
        .setColor(0xFF0000)
        .setTimestamp();
    
    try {
        await fetch(config.discord.channels.banWebhook, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                username: 'System Banów ELPN',
                embeds: [embed]
            })
        });
    } catch (err) {
        console.error('Błąd webhooka:', err);
    }
}

client.on(Events.MessageCreate, async message => {
    if (message.author.bot) return;
    if (!message.content.startsWith('!')) return;
    
    const args = message.content.slice(1).trim().split(/ +/);
    const command = args.shift().toLowerCase();
    
    if (command === 'weryfikuj') {
        const robloxName = args[0];
        if (!robloxName) return message.reply('Użycie: `!weryfikuj [nick]`');
        
        const code = Math.random().toString(36).substring(2, 8).toUpperCase();
        codes.set(code, {
            discordId: message.author.id,
            robloxName: robloxName,
            time: Date.now()
        });
        
        const embed = new EmbedBuilder()
            .setTitle('🔐 Weryfikacja')
            .setDescription(`Kod: **\`${code}\`**\nWpisz w grze: \`/verify ${code}\``)
            .setColor(0x00FF00);
            
        message.reply({ embeds: [embed] });
        setTimeout(() => codes.delete(code), 600000);
    }
    
    if (command === 'setup-tickets') {
        if (!message.member.roles.cache.has(config.discord.roles.admin)) return;
        await createTicketPanel();
        message.reply('✅ Panel utworzony!');
    }
});

client.once(Events.ClientReady, async () => {
    client.user.setPresence({
        activities: [{ name: 'ELPN [BETA]', type: ActivityType.Playing }],
        status: 'dnd'
    });
    
    console.log(`[DISCORD] Bot gotowy jako ${client.user.tag}`);
});

module.exports = { client, codes, sendBanWebhook, db };
