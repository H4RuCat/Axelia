const { SlashCommandBuilder , EmbedBuilder } = require('discord.js');
const fs = require('fs');

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
        )
        .addStringOption(option => 
            option.setName('content')
                .setDescription('どんな内容？')
        ),

	execute: async function(interaction) {
        
        await interaction.deferReply();

        member = interaction.member.id;

        // データ(今回は taskData.json)読み取るときに使う二人
        const rawData = fs.readFileSync('taskData.json');
        const loadedData = JSON.parse(rawData);

        // loadedData(taskData.json)の中の、keyとmemberが一致するヤツの数
        const memberCount = loadedData.filter(task => task.key === member).length + 1;

        // lengthの形で、どのくらい要素があるか。
        const dataMemberTasks = loadedData.filter(task => task.key === member);

        const typeValue = interaction.options.getString('type');
        const contentValue = interaction.options.getString('content');

        // optionごとの処理
        switch (typeValue) {

            case 'taskAdd':

                if ( contentValue == null ) {
                    interaction.followUp('追加するタスクの内容を考えてから出直してください。')
                    return;
                }

                // tasksの配列に key(interaction.member.id), value(slashCommandのaddの中身)を入れてる
                tasks.push({ key: member, value: contentValue });
                // keyに一致する要素を探す
                const memberTasks = tasks.filter(task => task.key === member);
                // 追加したtaskの内容を表示する。
                const values = memberTasks.map(task => task.value);

                const addEmbed = new EmbedBuilder()
                    .setColor("#ffffff")
                    .setTitle("**追加された Task**")
                    .setDescription(`**${memberCount.toString()}. ** ${values.toString()}`)

                // taskData.json が存在するかCheck -> 無かったら作成し、memberTasksを入れる。その後return
                if ( !fs.existsSync('taskData.json') ) {　

                    fs.writeFileSync( 'taskData.json', JSON.stringify(memberTasks, undefined, 2) );
                    await interaction.followUp('`taskData.json`が存在しない為、作成しました。');
                    tasks.pop();
                    return;
 
                } else {

                    // なんか、データをがっちゃんこさせるやつ
                    const finalData = [...loadedData, ...memberTasks];
                    
                    // がっちゃんこしたヤツをtaskData.jsonにいれる。
                    fs.writeFileSync( 'taskData.json', JSON.stringify(finalData, undefined, 2) );

                }
                // 一時的に配列に入れてただけなので速攻削除！w
                tasks.pop();

                await interaction.followUp({ embeds: [addEmbed] });

                break;

            case 'taskRemove':
                
                if ( isNaN(contentValue) ) {
                    interaction.followUp('Int型にしてから出直してください。')
                    return;
                }

                if ( contentValue >= 0 && contentValue < dataMemberTasks.length ) {

                    
                    

                    
                } else {
                    interaction.followUp('指定された値が不適切なので、出直してください。');
                    return;
                }

                break;
            
            case 'taskList':
                
                // memberとkeyが一致するUserのTaskをtaskData.jsonから参照し、どれだけのtaskを滞納しているか確認する

                const listEmbed1 = new EmbedBuilder()
                    .setColor("#ffffff")
                    .setTitle("**Task 一覧**")
                    .setDescription(`取り合えずtaskの数だけ:** ${loadedData.length.toString()}**`);

                const listEmbed2 = new EmbedBuilder()
                    .setColor("#ffffff")
                    .setTitle("**Task 一覧**")
                    .setDescription('貴方にはTaskが存在しません。働いてください。');

                // 滞納しているtaskが無かったら働くように促す。もしあったらそのまま表示。
                if ( dataMemberTasks.length > 0 ) 
                  interaction.followUp({ embeds: [listEmbed1] });
                else 
                  interaction.followUp({ embeds: [listEmbed2] });

                break;

        }

	},
};
