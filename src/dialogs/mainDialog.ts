import {UniversalBot} from 'botbuilder';
import {TimeTracker} from './timetracker';

export class MainDialog{
    private bot:UniversalBot;

    constructor(bot:UniversalBot){
        this.bot = bot;
    }

    init(){
        this.bot.dialog('/', async (session) => {
            session.endDialog('You can send me your ideas that we can add to our bot. :male-student:');
        });

        new TimeTracker().GetDialog(this.bot);

    }
}
