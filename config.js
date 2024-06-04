const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');

// Load .env file from the source directory
const sourceEnvPath = path.join(__dirname, '.env');
if (fs.existsSync(sourceEnvPath)) {
    dotenv.config({ path: sourceEnvPath });
}

// Load .env file from the current working directory, overlaying the source directory settings
const localEnvPath = path.join(process.cwd(), '.env');
if (fs.existsSync(localEnvPath)) {
    dotenv.config({ path: localEnvPath });
}

// Override with any actual environment variables
const config = {
    DEBUG: process.env.DEBUG === 'true',
    INPUT_FILE_PATH: process.env.INPUT_FILE_PATH || './index.html',
    OUTPUT_JSON_FILE_PATH: process.env.OUTPUT_JSON_FILE_PATH || './output.json',
    ENCODED_JSON_FILE_PATH: process.env.ENCODED_JSON_FILE_PATH || './encoded_output.json',
    CONFIG_FILE_PATH: process.env.CONFIG_FILE_PATH || './config.json',
    TEMPLATE_FILE_PATH: process.env.TEMPLATE_FILE_PATH || './templates/template.html',
    GRID_TEMPLATE_FILE_PATH: process.env.GRID_TEMPLATE_FILE_PATH || './templates/grid_template.html',
    INDEX_TEMPLATE_FILE_PATH: process.env.INDEX_TEMPLATE_FILE_PATH || './templates/indexTemplate.html',
    OUTPUT_DIR: process.env.OUTPUT_DIR || 'html',
    MAX_FILENAME_LENGTH: parseInt(process.env.MAX_FILENAME_LENGTH, 10) || 50,
    INDENT_SPACES: parseInt(process.env.INDENT_SPACES, 10) || 8,
    GENERATE_INDEX_FILES: process.env.GENERATE_INDEX_FILES === 'true'
};

function resolveFilePath(filePath) {
    if (path.isAbsolute(filePath)) {
        return filePath;
    }
    return fs.existsSync(filePath)
        ? filePath
        : path.join(__dirname, filePath);
}

function resolveOutputPath(filePath) {
    if (path.isAbsolute(filePath)) {
        return filePath;
    }
    return path.join(process.cwd(), filePath);
}

const configFilePath = resolveFilePath(config.CONFIG_FILE_PATH);
const configData = JSON.parse(fs.readFileSync(configFilePath, 'utf8'));

config.CONFIG_FILE_PATH = configFilePath;
config.TEMPLATE_FILE_PATH = resolveFilePath(config.TEMPLATE_FILE_PATH);
config.GRID_TEMPLATE_FILE_PATH = resolveFilePath(config.GRID_TEMPLATE_FILE_PATH);
config.INDEX_TEMPLATE_FILE_PATH = resolveFilePath(config.INDEX_TEMPLATE_FILE_PATH);
config.INPUT_FILE_PATH = resolveFilePath(config.INPUT_FILE_PATH);
config.OUTPUT_JSON_FILE_PATH = resolveOutputPath(config.OUTPUT_JSON_FILE_PATH);
config.ENCODED_JSON_FILE_PATH = resolveOutputPath(config.ENCODED_JSON_FILE_PATH);
config.OUTPUT_DIR = resolveOutputPath(config.OUTPUT_DIR);

module.exports = { ...config, ...configData };
