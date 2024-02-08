const {exec} = require('child_process');

const sleep = async (args) => {
    console.log("Sleep Was Called");
    setTimeout(() => {
        exec("rundll32.exe powrprof.dll, SetSuspendState Sleep"); 
    }, 5000);
    return {success: true };
};

module.exports = { sleep }