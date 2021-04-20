const fs = require('fs');
const Discord = require("discord.js");
const bot_configuration = require("./bot_config.json");

const prefix = bot_configuration.BOT_PREFIX;
const nick_file = bot_configuration.NICKNAME_FILE;
const users_file = bot_configuration.USERS_FILE;
const client = new Discord.Client();
const help_text = readFile(bot_configuration.HELP_FILE);

function changeNicksOnServer(message){
    // Function for rename users
    const users_id = readFile(users_file).split('\n');
    
    let nicks = readFile(nick_file).split('\n');
    let used_nicks = [];

    users_id.forEach(id_ =>{
        let user = message.guild.members.fetch(id_);
        let generator_value = getRandomInt(nicks.length);

        for(let i = 0; i < used_nicks.length; i++){
            if(generator_value == used_nicks[i]){
                generator_value = getRandomInt(nicks.length);
                i = -1;
            }
        }

        used_nicks.push(generator_value);
        user.then((value)=>{
            changeNick(value, nicks[generator_value]);
        });    
    });
}

function getRandomInt(max) {
    // Random int in range generator
    return Math.floor(Math.random() * max);
  }

function changeNick(member, nickname){
    // Function for change nick
    member.setNickname(nickname);
}

function findNick(){
    // Function for finding a nickname in the database to rename a user
    let nicks = readFile(nick_file).split('\n');
    let generator_value = getRandomInt(nicks.length);
    return nicks[generator_value];
}

function readFile(file){
    // Function for read nicknames from database
    let fileContent = fs.readFileSync(file, "utf8");
    return fileContent;
}

function writeFile(line, file){
    // Add nickname to database
    fs.appendFileSync(file, `\n${line}`);
}

function compareNicks(nickname){
    /*
    Nickname search function in the database
    to prevent the existing nickname from being recorded
    */
    let nicks = readFile(nick_file).split('\n');
    let isFound = false;

    nicks.forEach(element => {
        if(nickname == element) isFound = true;
    });
    return isFound;
}

client.on("message", function(message) {
    // Checks
    if (message.author.bot) return;
    if (!message.content.startsWith(prefix)) return;

    // Variables init
    const commandBody = message.content.slice(prefix.length+1);
    const args = commandBody.split(' ');
    const command = args.shift();

    let nick;
    let Embed;

    // Analize command
    switch(command){

        case bot_configuration.WRITE_COMMAND:
            // Write command
            const nickname = commandBody.slice(command.length+1);
            let compare_result = compareNicks(nickname);

            if(compare_result){
                // If the nickname in the database show error message
                Embed = new Discord.MessageEmbed()
                .setColor('#850d0d')
                .setTitle('Error')
                .setDescription(`The nickname(${nickname}) is already in the database`)
                .setFooter(`Check other comands use ${bot_configuration.prefix} ${bot_configuration.HELP}`);
                message.channel.send(Embed);
            }
            else{
                if(nickname.length > 32){
                    // If nickname length > 32 show error message
                    Embed = new Discord.MessageEmbed()
                    .setColor('#850d0d')
                    .setTitle('Error')
                    .setDescription(`Nickname: ${nickname} \nLength: ${nickname.length} \nTHE LENGTH OF THE NICKNAME MUST BE LESS THAN 32 SYMBOLS`)
                    .setFooter(`Check other comands use ${bot_configuration.prefix} ${bot_configuration.HELP}`);
                    message.channel.send(Embed);
                    }
                else{
                    // If the nickname is not yet in the database and nickname length <= 32, then add
                    writeFile(nickname, nick_file);
                    Embed = new Discord.MessageEmbed()
                    .setColor('#0d8519')
                    .setTitle('Success')
                    .setDescription(`Writed nickname: ${nickname} \nLength: ${nickname.length}`)
                    .setFooter(`Check other comands use ${bot_configuration.prefix} ${bot_configuration.HELP}`);
                    message.channel.send(Embed);
                }
            }
        break;

        case bot_configuration.CHANGE_NICKNAME_COMMAND:
            // Change nickname command
            nick = findNick();
            changeNick(message.member, nick);
            Embed = new Discord.MessageEmbed()
            .setColor('#85690d')
            .setTitle('Nickname changed')
            .setDescription(`New nickname: ${nick}`)
            .setFooter(`Check other comands use ${bot_configuration.prefix} ${bot_configuration.HELP}`);
            message.channel.send(Embed);
        break;

        case bot_configuration.CHANGE_NICKNAME_MEMBERS_COMMAND:
            // Change nickname command
            changeNicksOnServer(message);
            Embed = new Discord.MessageEmbed()
            .setColor('#5d0f91')
            .setTitle('Nickname members changed')
            .setDescription(`AAAAAAA`)
            .setFooter(`Check other comands use ${bot_configuration.prefix} ${bot_configuration.HELP}`);
            message.channel.send(Embed);
        break;

        case bot_configuration.HELP:
            Embed = new Discord.MessageEmbed()
            .setColor('#2a593a')
            .setTitle('COMMANDS')
            .setDescription(help_text);
            message.channel.send(Embed);
        break;

        default:
            // If command not found
            Embed = new Discord.MessageEmbed()
            .setColor('#850d0d')
            .setTitle('Error')
            .setDescription(`Command not found, use ${bot_configuration.prefix} ${bot_configuration.HELP}`);
            message.channel.send(Embed);
        break;
    }   
  });

client.login(bot_configuration.BOT_TOKEN);