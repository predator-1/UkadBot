import {WebClient} from '@slack/client';

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
}
