'use strict';
//Env Configuration
require('dotenv').config()
// Shared Functions
const csvUtils = require('./csvUtils');



async function handleScreenCreation(screenData = {}) {
    let newHelperCode, newHelperFile, newInterfaceCode, newInterfaceFile, newControllerCode, newControllerFile, newModelCode, newModelFile = null;
    if (screenData == null || csvUtils.checkEmptyUtility(screenData)) return csvUtils.cliLogger.error(`ERROR : handleScreenCreation - Missing or empty screenData argument.`);
    let {
        screen,
        directory,
        created = 'n'
    } = screenData;
    return new Promise((resolve, reject) => {

        csvUtils.cliLogger.info(`Creating: ${screen} - ${directory}`);
        //If screen was already created - skip or we can use the update to overwrite/append? 
        if (created === 'y') {
            csvUtils.cliLogger.info(`Screen Alread Exists skipping: ${screen}`);
            return;
        }

        //Create all of the Code File
        newHelperCode = csvUtils.generateTemplates(`vb/${process.env.VbHelperFileTemplate}.mustache`, screen);
        newInterfaceCode = csvUtils.generateTemplates(`vb/${process.env.VbInterfaceFileTemplate}.mustache`, screen);
        newControllerCode = csvUtils.generateTemplates(`vb/${process.env.VbControllerFileTemplate}.mustache`, screen);
        newModelCode = csvUtils.generateTemplates(`vb/${process.env.VbModelFileTemplate}.mustache`, screen);


        //Setup File Paths
        newHelperFile = `${process.env.VB_BASE_PROJECT_DIRECTORY}/${directory}/Helpers/${screen}Helper.vb`;
        newInterfaceFile = `${process.env.VB_BASE_PROJECT_DIRECTORY}/${directory}/HelperInterfaces/I${screen}Helper.vb`;
        newControllerFile = `${process.env.VB_BASE_PROJECT_DIRECTORY}/${directory}/Controllers/${screen}Controller.vb`;
        newModelFile = `${process.env.VB_BASE_PROJECT_DIRECTORY}/${directory}/Model/${screen}Model.vb`;


        //Create directories if they do not exist - recursively (likely not necessary);
        csvUtils.createRecursiveDirectory(`${process.env.VB_BASE_PROJECT_DIRECTORY}/${directory}/Helpers`)
            .then(() => {
                csvUtils.createRecursiveDirectory(`${process.env.VB_BASE_PROJECT_DIRECTORY}/${directory}/HelperInterfaces`)
                csvUtils.createRecursiveDirectory(`${process.env.VB_BASE_PROJECT_DIRECTORY}/${directory}/Controllers`)
                csvUtils.createRecursiveDirectory(`${process.env.VB_BASE_PROJECT_DIRECTORY}/${directory}/Model`)
            })
            .then(() => {
                
                csvUtils.createNewFile(newHelperFile, newHelperCode);
                csvUtils.createNewFile(newInterfaceFile, newInterfaceCode);
                csvUtils.createNewFile(newControllerFile, newControllerCode);
                csvUtils.createNewFile(newModelFile, newModelCode);
            })
        .catch((err) => {
            csvUtils.cliLogger.error(`ERROR : handleScreenCreation - ${err}.`);
            reject(err)
        });
        
        resolve(true)
    });
}


/**
 * @name runCSVVbGenerator
 * @description Creates the Helper, Interface, Model, and Controller in the specified directory
 * @note This function requires the following environment variables to be set:
 * VB_CSV_FILE_NAME - name of csv file to read
 *  
 */
 const runCSVVbGenerator = async () => {
    let csvFileList = [];
    const csvFile = `/${process.env.VB_CSV_FILE_NAME}.csv`;
    try {
        //Read the csv
        csvFileList = await csvUtils.readCSV(csvFile);
        await Promise.all(csvFileList.map((screenData) => {
            handleScreenCreation(screenData);
            return true
        }));
        await csvUtils.updateCSV(csvFile);

    } catch (error) {
        csvUtils.cliLogger.error(`ERROR : runCSVVbGenerator - ${error}.`);
    }
}


runCSVVbGenerator();