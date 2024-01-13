
const nameDict = require("./tarkovNameDict.json");

const get_tarkov_market = async (args) => {
    console.log("get_tarkov_market was called");
    console.log(args.itemName)
    try {
        console.log(nameDict[(args.itemName)]);
        const respond = await fetch('https://api.tarkov.dev/graphql', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
            },
            body: JSON.stringify({
                query: `{
            items(name: "${nameDict[args.itemName]}") {
                name
                shortName
                avg24hPrice
            }
        }`})
        })
        const json = (await respond).json();
        return json;


    } catch (error) {
        console.log("Error:", error);
        return { error: error.toString() };
    }

};

// const test = async () => {
//     console.log("test:", JSON.stringify(await get_tarkov_market({ itemName: "Tor-2" })));
// }
// test();

module.exports = { get_tarkov_market };
