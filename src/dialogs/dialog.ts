import {UniversalBot, Message, Session, IntentDialog} from 'botbuilder';

export abstract class Dialog{
    abstract RegisterDialog(intents?:IntentDialog):void;
/*
    createMessage(session:Session, text?:string, image?:string){
        let message = new Message(session);
        if(text){
            message.text(text);
        }
        if(image){

        }

    }

    createChoiseMessage(){

    }*/


}
