import {UniversalBot, IntentDialog} from 'botbuilder';
const apiairecognizer = require('api-ai-recognizer');
import * as scenarios from './scenarios';
import {Dialog} from './dialog';

export class MainDialog{
    private bot:UniversalBot;
    private intentDialog:IntentDialog;

    constructor(bot:UniversalBot){
        this.bot = bot;
    }

    init(){
        this.RegisterDialog();
    }

    private RegisterDialog(){
        const apiaiKey = process.env.apiaiKey;
        if(apiaiKey){
            const recognizer = new apiairecognizer(apiaiKey);
            this.intentDialog  = new IntentDialog({
                recognizers: [recognizer],
            });
            this.bot.dialog('/', this.intentDialog);
            this.RegisterScenarios();
        }
    }

    private RegisterScenarios(){
        for(let scenario of scenarios.All){
           let inst = new scenario();
           inst.RegisterDialog(this.intentDialog);
        }
    }
}
