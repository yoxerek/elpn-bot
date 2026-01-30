const { REST, Routes, SlashCommandBuilder } = require('discord.js');
const config = require('./config');

const commands = [
    new SlashCommandBuilder()
        .setName('nadajrole')
        .setDescription('Nadaje rolę powiązaną z Roblox')
        .addUserOption(option => 
            option.setName('uzytkownik')
                .setDescription('Użytkownik Discord')
                .setRequired(true))
        .addStringOption(option =>
            option.setName('rola')
                .setDescription('Nazwa roli w Roblox')
                .setRequired(true)
                .addChoices(
                    { name: 'Inter Fan', value: 'InterFan' },
                    { name: 'Milan Fan', value: 'MilanFan' },
                    { name: 'Juve Fan', value: 'JuveFan' }
                )),
    
    new SlashCommandBuilder()
        .setName('usunrole')
        .setDescription('Usuwa rolę powiązaną z Roblox')
        .addUserOption(option => 
            option.setName('uzytkownik')
                .setDescription('Użytkownik Discord')
                .setRequired(true))
        .addStringOption(option =>
            option.setName('rola')
                .setDescription('Nazwa roli w Roblox')
                .setRequired(true)
                .addChoices(
                    { name: 'Inter Fan', value: 'InterFan' },
                    { name: 'Milan Fan', value: 'MilanFan' },
                    { name: 'Juve Fan', value: 'JuveFan' }
                ))
];

const rest = new REST({ version: '10' }).setToken(config.discord.token);

(async () => {
    try {
        console.log('Rozpoczynam rejestrację komend...');
        await rest.put(
            Routes.applicationGuildCommands(config.discord.clientId, config.discord.guildId),
            { body: commands }
        );
        console.log('✅ Komendy zarejestrowane!');
    } catch (error) {
        console.error(error);
    }
})();