const { Client, Intents } = require('discord.js');
const banned = [];
const client = new Client({ intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES] });

const words = require('./words.json')

let userDelays = {};

const Database = require("@replit/database")
const db = new Database()
//require('./deploy')
require('./server.js')
client.on('ready', () => {
  console.log(`Logged in as ${client.user.tag}!`);
});
async function mSocialCredit(user, amount) {
	let usr = await db.get(user);
	usr.score += amount;
	await db.set(user,usr);
	
}

async function susEvent(msg, isMsgEdit) {
  let socialCredit = await db.get(msg.author.id)
	if (!socialCredit) {
		socialCredit = {score: 80};
		await db.set(msg.author.id,socialCredit);
	}
	for (let bword of words.bad) {
		if (bword.text) {
			if (msg.content.toLowerCase().includes(bword.text)) {
				mSocialCredit(msg.author.id, bword.price);
				msg.reply(`${bword.price} social credit.`)
			}
		}
		if (bword.regex) {
			let [regex, flags] = bword.regex;
			if (new RegExp(regex, flags).test(msg.content)) {
				mSocialCredit(msg.author.id, bword.price);
				msg.reply(`${bword.price} social credit.`);
			}
		}
	}
  if (!isMsgEdit) if (Date.now() > (userDelays[msg.author.id] || 0)) {
		for (let gword of words.good) {
			if (gword.text) {
				if (msg.content.toLowerCase().includes(gword.text)) {
					
					mSocialCredit(msg.author.id, gword.price);
					try { msg.reply(`+${gword.price} social credit!`); } catch(err) { console.error(err); };
					// ratelimit
					userDelays[msg.author.id] = Date.now()+(5 * 1000)
					return;
				}
			}
			if (gword.regex) {
				let [regex, flags] = gword.regex;
				if (new RegExp(regex, flags).test(msg.content)) {
					mSocialCredit(msg.author.id, gword.price);
					try { msg.reply(`+${gword.price} social credit!`); } catch(err) { console.error(err); };
					//ratelimit
          userDelays[msg.author.id] = Date.now()+(5 * 1000)
					return;
				}
			}
		}
	}
}

client.on('messageCreate', async (msg) => {
  if (banned.includes(msg.author.id)) return;
  if (msg.author.bot) return;
	if (msg.content === "(sc)reset") {
		await db.set(msg.author.id.toString(), 0);
		msg.reply('social credit reset successful')
	}
	await susEvent(msg, false);
});

client.on('messageUpdate', async (omsg, nmsg) => { // sussybaka sunny
  if (banned.includes(nmsg.author.id)) return;
  if (nmsg.author.bot) return;
  await susEvent(nmsg, true);
});

client.on('interactionCreate', async interaction => {
  if (!interaction.isCommand()) return;

  if (interaction.commandName === 'score') {
		let user = interaction.options.getUser('user') || interaction.user;
    let id = user.id;
    if (banned.includes(id)) return interaction.reply(`<@!${id}> has NaN social credit.`);
    if (id === client.user.id) return interaction.reply(`<@!${client.user.id}> has ∞ social credit.`);
    if (user.bot) return interaction.reply(`<@!${id}> is a bot duck.`);
		let socialCredit = await db.get(id)
		if (!socialCredit) {
			socialCredit = {score: 80};
			await db.set(id,socialCredit);
		}
    await interaction.reply(`<@!${id}> has ${socialCredit.score} social credit.`);
  }
});
client.on('error', err => console.error(err));
client.login(process.env.TOKEN);