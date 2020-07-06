'use strict';

const path = require('path');
const fs = require('fs');

module.exports = class LogsParser {
    constructor() {
        this.logsPath = path.join(__dirname, '../upload/tvlogs.txt');
    }
    ReadFile() {
        return fs.readFileSync(this.logsPath, "utf8");
    }

    Parse() {
        return new Promise(((resolve, reject) => {
            try {
                const logsData = this.ReadFile();
                const rows = logsData.split('\n');
                const keys = rows.shift().split('\t').slice(1);
                resolve(rows.map(row => {
                    const data = row.split('\t').slice(1);
                    data[1] = new Date(data[1]);
                    const result = {};
                    data.forEach((chunk, idx) => {
                        result[keys[idx]] = chunk;
                    });
                    return result;
                }));
            } catch (e) {
                reject(e);
            }
        }));
    }
}