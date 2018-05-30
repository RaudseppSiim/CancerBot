const Discord = require('discord.js');
const client = new Discord.Client();

client.on('ready', () => {
  console.log(`Logged in as ${client.user.tag}!`);
});

client.on('message', msg => {
  if (msg.content === 'ping') {
    msg.reply('pong');
  }
  if (msg.content === 'bong') {
    msg.reply('dong');
  }
  if (msg.content === 'c.join') {
    // Only try to join the sender's voice channel if they are in one themselves
    if (msg.member.voiceChannel) {
      msg.member.voiceChannel.join()
        .then(connection => { // Connection is an instance of VoiceConnection
          msg.reply('I have successfully connected to the channel!');
        })
        .catch(console.log);
    } else {
      msg.reply('You need to join a voice channel first!');
    }
  }
  if (msg.content === 'c.leave') {
      msg.member.voiceChannel.leave()
        .then(connection =>{
          msg.reply('I have left the Channel')
        })
        .catch(console.log);
  }
});

client.login('NDUxNDQ5MzcwNjY4MTcxMjg1.DfB-LQ.oghQRVZw9zB6whsxKNAvRS-Mgs4');
