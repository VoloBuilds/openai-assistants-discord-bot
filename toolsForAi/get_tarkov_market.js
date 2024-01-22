/* The function description in openai

{
  "name": "get_tarkov_market",
  "description": "Get the 24 hour average price of an item by given item name",
  "parameters": {
    "type": "object",
    "properties": {
      "itemName": {
        "type": "string",
        "description": "the name of the item"
      }
    },
    "required": [
      "itemName"
    ]
  }
}
*/
const nameDict = require("./tarkovNameDict.json");

const get_tarkov_market = async ({itemName}) => {
    console.log("get_tarkov_market was called");
    console.log(itemName)
    try {
        console.log(nameDict[(itemName)]);
        const respond = await fetch('https://api.tarkov.dev/graphql', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
            },
            body: JSON.stringify({
                query: `{
            items(name: "${nameDict[itemName]}") {
                name
                shortName
                avg24hPrice
            }
        }`})
        })
        return await respond.json();


    } catch (error) {
        console.log("Error:", error);
        return { error: error.message };
    }

};

// const test = async () => {
//     console.log("test get_tarkov_market:", JSON.stringify(await get_tarkov_market({ itemName: "Tor-2" })));
// }
// test();

module.exports = { get_tarkov_market };
