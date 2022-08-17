'use strict';
//Env Configuration
require('dotenv').config()
//Native Libraries
const fs = require('fs');
const path = require('path');
//Vendor Libraries
const Mustache = require('mustache');
const customTemplateTags = ['<%', '%>'];
const csv = require('csv-parser')
const jsonfile = require('jsonfile');
const winston = require('winston');

/**
 * @name logConfiguration
 * @description Logger configuration
 */
 const logConfiguration = {
    transports: [
        new winston.transports.Console({
            level: 'warn'
        }),
        new winston.transports.File({
            level: 'error',
            // Create the log directory if it does not exist
            filename: 'logs/cli_error.log'
        }),
        new winston.transports.File({
            level: 'info',
            // Create the log directory if it does not exist
            filename: 'logs/cli_history.log'
        })
    ],
    format: winston.format.combine(
        winston.format.label({
            label: `Label🏷️`
        }),
        winston.format.timestamp({
           format: 'MMM-DD-YYYY HH:mm:ss'
       }),
        winston.format.printf(info => `${info.level}: ${info.label}: ${[info.timestamp]}: ${info.message}`),
    )
};

/**
 * @function Logging System
 * @description Logs messages to the console and/or file
 * @options | info | warn | error
 * @param {string} message - The message to log
 * @example
 * cliLogger.info(`Log example`);
 * cliLogger.warn(`Log example`);
 * cliLogger.error(`Log example`);
 * @returns {void}
 */
const cliLogger = winston.createLogger(logConfiguration);


/**
 * @name checkIfFileExists
 * @description Checks if a file/path exists
 * @param {string} filePath 
 * @returns 
 * true if file exists
 * false if file does not exist
 */
 const checkIfFileExists = (filePath = null) => {
    return new Promise((resolve, reject) => {
    if (filePath == null) return reject("ERROR : checkIfFileExists - Empty paramater filePath");
    let directory = path.join(__dirname, filePath);
    if (fs.existsSync(directory)) {
        resolve(true);
    }
    resolve(false);
    });
};

/**
 * @name checkEmptyUtility
 * @description Checks if an object is empty
 * @param {object} obj
 * @returns
 * true if object is empty
 * false if object is not empty
 */
 const checkEmptyUtility = (obj = {}) => {
    console.log("checkEmptyUtility", obj);
    return Object.keys(obj).length === 0 && obj.constructor === Object;
}

/**
 * @name checkEmptyUtilityArr
 * @description Checks if an an array is empty
 * @param {Array} - bulk_arr - array of screen objects
 * @returns
 * true if is an array and has items
 * false if is an array and has no items
 */
 const checkEmptyUtilityArr = (arr = []) => {
    if(!Array.isArray(arr)) throw 'ERROR : checkEmptyUtilityArr - Invalid argument typeof Array required.';
    if (!arr.length) throw "ERROR : checkEmptyUtilityArr - Empty Array skipping updating.";
    return true;
}

/** 
 * @name readCSV
 * @description Reads a CSV file and returns an array of objects
 * @param {string} CSV File name to read
 * @returns csv file contents as an array of objects
 * 
 * 
 */
 const readCSV = (csvFileName = null) => {
    if (csvFileName == null) return cliLogger.error(`ERROR : readCSV - Empty PAramater 'csvFileName'`);
    let csvFile = path.join(__dirname, csvFileName);
    let csvFileList = [];
    return new Promise((resolve, reject) => {
        fs.createReadStream(csvFile)
            .on('error', (error) => {
                cliLogger.error(`ERROR : readCSV - ${error}`);
                reject(error);
            })
            .pipe(csv())
            .on('data', (data) => csvFileList.push(data))
            .on('end', () => {
                resolve(csvFileList);
            });
    });
};

/**
 * @name arrToCSV
 * @description taks an array of objects, and converts it to csv format
 * @param {array} - Array of objects containing targeted csv data
 * @returns comma seperated csv
 */

 function arrToCSV(arr = []) {
    if(!Array.isArray(arr)) throw 'ERROR : arrToCSV - Invalid argument typeof Array required.';
    if (!arr.length) throw "ERROR : arrToCSV - Empty Array skipping updating.";
    const array = [Object.keys(arr[0])].concat(arr)
      
    return array.map(it => {
      return Object.values(it).toString()
    }).join('\n')
};

/** 
 * @name updateCSV
 * @description Updates the 'created' column after screens are created
 * 
 * 
 */
 const updateCSV = async (csvFileName = null) => {
    if (csvFileName == null) return cliLogger.error(`ERROR : readCSV - Empty PAramater 'csvFileName'`);
    let csvFileList = [], formattedCSV = null;

    try {
        csvFileList = await readCSV(csvFileName);
        csvFileList.map((item) => {
            item.created = 'y';
        });

        formattedCSV = await arrToCSV(csvFileList);
        cliLogger.info('INFO : updateCSV - Completed formatting csv file overwriting old.');
        createNewFile(csvFileName, formattedCSV);
    } catch (error) {
        cliLogger.error(`ERROR : updateCSV - ${error}`);
    }
        
    };



/**
 * @name createFile
 * @description Creates a file if it does not exist
 * @param {string} fileName 
 * @param {string} newContents 
 * @returns 
 */

 const createNewFile = (fileName = null, newContents = null) => {
    return new Promise((resolve, reject) => {
        if (fileName == null) return reject("no file name provided");
        if (newContents == null) return reject("no new contents provided");
        let file = path.join(__dirname, fileName);
        // Create the file if it does not exist
        fs.writeFile(file, newContents, (err) => {
            if (err) return reject(err);
        });
        resolve(true);
    });
};

/**
 * @name checkIfDirectoryExists
 * @description Checks if a directory exists
 * @param {string} directoryName 
 * @returns 
 */
 const checkIfDirectoryExists = (directoryName = null) => {
    if (directoryName == null) return cliLogger.error(`Error : checkIfDirectoryExists - Missing or undefined paramater 'directoryName'.`);
    let directory = path.join(__dirname, directoryName);
    if (fs.existsSync(directory)) {
        return true;
    }
    return false;
};

/**
 * @name createDirectory
 * @description Creates a directory if it does not exist - recursively
 * @param {string} full path to directory
 * @example "./parent/child/grandchild" 
 */
 const createRecursiveDirectory = async (newDirectory = null) => {
    if (newDirectory == null) return cliLogger.error(`Error : createRecursiveDirectory - Missing or undefined paramater 'newDirectory'.`);
    if (checkIfDirectoryExists(newDirectory)) {
        return true;
    };
    let directory = path.join(__dirname, newDirectory);
    fs.mkdir(directory, {
        recursive: true
    }, function(err) {
        if (err) {
            cliLogger.error(`ERROR : readCSV - ${err}`);
        } else {
            cliLogger.info(`INFO : createRecursiveDirectory - New Directory Sucessfully Created - ${newDirectory}`);
        }
    })
};

/**
 * @name generateBulkTemplate
 * @description Creates the code necessary using generateTemplates mustache template
 * @param {string} templateFile - name of template file to use
 * @param {Array} arr of data - array of data passing in
 */
 const generateBulkTemplate = (templateFile = null, bulk_arr = []) => {
    if (templateFile == null) return cliLogger.error(`Error : generateBulkTemplate - missing or undefined paramater 'templateFile'.`);
   // if (bulk_arr == null) return cliLogger.error(`Error : generateBulkTemplate - Missing or undefined paramater arr.`);
    let template = fs.readFileSync(path.join(__dirname, `${process.env.GENERATOR_TEMPLATE_PATH}/${templateFile}`), 'utf8');
    let templateData = {
        bulk_arr: bulk_arr
    };
    // Override default mustache tags with Custom Deliminators to avoid conflicting with vue {{}}
    //Mustache.tags = customTemplateTags;
    let renderedTemplate = Mustache.render(template, templateData);
    return renderedTemplate;
};

/**
 * @name generateTemplates
 * @description Creates the code necessary using mustache templates
 * @param {string} templateFile - name of template file to use
 * @param {string} screen - name of screen you are creating a file for
 * @returns 
 */
 const generateTemplates = (templateFile = null, screen = null) => {
    if (templateFile == null) return cliLogger.error(`Error : generateTemplates - missing or undefined paramater 'templateFile'.`);
    if (screen == null) return cliLogger.error(`Error : generateTemplates - Missing or undefined paramater screen.`);
    let template = fs.readFileSync(path.join(__dirname, `${process.env.GENERATOR_TEMPLATE_PATH}/${templateFile}`), 'utf8');
    let templateData = {
        screen: screen
    };
    // Override default mustache tags with Custom Deliminators to avoid conflicting with vue {{}}
    Mustache.tags = customTemplateTags;
    let renderedTemplate = Mustache.render(template, templateData);
    return renderedTemplate;
};

/**
 * @name genTemplateBlank
 * @description Creates the code necessary using mustache templates
 * @param {string} templateFile - name of template file to use
 * @param {string} obj - name of screen you are creating a file for
 * @returns 
 */
 const genTemplateBlank = (templateFile = null, obj) => {
    if (templateFile == null) return cliLogger.error(`Error : generateTemplates - missing or undefined paramater 'templateFile'.`);
    
    let template = fs.readFileSync(path.join(__dirname, `${process.env.GENERATOR_TEMPLATE_PATH}/${templateFile}`), 'utf8');
    let templateData = {
       ...obj
    };
    // Override default mustache tags with Custom Deliminators to avoid conflicting with vue {{}}
    //Mustache.tags = customTemplateTags;
    let renderedTemplate = Mustache.render(template, templateData);
    return renderedTemplate;
};

/**
 * @name updateVueRouterConfig
 * @description Updates the vue router config file first by reading the file, then updating the object, than overwriting the file
 * @param {object} newRouteList - list of routes to create
 * @returns 
 */
const updateVueRouterConfig = async (newRouteList = {}) => {
    let routerConfig = {};
    const routerFile = path.join(__dirname, `${process.env.VUE_ROUTER_CONFIG_FILE_LOCATION}/${process.env.VUE_ROUTER_CONFIG_FILE_NAME}.json`);
    if (newRouteList == null || checkEmptyUtility(newRouteList)) return cliLogger.info(`INFO : updateVueRouterConfig - No new routes added.`);
    // Read the file to construct new json object
    routerConfig = await jsonfile.readFile(routerFile);
    routerConfig = Object.assign({}, routerConfig, newRouteList);
    jsonfile.writeFile(routerFile, routerConfig, { spaces: 2, finalEOL: false }, function (err) {
        if (err) cliLogger.error(`ERROR : updateVueRouterConfig - ${err}`);
    })
};

module.exports = {
    checkIfFileExists,
    createNewFile,
    createRecursiveDirectory,
    readCSV,
    generateTemplates,
    updateVueRouterConfig,
    checkEmptyUtility,
    cliLogger,
    updateCSV,
    checkEmptyUtilityArr,
    generateBulkTemplate,
    genTemplateBlank

}