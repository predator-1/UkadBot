import {IntentDialog} from 'botbuilder';
import {Dialog} from '../dialog';
import {Logger} from '../../helpers/logger';

export class NotificationsTimetrackerUnfilledYesterday extends Dialog{
    public static Name = 'notifications.timetracker.unfilled.yesterday';

    public RegisterDialog(intentDialog:IntentDialog){
        intentDialog.matches(NotificationsTimetrackerUnfilledYesterday.Name, (session,args) => {
            Logger.AddToLog(`Send yesterday to ${session.message.address.user.id}`);
            // tslint:disable-next-line:max-line-length
            let answer = `Hi <@${session.message.address.user.id}>. You didn't fill your time tracker :stopwatch: Yesterday. \r\n Could you do it now, please? Thanks. :sbow:`;
            session.endDialog(answer);
        });
    }
}
