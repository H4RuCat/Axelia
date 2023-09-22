const { SlashCommandBuilder , EmbedBuilder } = require('discord.js');

const tasks = [];

module.exports = {
	data: new SlashCommandBuilder()
		.setName('task')
		.setDescription('タスクの追加・削除・確認が出来るよ！')
        .addStringOption(option =>
            option.setName('type')
                .setDescription('何をするか決める')
                .setRequired(true)
                .addChoices(
                    { name:'add', value:'taskAdd' },
                    { name:'remove', value:'taskRemove' },
                    { name:'list', value:'taskList' }
                )
        ),

	execute: async function(interaction) {
        
        await interaction.deferReply();

        member = interaction.member.id;

        // 8 - 11行目
        const typeValue = interaction.options.getString('task');
        // const contentValue = interaction.options.getString('content');

        // optionごとの処理
        switch (typeValue) {

            case 'taskAdd':

                tasks.push({ key: member, value: typeValue });
                const memberTasks = tasks.filter(task => task.key === member);

                const embed = new EmbedBuilder()
                    .setColor("#ffffff")
                    .setTitle("Tasks")
                    .setDescription('description')
                
                console.log(memberTasks);

                await interaction.followUp({ embeds: [embed] });

                break;

            case 'taskRemove':

                break;
            
            case 'taskList':

                break;

        }

	},
};
