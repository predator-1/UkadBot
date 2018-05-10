require('dotenv').config();

import {RTMClient, WebClient} from '@slack/client';
import {SlackConnector} from './SlackConnector';
import {UniversalBot, Prompts, MemoryBotStorage} from 'botbuilder';
import { Z_UNKNOWN } from 'zlib';
import {Timetracker} from './notifications/timetracker';
import {MainDialog} from './dialogs/mainDialog';
import {NotifyManager} from './notifications/notifyManager';
import {Logger} from './helpers/logger';

process.on('uncaughtException', (error) => {
    Logger.AddError(error.stack);
});

process.on('unhandledRejection', (error) => {
    Logger.AddError(error.stack);
});

let SLACK_KEY = process.env.SLACK_KEY;

const rtmClient = new RTMClient(SLACK_KEY);
const slackConnector = new SlackConnector(SLACK_KEY);
const bot = new UniversalBot(slackConnector);
bot.set('storage', new MemoryBotStorage());
const mainDialog = new MainDialog(bot);
mainDialog.init();

rtmClient.start(null);
rtmClient.on('slack_event', slackConnector.listen());

NotifyManager.Start(SLACK_KEY, slackConnector);
