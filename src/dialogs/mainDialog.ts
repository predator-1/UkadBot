import {UniversalBot} from 'botbuilder';
import {TimeTracker} from './timetracker';

export class MainDialog{
    private bot:UniversalBot;

    constructor(bot:UniversalBot){
        this.bot = bot;
    }

    init(){
        this.bot.dialog('/', async (session) => {
            session.endDialog('I can\'t help you now. I\'m sorry(');
        });

        new TimeTracker().GetDialog(this.bot);

    }
}
