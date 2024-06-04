# Quora Zip Extractor

This tool extracts and processes Quora zip backups. It takes a large HTML file and associated images directory from Quora's data export and separates out different types of content into individual HTML files with associated images. It also organizes small amounts of data into single files with a data table for easier traversal.

## Purpose

The purpose of this tool is to help users easily navigate their Quora data by breaking down the large HTML file provided by Quora into manageable pieces, each with its relevant content and images.

## Acquiring the Backup Zip File

To get your Quora data, follow these steps:
1. Go to [Quora's support channel](https://help.quora.com/hc/en-us/requests/new).
2. Select the "I want a copy of my data" option from the dropdown.
3. Submit your request.
4. Within a few days, you should receive a zip file named something like `content_<Your_Name>.zip`.

where <Your_Name> is typically your first and last names separated by an underscore.

## Unzipping the Backup File

After downloading the zip file, unzip it using the following command from the Terminal - e.g.:
```sh
cd ~/Downloads
mkdir content_<Your_Name>
cd content_<Your_Name>
unzip ../content_<Your_Name>.zip
```

or just double-click on the zip file from Finder - it should extract it into this directory automatically.

This will extract an HTML file and an `images` directory.

## Installation

### Prerequisites

- Node.js (>=14.x)

### Install as a Command

To install this tool from GitHub and use it as a command-line tool, follow these steps:

1. Install the tool globally from GitHub:
```sh
npm install -g git+https://github.com/storizzi/Quora-Zip-Extractor.git
```

## Usage

### Prepare Your Environment

Ensure you have a `.env` file in the root of your project directory if you need to customize the defaults. The `.env` file can include the following environment variables:

```plaintext
OUTPUT_DIR=html
CONFIG_FILE_PATH=config.json
INPUT_FILE_PATH=path/to/your/quora_export.html
```

If the `.env` file is not present, the tool will use the following defaults:
- **OUTPUT_DIR**: `html` (inside the current directory)
- **CONFIG_FILE_PATH**: `config.json` (from the source code directory if not found in the current working directory)
- **INPUT_FILE_PATH**: `index.html` (in the current directory)

### Running the Command

1. Open your terminal.
2. Navigate to the directory containing your extracted Quora backup, for example:
```sh
cd ~/Downloads/content_<Your_Name>
```
3. Run the command:
```sh
quora-zip-extractor
```

This will process the HTML file and images directory, creating a structured output in the specified `OUTPUT_DIR`.

## Viewing the Results

The results will be stored in the `html` directory (or the directory specified in the `OUTPUT_DIR` environment variable). To view the root index file, open it in your browser:

```sh
open html/index.html
```

## Environment Variables

- **OUTPUT_DIR**: Directory where the output files will be saved.
- **CONFIG_FILE_PATH**: Path to the JSON configuration file.
- **INPUT_FILE_PATH**: Path to the Quora HTML export file.

Ensure these variables are correctly set in your `.env` file to match your project's structure. If the `.env` file is not present, the tool will use the default values as mentioned above.

## Note

Scraping Quora's website may be against their terms and conditions. This tool uses the official data export provided by Quora, which complies with their data portability policies.

For more information on data portability policies and the legal implications, you can refer to the discussion on Quora:
[What is Quora’s data portability policy?](https://www.quora.com/What-is-Quoras-data-portability-policy-Can-I-get-a-feed-of-all-my-contributions-to-the-site)
