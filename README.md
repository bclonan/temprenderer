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
|---------|---------|------|
|BaseAllFixtures     | Creates All Fixtures file for miragejs | psx | 
|BaseAllModels     |   Creates models file for miragejs      | psx | 
|BaseAllRequestPlaceholders     | Creates All request file for miragejs        | psx | 
|BaseDummyPSX     |   Test Dummy      | psx | 
|BaseMasterRoutes     |Creates All route file         | psx |  
|BaseMockTestCard     | Creates mock testing screen        | psx | 
|BaseSingleFixture     | Creates unique fixtures        | psx | 
|BaseSingleRequestPlaceholders     |   creates unique request placeholders      | psx | 


## Use

<figure class="video_container">
  <iframe src="https://share.getcloudapp.com/DOurRJpq?embed=true" allowtransparency="true" allowfullscreen="allowfullscreen" style="border: medium none;" data-frame-src="https://share.getcloudapp.com/DOurRJpq?embed=true" width="575" height="400" frameborder="0"></iframe>
</figure>

## Known Issues 
- [] At times you have to run the generator twice in order to create all of your pages this is due to our recursive directory creating.


[Creating Templates Video Sample](https://imgworld.sharepoint.com/:v:/r/sites/16090Digital/Shared%20Documents/Valvoline%20Sticker%20Bucks%203.0/PSX_Mobile/PSX_Mobile/Training%20Sessions/PSX_SPRINT1_API_MOCKING_TEMPLATE_RENDERER_PT_1.mp4?csf=1&web=1&e=FJNGIK)