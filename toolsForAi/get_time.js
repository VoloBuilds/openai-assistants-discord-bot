/*
{
  "name": "get_time",
  "description": "Get the current GMT time",
  "parameters": {
    "type": "object",
    "properties": {},
    "required": []
  }
}
*/

// Simple get time
// const get_time = async (args) => {
//   console.log("get_time was called");
//   const time = new Date().toISOString().replace(/T/, ' ').replace(/\..+/, '');
//   console.log(time, typeof time);
//   return { time: time };
// };

const { get_lonLat } = require("./get_lonLat.js");
require("dotenv").config();

const get_time = async (args) => {
  console.log("get_time was called");
  let geocode = (await get_lonLat(args));
  let time = (new Date).getTime();
  let targetTime = null;

  try {
    console.log("geocode:", await geocode);
    const respond = await fetch(`https://maps.googleapis.com/maps/api/timezone/json?location=${geocode.latitude}%2C${geocode.longitude}&timestamp=1331161200&key=${process.env.GOOGLEMAP_API_KEY}`)
    const json = (await respond).json();
    targetTime = await new Date(time + ((await json).rawOffset + (await json).dstOffset) * 1000).toISOString().replace(/T/, ' ').replace(/\..+/, '');
    return { location: args.location, time: await targetTime };
  } catch (error) {
    console.log("Error:", error);
    return { error: error.toString() };
  }

};

// const test = async () => {
//   console.log("test:", await get_time({ location: "Hong Kong" }));
// }
// test();

module.exports = { get_time };
