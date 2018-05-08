import * as schedule from 'node-schedule';
import {Timetracker} from './timetracker';
import {SlackConnector} from '../SlackConnector';

export class NotifyManager{
    static Start(slackKey:string, slackConnector:SlackConnector){
        this.StartTimeTracker(slackKey, slackConnector);
    }

    private static StartTimeTracker(slackKey:string, slackConnector:SlackConnector){
        let callback = (yesterday:boolean) => { return () =>{
                let tt = new Timetracker(slackKey, slackConnector);
                tt.Notify(yesterday);
            };
        };

        return [schedule.scheduleJob('0 00 11 * * MON,TUE,WED,THU,FRI', callback(true))
                ,schedule.scheduleJob('0 00 21 * * MON,TUE,WED,THU,FRI', callback(false))];
    }

}

