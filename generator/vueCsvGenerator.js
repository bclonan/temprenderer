'use strict';
//Env Configuration
require('dotenv').config()
// Shared Functions
const csvUtils = require('./csvUtils');

async function handleScreenCreation(screenData = {}) {
    
    let newViewCode, newDtoCode, newDataCode, newDtoFile, newDataFile, newViewFile = null;
    if (screenData == null || csvUtils.checkEmptyUtility(screenData)) return csvUtils.cliLogger.error(`ERROR : handleScreenCreation - Missing or empty screenData argument.`);
    let {
        screen,
        controller = 'none',
        route = "",
        directory,
        chunk,
        created = 'n'
    } = screenData;
    return new Promise((resolve, reject) => {
        csvUtils.cliLogger.info(`Creating: ${screen} - ${controller} - ${route} - ${directory} - ${chunk} - ${created}`);
        //If screen was already created - skip or we can use the update to overwrite/append? 
        if (created === 'y') {
            csvUtils.cliLogger.info(`Screen Alread Exists skipping: ${screen}`);
            return;
        }

        

        // Create DTO, Data files, and View File name
        newDtoCode = csvUtils.generateTemplates(`vue/${process.env.VueDtoFileTemplate}.mustache`, screen);
        newDataCode = csvUtils.generateTemplates(`vue/${process.env.VueDataFileTemplate}.mustache`, screen);
        

        //Create directories if they do not exist - recursively (likely not necessary);
        csvUtils.createRecursiveDirectory(`${process.env.VUE_BASE_PROJECT_DIRECTORY}/dto/${directory}`)
            .then(() => {
                csvUtils.createRecursiveDirectory(`${process.env.VUE_BASE_PROJECT_DIRECTORY}/data/${directory}`)
                csvUtils.createRecursiveDirectory(`${process.env.VUE_BASE_PROJECT_DIRECTORY}/views/${directory}`)
                             //Create the 'view' file first Make extendable for future controllers/template options
        if (controller === 'none') {
            newViewCode = csvUtils.generateTemplates(`vue/${process.env.VueViewFileTemplate}.mustache`, screen);
        } else {
            newViewCode = csvUtils.generateTemplates(`vue/View${controller}Template.mustache`, screen);
        }
        newDtoFile = `${process.env.VUE_BASE_PROJECT_DIRECTORY}/dto/${directory}/${screen}DTO.ts`;
        newDataFile = `${process.env.VUE_BASE_PROJECT_DIRECTORY}/data/${directory}/${screen}Data.ts`;
        newViewFile = `${process.env.VUE_BASE_PROJECT_DIRECTORY}/views/${directory}/${screen}.ts`;
                csvUtils.createNewFile(newDtoFile, newDtoCode);
                csvUtils.createNewFile(newDataFile, newDataCode);
                csvUtils.createNewFile(newViewFile, newViewCode);
            })
        .catch((err) => {
            csvUtils.cliLogger.error(`ERROR : handleScreenCreation - ${err}.`);
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
    const csvFile = `/${process.env.VUE_CSV_FILE_NAME}.csv`;
    try {
        //Read the csv
        csvFileList = await csvUtils.readCSV(csvFile);
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
        routerFileExists = await csvUtils.checkIfFileExists(ROUTER_JSON_FILE);
        if (!routerFileExists) {
            await csvUtils.createRecursiveDirectory(ROUTER_JSON_FILE_DIR);
            await csvUtils.createNewFile(ROUTER_JSON_FILE, EmptyJsonTemplate);
        }
        await csvUtils.updateVueRouterConfig(newRouteListToAdd);

        
        await csvUtils.updateCSV(csvFile);

    } catch (error) {
        csvUtils.cliLogger.error(`ERROR : runCSVVueGenerator - ${error}.`);
    }
}


runCSVVueGenerator();