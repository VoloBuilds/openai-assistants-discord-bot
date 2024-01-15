// ref: https://github.com/fent/node-ytdl-core/blob/master/example/captions.js


const fs = require('fs');
const path = require('path');
const https = require('https');
const ytdl = require('ytdl-core');

// Can be xml, ttml, vtt, srv1, srv2, srv3
const format = 'srv3';

const extractTextSRV3Contents = (input) => {
    const pattern = /<p[^>]*>(.*?)<\/p>/g;
    const matches = input.matchAll(pattern);
    const textContents = [];
  
    for (const match of matches) {
      textContents.push(match[1].replace(/\\n/g, " "));
    }
  
    return textContents;
  };

const fetchData = (url) => {
    return new Promise((resolve, reject) => {
        https.get(url, (res) => {
            let data = '';
            res.on('data', (chunk) => {
                data += chunk;
            });
            res.on('end', () => {
                resolve(data);
            });
            res.on('error', (error) => {
                reject(error);
            });
        });
    });
};

const get_yt = async (args) => {
    const link = args.link;
    const lang = args.lang;

    try {
        const info = await ytdl.getInfo(link);
        const tracks = info.player_response.captions?.playerCaptionsTracklistRenderer.captionTracks;

        if (tracks && tracks.length) {
            const availLangCode = tracks.map(t=>t.languageCode);
            const track = tracks.find((t) => t.languageCode === lang);
            if (track) {
                console.log('Retrieving captions:', track.name.simpleText);
                const data = await fetchData(`${track.baseUrl}&fmt=${format !== 'xml' ? format : ''}`);
                const cleanData = extractTextSRV3Contents(JSON.stringify(data));
                return {caption: JSON.stringify(cleanData)};
            } else {
                throw new Error(`Try use language code: ${JSON.stringify(availLangCode)} instead`);
            }
        } else {
            throw new Error(`No captions found for this video, cannot retrive content`);
        }

    } catch (error) {
        console.error('Error:', error.message);
        return {error: error.message};
    }
};

// get_yt({link: "https://www.youtube.com/watch?v=QRS8MkLhQmM", lang: "en"}).then((res) => {
//     console.log("res:",res);
// })

module.exports = { get_yt };
