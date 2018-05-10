import {IntentDialog} from 'botbuilder';
import {Dialog} from '../dialog';

export class Wellcome extends Dialog{
    public static Name = 'intent.wellcome';

    public RegisterDialog(intentDialog:IntentDialog){
        intentDialog.matches(Wellcome.Name, (session,args) => {
            session.endDialog('Hello');
        });
    }
}
