// const { SlashCommandBuilder, Client } = require('discord.js');
// const { joinVoiceChannel, createAudioPlayer, createAudioResource, NoSubscriberBehavior, StreamType } = require('@discordjs/voice');
// // const ytdl = require('ytdl-core-discord');

// module.exports = {
//     data: new SlashCommandBuilder()
//         .setName('play')
//         .setDescription('音楽を再生します | Play the music')
//         .addStringOption(option =>
//             option.setName('url')
//                 .setDescription('再生したいYouTube動画のURLを入力してください')
//                 .setRequired(true),
//         ),
//     execute: async function (interaction) {
//         await interaction.deferReply();
//         // ユーザーが提供したURLを取得
//         const url = interaction.options.getString('url');

//         // ボイスチャンネルを取得
//         const voiceChannel = interaction.member.voice.channel;

//         if (!voiceChannel) {
//             return interaction.followUp('ボイスチャンネルに参加している必要があります。');
//         }

//         // ボイスチャンネルに接続
//         const connection = joinVoiceChannel({
//             channelId: voiceChannel.id,
//             guildId: interaction.guild.id,
//             adapterCreator: interaction.guild.voiceAdapterCreator,
//             selfDeaf: true,
//         });

        




//         // 音楽を再生
//         // const stream = await ytdl(ytdl.getURLVideoID(url), { filter: 'audioonly', quality: 'highestaudio', highWaterMark: 32 * 1024 * 1024 });
//         // const resource = createAudioResource(stream, { inputType: StreamType.WebmOpus });
//         // const player = createAudioPlayer({ behaviors: { noSubscriber: NoSubscriberBehavior.Pause } });

//         // connection.subscribe(player);
//         // player.play(resource);

//         // player.on('stateChange', (oldState, newState) => {
//         //     if (newState.status === 'idle') {
//         //         // 再生が終了した際の処理
//         //         connection.destroy();
//         //         interaction.followUp('音楽再生が終了しました。');
//         //     }
//         // });

//         // player.on('error', (error) => {
//         //     console.error(error);
//         //     interaction.followUp('音楽再生中にエラーが発生しました。');
//         // });

//         await interaction.followUp(`音楽を再生中: ${url}`);
//     },
// };
