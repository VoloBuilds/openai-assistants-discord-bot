const fs = require('fs');
const pdf = require('pdf-parse');
const fetch = require('node-fetch');

const fileName = `./.cache/.v2tcache-${Math.random().toString(36).slice(2)}.ogg`
const pdf2text = async (url) => {
  try {
    const response = await fetch(url);
    if (!response.ok) {throw new Error(`Failed to fetch file. Status: ${response.status}`);}
    const fileBuffer = await response.buffer();
    const data = await pdf(fileBuffer); 
    return data.text;
  } catch (error) {
    console.error('Error fetching or saving file:', error.message);
  }
}

// const test = async () => {
//     console.log("test pdf2text:", await pdf2text("https://cdn.discordapp.com/attachments/1192990964105613413/1198843435281559562/0-logistics-full.pdf?ex=65c060f4&is=65adebf4&hm=72e589dbdca3e07f26216c4d7a4490a1db3da8cb54c8636826aa3947e9245985&"));
// }
// test();

module.exports = { pdf2text };