const Discord = require('discord.js');
const client = new Discord.Client();
const alive = require('./server.js');
const config = require('./config.json'),
	fs = require('fs'),
	util = require('util'),
	readdir = util.promisify(fs.readdir),
	mongoose = require('mongoose');
client.on('guildCreate', guild => {
	guild.systemChannel.send(`Thank you for adding me. If You Wish Please Vote Me.`);
});
client.on('guildLeave', guild => {
	guild.systemChannel.send(`Thanks! for Using Mee`);
});
client.on('message', message => {
	if (message.content === '!join') {
		client.emit('guildMemberAdd', message.member);
	}
});

client.on('message', message => {
	if (message.content === '!leave') {
		client.emit('guildMemberLeave', message.member);
	}
});

client.on('message', message => {
	if (message.content === '!nitro') {
		client.emit('GuildMember.premiumSinceTimestamp', message.member);
	}
});
client.on('guildMemberAdd', async (member,message) => {
    const { guild } = member
    const role1 = message.roles.cache.find(role => role.name === 'Quest')
    member.roles.add(role1)
})
client.logger = require('./modules/Logger.js');
client.errors = require('./modules/Embeds.js');
client.tools = require('./modules/Tools.js');
client.data = require('./modules/MongoDB.js');
client.events = new Discord.Collection();
client.commands = new Discord.Collection();
client.categories = [];
async function init() {
	const eventFiles = fs
		.readdirSync('./events/')
		.filter(file => file.endsWith('.js'));
	for (const file of eventFiles) {
		const event = require(`./events/${file}`);
		const eventName = file.split('.')[0];
		client.logger.event(`Loading Event - ${eventName}`);
		client.on(eventName, event.bind(null, client));
	}

	let folders = await readdir('./commands/');
	folders.forEach(direct => {
		const commandFiles = fs
			.readdirSync('./commands/' + direct + '/')
			.filter(file => file.endsWith('.js'));
		for (const file of commandFiles) {
			const command = require(`./commands/${direct}/${file}`);
			client.commands.set(command.name, command);
		}
	});

	mongoose
		.connect(
			process.env.mongoDB,
			{ useNewUrlParser: true, useUnifiedTopology: true }
		)
		.then(() => {
			client.logger.log('Connected to the Mongodb database.', 'log');
		})
		.catch(err => {
			client.logger.log(
				'Unable to connect to the Mongodb database. Error:' + err,
				'error'
			);
		});
}

init();
client.login(process.env.TOKEN);

