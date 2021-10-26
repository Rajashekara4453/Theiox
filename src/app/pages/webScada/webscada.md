# Parent Component

## webScada.component.ts

### Contents:

 # OnInit:
1) * subscribe to script loader which will load **sanitizer**, **mxClient** and **grapheditor css**.
    * **sanitizer:** used in js files to sanitize url.
    * **mxClient:** mxGraph library entry file that loads all the required js useful for creating the dom for the graph.
    * **grapheditor css:** styling for the window.

2) * subscribe to params route to update the dashboard ID whenever the page url changes.
    * as soon as dashboard ID changes call loadWidgets

 # loadWidgets
* using the dashboard ID subscribe for dashboard Data and update the dashboardData variable.

# HTML part

component :
###  BreadCrumb 
1) show if dashboardData is available.
2) on refresh call loadWidgets() 
3) send dashboardData to child.

### Preview
1) show if dashboardData is available.
3) send dashboardData to child.


## why update dashboard Data?
    
    * Since we subscribed to params, dashboard ID gets updated to the one on the url whenever we choose a new scada from the sidebar.
    * Immediately after, loadwidgets gets called which updates dashboardData variable.

---
---
# Child Component 1 - Preview.

## Contents:
### Services
1) _webScada service - main services with business logic for this component.
2) globals - used only to get the current user site id for the editor URL.

# OnInit
***getScadaColors***:
Request ***_webScada service*** to get the scada colors from the configuration.json and set the global variable **colorPicker**.  

## why OnChanges?

    * When the dashboardData variable changes in the parent component it is reflected in the child, we are detecting the change of this emitted variable in the onChanges to update the view whenever the dashboardData changes...
    hens change in URL = change in view. 

# OnChanges

* **isOwner** - used to show/hide the edit button that navigates the user to editor.
* **isSubscribed** - if this is not the first time load then unsubscribe to the observable and set the variable to false.
* **graphContainer** - holds the dom element where the graph will be loaded and is going to be erased to nothing every load.
* **onInit** - if this is the first load then wait for the graph to load then call ***importRequiredModules*** service else call the service immediately.
* **hasObservable** - subscribe to the observable that emits the cells to be updated and when the value comes call updateCellOnValue method.

# updateCellOnValue( data );
    data: {
        cell: mxCell //cell that has to be updated
        styles:{
            remove:['fillColor=red',..] //default styles
            update:['fillColor=pink',..] //styles added based on conditions. 
        }
    }
**graph** - graph object updated in the service, used for getting the cell through graph.model.getCell
**applying Styles** - basically looping through both remove and update styles array and updating the styles for the cell using ***setCellStyle*** service


### ***ZoomIn, ZoomOut, resetGraph, editGraph***
* Does as the name suggests, 
* **resetGraph** - does not refresh the page it just scales and translates to the original position.
* **editGraph** - takes us to the editor with dashboardID and siteId which will be processed in the editor.

---
---
# WebScada Service

### **importRequiredModules(graphContainer, dashboardData, isOnInit)**
    graphContainer: the dom element where the graph has to be loaded.
    dashboardData: object that holds xml info to update the graph.
    isOnInit: is this the initial load or not.

* Based on **isOninit** wait for the graphLoad then call ***initializeGraph*** or load call it immediately.
---
### **initializeGraph(graphContainer, dashboardData)**
    graphContainer: the dom element where the graph has to be loaded.
    dashboardData: object that holds xml info to update the graph.

* Load type definitions of **Editor**, **EditorUi** and **graph**.

* Create a new graph instance by calling createGraphInstance

* load xml to the created instance
---
### **createGraphInstance(graphContainer, Editor, EditorUi, Graph)**
    graphContainer: The dom element where the graph has to be loaded.
    Editor,EditorUi: Type defined js files with methods and variables to create an editor.
    Graph: Type defined js file with methods and variables to create the graph object.

* mxUtil function that is going to accept:
  * **resources** - accepts the txt - for naming and xml - for styles
  * **createEditor** - gets the required theme and creates the editor and editorUi instance
    * **graph** - creates the graph Object instance required to load and modify the xml and styles respectively.
  * on any errors display error loading resource files.
---
### **loadXmlToInstance(dashboardInfo, EditorUi)**
    dashboardInfo: object that holds xml info to update the graph.
    EditorUi: Required since we are overriding a method inside this file.

* **xmlData** - retrieve the xml from the dashboard and feed it to the Editors Open method.
* ***Editor.prototype.open*** - set graph on the canvas.

* call service ***getUnitData***
---
### **getUnitData()**
* **cellFactors** - get the factors data from ***getChartUnitMetaData*** if failed return null.
* **cellUnits** - get the units data from ***getUnits*** if failed return null.
* call the service ***setCellProperty*** when the graph is ready.
---
### **setCellProperty()**
* **topicRequestJson** - the request json for the that must be populated with topics and devices from the cells.
* **requireTopic** - request for topics only if the cells have configured device and topic.
* loop through the all the cells,
    * get device and topic from each cell that contains it and update the **topicRequestJson**.
* **defaultStyle** - get the default style for the cell and create a property defaultStyle in the cell to store it.
* set **tags** and **units** for each cells from **cellUnits** and **cellFactors**.
* **scaleToTranslate** - if fit to screen is selected in the editor, this variable will be defined to graph's **scaleToTranslate** property.

* call service ***getTopicsForCells*** if **requireTopic** is true.
---
### **getTopicsForCells(input, nodes)**
    input: the topicRequestJson created from devices and tags retrieved from the cells.
    nodes: xml nodes of the graph

* set topics for every cell that match the response with devices and tags.
* **topicNodeData** - create an object with topics as property and cells as value.
* call service to ***setRealTimeRefresh***.

### **setRealTImeRefresh() mqttConnect()**
*  methods to connect to mqtt.
* on message arrived call service ***setCellsToUpdate***.

## setCellsToUpdate(payload, topic)
    payload: payload string with message.
    topic: current topic for which the current mqtt message has arrived. 

* **mqttResponse** - parsed mqtt payload.
* **model** - current **graph** model.
* **changeNodes** - from the topic get all the cells that has to be updated from the **topicNodeData** object.

* loop through the cells present in the **changeNodes** array of cells.

* ***For Every Cell*** - 
    * **cell** - acquired from the **model** with the id of the cell from **changeNodes** object.
    * **isShowValue** - should the value be shown? configured in editor.
    * **isShowUnits** - should the units be shown? configured in editor.
    * Update the **data** object with value.
    * Update the **style** object with update and remove style based on configured cells in the editor.
    * **emit the data observable.** ( can be accesses by subscribing to it by using ***getPreviewCells*** service).

    ## updateStyleArray(array, )