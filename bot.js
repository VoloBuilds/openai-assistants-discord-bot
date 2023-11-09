const { Client, GatewayIntentBits } = require('discord.js');
const { OpenAI } = require("openai");
require("dotenv").config();

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY
});

// Discord Client
const client = new Client({
  intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent
    ]
});

const sleep = (ms) => {
    return new Promise(resolve => setTimeout(resolve, ms));
}

// When discord bot has started up
client.once('ready', () => {
    console.log('Bot is ready!');
});


const threadMap = {};

const getOpenAiThreadId = (discordThreadId) => {
    // Replace this in-memory implementation with a database (e.g. DynamoDB, Firestore, Redis)
    return threadMap[discordThreadId];
}

const addThreadToMap = (discordThreadId, openAiThreadId) => {
    threadMap[discordThreadId] = openAiThreadId;
}

const terminalStates = ["cancelled", "failed", "completed", "expired"];
const statusCheckLoop = async (openAiThreadId, runId) => {
    const run = await openai.beta.threads.runs.retrieve(
        openAiThreadId,
        runId
    );

    if(terminalStates.indexOf(run.status) < 0){
        await sleep(1000);
        return statusCheckLoop(openAiThreadId, runId);
    }
    // console.log(run);

    return run.status;
}

const addMessage = (threadId, content) => {
    console.log(content);
    return openai.beta.threads.messages.create(
        threadId,
        { role: "user", content }
    )
}

// This event will run every time a message is received
client.on('messageCreate', async message => {
    if (message.author.bot || !message.content || message.content === '') return; //Ignore bot messages
    // console.log(message);
    const discordThreadId = message.channel.id;
    let openAiThreadId = getOpenAiThreadId(discordThreadId);

    let messagesLoaded = false;
    if(!openAiThreadId){
        const thread = await openai.beta.threads.create();
        openAiThreadId = thread.id;
        addThreadToMap(discordThreadId, openAiThreadId);
        if(message.channel.isThread()){
            //Gather all thread messages to fill out the OpenAI thread since we haven't seen this one yet
            const starterMsg = await message.channel.fetchStarterMessage();
            const additionalMsgs = await message.channel.messages.fetch();
            const messages = [starterMsg, ...additionalMsgs].filter(msg => !!msg.content && msg.content !== '');

            // console.log(messages);
            await Promise.all(messages.map(msg => addMessage(openAiThreadId, msg.content)));
            messagesLoaded = true;
        }
    }

    // console.log(openAiThreadId);
    await addMessage(openAiThreadId, message.content);

    const run = await openai.beta.threads.runs.create(
        openAiThreadId,
        { assistant_id: process.env.ASSISTANT_ID }
    )
    const status = await statusCheckLoop(openAiThreadId, run.id);

    const messages = await openai.beta.threads.messages.list(openAiThreadId);
    const response = messages.data[0].content[0].text.value;
    console.log(response);
    
    message.reply(response);
});

// Authenticate Discord
client.login(process.env.DISCORD_TOKEN);