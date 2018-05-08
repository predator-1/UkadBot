import {UniversalBot} from 'botbuilder';
import {Logger} from '../helpers/logger';

export class TimeTracker {
    public static Intent = {today:'notifications.Timetracker:today', yesterday:'notifications.Timetracker:yesterday'};

    public GetDialog(bot:UniversalBot){
        bot.dialog(TimeTracker.Intent.yesterday, (session, args, next) => {
            Logger.AddToLog(`Send yesterday to ${session.message.address.user.id}`);
            // tslint:disable-next-line:max-line-length
            let answer = `Hi <@${session.message.address.user.id}>. You didn't fill your time tracker :stopwatch: Yesterday. \r\n Could you do it now, please? Thanks. :sbow:`;
            session.endDialog(answer);
        }).triggerAction({
            matches: new RegExp(TimeTracker.Intent.yesterday),
        });

        bot.dialog(TimeTracker.Intent.today, (session, args, next) => {
            Logger.AddToLog(`Send today to ${session.message.address.user.id}`);
            // tslint:disable-next-line:max-line-length
            let answer = `Hi <@${session.message.address.user.id}>. You didn't fill your time tracker :stopwatch: Today. \r\n Could you do it now, please? Thanks. :sbow:`;
            session.endDialog(answer);
        }).triggerAction({
            matches: new RegExp(TimeTracker.Intent.today),
        });
    }
}
