const NodeGeocoder = require('node-geocoder');
require("dotenv").config();

const options = {
    provider: 'google',
    apiKey: process.env.GOOGLEMAP_API_KEY, // for Mapquest, OpenCage, Google Premier
    formatter: null // 'gpx', 'string', ...
};

const geocoder = NodeGeocoder(options);

// Using callback
const get_lonLat = async (args) => {

    console.log("get_lonLat was called");
    try {
        let res = await geocoder.geocode(args.location);
        return { latitude: await (await res)[0].latitude, longitude: await (await res)[0].longitude };
    } catch (error) {
        return { error: error.toString() };
    }
}

const test = async () => {
    console.log("test get_lonLat:", await get_lonLat({ location: "Hong Kong" }));
}
test();
module.exports = { get_lonLat };
