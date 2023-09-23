const { SlashCommandBuilder } = require('discord.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('hey')
		.setDescription('あいさつに反応してbotが返事します'),
	execute: async function(interaction) {
		await interaction.reply('Fuck.');
	},
};

// module.exportsの補足
// キー・バリューの連想配列のような形で構成されている。
//
// module.exports = {
//    キー: バリュー,
//    キー: バリュー,
// };
//