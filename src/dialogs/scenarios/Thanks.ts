import {IntentDialog} from 'botbuilder';

import {Dialog} from '../dialog';


export class Thanks extends Dialog {
    public static Name = 'service.Thanks';

    public RegisterDialog(intentDialog:IntentDialog){
        intentDialog.matches(Thanks.Name, async (session,args) => {
            session.endDialog('You\'re wellcome :wink:');
        });
    }
}
