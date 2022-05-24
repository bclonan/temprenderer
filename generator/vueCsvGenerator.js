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
    if (filePath == null) return reject("no path provided");
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
    return Object.keys(obj).length === 0 && obj.constructor === Object;
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
    if (csvFileName == null) return console.log("no csv file provided");
    let csvFile = path.join(__dirname, csvFileName);
    let csvFileList = [];
    return new Promise((resolve, reject) => {
        fs.createReadStream(csvFile)
            .on('error', (error) => {
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
        console.log("Creating", file)
        fs.appendFile(file, newContents, (err) => {
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
    if (directoryName == null) return console.log("no directory name provided");
    let directory = path.join(__dirname, directoryName);
    if (fs.existsSync(directory)) {
        return true;
    }
    return false;
}

/**
 * @name createDirectory
 * @description Creates a directory if it does not exist - recursively
 * @param {string} full path to directory
 * @example "./parent/child/grandchild" 
 */
const createRecursiveDirectory = async (newDirectory = null) => {
    if (newDirectory == null) return console.log("no directory name provided");
    if (checkIfDirectoryExists(newDirectory)) {
        return true;
    };
    let directory = path.join(__dirname, newDirectory);
    fs.mkdir(directory, {
        recursive: true
    }, function(err) {
        if (err) {
            console.log(err)
        } else {
            console.log("New directory successfully created.")
        }
    })
}

/**
 * @name generateTemplates
 * @description Creates the code necessary using mustache templates
 * @param {string} templateFile - name of template file to use
 * @param {string} screen - name of screen you are creating a file for
 * @returns 
 */
const generateTemplates = (templateFile = null, screen = null) => {
    if (templateFile == null) return console.log("no template file name provided");
    if (screen == null) return console.log("no screen name provided");
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
 * @name updateVueRouterConfig
 * @description Updates the vue router config file first by reading the file, then updating the object, than overwriting the file
 * @param {object} newRouteList - list of routes to create
 * @returns 
 */
const updateVueRouterConfig = async (newRouteList = {}) => {
    let routerConfig = {};
    const routerFile = path.join(__dirname, `${process.env.VUE_ROUTER_CONFIG_FILE_LOCATION}/${process.env.VUE_ROUTER_CONFIG_FILE_NAME}.json`);
    if (newRouteList == null || checkEmptyUtility(newRouteList)) return console.log("No new routes to add.");
    // Read the file to construct new json object
    routerConfig = await jsonfile.readFile(routerFile);
    routerConfig = Object.assign({}, routerConfig, newRouteList);
    jsonfile.writeFile(routerFile, routerConfig, { spaces: 2, finalEOL: false }, function (err) {
        if (err) console.log(err)
    })
};

async function handleScreenCreation(screenData = {}) {
    let newViewCode, newDtoCode, newDataCode, newDtoFile, newDataFile, newViewFile = null;
    if (screenData == null || checkEmptyUtility(screenData)) return console.log("No screen data provided.");
    let {
        screen,
        controller = 'none',
        route = "",
        directory,
        chunk,
        created = 'n'
    } = screenData;
    return new Promise((resolve, reject) => {

        // console.log(`${screen} - ${controller} - ${route} - ${directory} - ${chunk} - ${created}`);
        //If screen was already created - skip or we can use the update to overwrite/append? 
        if (created === 'y') {
            console.log("screen already created");
            return;
        }

        //Create the 'view' file first Make extendable for future controllers/template options
        if (controller === 'none') {
            newViewCode = generateTemplates(`vue/${process.env.VueViewFileTemplate}.mustache`, screen);
        } else {
            newViewCode = generateTemplates(`vue/View${controller}Template.mustache`, screen);
        }

        // Create DTO, Data files, and View File name
        newDtoCode = generateTemplates(`vue/${process.env.VueDtoFileTemplate}.mustache`, screen);
        newDataCode = generateTemplates(`vue/${process.env.VueDataFileTemplate}.mustache`, screen);
        newDtoFile = `${process.env.VUE_BASE_PROJECT_DIRECTORY}/dto/${directory}/${screen}DTO.ts`;
        newDataFile = `${process.env.VUE_BASE_PROJECT_DIRECTORY}/data/${directory}/${screen}Data.ts`;
        newViewFile = `${process.env.VUE_BASE_PROJECT_DIRECTORY}/views/${directory}/${screen}.ts`;
        //Create directories if they do not exist - recursively (likely not necessary);
        createRecursiveDirectory(`${process.env.VUE_BASE_PROJECT_DIRECTORY}/dto/${directory}`)
            .then(() => {
                createRecursiveDirectory(`${process.env.VUE_BASE_PROJECT_DIRECTORY}/data/${directory}`)
            })
            .then(() => {
                
                 createNewFile(newDtoFile, newDtoCode);
                 createNewFile(newDataFile, newDataCode);
                 createNewFile(newViewFile, newViewCode);
            })
        .catch((err) => {
            reject(err)
        });
        
        resolve(true)
    });
}

/**
 * @name runCSVVueGenerator
 * @description Creates the vuejs screens, dto, and data files based on csv input
 * @note This function requires the following environment variables to be set:
 * VUE_CSV_FILE_NAME - name of csv file to read
 *  
 */
const runCSVVueGenerator = async () => {
    let csvFileList = [],
        newRouteListToAdd = {}, routerFileExists = false, ROUTER_JSON_FILE = null, EmptyJsonTemplate = '{}', ROUTER_JSON_FILE_DIR = null;
    try {
        //Read the csv
        csvFileList = await readCSV(`/${process.env.VUE_CSV_FILE_NAME}.csv`);
        await Promise.all(csvFileList.map((screenData) => {
            handleScreenCreation(screenData);
            Object.assign(newRouteListToAdd, {
                [screenData.screen]: screenData.route
            });
            return newRouteListToAdd
        }));

        //Update the vue router config file
        ROUTER_JSON_FILE_DIR = `${process.env.VUE_ROUTER_CONFIG_FILE_LOCATION}`;
        ROUTER_JSON_FILE = `${process.env.VUE_ROUTER_CONFIG_FILE_LOCATION}/${process.env.VUE_ROUTER_CONFIG_FILE_NAME}.json`;
        routerFileExists = await checkIfFileExists(ROUTER_JSON_FILE);
        if (!routerFileExists) {
            await createRecursiveDirectory(ROUTER_JSON_FILE_DIR);
            await createNewFile(ROUTER_JSON_FILE, EmptyJsonTemplate);
        }
        await updateVueRouterConfig(newRouteListToAdd);
        console.log("fileexists", routerFileExists)
        // routerFileExists = await checkIfFileExists(ROUTER_JSON_FILE).then(result => {
        //     console.log("file exists")
        //     if(!result) {
        //         createRecursiveDirectory(ROUTER_JSON_FILE_DIR);
        //         createNewFile(ROUTER_JSON_FILE, EmptyJsonTemplate)
        //     }
        // }).then(() => {
        //     return updateVueRouterConfig(newRouteListToAdd);
        // });

        //@@TODO : write a function to update csv;
    } catch (error) {
        console.log(error);
    }
}


runCSVVueGenerator();