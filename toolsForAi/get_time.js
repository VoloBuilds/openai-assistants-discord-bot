/* The function description in openai
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
const simple_get_time = async (args) => {
  console.log("get_time was called");
  const time = new Date().toISOString().replace(/T/, ' ').replace(/\..+/, '');
  console.log(time, typeof time);
  return { time: time };
};

const { get_coordinate } = require("./get_coordinate.js");
require("dotenv").config();
const GOOGLEMAP_API_KEY = process.env.GOOGLEMAP_API_KEY;

const getTimezoneData = async (latitude, longitude) => {
  const response = await fetch(`https://maps.googleapis.com/maps/api/timezone/json?location=${latitude}%2C${longitude}&timestamp=${Date.now() / 1000}&key=${GOOGLEMAP_API_KEY}`);
  if (!response.ok) {
    throw new Error(`Failed to fetch timezone data. Status: ${response.status}`);
  }
  return await response.json();
};

const real_get_time = async (args) => {
  console.log("get_time was called");

  try {
    const { latitude, longitude } = await get_coordinate(args);
    const timezoneData = await getTimezoneData(latitude, longitude);

    let currentTime = Date.now();
    let targetTime = await new Date(currentTime + (timezoneData.rawOffset + timezoneData.dstOffset) * 1000)
      .toISOString().replace(/T/, ' ')
      .replace(/\..+/, '');

    return { timeZoneName: timezoneData.timeZoneName, time: await targetTime };
  } catch (error) {
    console.log("Error:", error.message);
    return { error: error.message };
  }

};

let get_time = simple_get_time;
if (!GOOGLEMAP_API_KEY) {
  console.error("Google Maps API key is not set. Using simple_get_time(), Set the GOOGLEMAP_API_KEY environment variable to use real_get_time() \n To obtain the API, Check https://developers.google.com/maps/documentation/timezone/overview ");
} else {
  get_time = real_get_time;
}

// Example: 
// const test = async () => {
//   console.log("test get_time:", await get_time({ location: "Hong Kong" }));
// }
// test();

module.exports = { get_time };
