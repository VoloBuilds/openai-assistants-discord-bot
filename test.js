const path = require('path');
const fs = require('fs');
const ytdl = require('ytdl-core');
const { OpenAI } = require("openai");
require("dotenv").config();
const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY
});



let url = `https://www.youtube.com/watch?v=WY73exaVpyw&ab_channel=EverydayAstronaut`;
const output = path.resolve(`./abc.mp3`);
const video = ytdl(url, { filter: 'audioonly' });
const writeStream = fs.createWriteStream(output);
video.pipe(writeStream);

writeStream.on('finish', () => {
    console.log('Video pipe created');
    audioFun();
});

const audioFun = async (file) => {
    const transcription = await openai.audio.transcriptions.create({
        file: fs.createReadStream("./abc.mp3"),
        model: "whisper-1"
    })
    console.log(transcription.text)
}
// audioFun();


