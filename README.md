## Generate Vue Files based off of CSV

### Vue

```
npm run g:vuecsv
```

### VB Pages

```
npm run g:vbcsv
```

### Set ENV variables 

```
# Base directory where vue app files exists
VUE_BASE_PROJECT_DIRECTORY=../src 
# Tempate path
GENERATOR_TEMPLATE_PATH=./_templates
# Vue CSV File Name
VUE_CSV_FILE_NAME=WAIS_VUE_V1
# VB CSV File Name
VB_CSV_FILE_NAME=WAIS_VB_V1
# List of vue templates to generate and use
VUE_TEMPLATE_LIST=BaseData,BaseDTO,BaseView
# File template configs
VueDtoFileTemplate=BaseDTO
VueDataFileTemplate=BaseData
VueViewFileTemplate=BaseView
# router config json file
VUE_ROUTER_CONFIG_FILE_LOCATION=../src/router
# Router Config File name
VUE_ROUTER_CONFIG_FILE_NAME=WIASPathConfig

# Base directory where your vb project lives
VB_BASE_PROJECT_DIRECTORY=../WCAIS.WebAPI
# Default VB Templates
VbHelperFileTemplate=BaseHelper
VbInterfaceFileTemplate=BaseInterface
VbControllerFileTemplate=BaseController
VbModelFileTemplate=BaseModel
```