'use strict';

const path = require('path');
const fs = require('fs');
const {parseStringPromise} = require('xml2js');
const cyrillicToTranslit = require('cyrillic-to-translit-js');

module.exports = class ChannelsParser {
    constructor() {
        this.channelsPath = path.join(__dirname, '../upload/xmltv.xml');
    }

    ReadFile() {
        return fs.readFileSync(this.channelsPath, "utf8");
    }

    Parse() {
        return new Promise(async (resolve, reject) => {
            try {
                const data = await parseStringPromise(this.ReadFile(), {mergeAttrs: true, charkey: 'value'});
                const result = {
                    programs: [],
                    channels: []
                };
                result.channels = data.tv.channel.map(channel => {
                    const nameRus = channel['display-name'].pop().value;
                    return {
                        id: parseInt(channel.id.pop()),
                        name: cyrillicToTranslit().transform(nameRus),
                        nameRus
                    }
                });
                result.programs = data.tv.programme.map(program => {
                    return {
                        start: this.FromGreenwichToDate(program.start.pop()),
                        stop: this.FromGreenwichToDate(program.stop.pop()),
                        channelId: parseInt(program.channel.pop()),
                        title: program.title.pop().value,
                    }
                });
                resolve(result);
            } catch (e) {
                reject(e);
            }
        });
    }

    FromGreenwichToDate(str) {
        const year = str.slice(0, 4);
        const month = str.slice(4, 6);
        const day = str.slice(6, 8);
        const hours = str.slice(8, 10);
        const minutes = str.slice(10, 12);
        const seconds = str.slice(12, 14);
        return new Date(year, month, day, hours, minutes, seconds);
    }
}