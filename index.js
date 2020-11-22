// Discord
const Discord = require('discord.js');
const client = new Discord.Client();

const token = 'NzY3MTkwMTAzNDc0NzAwMjk4.X4uTdg.GNDiCTuVlz2zZ51OcwW0T5yexvk';

const PREFIX = '=';

// JSON
const fs = require('fs');
var rdPath = 'G:/Dokument/Discord Bots/RISK Bot/rd.json';

client.on('ready', () => {
    console.log('This bot is online!')
});

// Commands
client.on('message', msg=>{
    let args = msg.content.substring(PREFIX.length).split(" ");

    switch(args[0]){
        case 'info':
            printCommands(msg.channel);
            break;
        case 'ping':
            msg.channel.send('Pong!');
            break;
        case 'killMission':
            killMission(msg);
            break;
        case 'stats':
            printStats(msg);
            break;
    }
})

client.login(token);

// Prints all bot commands
function printCommands(channel){
    const helpEmbed = new Discord.MessageEmbed()
        .setColor('#0099ff')
        .setTitle('RISK Bot Info')
        .setDescription('Commands:')
        .addFields(
            {name:PREFIX+'info', value: 'Prints info about the RISK Bot'},
            {name:PREFIX+'stats [user]', value: 'Prints statistics about the mentioned user'},
            {name:PREFIX+'ping', value: 'Pings the bot'},
            {name:PREFIX+'killMission [user1] [user2] ... [userN]', value: 'Sends a message to all mentioned users with another user they are tasked to kill.'}
        )
    channel.send(helpEmbed);
}

// Sends a message to all mentioned users with a user they are tasked to kill
function killMission(msg){
    msg.channel.send('Sending messages to specified users');
    
    // Bot support
    let args = msg.content.substring(PREFIX.length).split(" ");

    var mentionedUsers = [];

    // Adds all mentioned users to the array
    msg.mentions.users.map(user =>{
        mentionedUsers[mentionedUsers.length] = user.username;
    });

    // Adds all bots to the array
    for (var i = 0; i < args.length; i++){
        var sub = args[i];
        if (sub.includes("bot")){
            mentionedUsers[mentionedUsers.length] = sub;
            msg.channel.send('Added bot ' + sub);
        }

        if (mentionedUsers.length >= 6) break;
    }

    var temp = mentionedUsers;

    // For every two players over 3, duplicate all elements in the array
    for (var i = 3; i < msg.mentions.users.length; i+=2){
        // Duplicates the elements in the array
        mentionedUsers = mentionedUsers.concat(temp);
    }

    // Loops through all the mentioned users
    msg.mentions.users.map(user =>{
        // Selects a random user from the mentionedUsers
        var index = Math.floor(Math.random() * mentionedUsers.length);
        var randomUser = mentionedUsers[index];
        
        // Removes the user from the list of all mentioned users
        mentionedUsers.splice(index, 1);

        try {
            // Sends a message to the current user with the random user
            user.send('Your mission is to eliminate ' + randomUser);
            if (!msg.content.includes("-noStats")) writeToJSON(user.id, user.username, randomUser);
        } catch (err){
        }
    });
}

// Prints the statistics of the mentioned user
function printStats(msg){
    var mentionedUser = msg.mentions.users.first();
    if (mentionedUser == undefined) {
        msg.channel.send("Please specify a user");
        return;
    }
    var userId = mentionedUser.id;
    
    var rdRead = fs.readFileSync(rdPath);
    var rdFile = JSON.parse(rdRead);

    if(!rdFile[userId]){
        msg.channel.send('Error: User does not have any stats');
    } else {
        const statEmbed = new Discord.MessageEmbed();
        statEmbed.setColor('#0099ff');
        statEmbed.setTitle(mentionedUser.username + ' Statistics');
        statEmbed.setDescription('Mission Targets:');

        for (var i = 0; i < rdFile[userId].targets.length; i++){
            var targetName = rdFile[userId].targets[i].target;
            var count = rdFile[userId].targets[i].count;

            statEmbed.addField('Target: ' + targetName, 'Count: ' + count);
        }

        msg.channel.send(statEmbed);
    }
}

// Writes info to the json file
function writeToJSON(userId, name, target){
    var rdRead = fs.readFileSync(rdPath);
    var rdFile = JSON.parse(rdRead);

    if (!rdFile[userId]){
        rdFile[userId] = {name: name, targets: [{target: target, count: 1}]};
    } else{
        var targets = rdFile[userId].targets;

        var foundTarget = false;

        for (var i = 0; i < targets.length; i++){
            if (targets[i].target == target){
                var count = targets[i].count + 1;
                targets[i] = {target: target, count: count};
                foundTarget = true;
            }
        }

        if (!foundTarget){
            targets[targets.length] = {target: target, count: 1};
        }

        rdFile[userId] = {name: name, targets: targets};
    }

    fs.writeFileSync(rdPath, JSON.stringify(rdFile, null, 2));
}