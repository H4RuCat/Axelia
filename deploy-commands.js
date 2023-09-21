// discord.js v14では、下記のようにRESTとRoutesはdiscord.jsパッケージから直接インポートできる
const { REST, Routes } = require('discord.js');

// test.jsのmodule.exportsを呼び出す
const testFile = require('./commands/test.js');
const taskFile = require('./commands/task.js');

// 環境変数としてapplicationId, guildId, tokenの3つが必要
const { applicationId, guildId, token } = require('./config.json');

// 登録コマンドを呼び出してリスト形式で登録
const commands = [testFile.data.toJSON(), taskFile.data.toJSON()];

// DiscordのAPIには現在最新のversion10を指定
const rest = new REST({ version: '10' }).setToken(token);

// Discordサーバーにコマンドを登録
(async () => {
    try {
        await rest.put(
			Routes.applicationGuildCommands(applicationId, guildId),
			{ body: commands },
		);
        console.log('サーバー固有のコマンドが登録されました！');
    } catch (error) {
        console.error('コマンドの登録中にエラーが発生しました:', error);
    }
})();