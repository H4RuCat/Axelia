const { ActionRowBuilder, SlashCommandBuilder , EmbedBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const fs = require('fs');

const tasks = [];

module.exports = {
	data: new SlashCommandBuilder()
    .setName('task')
    .setDescription('タスクの追加・削除・確認が出来るよ！')
    .addSubcommand(subcommand =>
        subcommand
            .setName('add')
            .setDescription('タスクを追加する')
            .addStringOption(option =>
                option.setName('content')
                    .setDescription('追加したいタスクの内容')
                    .setRequired(true)
            )
            .addStringOption(option =>
                option.setName('time1')
                    .setDescription('タスクの期間 | 年, 月, 日 | 例: 2023/08/23')
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
            .setDescription('タスクを削除する')
            .addIntegerOption(option =>
                option.setName('tasknumber')
                    .setDescription('削除するタスクの番号 / Listで確認出来ます。')
                    .setRequired(true)
            )
    )
    .addSubcommand(subcommand =>
        subcommand
            .setName('list')
            .setDescription('タスクの一覧を表示する')
    )
    .addSubcommand(subcommand =>
         subcommand
            .setName('request')
            .setDescription('タスクの依頼をする')
            .addRoleOption(option =>
                option.setName('role')
                    .setDescription('taskを依頼するroleを指定')
                    .setRequired(true)
                )
            .addStringOption(option =>
                option.setName('title')
                    .setDescription('依頼するtaskのtitleを指定')
                    .setRequired(true)
                )
            .addStringOption(option =>
                option.setName('task')
                    .setDescription('依頼するtaskの内容を指定')
                    .setRequired(true)
                )
        ),

    handleButtonInteraction: async function (interaction) {

        customId = interaction.customId;
        member = interaction.member.id;

        const rawData = fs.readFileSync('taskData.json');
        const loadedData = JSON.parse(rawData);

        // /requestConfirm\d*/.test(customId) = trueのはずなのに、switch-caseが動かない問題勃発してます。
        // customId = requestConfirm[数値] 

        switch (/requestConfirm\d*/.test(customId)) {
        
            case /requestConfirm\d*/.test(customId):

                // customIdの中から数字のみを取得
                var idNumber = Number(customId.replace(/[^0-9]/g, ''));
                const requestTask = loadedData.find(task => task.id === idNumber);

                if ( !requestTask ) {
                    await interaction.reply({ content: 'このタスクはもう誰かが引き受けています。', ephemeral: true });
                    return;
                }

                const loadCount = loadedData.filter(task => task.count);

                // taskData.jsonから取得したcountの値から1を引く
                let count = loadCount[0].count - 1;
                
                // tasksの配列の中にぶっこむ
                tasks.push({ key: member, value: requestTask.value }, { count: count });
                
                // taskData.jsonから、現在存在する{ count: x }と、押されたButtonのメッセージに対応する要素を削除
                loadedData.splice(loadedData.indexOf(requestTask), 1);
                loadedData.splice(loadedData.indexOf(loadedData.count), 1);
                
                // いつものがちゃこん
                const finalData = [...loadedData, ...tasks];

                fs.writeFileSync( 'taskData.json', JSON.stringify(finalData, undefined, 2) );

                tasks.pop();

                interaction.reply({ content: `${interaction.member} **がこのタスクを引き受けました。**` })

                const avatarURL = user.displayAvatarURL({ format: 'png', dynamic: true, size: 1024 });
                const logChannel = interaction.guild.channels.cache.get('1055771880524619856');

                const visionEmbed = new EmbedBuilder()
                    .setTitle("**Task vision**")
                    .setDescription(`**Taskの 引き受け**`)
                    .setColor("#00ffff")
                    .setThumbnail(avatarURL)
                    .addFields(
                        { name: '__User情報__', value: `**UserName:** ${user.username} | **UserID:** ${user.id}` }
                    )
                    .addFields(
                        { name: '__Taskの内容__', value: `**${requestTask.value}**` }
                    )

                await logChannel.send({ embeds: [visionEmbed] });

                 
                break;
        
        }

        return;

    },
	execute: async function(interaction) {
        
        await interaction.deferReply();

        member = interaction.member.id;
        user = interaction.member.user;

        // データ(今回は taskData.json)読み取るときに使う二人
        const rawData = fs.readFileSync('taskData.json');
        const loadedData = JSON.parse(rawData);

        // loadedData(taskData.json)の中の、keyとmemberが一致するヤツの数
        const memberCount = loadedData.filter(task => task.key === member).length + 1;

        // lengthの形で、どのくらい要素があるか。
        const dataMemberTasks = loadedData.filter(task => task.key === member);

        const typeValue = interaction.options.getSubcommand();
        const contentValue = interaction.options.getString('content');
        const removeNumberValue = interaction.options.getInteger('tasknumber');

        const avatarURL = user.displayAvatarURL({ format: 'png', dynamic: true, size: 1024 });

        const logChannel = interaction.guild.channels.cache.get('1055771880524619856');
        const requestChannel = interaction.guild.channels.cache.get('1155383813564809276');

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

        // SlashCommand群
        switch (typeValue) {

            case 'add':

                if ( contentValue == null ) {
                    interaction.followUp('追加するタスクの内容を考えてから出直してください。')
                    return;
                }

                const Date1 = interaction.options.getString('time1');    // 年月日
                const Date2 = interaction.options.getString('time2');  // 時分秒
                const AllDate = `${Date1} ${Date2}`;

                const deadline = new Date(AllDate);

                // tasksの配列に key(interaction.member.id), value(slashCommandのaddの中身), date(指定した時間)を入れてる
                tasks.push({ key: member, value: contentValue, date: deadline });
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
                    .setDescription('貴方にはTaskが存在しません。働いてください。');

                // 滞納しているtaskが無かったら働くように促す。もしあったらそのまま表示。
                if ( dataMemberTasks.length > 0 ) {

                    const taskList = dataMemberTasks.map((task, index) => `**${index + 1}.** ${task.value} \n__${task.date}__`);
                    listEmbed1.setDescription(taskList.join('\n\n')); 

                    interaction.followUp({ embeds: [listEmbed1] });

                } else { 
                    interaction.followUp({ embeds: [listEmbed2] });
                }
                break;
            case 'request':
                // loadedDataからcountの値を取り出す
                const loadCount = loadedData.filter(task => task.count);
                // countの値がなかったら、count: 0を追加する
                if ( loadCount.length == 0 ) loadCount.push({count: 0});
                // countの値が0以上の数じゃなかったら、0にする(分けているのはエラーになるため)
                if ( !Number.isInteger(loadCount[0].count) ) loadCount[0].count = 0;
                if ( loadCount[0].count < 0 ) loadCount[0].count = 0;

                // countに代入し、値を1増やす
                let count = loadCount[0].count + 1;

                // loadedDataからcountの値を削除する
                loadedData.forEach(function (value) {
                    delete value.count;
                });

                // loadedDataから空のオブジェクトを削除する(=値が存在するものだけを取り出す)
                let loadedData_noEmpty = loadedData.filter(function (value) {
                    return Object.keys(value).length;
                });

                const roleValue = interaction.options.getRole('role');
                const titleValue = interaction.options.getString('title');
                const taskValue = interaction.options.getString('task');

                const requestEmbed = new EmbedBuilder()
                    .setColor("#ff00ff")
                    .setTitle("**Task 依頼**")
                    .setThumbnail(avatarURL)
                    .setDescription(`**__${titleValue}__**`)
                    .setFields(
                        { name: ` `, value: `${taskValue}`}
                    )
                    .setTimestamp()
                
                const confirm = new ButtonBuilder()
                    .setCustomId('requestConfirm' + count)
                    .setLabel('タスクを受ける')
                    .setStyle(ButtonStyle.Success);
                
                const requestRow = new ActionRowBuilder()
			        .addComponents(confirm);
                
                interaction.followUp(`**依頼を送信しました！**`);

                await requestChannel.send(`${roleValue}** へ依頼です。確認してください。**`);
                await requestChannel.send({ 
                    embeds: [requestEmbed],
                    components: [requestRow]
                });
                let newArray = [];
                //memberが存在しないため、valueとidのみ配列へ
                newArray.push({ value: taskValue, id: count });
                // {count: (数字)}の形式で配列に入れる
                newArray.push({ count: count });
                //がっちゃんこ
                const finalData = [...loadedData_noEmpty, ...newArray];
                //書き込み
                fs.writeFileSync( 'taskData.json', JSON.stringify(finalData, undefined, 2) );

                visionEmbed
                .setColor("#ffff00")
                .addFields(
                    { name: '__Taskの内容__', value: `**${taskValue.toString()}**` }
                )

                await logChannel.send({ embeds: [visionEmbed] });
                
                break;

        }

	},
};