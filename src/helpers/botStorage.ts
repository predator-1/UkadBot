import {IBotStorage, IBotStorageContext, IBotStorageData} from 'botbuilder';
const Datastore = require('nedb-promise');
const dbUserData = new Datastore({ filename: 'UserData.db', autoload: true });

export class BotStorage implements IBotStorage{
    private userStore:string = 'userStore';
    private conversationStore:string = 'conversationStore';

    public getData(context: IBotStorageContext, callback: (err: Error, data: IBotStorageData) => void){
        let work = async () => {
            let data: IBotStorageData = {};
            if (context.userId) {
                if (context.persistUserData) {
                    const userData = await this.GetUserData(context.userId);
                    if (userData) {
                        data.userData = JSON.parse(userData);
                    } else {
                        data.userData = null;
                    }
                }
                if (context.conversationId) {
                    let key = context.userId + ':' + context.conversationId;
                    const privateConversationData = await this.GetConversationData(key);
                    if (privateConversationData) {
                        data.privateConversationData = JSON.parse(privateConversationData);
                    } else {
                        data.privateConversationData = null;
                    }
                }
            }
            if (context.persistConversationData && context.conversationId) {
                const privateConversationData = await this.GetConversationData(context.conversationId);
                if (privateConversationData) {
                    data.conversationData = JSON.parse(privateConversationData);
                } else {
                    data.conversationData = null;
                }
            }
            callback(null, data);
        };
        work();
    }

    public saveData(context: IBotStorageContext, data: IBotStorageData, callback?: (err: Error) => void){
        let work = async () => {
            if (context.userId) {
                if (context.persistUserData) {
                    await this.SetUserData(context.userId, JSON.stringify(data.userData || {}));
                }
                if (context.conversationId) {
                    let key = context.userId + ':' + context.conversationId;
                    await this.SetConversationData(key, JSON.stringify(data.privateConversationData || {}));
                }
            }
            if (context.persistConversationData && context.conversationId) {
                await this.SetConversationData(context.conversationId
                                                ,JSON.stringify(data.privateConversationData || {}));
            }
            callback(null);
        };
        work();
    }

    public deleteData(context: IBotStorageContext): void {
        let work = async () => {
            if (context.userId && this.userStore.hasOwnProperty(context.userId)) {
                if (context.userId) {
                    if (context.persistUserData) {
                        await this.DeleteUserData(context.userId);
                    }
                    if (context.conversationId) {
                        let key = context.userId + ':' + context.conversationId;
                        await this.DeleteConversationData(key);
                    }
                }
                if (context.persistConversationData && context.conversationId) {
                    await this.DeleteConversationData(context.conversationId);
                }
            }
        };
        work();
    }

    private async GetUserData(id:string): Promise<string>{
        let fullUserData: IDbData = await dbUserData.findOne({key: this.userStore, id});
        if(fullUserData){
            return fullUserData.data;
        }
        return null;
    }

    private async GetConversationData(id:string): Promise<string>{
        let fullUserData: IDbData = await dbUserData.findOne({key: this.conversationStore, id});
        if(fullUserData){
            return fullUserData.data;
        }
        return null;
    }

    private async SetUserData(id:string, data:string): Promise<void>{
        await this.DeleteUserData(id);
        await dbUserData.insert({key: this.userStore, id, data});
    }

    private async SetConversationData(id:string, data:string): Promise<void>{
        await this.DeleteConversationData(id);
        await dbUserData.insert({key: this.conversationStore, id, data});
    }

    private async DeleteUserData(id:string): Promise<void>{
        await dbUserData.remove({key: this.userStore, id}, {multi: true});
    }

    private async DeleteConversationData(id:string): Promise<void>{
        await dbUserData.remove({key: this.conversationStore, id}, {multi: true});
    }
}

interface IDbData{
    key:string;
    id:string;
    data:any;
}
