const { REST } = require('@discordjs/rest');
const { Routes } = require('discord-api-types/v9');
const { SlashCommandBuilder } = require('@discordjs/builders');

const {TOKEN, CLIENT_ID, GUILD_ID} = process.env;

const commands = [
	new SlashCommandBuilder()
		.setName('score')
		.setDescription('Check your score or another user\'s score')
		.addUserOption(option => 
			option.setName('user')
				.setDescription('The user you want to see the score from')
		)
].map(x => x.toJSON());

const rest = new REST({ version: '9' }).setToken(TOKEN);

(async () => {
  try {
    console.log('Started refreshing application (/) commands.');

    await rest.put(
      //Routes.applicationGuildCommands(CLIENT_ID, GUILD_ID),
			Routes.applicationCommands(CLIENT_ID),
      { body: commands },
    );

    console.log('Successfully reloaded application (/) commands.');
  } catch (error) {
    console.error(error);
  }
})();