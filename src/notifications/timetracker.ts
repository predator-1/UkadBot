import * as axios from 'axios';
import {WebClient, WebAPICallResult} from '@slack/client';
import {ISlackMessage, SlackConnector} from 'SlackConnector';
import {Logger} from '../helpers/logger';
import * as TimeTrackerDialog from '../dialogs/timetracker';

let headers = {
    accept:'application/json',
};

export class Timetracker{
    private webClient:WebClient;
    private apiTimetracker:string;
    private slackConnector:SlackConnector;

    constructor(slackKey:string, slackConnector:SlackConnector) {
        this.webClient = new WebClient(slackKey);
        this.apiTimetracker = process.env.apiTimetracker;
        this.slackConnector = slackConnector;
    }

    public async Notify(yesterday:boolean){
        let email = await this.GetEmails(yesterday);
        if(email){
            Logger.AddToLog('Notify email success');
            let userIds = await this.GetUserId(email);
            if(userIds){
                Logger.AddToLog('Notify userIds success');
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
            }
        } else {
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
        let resp = await axios.default.get(apiReqUrl, {headers});
        if(resp.data){
            // return ['alex.golubev@ukad-group.com'];
            return JSON.parse(resp.data);
        }
        return [];
    }

    private async GetUserId(emails:string[]): Promise<{email:string, userId:string}[]>{
        let list = await this.webClient.users.list();
        let findedUsers:{email:string, userId:string}[] = [];
        if(list && list.ok){
            let members = (list as IUserList).members;
            emails.forEach((email)=>{
                for(let i=0; i<members.length; i++){
                    if(members[i].profile.email === email){
                        findedUsers.push({email,userId:members[i].id});
                        break;
                    } else if(i === members.length-1){
                        Logger.AddToLog(`Can't find userId fro ${email}`);
                    }
                }
            });
        }
        return findedUsers;
    }

    private async CreateDialog(userId: string, yesterday:boolean): Promise<ISlackMessage>{
        let dialogId = await this.webClient.im.open({user:userId});
        if(dialogId && dialogId.ok){
            let channel = (dialogId as IOpenConversation).channel.id;
            let text = yesterday ? TimeTrackerDialog.TimeTracker.Intent.yesterday
                                 : TimeTrackerDialog.TimeTracker.Intent.today;
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
