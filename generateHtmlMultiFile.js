const fs = require('fs');
const path = require('path');
const mustache = require('mustache');
const {
    generateSlug,
    extractTitleFromUrl,
    copyImages,
    filterItemAttributes,
    cleanTitle,
    getAttribute,
    getTitleOrFilename
} = require('./utils');

function generateHtmlMultiFile(config, contentType, items) {
    const {
        OUTPUT_DIR,
        TEMPLATE_FILE_PATH,
        MAX_FILENAME_LENGTH,
        INDENT_SPACES
    } = config;

    const typeDir = path.join(OUTPUT_DIR, config.subdirectoryName || generateSlug(contentType, MAX_FILENAME_LENGTH));
    if (!fs.existsSync(typeDir)) {
        fs.mkdirSync(typeDir, { recursive: true });
    }

    const imagesDir = path.join(typeDir, 'images');
    if (config.createImagesDirectory && !fs.existsSync(imagesDir)) {
        fs.mkdirSync(imagesDir);
    }

    const templateContent = fs.readFileSync(TEMPLATE_FILE_PATH, 'utf8');

    const itemsGroupedBySection = {};

    items.forEach((item) => {
        const section = config.subdivideBy ? item[config.subdivideBy] : null;
        if (section) {
            if (!itemsGroupedBySection[section]) {
                itemsGroupedBySection[section] = [];
            }
            itemsGroupedBySection[section].push(item);
        } else {
            itemsGroupedBySection[null] = itemsGroupedBySection[null] || [];
            itemsGroupedBySection[null].push(item);
        }
    });

    const processItems = (groupItems, groupDir) => {
        groupItems.forEach((item, index) => {
            const { attribute: titleAttr, value: titleValue } = getAttribute(item, config.titleAttribute);
            const extractedTitle = extractTitleFromUrl(titleValue);
            const cleanedTitle = cleanTitle(extractedTitle) || cleanTitle(titleValue) || `Item ${index + 1}`;
            const filename = generateSlug(cleanTitle(getTitleOrFilename(item, config.filenameAttribute)) || `item_${index + 1}`, MAX_FILENAME_LENGTH);
            const outputPath = path.join(groupDir, `${filename}.html`);

            const filteredItem = filterItemAttributes(item);

            const { attribute: contentAttr, value: content } = getAttribute(item, config.contentAttribute);

            const attributes = Object.keys(filteredItem).map(key => {
                if (key !== contentAttr && key !== titleAttr) {
                    return `${' '.repeat(INDENT_SPACES)}<li><strong>${key}:</strong> ${filteredItem[key] || ''}</li>`;
                } else if (key === titleAttr && cleanedTitle !== titleValue) {
                    // If the cleaned title is different from the raw titleValue, include it in the list
                    return `${' '.repeat(INDENT_SPACES)}<li><strong>${key}:</strong> ${filteredItem[key] || ''}</li>`;
                }
                return '';
            }).filter(attr => attr !== '').join('\n');

            const filledTemplate = mustache.render(templateContent, {
                title: cleanedTitle,
                content: content || '',
                attributes: attributes
            });
            fs.writeFileSync(outputPath, filledTemplate, 'utf8');
            console.log(`Saved: ${outputPath}`);

            const itemUrl = path.relative(OUTPUT_DIR, outputPath);
            item.generatedFilename = path.relative(process.cwd(), outputPath);
            item.outputURL = itemUrl;

            if (config.createImagesDirectory) {
                copyImages(content, imagesDir);
            }
        });
    };

    if (itemsGroupedBySection[null]) {
        processItems(itemsGroupedBySection[null], typeDir);
    } else {
        Object.keys(itemsGroupedBySection).forEach(section => {
            const sectionDir = path.join(typeDir, generateSlug(section, MAX_FILENAME_LENGTH));
            if (!fs.existsSync(sectionDir)) {
                fs.mkdirSync(sectionDir);
            }
            processItems(itemsGroupedBySection[section], sectionDir);
        });
    }

    return items;
}

module.exports = generateHtmlMultiFile;
