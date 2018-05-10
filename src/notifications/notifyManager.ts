import * as schedule from 'node-schedule';
import {Timetracker} from './timetracker';
import {SlackConnector} from '../SlackConnector';
import {Logger} from '../helpers/logger';

export class NotifyManager{
    static Start(slackKey:string, slackConnector:SlackConnector){
        this.StartTimeTracker(slackKey, slackConnector);
    }

    private static StartTimeTracker(slackKey:string, slackConnector:SlackConnector){
        let callback = (yesterday:boolean) => { return () =>{
                Logger.AddToLog('try to send notifications');
                let tt = new Timetracker(slackKey, slackConnector);
                tt.Notify(yesterday);
            };
        };

        return [schedule.scheduleJob('0 53 9 * * MON,TUE,WED,THU,FRI', callback(true))
                ,schedule.scheduleJob('0 0 11 * * MON,TUE,WED,THU,FRI', callback(true))
                ,schedule.scheduleJob('0 0 21 * * MON,TUE,WED,THU,FRI', callback(false))];
    }

}

