import * as schedule from 'node-schedule';
import {TimetrackerUnfiled} from './timetrackerUnfiled';
import {SlackConnector} from '../SlackConnector';
import {Logger} from '../helpers/logger';

export class NotifyManager{
    static Start(slackConnector:SlackConnector){
        this.StartTimeTracker(slackConnector);
    }

    private static StartTimeTracker(slackConnector:SlackConnector){
        return [schedule.scheduleJob('0 0 11 * * TUE,WED,THU,FRI,SAT'
                        ,NotifyManager.TimeTrackerNotify(slackConnector)(true))
                ,schedule.scheduleJob('0 0 21 * * MON,TUE,WED,THU,FRI'
                        ,NotifyManager.TimeTrackerNotify(slackConnector)(false))];
    }

    public static TimeTrackerNotify(slackConnector:SlackConnector){
        return (yesterday:boolean) => {
            return () =>{
                Logger.AddToLog('try to send notifications');
                let tt = new TimetrackerUnfiled(slackConnector);
                tt.Notify(yesterday);
            };
        };
    }

}

