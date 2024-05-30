const fs = require('fs');
const path = require('path');
const mustache = require('mustache');
const { generateSlug, extractTitleFromUrl, getTitleOrFilename, cleanTitle } = require('./utils');

function generateIndexFiles(jsonData, config) {
    const {
        OUTPUT_DIR,
        INDEX_TEMPLATE_FILE_PATH,
        DEBUG
    } = config;

    const indexTemplateContent = fs.readFileSync(INDEX_TEMPLATE_FILE_PATH, 'utf8');

    // Generate the main index.html in the OUTPUT_DIR directory
    const mainLinks = Object.keys(jsonData).map(contentType => {
        const contentConfig = config[contentType];
        if (!contentConfig) {
            console.error(`Missing configuration for content type: ${contentType}`);
            return '';
        }
        if (contentConfig.createSingleFile) {
            if (jsonData[contentType] && jsonData[contentType].length > 0) {
                const filename = jsonData[contentType][0].generatedFilename;
                const relativePath = path.relative(OUTPUT_DIR, filename);
                return `<li><a href="${relativePath}">${contentType}</a></li>`;
            } else {
                return '';
            }
        } else {
            const contentDir = contentConfig.subdirectoryName || generateSlug(contentType, config.MAX_FILENAME_LENGTH);
            return `<li><a href="${contentDir}/index.html">${contentType}</a></li>`;
        }
    }).filter(link => link !== '').join('\n');

    // Include a link to the original index.html in the parent directory
    const parentIndexLink = `<li><a href="../index.html">Original Quora Backup index.html</a></li><hr>`;
    const mainIndexContent = mustache.render(indexTemplateContent, {
        title: 'Table of Contents',
        links: parentIndexLink + '\n' + mainLinks
    });

    fs.writeFileSync(path.join(OUTPUT_DIR, 'index.html'), mainIndexContent, 'utf8');
    if (DEBUG) console.log(`Saved: ${path.join(OUTPUT_DIR, 'index.html')}`);

    // Generate index.html for each content type
    Object.keys(jsonData).forEach(contentType => {
        const contentConfig = config[contentType];
        if (!contentConfig) {
            console.error(`Missing configuration for content type: ${contentType}`);
            return;
        }

        const contentDir = path.join(OUTPUT_DIR, contentConfig.subdirectoryName || generateSlug(contentType, config.MAX_FILENAME_LENGTH));

        if (contentConfig.createSingleFile) {
            return;
        }

        if (!fs.existsSync(contentDir)) {
            fs.mkdirSync(contentDir, { recursive: true });
        }

        const typeLinks = [];
        const itemsGroupedBySection = {};

        jsonData[contentType].forEach(item => {
            const section = contentConfig.subdivideBy ? item[contentConfig.subdivideBy] : null;
            if (section) {
                if (!itemsGroupedBySection[section]) {
                    itemsGroupedBySection[section] = [];
                }
                itemsGroupedBySection[section].push(item);
            } else {
                const relativePath = path.relative(contentDir, item.generatedFilename);
                const title = cleanTitle(getTitleOrFilename(item, contentConfig.titleAttribute));
                typeLinks.push(`<li><a href="${relativePath}">${title}</a></li>`);
            }
        });

        const typeIndexContent = mustache.render(indexTemplateContent, {
            title: `${contentType} - Table of Contents`,
            links: typeLinks.join('\n')
        });

        fs.writeFileSync(path.join(contentDir, 'index.html'), typeIndexContent, 'utf8');
        if (DEBUG) console.log(`Saved: ${path.join(contentDir, 'index.html')}`);

        // Generate index.html for each section if subdivided
        Object.keys(itemsGroupedBySection).forEach(section => {
            const sectionDir = path.join(contentDir, generateSlug(section, config.MAX_FILENAME_LENGTH));

            if (!fs.existsSync(sectionDir)) {
                fs.mkdirSync(sectionDir, { recursive: true });
            }

            const sectionLinks = itemsGroupedBySection[section].map(item => {
                const relativePath = path.relative(sectionDir, item.generatedFilename);
                const title = cleanTitle(getTitleOrFilename(item, contentConfig.titleAttribute));
                return `<li><a href="${relativePath}">${title}</a></li>`;
            }).join('\n');

            const sectionIndexContent = mustache.render(indexTemplateContent, {
                title: `${section} - Table of Contents`,
                links: sectionLinks
            });

            fs.writeFileSync(path.join(sectionDir, 'index.html'), sectionIndexContent, 'utf8');
            if (DEBUG) console.log(`Saved: ${path.join(sectionDir, 'index.html')}`);

            // Add link to the section in the main type index file
            typeLinks.push(`<li><a href="${generateSlug(section, config.MAX_FILENAME_LENGTH)}/index.html">${section}</a></li>`);
        });

        // Update type index file with section links
        const updatedTypeIndexContent = mustache.render(indexTemplateContent, {
            title: `${contentType} - Table of Contents`,
            links: typeLinks.join('\n')
        });

        fs.writeFileSync(path.join(contentDir, 'index.html'), updatedTypeIndexContent, 'utf8');
        if (DEBUG) console.log(`Updated: ${path.join(contentDir, 'index.html')}`);
    });
}

module.exports = generateIndexFiles;
