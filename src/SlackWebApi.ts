import {WebClient, WebAPICallResult} from '@slack/client';
import {Logger} from './helpers/logger';

export class SlackWebApi {
    private static webClient:WebClient;

    public static GetInstance():WebClient{
        if(!this.webClient){
            this.webClient = new WebClient(process.env.SLACK_KEY);
        }
        return this.webClient;
    }

    public static async SendMessage(channel:string, text:string, image?:string){
        await this.GetInstance().chat.postMessage({channel
            , text, as_user:true});
    }

    public static async OpenChannel(userId:string){
        let dialogId:WebAPICallResult;
        try{
            dialogId = await SlackWebApi.GetInstance().im.open({user:userId});
        } catch (e){
            Logger.AddError(`CreateDialog ${e.stack}`);
        }
        if(dialogId && dialogId.ok){
            let channel = (dialogId as IOpenConversation).channel.id;
            return channel;
        }
        return null;
    }
}

export interface IUserList extends WebAPICallResult{
    members:{id:string, profile:ISlackProfile}[];
}

export interface ISlackProfile{
    email:string;
    real_name:string;
    display_name:string;
}

export interface IOpenConversation extends WebAPICallResult{
    channel:{id:string};
}
