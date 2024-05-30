const fs = require('fs');
const path = require('path');
const generateHtmlSingleFile = require('./generateHtmlSingleFile');
const generateHtmlMultiFile = require('./generateHtmlMultiFile');

function generateHtmlFromJson(config, jsonData) {
    const configData = JSON.parse(fs.readFileSync(config.CONFIG_FILE_PATH, 'utf8'));

    Object.keys(jsonData).forEach(contentType => {
        const contentConfig = configData[contentType];
        if (!contentConfig) {
            console.error(`No configuration found for content type: ${contentType}`);
            return;
        }

        if (contentConfig.createSingleFile) {
            jsonData[contentType] = generateHtmlSingleFile({ ...config, ...contentConfig }, contentType, jsonData[contentType]);
        } else {
            jsonData[contentType] = generateHtmlMultiFile({ ...config, ...contentConfig }, contentType, jsonData[contentType]);
        }
    });

    return jsonData;
}

module.exports = generateHtmlFromJson;
