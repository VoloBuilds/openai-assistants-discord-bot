// ref: https://github.com/fent/node-ytdl-core/blob/master/example/captions.js

const https = require('https');
const ytdl = require('ytdl-core');
const { JSDOM } = require("jsdom");
const {get_yt_byWhisper} = require("./get_yt_byWhisper");

// Can be xml, ttml, vtt, srv1, srv2, srv3
const format = 'xml';

const extract = (caption) => {
    const dom = new JSDOM(caption, { contentType: "text/xml" });
    let cleanCaption = "";
    dom.window.document.querySelectorAll("text").forEach((e) => {
        cleanCaption += ` ${e.textContent}`;
    })
    return cleanCaption;
}

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

const get_yt = async ({link,lang}) => {

    try {
        const info = await ytdl.getInfo(link);
        const tracks = info.player_response.captions?.playerCaptionsTracklistRenderer.captionTracks;

        if (tracks && tracks.length) {
            const availLangCode = tracks.map(t => t.languageCode);
            const track = tracks.find((t) => t.languageCode === lang);
            if (track) {
                const data = await fetchData(`${track.baseUrl}&fmt=${format !== 'xml' ? format : ''}`);
                const cleanData = extract(data);
                return { caption: cleanData };
            } else {
                throw new Error(`Use lang, language code: ${JSON.stringify(availLangCode)} instead`);
            }
        } else {
            return await get_yt_byWhisper({link});
        }

    } catch (error) {
        console.error('Error:', error.message);
        return { error: error.message };
    }
};

// get_yt({ link: "https://www.youtube.com/watch?v=HkagM7FVpic&ab_channel=SoftwareChats", lang: "en" }).then((res) => {
//     console.log("res:", res);
// })

module.exports = { get_yt };
