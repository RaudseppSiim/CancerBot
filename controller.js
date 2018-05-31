const Discord = require('discord.js');
const client = new Discord.Client();
const yt = require('ytdl-core')
var playable = false;
let queue = {};

client.on('ready', () => {
  console.log(`Logged in as ${client.user.tag}!`);
});

client.on('message', msg => {
let dispatcher;
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
          playable = true;
        })
        .catch(console.log);
    } else {
      msg.reply('You need to join a voice channel first!');
    }
  }
  if (msg.content === 'c.leave') {
    msg.member.voiceChannel.leave();
    msg.reply('I have successfully left the channel!');
    playable = false;
  }
  if(msg.content ==='c.play' && playable === true) {

    if (queue[msg.guild.id] === undefined) return msg.channel.sendMessage(`Add some songs to the queue first with c.add`);
		if (!msg.guild.voiceConnection) return commands.join(msg).then(() => commands.play(msg));
		if (queue[msg.guild.id].playing) return msg.channel.sendMessage('Already Playing');
		queue[msg.guild.id].playing = true;

		console.log(queue);
    (function play(song) {
			console.log(song);
			if (song === undefined) return msg.channel.sendMessage('Queue is empty').then(() => {
				queue[msg.guild.id].playing = false;
				msg.member.voiceChannel.leave();
			});
			msg.channel.sendMessage(`Playing: **${song.title}** as requested by: **${song.requester}**`);
      dispatcher = msg.guild.voiceConnection.playStream(yt(song.url, { audioonly: true }), { passes : 5 });
      let collector = msg.channel.createCollector(m => m);
        collector.on('message', m => {
				if (m.content.startsWith('c.pause')) {
					msg.channel.sendMessage('paused').then(() => {dispatcher.pause();});
				} else if (m.content.startsWith('c.resume')){
					msg.channel.sendMessage('resumed').then(() => {dispatcher.resume();});
				} else if (m.content.startsWith('c.skip')){
					msg.channel.sendMessage('skipped').then(() => {dispatcher.end();});
				} else if (m.content.startsWith('c.volume+')){
					if (Math.round(dispatcher.volume*50) >= 100) return msg.channel.sendMessage(`Volume: ${Math.round(dispatcher.volume*50)}%`);
					dispatcher.setVolume(Math.min((dispatcher.volume*50 + (2*(m.content.split('+').length-1)))/50,2));
					msg.channel.sendMessage(`Volume: ${Math.round(dispatcher.volume*50)}%`);
				} else if (m.content.startsWith('c.volume-')){
					if (Math.round(dispatcher.volume*50) <= 0) return msg.channel.sendMessage(`Volume: ${Math.round(dispatcher.volume*50)}%`);
					dispatcher.setVolume(Math.max((dispatcher.volume*50 - (2*(m.content.split('-').length-1)))/50,0));
					msg.channel.sendMessage(`Volume: ${Math.round(dispatcher.volume*50)}%`);
				} else if (m.content.startsWith('c.time')){
					msg.channel.sendMessage(`time: ${Math.floor(dispatcher.time / 60000)}:${Math.floor((dispatcher.time % 60000)/1000) <10 ? '0'+Math.floor((dispatcher.time % 60000)/1000) : Math.floor((dispatcher.time % 60000)/1000)}`);
				}
});
      dispatcher.on('end', () => {
				collector.stop();
				play(queue[msg.guild.id].songs.shift());
			});
			dispatcher.on('error', (err) => {
				return msg.channel.sendMessage('error: ' + err).then(() => {
					collector.stop();
					play(queue[msg.guild.id].songs.shift());
				});
			});
    })(queue[msg.guild.id].songs.shift());
}

  if(msg.content.split(' ')[0] === 'c.add') {
		let url = msg.content.split(' ')[1];
	if (url == '' || url === undefined) return msg.channel.sendMessage(`You must add a YouTube video url, or id after c.add`);
		yt.getInfo(url, (err, info) => {
			if(err) return msg.channel.sendMessage('Invalid YouTube Link: ' + err);
			if (!queue.hasOwnProperty(msg.guild.id)) queue[msg.guild.id] = {}, queue[msg.guild.id].playing = false, queue[msg.guild.id].songs = [];
			queue[msg.guild.id].songs.push({url: url, title: info.title, requester: msg.author.username});
			msg.channel.sendMessage(`added **${info.title}** to the queue`);
		});
    if()
  }

  if(msg.content == 'c.queue') {
    if (queue[msg.guild.id] === undefined) return msg.channel.sendMessage(`Add some songs to the queue first with c.add`);
		let tosend = [];
		queue[msg.guild.id].songs.forEach((song, i) => { tosend.push(`${i+1}. ${song.title} - Requested by: ${song.requester}`);});
		msg.channel.sendMessage(`__**${msg.guild.name}'s Music Queue:**__ Currently **${tosend.length}** songs queued ${(tosend.length > 15 ? '*[Only next 15 shown]*' : '')}\n\`\`\`${tosend.slice(0,15).join('\n')}\`\`\``);
}
});
client.login('NDUxNDQ5MzcwNjY4MTcxMjg1.DfB-LQ.oghQRVZw9zB6whsxKNAvRS-Mgs4');
