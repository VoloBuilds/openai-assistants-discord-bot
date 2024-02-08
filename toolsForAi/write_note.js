const fs = require('fs');
const util = require('util');
require('dotenv').config();

const path = process.env.NOTE_PATH;
const writeFileAsync = util.promisify(fs.writeFile);
const write_note = async ({ title, content }) => {
    console.log("write_note was called");
    title = title.replace(/[<>:"/\\|?*]/g, '_');
    const fullPath = `${path}/${title}.md`;
    try {
        await writeFileAsync(fullPath, content);
        return { success: true, title: title, content: content, action: "return note to user for preview"};
    } catch (err) {
        console.error("Error during write process:", err);
        return { success: false, error: err.message };
    }
};

// write_note({ title: "TEST", content: "OK" })

module.exports = { write_note };
