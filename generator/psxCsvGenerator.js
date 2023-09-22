'use strict';
//Env Configuration
require('dotenv').config()
// Shared Functions
const csvUtils = require('./csvUtils');

/**
 * Handle All file creation that requires an array of screenData objects
 * @name handleBulkCreation
 * @param {ARRAY} bulk_arr = array of objects from the csv
 * @returns {void}
 */
async function handleBulkCreation(bulk_arr = []) {
    let newRequestsFile, newRequestsCode,
     newModelFile, newModelCode,
     newRouterFile, newRouterCode,
     newMockTestCardFile,  newMockTestCardCode,
     newFixturesFile, newFixturesCode = null;
    //if (bulk_arr == null || csvUtils.checkEmptyUtilityArr(bulk_arr)) return csvUtils.cliLogger.error(`ERROR : handleBulkCreation - Missing or empty bulk_arr argument.`);
    return new Promise((resolve, reject) => {

        csvUtils.cliLogger.info(`Creating: ${bulk_arr}`);
        //If screen was already created - skip or we can use the update to overwrite/append?
        
        //Create all of the Code File
        newRequestsCode = csvUtils.generateBulkTemplate(`psx/${process.env.PSXAllRequestsPlaceholderFileTemplate}.mustache`, bulk_arr);
        newModelCode = csvUtils.generateBulkTemplate(`psx/${process.env.PSXAllModelsFileTemplate}.mustache`, bulk_arr);
        newRouterCode = csvUtils.generateBulkTemplate(`psx/${process.env.PSXMasterRoutesFileTemplate}.mustache`, bulk_arr);
        newMockTestCardCode = csvUtils.generateBulkTemplate(`psx/${process.env.PSXMockTestCardFileTemplate}.mustache`, bulk_arr);
        newFixturesCode = csvUtils.generateBulkTemplate(`psx/${process.env.PSXAllFixturesFileTemplate}.mustache`, bulk_arr);
        

        //Setup File Paths
        newRequestsFile = `${process.env.PSX_BASE_PROJECT_DIRECTORY_Mirage}/request_placeholders/index.js`;
        newModelFile = `${process.env.PSX_BASE_PROJECT_DIRECTORY_Mirage}/models/index.js`;
        newRouterFile = `${process.env.PSX_BASE_PROJECT_DIRECTORY_Mirage}/routes/index.js`;
        newFixturesFile = `${process.env.PSX_BASE_PROJECT_DIRECTORY_Mirage}/fixtures/index.js`;
        newMockTestCardFile = `${process.env.PSX_BASE_PROJECT_DIRECTORY_TEST_MOCK}/screens/TestScreen.js`;
        
        //Create directories if they do not exist - recursively (likely not necessary);
        csvUtils.createRecursiveDirectory(`${process.env.PSX_BASE_PROJECT_DIRECTORY_Mirage}`)
            .then(() => {
                csvUtils.createRecursiveDirectory(`${process.env.PSX_BASE_PROJECT_DIRECTORY_Mirage}/request_placeholders`)
                csvUtils.createRecursiveDirectory(`${process.env.PSX_BASE_PROJECT_DIRECTORY_Mirage}/models`)
                csvUtils.createRecursiveDirectory(`${process.env.PSX_BASE_PROJECT_DIRECTORY_Mirage}/routes`)
                csvUtils.createRecursiveDirectory(`${process.env.PSX_BASE_PROJECT_DIRECTORY_Mirage}/fixtures`)
                csvUtils.createRecursiveDirectory(`${process.env.PSX_BASE_PROJECT_DIRECTORY_TEST_MOCK}/screens`)
            })
            .then(() => {
                csvUtils.createNewFile(newRequestsFile, newRequestsCode);
                csvUtils.createNewFile(newModelFile, newModelCode);
                csvUtils.createNewFile(newRouterFile, newRouterCode);
                csvUtils.createNewFile(newFixturesFile, newFixturesCode);
                csvUtils.createNewFile(newMockTestCardFile, newMockTestCardCode);
            })
        .catch((err) => {
            csvUtils.cliLogger.error(`ERROR : handleBulkCreation - ${err}.`);
            reject(err)
        });
        
        resolve(true)
    });
}

async function handleIndividualCreation(screenData = {}) {
    
    let newFixtureCode, newFixtureFile, newRequestCode, newRequestFile = null;
    if (screenData == null || csvUtils.checkEmptyUtility(screenData)) return csvUtils.cliLogger.error(`ERROR : handleScreenCreation - Missing or empty screenData argument.`);
    let {
        isGet = true,
        response_sample = {},
        request_sample = {},
        name = null,
        created = null,
        type = 'GET',
        hasReqBody = false,
        requestArgs = [],
    } = screenData;
    return new Promise((resolve, reject) => {

        csvUtils.cliLogger.info(`Creating: ${name}`);
        //If screen was already created - skip or we can use the update to overwrite/append? 
        if (created === 'y') {
            csvUtils.cliLogger.info(`Screen Alread Exists skipping: ${name}`);
            return;
        }

        //Create all of the Code File
        newFixtureCode = csvUtils.genTemplateBlank(`psx/${process.env.PSXSingleFixtureFileTemplate}.mustache`, {response_sample : response_sample});
        
      
        //Setup File Paths
        newFixtureFile = `${process.env.PSX_BASE_PROJECT_DIRECTORY_Mirage}/fixtures/${name}Fixture.json`;
        if(hasReqBody) {
            newRequestCode = csvUtils.genTemplateBlank(`psx/${process.env.PSXSingleRequestFileTemplate}.mustache`, {request_sample: request_sample});
            newRequestFile = `${process.env.PSX_BASE_PROJECT_DIRECTORY_Mirage}/request_placeholders/${name}SampleRequest.json`;
          //Create directories if they do not exist - recursively (likely not necessary);
        csvUtils.createRecursiveDirectory(`${process.env.PSX_BASE_PROJECT_DIRECTORY_Mirage}`)
        .then(() => {
            csvUtils.createRecursiveDirectory(`${process.env.PSX_BASE_PROJECT_DIRECTORY_Mirage}/request_placeholders`)
        })
        .then(() => {
            csvUtils.createNewFile(newRequestFile, newRequestCode);
        })
    .catch((err) => {
        csvUtils.cliLogger.error(`ERROR : handlePostCreation - ${err}.`);
        reject(err)
    });  

        }

                  //Create fixtures - recursively (likely not necessary);
                  csvUtils.createRecursiveDirectory(`${process.env.PSX_BASE_PROJECT_DIRECTORY_Mirage}`)
                  .then(() => {
                      csvUtils.createRecursiveDirectory(`${process.env.PSX_BASE_PROJECT_DIRECTORY_Mirage}/fixtures`)
                  })
                  .then(() => {
                      csvUtils.createNewFile(newFixtureFile, newFixtureCode);
                  })
              .catch((err) => {
                  csvUtils.cliLogger.error(`ERROR : handleFixtureCreation - ${err}.`);
                  reject(err)
              });  
        
        resolve(true)
    });
}


/**
 * @name runCSVPSXGenerator
 * @description Creates Necessary mock api files in the specified directory
 * @note This function requires the following environment variables to be set:
 * # Base directory where your vb project lives
* PSX_BASE_PROJECT_DIRECTORY_Mirage=../mirage
* PSX_BASE_PROJECT_DIRECTORY_TEST_MOCK=../app
* # Default PSX Templates
* PSXAllFixturesFileTemplate=BaseAllFixtures
* PSXAllModelsFileTemplate=BaseAllModels
* PSXAllRequestsPlaceholderFileTemplate=BaseAllRequestPlaceholders
* PSXMasterRoutesFileTemplate=BaseMasterRoutes
* PSXMockTestCardFileTemplate=BaseMockTestCard
* PSXSingleFixtureFileTemplate=BaseSingleFixture
* PSXSingleRequestFileTemplate=BaseSingleRequestPlaceholders
* PSX_MOCK_CSV_FILE_NAME=PSX_MOCKGEN_V1
 *  
 */
 const runCSVPSXGenerator = async () => {
    let csvFileList = [];
    const csvFile = `/${process.env.PSX_MOCK_CSV_FILE_NAME}.csv`;
    let bulk_arr = [];
    try {
        //Read the csv
        csvFileList = await csvUtils.readCSV(csvFile);
        
        //Loop through the csv and add records to the master bulk list
        for (let i = 0; i < csvFileList.length; i++) {
            bulk_arr.push({
                name : csvFileList[i].name, 
                route: csvFileList[i].route,
                route_mock_sample: csvFileList[i].route_mock_sample, 
                created : csvFileList[i].created, 
                isGet : csvFileList[i].isGet === 'y' || csvFileList[i].isGet === 'Y', 
                response_sample : csvFileList[i].response_sample, 
                request_sample : csvFileList[i].request_sample, 
                type : csvFileList[i].type, 
                description : csvFileList[i].description, 
                hasReqBody : csvFileList[i].hasReqBody === 'y' || csvFileList[i].hasReqBody === 'Y',
                requestArgs : csvFileList[i].args == null ? [] : csvFileList[i].args.split(','),
                parent : csvFileList[i].parent,
            });
        }
     
        //Loop through the master bulk list and create BaseAllRequests, BaseAllModels, BaseMasterRoutes, BaseMockTestCard, BaseAllFixtures
        await handleBulkCreation(bulk_arr);
        

        //Loop through the master bulk list and create BaseSingleFixture, BaseSingleRequestPlaceholders
        await Promise.all(csvFileList.map((screenData) => {
            handleIndividualCreation(screenData);
            return true
        }));
       
       // await csvUtils.updateCSV(csvFile);

    } catch (error) {
        csvUtils.cliLogger.error(`ERROR : runCSVPSXGenerator - ${error}.`);
    }
}


runCSVPSXGenerator();