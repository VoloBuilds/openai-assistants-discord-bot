const path = require('path');
const fs = require('fs');
const ytdl = require('ytdl-core');
const { OpenAI } = require("openai");
require("dotenv").config();
const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY
});

const get_yt_byWhisper = async (args) => {
    let link = args.link;

    const output = path.resolve(`./abc.mp3`);
    const video = ytdl(link, { filter: 'audioonly' });
    const writeStream = fs.createWriteStream(output);
    video.pipe(writeStream);

    const speechToText = async () => {
        return new Promise((resolve, reject) => {
            writeStream.on('finish', async () => {
                const transcription = await openai.audio.transcriptions.create({
                    file: fs.createReadStream(output),
                    model: "whisper-1"
                });
                resolve(transcription.text);
            });
            writeStream.on('error', (error) => {
                reject(error);
            });
        });
    };

    const caption = await speechToText();
    return { caption: caption };
};

// get_yt_byWhisper({ link: "https://www.youtube.com/watch?v=WObAS2tXj5s", lang: "en" }).then((res) => {
//     console.log("res:", res);
// });

module.exports = { get_yt_byWhisper };