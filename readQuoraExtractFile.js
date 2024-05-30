const fs = require('fs');
const path = require('path');
const mustache = require('mustache');

const DATA_FILE_PATH = './output.json';        // Path to the JSON data file
const CONFIG_FILE_PATH = './config.json';      // Path to the JSON configuration file
const TEMPLATE_FILE_PATH = './template.html';  // Path to the HTML template for key/value list
const GRID_TEMPLATE_FILE_PATH = './grid_template.html'; // Path to the HTML template for grid
const OUTPUT_DIR = 'html';                     // Directory to store the output HTML files
const UPDATED_JSON_FILE_PATH = './output.json'; // Path to the updated JSON file
const MAX_FILENAME_LENGTH = 50;                // Maximum length for filenames
const INDENT_SPACES = 8;                       // Number of spaces to use for indentation

// Load the JSON files
const jsonData = JSON.parse(fs.readFileSync(DATA_FILE_PATH, 'utf8'));
const configData = JSON.parse(fs.readFileSync(CONFIG_FILE_PATH, 'utf8'));

// Load the HTML templates
const templateContent = fs.readFileSync(TEMPLATE_FILE_PATH, 'utf8');
const gridTemplateContent = fs.readFileSync(GRID_TEMPLATE_FILE_PATH, 'utf8');

// Create output directories
if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR);
}

// Function to generate a slug from a string
function generateSlug(text) {
    let slug = text.toString().toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')        // Replace non-alphanumeric characters with dashes
        .replace(/^-+|-+$/g, '')            // Remove leading and trailing dashes
        .replace(/-+/g, '-');               // Replace multiple dashes with a single dash

    if (slug.length > MAX_FILENAME_LENGTH) {
        slug = slug.substring(0, MAX_FILENAME_LENGTH);
        const lastDashIndex = slug.lastIndexOf('-');
        if (lastDashIndex > 0) {
            slug = slug.substring(0, lastDashIndex);
        }
    }

    return slug;
}

// Function to extract a title from a URL
function extractTitleFromUrl(url) {
    const match = url.match(/^https:\/\/.*?quora\.com\/(.+)$/);
    if (match) {
        return match[1].replace(/-/g, ' ').replace(/\b\w/g, char => char.toUpperCase());
    }
    return null;
}

// Function to copy images referenced in the content
function copyImages(content, imagesDir) {
    const imgRegex = /<img[^>]+src="([^">]+)"/g;
    let match;
    while ((match = imgRegex.exec(content)) !== null) {
        const imgSrc = match[1];
        const imgName = path.basename(imgSrc);
        const imgPath = path.join(imagesDir, imgName);

        // Assume images are relative to input file path
        const imgFullPath = path.join(path.dirname(DATA_FILE_PATH), imgSrc);

        if (fs.existsSync(imgFullPath)) {
            fs.copyFileSync(imgFullPath, imgPath);
            console.log(`Copied: ${imgPath}`);
        } else {
            console.warn(`Image not found: ${imgFullPath}`);
        }
    }
}

// Function to generate table rows from items with anchor points
function generateTableRows(items) {
    const keys = Object.keys(items[0]);
    const tableHeader = keys.map(key => `<th>${key}</th>`).join('');
    const tableRows = items.map((item, index) => {
        const row = keys.map(key => `<td>${item[key]}</td>`).join('');
        return `<tr id="item${index + 1}"><td><a href="#item${index + 1}">item${index + 1}</a></td>${row}</tr>`;
    }).join('');
    return { tableHeader, tableRows };
}

// Function to get the attribute value for title or filename
function getTitleOrFilename(item, attribute) {
    if (item[attribute]) {
        const titleFromUrl = extractTitleFromUrl(item[attribute]);
        return titleFromUrl ? titleFromUrl : item[attribute];
    }
    return null;
}

// Function to remove generatedFilename and outputURL from item attributes
function filterItemAttributes(item) {
    const filteredItem = {};
    Object.keys(item).forEach(key => {
        if (key !== 'generatedFilename' && key !== 'outputURL') {
            filteredItem[key] = item[key];
        }
    });
    return filteredItem;
}

// Function to generate HTML files from JSON data and update the JSON data with filenames and URLs
function generateHtmlFilesAndUpdateJson() {
    Object.keys(jsonData).forEach(contentType => {
        const config = configData[contentType];
        if (!config) {
            console.error(`No configuration found for content type: ${contentType}`);
            return;
        }

        const typeDir = path.join(OUTPUT_DIR, config.subdirectoryName || generateSlug(contentType));
        if (!fs.existsSync(typeDir)) {
            fs.mkdirSync(typeDir, { recursive: true });
        }

        // Create images directory for this content type if specified
        const imagesDir = path.join(typeDir, 'images');
        if (config.createImagesDirectory && !fs.existsSync(imagesDir)) {
            fs.mkdirSync(imagesDir);
        }

        if (config.createSingleFile) {
            const items = jsonData[contentType];
            const { tableHeader, tableRows } = generateTableRows(items);
            const outputPath = path.join(typeDir, `${generateSlug(contentType)}.html`);
            const filledTemplate = mustache.render(gridTemplateContent, {
                title: contentType,
                tableHeader: tableHeader,
                tableRows: tableRows
            });
            fs.writeFileSync(outputPath, filledTemplate, 'utf8');
            console.log(`Saved: ${outputPath}`);
            // Update JSON data with filename and URL
            jsonData[contentType].forEach((item, index) => {
                const itemUrl = `${path.relative(OUTPUT_DIR, outputPath)}#item${index + 1}`;
                item.generatedFilename = path.relative(process.cwd(), outputPath);
                item.outputURL = itemUrl;
            });
        } else {
            const itemsGroupedBySection = {};

            jsonData[contentType].forEach((item) => {
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

            if (itemsGroupedBySection[null]) {
                // No grouping, place items directly in the specified subdirectory
                itemsGroupedBySection[null].forEach((item, index) => {
                    const title = getTitleOrFilename(item, config.titleAttribute) || `Item ${index + 1}`;
                    const filename = generateSlug(getTitleOrFilename(item, config.filenameAttribute) || `item_${index + 1}`);
                    const outputPath = path.join(typeDir, `${filename}.html`);

                    const filteredItem = filterItemAttributes(item);

                    const attributes = Object.keys(filteredItem).map(key => {
                        if (key !== 'Content') {
                            return `${' '.repeat(INDENT_SPACES)}<li><strong>${key}:</strong> ${filteredItem[key]}</li>`;
                        }
                        return '';
                    }).join('\n');

                    const filledTemplate = mustache.render(templateContent, {
                        title: title,
                        content: item.Content,
                        attributes: attributes
                    });
                    fs.writeFileSync(outputPath, filledTemplate, 'utf8');
                    console.log(`Saved: ${outputPath}`);

                    // Update JSON data with filename and URL
                    const itemUrl = path.relative(OUTPUT_DIR, outputPath);
                    item.generatedFilename = path.relative(process.cwd(), outputPath);
                    item.outputURL = itemUrl;

                    // Copy images if any (assuming img tags are inside the content)
                    if (config.createImagesDirectory) {
                        copyImages(item.Content, imagesDir);
                    }
                });
            } else {
                Object.keys(itemsGroupedBySection).forEach(section => {
                    const sectionDir = path.join(typeDir, generateSlug(section));
                    if (!fs.existsSync(sectionDir)) {
                        fs.mkdirSync(sectionDir);
                    }

                    itemsGroupedBySection[section].forEach((item, index) => {
                        const title = getTitleOrFilename(item, config.titleAttribute) || `Item ${index + 1}`;
                        const filename = generateSlug(getTitleOrFilename(item, config.filenameAttribute) || `item_${index + 1}`);
                        const outputPath = path.join(sectionDir, `${filename}.html`);

                        const filteredItem = filterItemAttributes(item);

                        const attributes = Object.keys(filteredItem).map(key => {
                            if (key !== 'Content') {
                                return `${' '.repeat(INDENT_SPACES)}<li><strong>${key}:</strong> ${filteredItem[key]}</li>`;
                            }
                            return '';
                        }).join('\n');

                        const filledTemplate = mustache.render(templateContent, {
                            title: title,
                            content: item.Content,
                            attributes: attributes
                        });
                        fs.writeFileSync(outputPath, filledTemplate, 'utf8');
                        console.log(`Saved: ${outputPath}`);

                        // Update JSON data with filename and URL
                        const itemUrl = path.relative(OUTPUT_DIR, outputPath);
                        item.generatedFilename = path.relative(process.cwd(), outputPath);
                        item.outputURL = itemUrl;

                        // Copy images if any (assuming img tags are inside the content)
                        if (config.createImagesDirectory) {
                            copyImages(item.Content, imagesDir);
                        }
                    });
                });
            }
        }
    });

    // Write the updated JSON data to a file
    fs.writeFileSync(UPDATED_JSON_FILE_PATH, JSON.stringify(jsonData, null, 2), 'utf8');
    console.log(`Updated JSON data saved to ${UPDATED_JSON_FILE_PATH}`);
}

// Run the HTML generation and update the JSON data
generateHtmlFilesAndUpdateJson();
