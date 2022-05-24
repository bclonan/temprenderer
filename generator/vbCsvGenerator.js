//Env Configuration
require('dotenv').config()
//Native Libraries
const fs = require('fs');
const path = require('path');
//Vendor Libraries
const Mustache = require('mustache');
const customTemplateTags = ['<%', '%>'];
const csv = require('csv-parser')
const jsonfile = require('jsonfile')

//Holds csv file list to create
let rawFileList = [];

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
    if (directoryName == null) return console.log("no directory name provided");
    let directory = path.join(__dirname, directoryName);
    if (fs.existsSync(directory)) {
        console.log("dir exists")
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
 * @name runCSVVbGenerator
 * @description Creates the vuejs screens, dto, and data files based on csv input
 * @note This function requires the following environment variables to be set:
 * VUE_CSV_FILE_NAME - name of csv file to read
 *  
 */
const runCSVVbGenerator = async () => {

    let newHelperCode, newHelperFilePath, newInterfaceCode, newInterfaceFilePath, newControllerCode, newControllerFilePath, newModelCode, newModelFilePath = null, csvFileList = [];    
    try {
        //Read the csv
        csvFileList = await readCSV(`/${process.env.VB_CSV_FILE_NAME}.csv`);


        await Promise.all(csvFileList.map(async (s) => {
            let {
                screen,
                directory,
                created = 'n'
            } = s;

            //If screen was already created - skip or we can use the update to overwrite/append? 
            if (created === 'y') {
                console.log("screen already created");
                return;
            }

           // Create all of the Code File
            newHelperCode = generateTemplates(`vb/${process.env.VbHelperFileTemplate}.mustache`, screen);
            newInterfaceCode = generateTemplates(`vb/${process.env.VbInterfaceFileTemplate}.mustache`, screen);
            newControllerCode = generateTemplates(`vb/${process.env.VbControllerFileTemplate}.mustache`, screen);
            newModelCode = generateTemplates(`vb/${process.env.VbModelFileTemplate}.mustache`, screen);

            //Setup File Paths
            newHelperFile = `${process.env.VB_BASE_PROJECT_DIRECTORY}/${directory}/Helpers/${screen}Helper.vb`;
            newInterfaceFile = `${process.env.VB_BASE_PROJECT_DIRECTORY}/${directory}/HelperInterfaces/I${screen}Helper.vb`;
            newControllerFile = `${process.env.VB_BASE_PROJECT_DIRECTORY}/${directory}/Controllers/${screen}Controller.vb`;
            newModelFile = `${process.env.VB_BASE_PROJECT_DIRECTORY}/${directory}/Model/${screen}Model.vb`;

            //Create directories if they do not exist - recursively (likely not necessary);
            await createRecursiveDirectory(`${process.env.VB_BASE_PROJECT_DIRECTORY}/${directory}/Helpers`);
            await createRecursiveDirectory(`${process.env.VB_BASE_PROJECT_DIRECTORY}/${directory}/HelperInterfaces`);
            await createRecursiveDirectory(`${process.env.VB_BASE_PROJECT_DIRECTORY}/${directory}/Controllers`);
            await createRecursiveDirectory(`${process.env.VB_BASE_PROJECT_DIRECTORY}/${directory}/Model`);
            //Create files
            await createNewFile(newHelperFile, newHelperCode);
            await createNewFile(newInterfaceFile, newInterfaceCode);
            await createNewFile(newControllerFile, newControllerCode);
            await createNewFile(newModelFile, newModelCode);
          

        }));

        //@@TODO : write a function to update csv;
    } catch (error) {
        console.log(error);
    }
}


runCSVVbGenerator();