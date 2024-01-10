const { Client, GatewayIntentBits } = require('discord.js');
const { OpenAI } = require("openai");
require("dotenv").config();
const { get_weather, get_time } = require("./tools_for_ai.js");
const toolbox = { get_weather: get_weather, get_time: get_time };

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
    console.log(process.env.OPENAI_THREAD_ID);
    return process.env.OPENAI_THREAD_ID;
    // return threadMap[discordThreadId];
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
    // console.log(run.status);

    if (run.status == "requires_action") {
        // console.log(run.required_action);
        const tool_outputs = run.required_action.submit_tool_outputs.tool_calls.map((callDetails) => {
            let callId = callDetails.id;
            const result = toolbox[callDetails.function.name](JSON.parse(callDetails.function.arguments));
            return {
                tool_call_id: callId,
                output: result
            }
        })
        // console.log(tool_outputs);
        const output_run = await openai.beta.threads.runs.submitToolOutputs(
            openAiThreadId,
            runId,
            {
                tool_outputs: tool_outputs
            }
        );
    }


    if (terminalStates.indexOf(run.status) < 0) {
        await sleep(1000);
        return statusCheckLoop(openAiThreadId, runId);
    }
    // console.log(run);

    return run.status;
}

const addMessage = (threadId, content) => {
    // console.log(content);
    return openai.beta.threads.messages.create(
        threadId,
        { role: "user", content }
    )
}


// This event will run every time a message is received
client.on('messageCreate', async message => {
    if (message.author.bot || !message.content || message.content === '') return; //Ignore bot messages
    const discordThreadId = message.channel.id;
    let openAiThreadId = getOpenAiThreadId(discordThreadId);
    let messagesLoaded = false;

    if (!openAiThreadId) {
        const thread = await openai.beta.threads.create();
        openAiThreadId = thread.id;
        addThreadToMap(discordThreadId, openAiThreadId);
        if (message.channel.isThread()) {
            //Gather all thread messages to fill out the OpenAI thread since we haven't seen this one yet
            const starterMsg = await message.channel.fetchStarterMessage();
            const otherMessagesRaw = await message.channel.messages.fetch();

            const otherMessages = Array.from(otherMessagesRaw.values())
                .map(msg => msg.content)
                .reverse(); //oldest first

            const messages = [starterMsg.content, ...otherMessages]
                .filter(msg => !!msg && msg !== '')

            // console.log(messages);
            await Promise.all(messages.map(msg => addMessage(openAiThreadId, msg)));
            messagesLoaded = true;
        }
    }

    // console.log(openAiThreadId);
    let userMessage = "";
    if (!messagesLoaded) { //If this is for a thread, assume msg was loaded via .fetch() 
        userMessage = `ID: <${message.author.id}> Name: ${message.author.globalName} saids:  ${message.content}`;
        // console.log(userMessage);
        try {
            await addMessage(openAiThreadId, userMessage);
        } catch (error) {
            console.log("error:", error);
            let errorRunID = error.error.message.slice(66, 94);
            let cancelRun = await openai.beta.threads.runs.cancel(openAiThreadId, errorRunID);
            console.log("cancelRun:", cancelRun);
            const messages = await openai.beta.threads.messages.list(openAiThreadId);
            let response = messages.data[0].content[0].text.value;
            response = response.substring(0, 1999) //Discord msg length limit when I was testing
            console.log("canceledRespond", response);
            console.log("multi-User:", `${response}\n${userMessage}`)
            await addMessage(openAiThreadId, `${response}\n${userMessage}`);

        }
    }

    const run = await openai.beta.threads.runs.create(
        openAiThreadId,
        { assistant_id: process.env.ASSISTANT_ID }
    )
    const status = await statusCheckLoop(openAiThreadId, run.id);

    const messages = await openai.beta.threads.messages.list(openAiThreadId);
    let response = messages.data[0].content[0].text.value;
    response = response.substring(0, 1999) //Discord msg length limit when I was testing

    let isCanceled = response.includes(userMessage);
    if (!isCanceled) {
        console.log("AI:", response);
        if (response.length != 0) {
            message.reply(response);
        }
    }


});


// Authenticate Discord
client.login(process.env.DISCORD_TOKEN);