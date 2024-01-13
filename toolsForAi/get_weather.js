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


// const get_weather = (args) => {
//     console.log("get_weather was called");
//     let location = args.location || "HongKong";
//     let unit = args.unit || "c";
//     return { "success": true, "location": location, "temperature": "18", "unit": unit };
// };

const { get_lonLat } = require("./get_lonLat.js");
require("dotenv").config();

const get_weather = async (args) => {
  console.log("get_time was called");
  let geocode = (await get_lonLat(args));
  let time = (new Date).getTime();
  let targetTime = null;

  try {
    console.log("geocode:", await geocode);
    const respond = await fetch(`https://api.openweathermap.org/data/2.5/weather?lat=${geocode.latitude}&lon=${geocode.longitude}&units=metric&appid=${process.env.OPENWEATHER_API_KEY}`)
    const json = (await respond).json();
    return json;
  } catch (error) {
    console.log("Error:", error);
    return { error: error.toString() };
  }

};

// const test = async () => {
//     console.log("test:", await get_weather({ location: "Hong Kong" }));
// }
// test();

module.exports = { get_weather };
