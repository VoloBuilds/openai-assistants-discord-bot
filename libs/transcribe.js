const fetch = require('node-fetch');
const fs = require('fs');

const { OpenAI } = require("openai");
require("dotenv").config();
const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY
});

// const url = 'https://cdn.discordapp.com/attachments/1192990964105613413/1198783818916691978/voice-message.ogg?ex=65c0296e&is=65adb46e&hm=f561071a1a7ee5dc595f2263055e0bc395c322886fe435b8efb223eddb0333c9&'; // Replace with the actual URL of the OGG file
const localFilePath = './.cache.ogg';

const transcribe = async (url) => {
  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Failed to fetch file. Status: ${response.status}`);
    }
    const fileBuffer = await response.buffer();
    await fs.promises.writeFile(localFilePath, fileBuffer);
    const transcription = await openai.audio.transcriptions.create({
      file: fs.createReadStream(localFilePath),
      model: "whisper-1"
    });
    console.log(transcription.text);
    return transcription.text;
  } catch (error) {
    console.error('Error fetching or saving file:', error.message);
  }
}

// transcribe();

module.exports = { transcribe };