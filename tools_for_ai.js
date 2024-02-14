const fs = require('fs');
const path = require('path');

const folderPath = path.join(__dirname, './toolsForAi');
const exportedModules = {};

fs.readdirSync(folderPath).forEach(file => {
    if (file.endsWith('.js')) {
        try {
            const moduleName = path.parse(file).name;
            const modulePath = path.join(folderPath, file);
            exportedModules[moduleName] = require(modulePath)[moduleName];
        } catch (error) {
            console.error(`Failed to load module ${file}: ${error.message}`);
        }
    }
});

// console.log(exportedModules);

module.exports = exportedModules;