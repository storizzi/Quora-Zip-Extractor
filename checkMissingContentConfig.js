const config = require('./config');

function checkMissingContentConfig(jsonData) {
    const missingConfigs = Object.keys(jsonData).filter(contentType => !config[contentType]);

    if (missingConfigs.length > 0) {
        console.error('Missing configuration for the following content types:');
        missingConfigs.forEach(contentType => console.error(`- ${contentType}`));
        throw new Error('Missing configurations detected. Please update the config.json file.');
    } else {
        console.log('All content types have corresponding configurations.');
    }
}

module.exports = checkMissingContentConfig;
