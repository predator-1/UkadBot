import {ISlackMessage, SlackConnector} from 'SlackConnector';
import {GetHolidays} from '../dialogs/scenarios';
import {Holidays} from '../helpers/holidays';
import {SlackWebApi} from '../SlackWebApi';

export class HolidaysNotify{
    private slackConnector:SlackConnector;

    constructor(slackConnector:SlackConnector) {
        this.slackConnector = slackConnector;
    }

    public async Notify(){
        let subs = process.env.holidaysSubscription.split(',');
        for(let i=0; i<subs.length; i++){
            let channel = await SlackWebApi.OpenChannel(subs[i]);
            let text = GetHolidays.Name;
            let user = subs[i];
            let type = 'message';
            this.slackConnector.dispatchSalckMessage({channel, text, type, user});
        }
    }
}
