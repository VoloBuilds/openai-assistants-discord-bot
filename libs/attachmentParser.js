const {voice2text} = require('./voice2text.js');
const {pdf2text} = require('./pdf2text.js');

const parser = {
    "audio/ogg": voice2text, 
    "application/pdf": pdf2text
};


const attachmentParser = async(type, url) => {
    console.log(type,url);
    try{
        const result = await parser[type](url);
        return result;
    }catch(e){
        return "File type not supported";
    }

}

module.exports = { attachmentParser }     