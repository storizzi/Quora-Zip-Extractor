const fs = require('fs');
const cheerio = require('cheerio');

function parseHtmlToJson(config) {
    const { INPUT_FILE_PATH } = config;
    const htmlContent = fs.readFileSync(INPUT_FILE_PATH, 'utf8');
    const $ = cheerio.load(htmlContent);

    const jsonData = {};

    $('body > div').each((index, element) => {
        const contentType = $(element).find('h1').text().trim();
        if (!jsonData[contentType]) {
            jsonData[contentType] = [];
        }

        let currentSection = null;

        $(element).children().each((i, el) => {
            if ($(el).is('h2')) {
                currentSection = {};
                jsonData[contentType].push(currentSection);
                currentSection['Content type'] = $(el).text().trim(); // Rename 'title' to 'Content type'
            } else if ($(el).is('div') && currentSection) {
                const key = $(el).find('strong').text().replace(':', '').trim();
                const valueElement = $(el).find('strong').next();
                let value;

                if (valueElement.length) {
                    if (valueElement.is('span')) {
                        value = valueElement.html(); // Get the HTML content for the span element
                    } else {
                        value = valueElement.text().trim();
                    }
                }

                currentSection[key] = value || '';
            } else if ($(el).is('p') && currentSection) {
                currentSection = null;
            }
        });
    });

    return jsonData;
}

module.exports = parseHtmlToJson;
