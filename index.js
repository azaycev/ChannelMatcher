const LogsParser = require('./classes/logs-parser.class');
const ChannelsParser = require('./classes/channels-parser.class');
const stringSimilarity = require('string-similarity');

const channelsParser = new ChannelsParser();
const logsParser = new LogsParser();

function ChannelNameMather(transliterateName, channelNames) {
    if (transliterateName) {
        const match = stringSimilarity.findBestMatch(transliterateName, channelNames);
        if (match.bestMatch.rating > 0.6) return match.bestMatch.target;
    }
    return null;
}

function LinkProgramsToChannels(programs, channels) {
    channels.map(channel => {
        channel.programs = programs.filter(program => program.channelId === channel.id);
        channel.programsCount = channel.programs.length;
    });
}

function GetTotalUsers(logs) {
    const uniqueUsers = new Set();
    logs.forEach(log => uniqueUsers.add(log.login));
    return uniqueUsers.size;
}

function GetChannelUsers(logs, formatted) {
    const channels = {};
    logs.forEach(log => {
        if (!formatted[log.channel]) return;
        if (channels[log.channel]) {
            channels[log.channel].watchers.push(log);
            channels[log.channel].watchersCount += 1;
            return;
        }
        channels[log.channel] = {
            watchers: [],
            watchersCount: 0
        };
    });
    return channels;
}

function LinkChannels(logs, channels) {
    const channelNames = channels.map(channel => channel.name);
    const formatted = {};
    const notFound = {};
    logs.forEach(log => {
        if (!formatted[log.channel]) {
            const finded = ChannelNameMather(log.channel, channelNames);
            if (finded) {
                formatted[log.channel] = finded;
            } else {
                notFound[log.channel] = true;
            }
        }

    });
    return {formatted, notFound};
}

async function GetData() {
    const parseLogsStart = Date.now();
    const logsData = await logsParser.Parse();
    const parseLogsEnd = Date.now();
    console.log('Logs parsed in %d seconds ', (parseLogsEnd - parseLogsStart) / 1000);

    const parseChannelsStart = Date.now();
    const {programs, channels} = await channelsParser.Parse();
    const parseChannelsEnd = Date.now();
    console.log('Channels parsed in %d seconds', (parseChannelsEnd - parseChannelsStart) / 1000);

    /*
    const linkProgramsStart = Date.now();
    LinkProgramsToChannels(programs, channels);
    const linkProgramsEnd = Date.now();
    console.log('Programs linked in %d seconds', (linkProgramsEnd - linkProgramsStart) / 1000);
    */
    const channelsMatchStart = Date.now();
    const {formatted, notFound} = LinkChannels(logsData, channels);
    const channelsMatchEnd = Date.now();
    console.log('Channels matched in %d seconds', (channelsMatchEnd - channelsMatchStart) / 1000);

    console.log('Найдено: ', Object.keys(formatted).length);
    console.log('Не найдено: ', Object.keys(notFound).length);
    /*
    const channelWatchersStart = Date.now();
    const channelsWatchers = GetChannelUsers(logsData, formatted);
    const channelWatchersEnd = Date.now();
    console.log('Channel watchers find in %d', (channelWatchersEnd - channelWatchersStart) / 1000);
    //console.log(channelsWatchers);
    */

    programs.slice(0, 500).forEach(program => {
        program.channel = channels.find(channel => channel.id === program.channelId);
        delete program.channelId;
        program.inTimeWatchets = logsData.filter(log => log.time >= program.start && log.time <= program.stop).map(log => log.login);
        program.totalWatchets = logsData
        console.log(program)
        if(program.totalWatchets.length > 0) console.log(program)
    });
}

GetData();
