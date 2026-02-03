// index.js - TERAZ SAM REJESTRUJE KOMENDY PRZY STARCIE
const { REST, Routes, SlashCommandBuilder } = require('discord.js');
const config = require('./config');

// NAJPIERW ZAREJESTRUJ NOWE KOMENDY (18 DRUŻYN)
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

console.log('🔄 Rejestrowanie komend (18 drużyn)...');

rest.put(
    Routes.applicationGuildCommands(config.discord.clientId, config.discord.guildId),
    { body: commands }
).then(() => {
    console.log('✅ Komendy zarejestrowane!');
    console.log('🚀 Uruchamianie bota...');
    
    // TERAZ URUCHOM BOTA
    const bot = require('./bot');
    const server = require('./server');
    
    console.log('📱 Bot Discord + 🌐 Serwer HTTP gotowe!');
}).catch(err => {
    console.error('❌ Błąd rejestracji komend:', err);
    // Mimo błędu spróbuj uruchomić bota
    const bot = require('./bot');
    const server = require('./server');
});
