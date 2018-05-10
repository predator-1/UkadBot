import * as winston from 'winston';
const MESSAGE = Symbol.for('message');
import {SlackWebApi} from '../SlackWebApi';
const channel = process.env.logChannel;


const jsonFormatter = (logEntry:any) => {
    const base = { timestamp: new Date() };
    const json = Object.assign(base, logEntry);
    logEntry[MESSAGE] = JSON.stringify(json);
    return logEntry;
};

const logger = winston.createLogger({
    format: winston.format(jsonFormatter)(),
    transports: [
      new winston.transports.File({ filename: 'log.log' }),
      new winston.transports.Console(),
    ],
});

export class Logger{
    static AddToLog(input:any){
        logger.log('info', input);
    }

    static AddError(input:any){
        logger.log('error', input);
    }

    static AddToChannel(input:string){
        if(channel){
            let work = async () => {
                await SlackWebApi.SendMessage(channel, input);
            };
            work();
        }
    }
}
