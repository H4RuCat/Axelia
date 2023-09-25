// test.jsのmodule.exportsを呼び出し
const testFile = require('./commands/test.js');
const taskFile = require('./commands/task.js');
// const playFile = require('./commands/play.js');

// 設定ファイルからトークン情報を呼び出し、変数に保存
const { token } = require('./config.json');

// discord.jsライブラリの中から必要な設定を呼び出し、変数に保存
const { Client, Events, GatewayIntentBits, EmbedBuilder } = require('discord.js');
const fs = require('fs');
// クライアントインスタンスと呼ばれるオブジェクトを作成
const client = new Client({ intents: [GatewayIntentBits.Guilds] });


function checkDeadlines() {
    const rawData = fs.readFileSync('taskData.json');
    const loadedData = JSON.parse(rawData);
  
    const currentDate = Math.floor(new Date() / 1000);
    
    loadedData.forEach(task => {

        const deadlineDate = Math.floor(new Date(task.date) / 1000);

        if ( currentDate === deadlineDate ) {
            deadlineEmbedFunction(task, '1155746186028929034')
        }
    });
}

function deadlineEmbedFunction(task, channelId) {

    // taskのidを表示させられるようにいつかしたいなぁって

    const deadlineEmbed = new EmbedBuilder()
        .setTitle("**Taskの期限になりました！**")
        .setDescription(`**え？？？？？勿論終わっていますよね？？？？？**`)
        .setColor("#0000ff")
        .setTimestamp()
        .addFields(
            { name: '__Taskの内容__', value: `**${task.value}**` }
        )
    
        const channel = client.channels.cache.get(channelId)
        
        channel.send(`## <@${task.key}> **絶対確認しろ！！！！！！！！！！！！！**`);
        channel.send({ embeds: [deadlineEmbed] });
}

// クライアントオブジェクトが準備OKとなったとき一度だけ実行
client.once(Events.ClientReady, c => {
	console.log(`準備OKです! ${c.user.tag}がログインします。`);

    checkDeadlines();
    setInterval(checkDeadlines, 1000);

});

// スラッシュコマンドに応答するには、interactionCreateのイベントリスナーを使う必要がある
client.on(Events.InteractionCreate, async interaction => {
    // スラッシュ以外のコマンドの場合は対象外なので早期リターンさせて終了
    if ( !( interaction.isChatInputCommand() || interaction.isButton() ) ) return;

    // コマンドにスラッシュが使われているかどうかはisChatInputCommand()で判断

    // コマンドを実行する関数
    const executeCommand = async (command, interaction) => {
        try {
            await command.execute(interaction);
        } catch (error) {
            console.error(error);
            if (interaction.replied || interaction.deferred) {
                await interaction.followUp({ content: 'コマンド実行時にエラーになりました。', ephemeral: true });
            } else {
                await interaction.reply({ content: 'コマンド実行時にエラーになりました。', ephemeral: true });
            }
        }
    };

    // コマンドごとの処理
    if ( interaction.isChatInputCommand() ) {
        const commandName = interaction.commandName;
        switch (commandName) {
            case testFile.data.name:
                await executeCommand(testFile, interaction);
                break;
            // case playFile.data.name:
            //     await executeCommand(playFile, interaction);
            //     break;
            case taskFile.data.name:
                await executeCommand(taskFile, interaction);
                break;
            default:
                console.error(`${commandName}というコマンドには対応していません。`);
        }
    } else if ( interaction.isButton() ) {
        const buttonName = interaction.customId;
        switch (true) {
            case /requestConfirm\d*/.test(buttonName):
                taskFile.handleButtonInteraction(interaction);
                break;
        }
    }

});


// ログイン
client.login(token);