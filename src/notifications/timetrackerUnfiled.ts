import * as axios from 'axios';
import {WebAPICallResult} from '@slack/client';
import {ISlackMessage, SlackConnector} from 'SlackConnector';
import {Logger} from '../helpers/logger';
import {NotificationsTimetrackerUnfilledToday, NotificationsTimetrackerUnfilledYesterday} from '../dialogs/scenarios';
import {SlackWebApi} from '../SlackWebApi';

// Retry
const axiosRetry = require('axios-retry');
axiosRetry(axios.default, { retries: 3 });

let headers = {
    accept:'application/json',
};

export class TimetrackerUnfiled{
    private apiTimetracker:string;
    private slackConnector:SlackConnector;

    constructor(slackConnector:SlackConnector) {
        this.apiTimetracker = process.env.apiTimetracker;
        this.slackConnector = slackConnector;
    }

    public async Notify(yesterday:boolean){
        let email = await this.GetEmails(yesterday);
        if(email && email.length > 0){
            Logger.AddToLog('Notify email success');
            Logger.AddToChannel(`Timetracker unfill. Finded ${email.length} emails.`);
            let userIds = await this.GetUserId(email);
            if(userIds){
                Logger.AddToLog('Notify userIds success');
                Logger.AddToChannel(`Timetracker unfill. Sended ${userIds.length} messages.`);
                for(let i=0; i<userIds.length; i++){
                    let dialog = await this.CreateDialog(userIds[i].userId, yesterday);
                    if(dialog){
                        Logger.AddToLog(`Notify userIds ${userIds[i].userId} ${userIds[i].email} success`);
                        this.slackConnector.dispatchSalckMessage(dialog);
                    } else {
                        Logger.AddToLog(`Notify userIds ${userIds[i].userId} failed`);
                    }
                }
            } else {
                Logger.AddToLog('Notify userIds failed');
                Logger.AddToChannel('Can\'t find userIds for sending.');
            }
        } else {
            Logger.AddToChannel('Can\'t find emails for sending.');
            Logger.AddToLog('Notify email failed');
        }
    }

    private async GetEmails(yesterday:boolean): Promise<string[]>{
        let ts = new Date().getTime();
        let current = new Date();
        if(yesterday){
            current.setTime(ts - 86400000);
        }
        let apiReqUrl
                = `${this.apiTimetracker}${current.getMonth()+1}-${current.getDate()}-${current.getFullYear()}`;
        let resp: axios.AxiosResponse;
        try{
            resp = await axios.default.get(apiReqUrl, {headers, timeout:60000});
        } catch (e){
            Logger.AddError(`GetEmails ${e.stack}`);
        }
        if(resp && resp.data){
            // return ['alex.golubev@ukad-group.com'];
            return resp.data;
        }
        return [];
    }

    private async GetUserId(emails:string[]): Promise<{email:string, userId:string}[]>{
        let list:WebAPICallResult;
        try{
            list = await SlackWebApi.GetInstance().users.list();
        } catch (e){
            Logger.AddError(`GetUserId ${e.stack}`);
        }
        if(list){
            let findedUsers:{email:string, userId:string}[] = [];
            if(list && list.ok){
                let members = (list as IUserList).members;
                emails.forEach((email)=>{
                    for(let i=0; i<members.length; i++){
                        if(email !== '' && members[i].profile.email
                                    && members[i].profile.email.toLocaleLowerCase() === email.toLocaleLowerCase()){
                            findedUsers.push({email,userId:members[i].id});
                            break;
                        } else if(i === members.length-1){
                            Logger.AddToLog(`Can't find userId from ${email}`);
                        }
                    }
                });
            }
            return findedUsers;
        }
        return null;
    }

    private async CreateDialog(userId: string, yesterday:boolean): Promise<ISlackMessage>{
        let dialogId:WebAPICallResult;
        try{
            dialogId = await SlackWebApi.GetInstance().im.open({user:userId});
        } catch (e){
            Logger.AddError(`CreateDialog ${e.stack}`);
        }
        if(dialogId && dialogId.ok){
            let channel = (dialogId as IOpenConversation).channel.id;
            let text = yesterday ? NotificationsTimetrackerUnfilledYesterday.Name
                                 : NotificationsTimetrackerUnfilledToday.Name;
            let user = userId;
            let type = 'message';
            return {channel, text, type, user};
        }
        return null;
    }
}

interface IUserList extends WebAPICallResult{
    members:{id:string, profile:{email:string}}[];
}

interface IOpenConversation extends WebAPICallResult{
    channel:{id:string};
}
