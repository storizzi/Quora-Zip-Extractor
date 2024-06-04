#!/usr/bin/env

const fs = require('fs');
const config = require('./config');
const parseHtmlToJson = require('./parseHtmlToJson');
const generateHtmlFromJson = require('./generateHtmlFromJson');
const generateIndexFiles = require('./generateIndexFiles');
const checkMissingContentConfig = require('./checkMissingContentConfig');
const { saveDebugJson, checkConfigFileExists } = require('./utils');

checkConfigFileExists(config.CONFIG_FILE_PATH);

console.log('Parsing HTML to JSON...');
let jsonData = parseHtmlToJson(config);
if (config.DEBUG) saveDebugJson(jsonData, 'parsed');

try {
    console.log('Checking for missing content configurations...');
    checkMissingContentConfig(jsonData, config);
} catch (error) {
    console.error(error.message);
    process.exit(1); // Stop the script if there are missing configurations
}

console.log('Generating HTML files from JSON...');
jsonData = generateHtmlFromJson(config, jsonData);
if (config.DEBUG) saveDebugJson(jsonData, 'generated');

console.log('Generating index files...');
generateIndexFiles(jsonData, config);
if (config.DEBUG) saveDebugJson(jsonData, 'indexed');

console.log('Saving updated JSON data...');
fs.writeFileSync(config.OUTPUT_JSON_FILE_PATH, JSON.stringify(jsonData, null, 2), 'utf8');
console.log(`Updated JSON data saved to ${config.OUTPUT_JSON_FILE_PATH}`);

console.log('Process completed.');
