import * as schedule from 'node-schedule';
import {Timetracker} from './timetracker';
import {SlackConnector} from '../SlackConnector';

export class NotifyManager{
    static Start(slackKey:string, slackConnector:SlackConnector){
        this.StartTimeTracker(slackKey, slackConnector);
    }

    private static StartTimeTracker(slackKey:string, slackConnector:SlackConnector){
        let callback = () =>{
            let tt = new Timetracker(slackKey, slackConnector);
            tt.Notify();
        };
        let everyDay = '0 0 11 * * * *';
        return schedule.scheduleJob(everyDay, callback);
    }

}

