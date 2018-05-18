import * as schedule from 'node-schedule';
import {TimetrackerUnfiled} from './timetrackerUnfiled';
import {SlackConnector} from '../SlackConnector';
import {Logger} from '../helpers/logger';
import {HolidaysNotify} from './holidaysNotify';

export class NotifyManager{
    static Start(slackConnector:SlackConnector){
        this.StartTimeTracker(slackConnector);
        this.StartHolidayNotify(slackConnector);
    }

    private static StartTimeTracker(slackConnector:SlackConnector){
        return [schedule.scheduleJob('0 0 11 * * TUE,WED,THU,FRI,SAT'
                        ,NotifyManager.TimeTrackerNotifyTask(slackConnector)(true))
                ,schedule.scheduleJob('0 0 21 * * MON,TUE,WED,THU,FRI'
                        ,NotifyManager.TimeTrackerNotifyTask(slackConnector)(false))];
    }

    public static TimeTrackerNotifyTask(slackConnector:SlackConnector){
        return (yesterday:boolean) => {
            return () =>{
                ( async () => {
                    Logger.AddToLog('try to send TimeTrackerNotify notifications');
                    let tt = new TimetrackerUnfiled(slackConnector);
                    tt.Notify(yesterday);
                })();
            };
        };
    }

    private static StartHolidayNotify(slackConnector:SlackConnector){
        return [schedule.scheduleJob('0 10 11 * * MON'
                        , NotifyManager.HolidayNotifyTask(slackConnector))];
    }

    public static HolidayNotifyTask(slackConnector:SlackConnector){
        return ()=>{
            ( async () => {
                Logger.AddToLog('try to send HolidayNotify notifications');
                let hol = new HolidaysNotify(slackConnector);
                await hol.Notify();
            })();
        };
    }

}

