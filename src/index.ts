require('dotenv').config();

import {RTMClient} from '@slack/client';
import {SlackConnector} from './SlackConnector';
import {UniversalBot, Prompts, MemoryBotStorage} from 'botbuilder';
import {MainDialog} from './dialogs/mainDialog';
import {NotifyManager} from './notifications/notifyManager';
import {Logger} from './helpers/logger';

process.on('uncaughtException', (error) => {
    Logger.AddError(error.stack);
});

process.on('unhandledRejection', (error) => {
    Logger.AddError(error.stack);
});

const rtmClient = new RTMClient(process.env.SLACK_KEY);
const slackConnector = new SlackConnector();
const bot = new UniversalBot(slackConnector);
bot.set('storage', new MemoryBotStorage());
const mainDialog = new MainDialog(bot);
mainDialog.init();

rtmClient.start(null);
rtmClient.on('slack_event', slackConnector.listen());

NotifyManager.Start(slackConnector);
