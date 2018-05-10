import {IntentDialog} from 'botbuilder';
import {Dialog} from '../dialog';

export class None extends Dialog{
    public static Name = 'intent.none';

    public RegisterDialog(intentDialog:IntentDialog){
        intentDialog.matches(None.Name, (session,args) => {
            session.endDialog('I didn\'t catch that.');
        });
    }
}
