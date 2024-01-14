/* The function description in openai
{
    "name": "get_coordinate",
        "parameters": {
        "type": "object",
            "properties": {
            "location": {
                "type": "string",
                    "description": "The city and state e.g. San Francisco, CA, or a zipcode"
            }
        },
        "required": [
            "location"
        ]
    },
    "description": "Determine the longitude and latitude of a given address"
}
*/

// Simple coordinate
const simple_get_coordinate = async (args) => {
    console.log("get_coordinate was called");
    return { latitude: 22.3193039, longitude: 114.1693611 }
};


const NodeGeocoder = require('node-geocoder');
require("dotenv").config();
const GOOGLEMAP_API_KEY = process.env.GOOGLEMAP_API_KEY;

const options = {
    provider: 'google',
    apiKey: GOOGLEMAP_API_KEY,
    formatter: null // 'gpx', 'string', ...
};

const geocoder = NodeGeocoder(options);

const real_get_coordinate = async (args) => {
    console.log("get_coordinate was called");

    try {
        const [geoInfo] = await geocoder.geocode(args.location);
        if (!geoInfo) { throw new Error("Geocode information not found, try search other names"); }
        return { latitude: geoInfo.latitude, longitude: geoInfo.longitude }; //stript useless info to save tokens

    } catch (error) {
        return { error: error.message };
    }
}

let get_coordinate = simple_get_coordinate;
if (!GOOGLEMAP_API_KEY) {
    console.error("Google Maps API key is not set. Using simple_get_coordinate(), Set the GOOGLEMAP_API_KEY environment variable to use real_get_coordinate() \n To obtain the API, Check https://developers.google.com/maps/documentation/timezone/overview ");
} else {
    get_coordinate = real_get_coordinate;
}

// const test = async () => {
//     console.log("test get_coordinate:", await get_coordinate({ location: "HongKong" }));
// }
// test();

module.exports = { get_coordinate };
