const fs = require('fs');
const path = require('path');

function generateSlug(text, maxLength) {
    return text.toString().toLowerCase()
        .replace(/\s+/g, '-')           // Replace spaces with -
        .replace(/[^\w\-]+/g, '')       // Remove all non-word chars
        .replace(/\-\-+/g, '-')         // Replace multiple - with single -
        .replace(/^-+/, '')             // Trim - from start of text
        .replace(/-+$/, '')             // Trim - from end of text
        .substring(0, maxLength);       // Trim at the desired length
}

function extractTitleFromUrl(url) {
    try {
        const urlObject = new URL(url);
        const pathName = urlObject.pathname;
        const segments = pathName.split('/');
        return segments[segments.length - 1].replace(/-/g, ' ');
    } catch (error) {
        // If the input is not a valid URL, return the original string
        return url;
    }
}

function copyImages(content, imagesDir, jsonFilePath) {
    // Logic to copy images based on content
    // You can customize this function based on how images are referenced in your content
}

function filterItemAttributes(item) {
    const filteredItem = { ...item };
    delete filteredItem.generatedFilename;
    delete filteredItem.outputURL;
    return filteredItem;
}

function saveDebugJson(data, label) {
    const fileName = `./debug_${label}.json`;
    fs.writeFileSync(fileName, JSON.stringify(data, null, 2), 'utf8');
    console.log(`Debug JSON saved to ${fileName}`);
}

function checkConfigFileExists(configFilePath) {
    if (!fs.existsSync(configFilePath)) {
        console.error(`Config file not found: ${configFilePath}`);
        process.exit(1);
    }
}

module.exports = {
    generateSlug,
    extractTitleFromUrl,
    copyImages,
    filterItemAttributes,
    saveDebugJson,
    checkConfigFileExists
};
