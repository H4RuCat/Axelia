const { SlashCommandBuilder } = require('discord.js');

const task = [];

module.exports = {
	data: new SlashCommandBuilder()
		.setName('task')
		.setDescription('タスクの追加・削除・確認が出来るよ！')
        .addStringOption(option =>
            option.setName('task')
                .setDescription('何をするか決める')
                .addChoices(
                    { name:'add', value:'taskAdd' },
                    { name:'remove', value:'taskRemove' },
                    { name:'list', value:'taskList' }
                )
        ),

	execute: async function(interaction) {
        
        await interaction.deferReply();

        // 8 - 11行目
        const taskValue = interaction.options.getString('task');

        // optionごとの処理
        switch (taskValue) {

            case 'taskAdd':

                task.push();

                break;

            case 'taskRemove':

                break;
            
            case 'taskList':

                break;

        }

	},
};
