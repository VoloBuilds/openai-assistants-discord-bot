/*
{
  "name": "get_weather",
  "description": "Determine weather in my location",
  "parameters": {
    "type": "object",
    "properties": {
      "location": {
        "type": "string",
        "description": "The city and state e.g. San Francisco, CA"
      },
      "unit": {
        "type": "string",
        "enum": [
          "c",
          "f"
        ]
      }
    },
    "required": [
      "location"
    ]
  }
}
*/


const simple_get_weather = (args) => {
  console.log("get_weather was called");
  let location = args.location || "HongKong";
  let unit = args.unit || "c";
  return { "success": true, "location": location, "temperature": "18", "unit": unit };
};

const { get_coordinate } = require("./get_coordinate.js");
require("dotenv").config();
const OPENWEATHER_API_KEY = process.env.OPENWEATHER_API_KEY;

const real_get_weather = async (args) => {
  console.log("get_time was called");

  try {
    // Default values
    const { location = "Hong Kong", unit = "c" } = args;
    let geoInfo = await get_coordinate({ location });
    if (geoInfo.error) { throw new Error(geoInfo.error); }

    let { latitude, longitude } = geoInfo;
    const respond = await fetch(`https://api.openweathermap.org/data/2.5/weather?lat=${latitude}&lon=${longitude}&units=metric&appid=${OPENWEATHER_API_KEY}`);

    return await respond.json();
  } catch (error) {
    console.log("Error:", error.message);
    return { error: error.message };
  }

};


let get_weather = simple_get_weather;
if (!OPENWEATHER_API_KEY) {
  console.error("Open Weather API key is not set. Using simple_get_weather(), Set the OPENWEATHER_API_KEY environment variable to use real_get_weather() \n To obtain the API, Check https://openweathermap.org/price");
} else {
  get_weather = real_get_weather;
}

// const test = async () => {
//   console.log("test get_weather:", await get_weather({ location: "hongKong" }));
// }
// test();

module.exports = { get_weather };
