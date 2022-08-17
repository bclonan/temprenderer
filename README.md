## Generating Files 


## About 
Template files are created in /templates/{parent}/templatefile.mustache 

Feed in the csv file with rows and columns to map and create your files

## Getting Started 

1. Pull the library
2. Install 
3. run your generator 

```bash
npm i 
```

```bash
npm run gen:yourmodule
```

```bash
npm run clean:yourmodule
```

## Extending 
//TODO


## Current Modules and templates 


|Module  |Description  | Generate With | Clean With |  Sample CSV |
|---------|---------|---------|-------| -----|
|psx     |   used to create react native psx miragejs mock routes      |    npm run gen:psx      |    npm run clean:psx      | PSX_MOCKGEN_V1.csv|


|Name  |Description  |  Module | 
|---------|---------|------|------|
|BaseAllFixtures     | Creates All Fixtures file for miragejs | psx | 
|BaseAllModels     |   Creates models file for miragejs      | psx | 
|BaseAllRequestPlaceholders     | Creates All request file for miragejs        | psx | 
|BaseDummyPSX     |   Test Dummy      | psx | 
|BaseMasterRoutes     |Creates All route file         | psx |  
|BaseMockTestCard     | Creates mock testing screen        | psx | 
|BaseSingleFixture     | Creates unique fixtures        | psx | 
|BaseSingleRequestPlaceholders     |   creates unique request placeholders      | psx | 


## Known Issues 
- [] At times you have to run the generator twice in order to create all of your pages this is due to our recursive directory creating.

