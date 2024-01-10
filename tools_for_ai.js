const get_weather = (args) => {
    console.log("get_weather was called");
    let location = args.location || "HongKong";
    let unit = args.unit || "C";
    return JSON.stringify({ "success": true, "location": location, "temperature": "-30", "unit": unit });
};


const get_time = (args) => {
    console.log("get_time was called");
    return new Date().toISOString().replace(/T/, ' ').replace(/\..+/, '')
}
module.exports = { get_weather, get_time };