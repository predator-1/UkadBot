require('dotenv').config();

import {RTMClient} from '@slack/client';
import {SlackConnector} from './SlackConnector';
import {UniversalBot, Prompts} from 'botbuilder';
import {MainDialog} from './dialogs/mainDialog';
import {NotifyManager} from './notifications/notifyManager';
import {Logger} from './helpers/logger';
import {BotStorage} from './helpers/botStorage';

process.on('uncaughtException', (error) => {
    Logger.AddError(error.stack);
});

process.on('unhandledRejection', (error) => {
    Logger.AddError(error.stack);
});

const rtmClient = new RTMClient(process.env.SLACK_KEY);
const slackConnector = new SlackConnector();
const bot = new UniversalBot(slackConnector);
bot.set('storage', new BotStorage());
const mainDialog = new MainDialog(bot);
mainDialog.init();

rtmClient.start(null);
rtmClient.on('slack_event', slackConnector.listen());

NotifyManager.Start(slackConnector);
