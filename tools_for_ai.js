const get_weather = (args) => {
    console.log("get_weather was called");
    let location = args.location || "HongKong";
    let unit = args.unit || "c";
    return JSON.stringify({ "success": true, "location": location, "temperature": "18", "unit": unit });
};

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


const get_time = (args) => {
    console.log("get_time was called");
    return new Date().toISOString().replace(/T/, ' ').replace(/\..+/, '')
}
module.exports = { get_weather, get_time };


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