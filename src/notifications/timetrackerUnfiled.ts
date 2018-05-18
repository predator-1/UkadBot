import * as axios from 'axios';
import {WebAPICallResult} from '@slack/client';
import {ISlackMessage, SlackConnector} from 'SlackConnector';
import {Logger} from '../helpers/logger';
import {NotificationsTimetrackerUnfilledToday, NotificationsTimetrackerUnfilledYesterday} from '../dialogs/scenarios';
import {SlackWebApi, IUserList, ISlackProfile, IOpenConversation} from '../SlackWebApi';

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
                let sentUsers = userIds.map((elem) => {
                    return `${elem.email} ${elem.firstname} ${elem.lastname}`;
                }).join(',');

                Logger.AddToLog(`Notify userIds success. Sent ${userIds.length} messages. ${sentUsers}`);
                Logger.AddToChannel(`Timetracker unfill. Sent ${userIds.length} messages. ${sentUsers}`);

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

    private async GetEmails(yesterday:boolean): Promise<IUser[]>{
        let ts = new Date().getTime();
        let current = new Date();
        if(yesterday){
            current.setTime(ts - 86400000);
        }
        let apiReqUrl
                // tslint:disable-next-line:max-line-length
                = `${this.apiTimetracker}NotEntirelyActiveUsers?notReportedOnly=true&secret=75eb567f-4aee-430d-a718-ab1ecd1f2793&date=${current.getMonth()+1}-${current.getDate()}-${current.getFullYear()}`;
        let resp: axios.AxiosResponse;
        try{
            resp = await axios.default.get(apiReqUrl, {headers, timeout:60000});
        } catch (e){
            Logger.AddError(`GetEmails ${e.stack}`);
        }
        if(resp && resp.data){
            // return [{email:'alex.golubev@ukad-group.com', firstname:'', lastname:''}];
            return resp.data;
        }
        return [];
    }

    private async GetUserId(users:IUser[]): Promise<IUserSlack[]>{
        let list:WebAPICallResult;
        try{
            list = await SlackWebApi.GetInstance().users.list();
        } catch (e){
            Logger.AddError(`GetUserId ${e.stack}`);
        }
        if(list){
            let findedUsers:IUserSlack[] = [];
            let cantFind:IUser[] = [];
            if(list && list.ok){
                let members = (list as IUserList).members;
                users.forEach((user)=>{
                    for(let i=0; i<members.length; i++){
                        if(this.Match(user, members[i].profile)){
                            findedUsers.push({email:user.email, userId:members[i].id
                                , firstname:user.firstname, lastname:user.lastname});
                            break;
                        } else if(i === members.length-1){
                            Logger.AddToLog(`Can't find userId from ${user.email} ${user.firstname} ${user.lastname}`);
                            cantFind.push({email:user.email
                                , firstname:user.firstname, lastname:user.lastname});
                        }
                    }
                });
            }
            let cantFindStr = cantFind.map((elem) => {
                return `${elem.email} ${elem.firstname} ${elem.lastname}`;
            }).join(',');
            Logger.AddToChannel(`Timetracker unfill. Can't find in Slack ${cantFind.length}. They are ${cantFindStr}`);

            return findedUsers;
        }
        return null;
    }

    private async CreateDialog(userId: string, yesterday:boolean): Promise<ISlackMessage>{
        let channel = await SlackWebApi.OpenChannel(userId);
        if(channel){
            let text = yesterday ? NotificationsTimetrackerUnfilledYesterday.Name
                                 : NotificationsTimetrackerUnfilledToday.Name;
            let user = userId;
            let type = 'message';
            return {channel, text, type, user};
        }
        return null;
    }

    private Match(userApi:IUser, userSlack:ISlackProfile):boolean{
        if(userApi.email && userSlack.email
            && userApi.email.toLocaleLowerCase() === userSlack.email.toLocaleLowerCase()){
            return true;
        }
        if(userApi.firstname && userApi.lastname){
            let userApiFirstname = userApi.firstname.toLocaleLowerCase();
            let userApiLastname = userApi.lastname.toLocaleLowerCase();
            if(userSlack.display_name){
                let slackDisplayName = userSlack.display_name.toLocaleLowerCase().replace(' ', '').replace('.', '');
                if(`${userApiFirstname}${userApiLastname}` === slackDisplayName
                    || `${userApiLastname}${userApiFirstname}` === slackDisplayName){
                    return true;
                }
            }

            if(userSlack.real_name){
                let slackRealName = userSlack.real_name.toLocaleLowerCase().replace(' ', '').replace('.', '');
                if(`${userApiFirstname}${userApiLastname}` === slackRealName
                    || `${userApiLastname}${userApiFirstname}` === slackRealName){
                    return true;
                }
            }
        }

        return false;
    }
}

interface IUser{
    email:string;
    firstname:string;
    lastname:string;
}

interface IUserSlack extends IUser{
    userId:string;
}
