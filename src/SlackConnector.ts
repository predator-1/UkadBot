import {IAddress, IConnector, IEvent, IMessage, Message, IIdentity, ISourceEventMap} from 'botbuilder';
import {WebClient} from '@slack/client';
import {Logger} from './helpers/logger';

export interface ISlackMessage{
    channel:string;
    source_team?:string;
    team?:string;
    text:string;
    ts?:string;
    type:string;
    user:string;
}

let bot:IIdentity = {id:process.env.BOT_ID};

export class SlackConnector implements IConnector{
    private webClient:WebClient;
    private onEventHandler: (events: IEvent[], cb?: (err: Error) => void) => void;
    private onInvokeHandler: (event: IEvent, cb?: (err: Error, body: any, status?: number) => void) => void;
    private onDispatchEvents: (events: IEvent[], cb?: (events: IEvent[]) => void) => void;

    constructor(slackKey:string){
        this.webClient = new WebClient(slackKey);
    }

    listen(){
        return(type:string, event:any) => {
            if(event && event.user && event.user !== bot.id){
                if(type === 'message'){
                    Logger.AddToLog(event);
                    if((event as ISlackMessage).channel.startsWith('D')){
                        // direct message, C-public channel, G-private channel or multi-person DM
                        this.dispatchSalckMessage(event as ISlackMessage);
                    }
                }
            }
        };
    }

    public dispatchSalckMessage(messageEvent:ISlackMessage){
        let user:IIdentity = {id:messageEvent.user};
        let conversation:IIdentity = {id:`${messageEvent.user}:${messageEvent.channel}`};
        let adress:IAddress = {channelId:messageEvent.channel, user, bot, conversation};
        let eventMap:ISourceEventMap = this.buildInteractiveMessageSourceEvent(process.env.TEAM_ID, messageEvent);
        const message = new Message()
            .address(adress)
            .timestamp(new Date().toISOString())
            .sourceEvent(eventMap)
            .text(messageEvent.text)
            .toMessage();
        this.dispatchEvents([message]);
    }

    private dispatchEvents(events: IEvent[]) {
        if (events.length > 0) {
            if (this.onDispatchEvents) {
            this.onDispatchEvents(events, (transforedEvents) => {
                this.onEventHandler(transforedEvents);
            });
            } else {
                this.onEventHandler(events);
            }
        }
    }

    private buildInteractiveMessageSourceEvent(token: string, event:any):ISourceEventMap {
        return {
          slack: {
            Payload: {
                event,
            },
            ApiToken: token,
          },
        };
      }

    send(messages: IMessage[], callback: (err: Error, addresses?: IAddress[]) => void){
        let work = async () =>{
            let adrs: IAddress[] = [];
            for(let i=0; i<messages.length; i++){
                await this.webClient.chat.postMessage({channel:messages[i].address.channelId
                                            ,text:messages[i].text, as_user:true});
                adrs.push(messages[i].address);
            }
            callback(null, adrs);
        };
        work();
    }

    startConversation(address: IAddress, callback: (err: Error, address?: IAddress) => void){
        callback(null, address);
    }

    public onEvent(handler: (events: IEvent[], cb?: (err: Error) => void) => void) {
        this.onEventHandler = handler;
      }

    public onInvoke(handler: (event: IEvent, cb?: (err: Error, body: any, status?: number) => void) => void) {
        this.onInvokeHandler = handler;
    }

    public onDispatch(handler: (events: IEvent[], cb?: (events: IEvent[]) => void) => void) {
        this.onDispatchEvents = handler;
    }
}
