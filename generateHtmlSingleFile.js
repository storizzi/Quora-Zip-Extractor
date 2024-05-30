const fs = require('fs');
const path = require('path');
const mustache = require('mustache');
const { generateTableRows } = require('./generateTableRows');
const { generateSlug, copyImages, filterItemAttributes, cleanTitle, getAttribute, getTitleOrFilename } = require('./utils');

function generateHtmlSingleFile(config, contentType, items) {
    const {
        OUTPUT_DIR,
        GRID_TEMPLATE_FILE_PATH,
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

    const { tableHeader, tableRows } = generateTableRows(items);
    const outputPath = path.join(typeDir, `${generateSlug(contentType, MAX_FILENAME_LENGTH)}.html`);
    const gridTemplateContent = fs.readFileSync(GRID_TEMPLATE_FILE_PATH, 'utf8');
    const filledTemplate = mustache.render(gridTemplateContent, {
        title: cleanTitle(contentType),
        tableHeader: tableHeader,
        tableRows: tableRows
    });
    fs.writeFileSync(outputPath, filledTemplate, 'utf8');
    console.log(`Saved: ${outputPath}`);

    items.forEach((item, index) => {
        const filteredItem = filterItemAttributes(item);

        const { attribute: titleAttr, value: titleValue } = getAttribute(item, config.titleAttribute);
        const { attribute: contentAttr, value: content } = getAttribute(item, config.contentAttribute);

        const attributes = Object.keys(filteredItem).map(key => {
            if (key !== contentAttr && key !== titleAttr) {
                return `${' '.repeat(INDENT_SPACES)}<li><strong>${key}:</strong> ${filteredItem[key] || ''}</li>`;
            }
            return '';
        }).filter(attr => attr !== '').join('\n');

        const itemTemplate = mustache.render(gridTemplateContent, {
            title: cleanTitle(contentType),
            content: content || '',
            attributes: attributes
        });

        const itemUrl = `${path.relative(OUTPUT_DIR, outputPath)}#item${index + 1}`;
        item.generatedFilename = path.relative(process.cwd(), outputPath);
        item.outputURL = itemUrl;

        if (config.createImagesDirectory) {
            copyImages(content, imagesDir);
        }
    });

    return items;
}

module.exports = generateHtmlSingleFile;
