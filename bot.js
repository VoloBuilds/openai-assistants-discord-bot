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

  if (terminalStates.indexOf(run.status) < 0) {
    await sleep(1000);
    return statusCheckLoop(openAiThreadId, runId);
  }

  return run.status;
}

const addMessage = (threadId, content) => {
  return openai.beta.threads.messages.create(
    threadId,
    { role: "user", content }
  )
}

// This event will run every time a message is received
client.on('messageCreate', async message => {
  if (message.author.bot || !message.content || message.content === '') return; //Ignore bot messages

  // Ignore messages that do not start with 'replyyy'
  if (!message.content.startsWith('replyyy')) return;

  // Removing 'replyyy' and potential leading whitespace from the message content
  const messageContent = message.content.replace(/^replyyy\s*/, '').trim();
  
  const discordThreadId = message.channel.id;
  let openAiThreadId = getOpenAiThreadId(discordThreadId);

  let messagesLoaded = false;
  if (!openAiThreadId) {
    const thread = await openai.beta.threads.create();
    openAiThreadId = thread.id;
    addThreadToMap(discordThreadId, openAiThreadId);
    if (message.channel.isThread()) {
      const starterMsg = await message.channel.fetchStarterMessage();
      const otherMessagesRaw = await message.channel.messages.fetch();

      const otherMessages = Array.from(otherMessagesRaw.values())
        .map(msg => msg.content)
        .reverse(); //oldest first

      const messages = [starterMsg.content, ...otherMessages]
        .filter(msg => !!msg && msg !== '')

      await Promise.all(messages.map(msg => addMessage(openAiThreadId, msg)));
      messagesLoaded = true;
    }
  }

  if (!messagesLoaded) {
    await addMessage(openAiThreadId, messageContent);
  }

  const run = await openai.beta.threads.runs.create(
    openAiThreadId,
    { assistant_id: process.env.ASSISTANT_ID }
  );
  const status = await statusCheckLoop(openAiThreadId, run.id);

  const messages = await openai.beta.threads.messages.list(openAiThreadId);
  let response = messages.data[0].content[0].text.value;
  response = response.substring(0, 1999); //Discord msg length limit when I was testing

  console.log(response);

  message.reply(response);
});

// Authenticate Discord
client.login(process.env.DISCORD_TOKEN);