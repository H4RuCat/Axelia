const { SlashCommandBuilder , EmbedBuilder, PermissionFlagsBits } = require('discord.js');
const fs = require('fs');
const { configLogChannel, } = require('../config.json');

const tasks = [];

function formatDate(date) {
    const year = date.getFullYear();

    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const seconds = String(date.getSeconds()).padStart(2, '0');
  
    return `${year}/${month}/${day} ${hours}:${minutes}:${seconds}`;
  }

module.exports = {
	data: new SlashCommandBuilder()
    .setName('force')
    .setDescription('強制的にメンバーのタスクを操作する')
    .setDefaultMemberPermissions(PermissionFlagsBits.BanMembers)
    .addSubcommand(subcommand =>
        subcommand
            .setName('add')
            .setDescription('強制的に指定したメンバーのタスクを追加する')
            .addUserOption(option =>
                option.setName('member')
                    .setDescription('操作するメンバーを指定する')
                    .setRequired(true)
            )
            .addUserOption(option =>
                option.setName('content')
                    .setDescription('タスクの内容を指定')
                    .setRequired(true)
            )
            .addStringOption(option =>
                option.setName('time1')
                    .setDescription('タスクの期間 | 年, 月, 日 | 例: 2023/09/25')
                    .setRequired(true)
            )
            .addStringOption(option =>
                option.setName('time2')
                    .setDescription('タスクの期間 | 時間, 分, 秒 | 例: 15:30:30')
                    .setRequired(true)
            )
    )
    .addSubcommand(subcommand =>
        subcommand
            .setName('remove')
            .setDescription('強制的に指定したメンバーのタスクを削除する')
            .addUserOption(option =>
                option.setName('member')
                    .setDescription('操作するメンバーを指定する')
                    .setRequired(true)
            )
            .addUserOption(option =>
                option.setName('tasknumber')
                    .setDescription('削除するタスクのnumberを指定')
                    .setRequired(true)
            )
    )
    .addSubcommand(subcommand =>
        subcommand
            .setName('list')
            .setDescription('強制的に指定したメンバーのタスクリストを表示')
            .addUserOption(option =>
                option.setName('member')
                    .setDescription('リストを閲覧するメンバーを指定する')
                    .setRequired(true)
            )
    ),

	execute: async function(interaction) {
        
        await interaction.deferReply();

        user = interaction.member.user;
        commandMember = interaction.options.getUser('member');

        // データ(今回は taskData.json)読み取るときに使う二人
        const rawData = fs.readFileSync('taskData.json');
        const loadedData = JSON.parse(rawData);

        // loadedData(taskData.json)の中の、keyとmemberが一致するヤツの数
        const memberCount = loadedData.filter(task => task.key === commandMember).length + 1;

        // lengthの形で、どのくらい要素があるか。
        const dataMemberTasks = loadedData.filter(task => task.key === commandMember.id);

        const typeValue = interaction.options.getSubcommand();
        const contentValue = interaction.options.getString('task');
        const removeNumberValue = interaction.options.getInteger('tasknumber');

        const avatarURL = user.displayAvatarURL({ format: 'png', dynamic: true, size: 1024 });

        const logChannel = interaction.guild.channels.cache.get(configLogChannel);

        var now = new Date();

        // var Year = now.getFullYear();
        // var Month = now.getMonth()+1;
        // var Day = now.getDate();
        // var Hour = now.getHours();
        // var Min = now.getMinutes();
        // var Sec = now.getSeconds();

        if ( typeValue == 'add' ) visionTaskType = '追加';
        if ( typeValue == 'remove' ) visionTaskType = '削除';
        if ( typeValue == 'list' ) visionTaskType = '一覧表示';
        if ( typeValue == 'request' ) visionTaskType = '依頼';

        const visionEmbed = new EmbedBuilder()
            .setTitle("**Task vision**")
            .setDescription(`**Taskの ${visionTaskType}**`)
            .setThumbnail(avatarURL)
            .addFields(
                { name: '__User情報__', value: `**UserName:** ${user.username} | **UserID:** ${user.id}` }
            )
        
        const dateRegex1 = /^\d{4}\/\d{2}\/\d{2}$/;
        const dateRegex2 = /^\d{2}:\d{2}:\d{2}$/;

        const Date1 = interaction.options.getString('time1');    // 年月日
        const Date2 = interaction.options.getString('time2');  // 時分秒

        if ( Date1 != null || Date2 != null  ) {
            if ( !dateRegex1.test(Date1)) {
                interaction.followUp('日付文字列(time1) の指定方法が違います。');
                return;
            } else if ( !dateRegex2.test(Date2) ) {
                interaction.followUp('時間文字列(time2) の指定方法が違います。');
                return;
            }
        }

        const AllDate = `${Date1} ${Date2}`;

        const deadline = new Date(AllDate);


        // SlashCommand群
        switch (typeValue) {

            case 'add':

                if ( contentValue == null ) {
                    interaction.followUp('追加するタスクの内容を考えてから出直してください。')
                    return;
                }

                // tasksの配列に key(interaction.member.id), value(slashCommandのaddの中身), date(指定した時間)を入れてる
                tasks.push({ key: commandMember, value: contentValue, date: deadline });
                // keyに一致する要素を探す
                const memberTasks = tasks.filter(task => task.key === commandMember);
                // 追加したtaskの内容を表示する。
                const values = memberTasks.map(task => task.value);

                const addEmbed = new EmbedBuilder()
                    .setColor("#ffffff")
                    .setTitle("**Taskの追加**")
                    .setDescription(`**内容** \n **${memberCount.toString()}. ** __${values.toString()}__ \n**Task期限:** ${formatDate(deadline)}`)

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
                visionEmbed
                    .setColor("#008000")
                    .addFields(
                        { name: '__Taskの内容__', value: `**${values.toString()}**` }
                    )

                // 一時的に配列に入れてただけなので速攻削除！w
                tasks.pop();

                await interaction.followUp({ embeds: [addEmbed] });
                await logChannel.send({ embeds: [visionEmbed] });

                break;

            case 'remove':

                const removeValue = removeNumberValue - 1 ;

                if ( isNaN(removeValue) ) {
                    interaction.followUp('Int型にしてから出直してください。')
                    return;
                }
        
                if ( removeValue >= 0 && removeValue < dataMemberTasks.length ) {

                    const newData = loadedData.filter(task => !dataMemberTasks.includes(task));
                    const removeTask = dataMemberTasks.splice(removeValue, 1);

                    const finalData = [...newData, ...dataMemberTasks];

                    fs.writeFileSync( 'taskData.json', JSON.stringify(finalData, undefined, 2) );

                    interaction.followUp(`**Task:** __${removeTask[0].value.toString()}__ を削除しました。`);

                    visionEmbed
                        .setColor("#ff0000")
                        .addFields(
                            { name: '__Taskの内容__', value: `**${removeTask[0].value.toString()}**` }
                        )
                    await logChannel.send({ embeds: [visionEmbed] });
                    
                } else {
                    interaction.followUp('指定された値が不適切なので、出直してください。');
                    return;
                }

                break;
            
            case 'list':
                
                // memberとkeyが一致するUserのTaskをtaskData.jsonから参照し、どれだけのtaskを滞納しているか確認する

                const listEmbed1 = new EmbedBuilder()
                    .setColor("#ffffff")
                    .setTitle("**Task 一覧**")

                const listEmbed2 = new EmbedBuilder()
                    .setColor("#ffffff")
                    .setTitle("**Task 一覧**")
                    .setDescription('そのユーザーにはTaskが存在しません。働かせてあげてください。');

                
                console.log(dataMemberTasks.length);

                // 滞納しているtaskが無かったら働くように促す。もしあったらそのまま表示。
                if ( dataMemberTasks.length > 0 ) {

                    const taskList = dataMemberTasks.map((task, index) => `**${index + 1}.** ${task.value} \n**Task期限:** __${formatDate(new Date(task.date))}__`);
                    listEmbed1.setDescription(taskList.join('\n\n')); 

                    interaction.followUp({ embeds: [listEmbed1] });

                } else { 
                    interaction.followUp({ embeds: [listEmbed2] });
                }
                break;

        }

	},
};