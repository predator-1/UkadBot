import {UniversalBot} from 'botbuilder';

export class TimeTracker {
    public static Intent = 'notifications.Timetracker';

    public GetDialog(bot:UniversalBot){
        bot.dialog(TimeTracker.Intent, (session, args, next) => {
            // tslint:disable-next-line:max-line-length
            let answer = `Hi <@${session.message.address.user.id}>. You didn't fill your time tracker :stopwatch: yesterday. \r\n Could you do it now, please? Thanks. :sbow:`;
            session.endDialog(answer);
        }).triggerAction({
            matches: new RegExp(TimeTracker.Intent),
        });
    }
}
