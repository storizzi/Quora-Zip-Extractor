require('dotenv').config();

const config = {
    DEBUG: process.env.DEBUG === 'true',
    INPUT_FILE_PATH: process.env.INPUT_FILE_PATH || './index.html',
    OUTPUT_JSON_FILE_PATH: process.env.OUTPUT_JSON_FILE_PATH || './output.json',
    CONFIG_FILE_PATH: process.env.CONFIG_FILE_PATH || './config.json',
    TEMPLATE_FILE_PATH: process.env.TEMPLATE_FILE_PATH || './template.html',
    GRID_TEMPLATE_FILE_PATH: process.env.GRID_TEMPLATE_FILE_PATH || './grid_template.html',
    OUTPUT_DIR: process.env.OUTPUT_DIR || 'html',
    MAX_FILENAME_LENGTH: parseInt(process.env.MAX_FILENAME_LENGTH, 10) || 50,
    INDENT_SPACES: parseInt(process.env.INDENT_SPACES, 10) || 8
};

module.exports = config;
