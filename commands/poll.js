const { SlashCommandBuilder , EmbedBuilder } = require('discord.js');

module.exports = {
	data: new SlashCommandBuilder()
    .setName('poll')
    .setDescription('なんかアンケート取る')
    .addStringOption(option =>
        option.setName('title')
            .setDescription('アンケートの内容書くんだYO')
            .setRequired(true)
    )
    .addStringOption(option =>
        option.setName('a')
            .setDescription(':regional_indicator_a: リアクションの中身')
            .setRequired(true)
    )
    .addStringOption(option =>
        option.setName('b')
            .setDescription(':regional_indicator_b: リアクションの中身')
            .setRequired(true)
    ),

	execute: async function(interaction) {

        await interaction.deferReply();

        const pollEmbed = new EmbedBuilder()
            .setTitle(`**${interaction.options.getString('title')}**`)
            .setDescription(`:regional_indicator_a: ${interaction.options.getString('a')} \n:regional_indicator_b: ${interaction.options.getString('b')}`)
            .setColor("#dda0dd")
        
        await interaction.followUp({ embeds: [pollEmbed] });

	},
};