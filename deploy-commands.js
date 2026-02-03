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
                .setDescription('Wybierz drużynę')
                .setRequired(true)
                .addChoices(
                    { name: 'Arka Gdynia', value: 'Arka Gdynia' },
                    { name: 'Bruk-BET Termalica', value: 'Bruk-BET Termalica' },
                    { name: 'Cracovia', value: 'Cracovia' },
                    { name: 'GKS Katowice', value: 'GKS Katowice' },
                    { name: 'Górnik Zabrze', value: 'Górnik Zabrze' },
                    { name: 'Jagiellonia Białystok', value: 'Jagiellonia Białystok' },
                    { name: 'Korona Kielce', value: 'Korona Kielce' },
                    { name: 'Lech Poznań', value: 'Lech Poznań' },
                    { name: 'Lechia Gdańsk', value: 'Lechia Gdańsk' },
                    { name: 'Legia Warszawa', value: 'Legia Warszawa' },
                    { name: 'Motor Lublin', value: 'Motor Lublin' },
                    { name: 'Piast Gliwice', value: 'Piast Gliwice' },
                    { name: 'Pogoń Szczecin', value: 'Pogoń Szczecin' },
                    { name: 'Radomiak Radom', value: 'Radomiak Radom' },
                    { name: 'Raków Częstochowa', value: 'Raków Częstochowa' },
                    { name: 'Widzew Łódź', value: 'Widzew Łódź' },
                    { name: 'Wisła Płock', value: 'Wisła Płock' },
                    { name: 'Zagłębie Lublin', value: 'Zagłębie Lublin' }
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
                .setDescription('Wybierz drużynę')
                .setRequired(true)
                .addChoices(
                    { name: 'Arka Gdynia', value: 'Arka Gdynia' },
                    { name: 'Bruk-BET Termalica', value: 'Bruk-BET Termalica' },
                    { name: 'Cracovia', value: 'Cracovia' },
                    { name: 'GKS Katowice', value: 'GKS Katowice' },
                    { name: 'Górnik Zabrze', value: 'Górnik Zabrze' },
                    { name: 'Jagiellonia Białystok', value: 'Jagiellonia Białystok' },
                    { name: 'Korona Kielce', value: 'Korona Kielce' },
                    { name: 'Lech Poznań', value: 'Lech Poznań' },
                    { name: 'Lechia Gdańsk', value: 'Lechia Gdańsk' },
                    { name: 'Legia Warszawa', value: 'Legia Warszawa' },
                    { name: 'Motor Lublin', value: 'Motor Lublin' },
                    { name: 'Piast Gliwice', value: 'Piast Gliwice' },
                    { name: 'Pogoń Szczecin', value: 'Pogoń Szczecin' },
                    { name: 'Radomiak Radom', value: 'Radomiak Radom' },
                    { name: 'Raków Częstochowa', value: 'Raków Częstochowa' },
                    { name: 'Widzew Łódź', value: 'Widzew Łódź' },
                    { name: 'Wisła Płock', value: 'Wisła Płock' },
                    { name: 'Zagłębie Lublin', value: 'Zagłębie Lublin' }
                ))
].map(cmd => cmd.toJSON());

const rest = new REST({ version: '10' }).setToken(config.discord.token);

(async () => {
    try {
        console.log('Usuwam stare komendy...');
        // USUŃ WSZYSTKIE STARE KOMENDY
        await rest.put(
            Routes.applicationGuildCommands(config.discord.clientId, config.discord.guildId),
            { body: [] }
        );
        console.log('✅ Stare komendy usunięte.');
        
        console.log('Rejestruję nowe komendy (18 drużyn)...');
        // DODAJ NOWE
        await rest.put(
            Routes.applicationGuildCommands(config.discord.clientId, config.discord.guildId),
            { body: commands }
        );
        console.log('✅ Nowe komendy zarejestrowane!');
        console.log('Odśwież Discorda (Ctrl+R) aby zobaczyć zmiany.');
    } catch (error) {
        console.error('Błąd:', error);
    }
})();
