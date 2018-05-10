import {IntentDialog} from 'botbuilder';
import {Dialog} from '../dialog';

export class TimetrackerUnfilled extends Dialog{
    public static Name = 'intent.timetracker.unfilled';

    public RegisterDialog(intentDialog:IntentDialog){
        intentDialog.matches(TimetrackerUnfilled.Name, (session, args) => {
            session.endDialog('I didn\'t catch that.');
        });
    }
}
