const fs = require('fs');
const path = require('path');
const cheerio = require('cheerio');

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
        const lastSegment = segments[segments.length - 1];
        const title = lastSegment.replace(/-/g, ' ').replace(/\b\w/g, char => char.toUpperCase());
        return title;
    } catch (error) {
        // If the input is not a valid URL, return the original string
        return url;
    }
}

function copyImages(content, imagesDir) {
    const $ = cheerio.load(content);
    const images = $('img');

    if (!fs.existsSync(imagesDir)) {
        fs.mkdirSync(imagesDir, { recursive: true });
    }

    images.each((i, img) => {
        const src = $(img).attr('src');
        if (src) {
            const filename = path.basename(src);
            const srcPath = path.join(process.cwd(), 'images', filename);
            const destPath = path.join(imagesDir, filename);

            try {
                if (fs.existsSync(srcPath)) {
                    fs.copyFileSync(srcPath, destPath);
                    console.log(`Copied image: ${srcPath} to ${destPath}`);
                } else {
                    console.error(`Image not found: ${srcPath}`);
                }
            } catch (error) {
                console.error(`Failed to copy image: ${srcPath}`, error);
            }
        }
    });
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

function cleanTitle(title) {
    if (typeof title !== 'string') {
        return title; // Return as-is if not a string
    }
    const $ = cheerio.load(title);
    return $.text();
}

function getAttribute(item, attribute) {
    if (Array.isArray(attribute)) {
        for (let attr of attribute) {
            if (item[attr]) {
                return item[attr];
            }
        }
    } else {
        return item[attribute];
    }
    return null;
}

function getTitleOrFilename(item, attribute) {
    if (attribute) {
        const value = getAttribute(item, attribute);
        if (value) {
            const titleFromUrl = extractTitleFromUrl(value);
            return titleFromUrl ? titleFromUrl : value;
        }
    }
    return null;
}

module.exports = {
    generateSlug,
    extractTitleFromUrl,
    copyImages,
    filterItemAttributes,
    saveDebugJson,
    checkConfigFileExists,
    cleanTitle,
    getAttribute,
    getTitleOrFilename
};
