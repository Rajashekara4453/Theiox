import { SidebarService } from './editor/editor-services/sidebar.service';
import { Injectable } from '@angular/core';
import { AppService } from '../../../app/services/app.service';
import { globals } from '../../../app/utilities/globals';

import { Paho } from '../../../../node_modules/ng2-mqtt/mqttws31';
import { Config } from '../../config/config';

import { BehaviorSubject, timer, Subject } from 'rxjs';
import { UtilityFunctions } from '../../../app/utilities/utility-func';

import { ToastrService } from '../../components/toastr/toastr.service';
import { HandleGraphService } from './editor/editor-services/handle-graph.service';

@Injectable({providedIn:
'root'})
export class WebscadaService {

  public unitMetaData: Object;
  public cellFactors: Object;
  public cellUnits: any;

  public graph: any;
  tryAgainInProgress: boolean;
  searchValue: string;
  failedMessage: any;
  hasScadaLoaded: boolean;
  subMenuContents: number;
  subMenuContentsLeft: number;
  subMenuContentsTop: number;
  action_id: any;
  constructor(
     private _appservice: AppService,
     private _global: globals,
     private _util: UtilityFunctions,
     private _toastLoad: ToastrService,
     private _handleGraph:HandleGraphService,
     private _sidebar:SidebarService
     ) {}

  public topicSubscribe = [];
  public topicNodeData: Object = {};
  public availableTopics: Object = {};

  public _mqttClient: any;

  public cellsToUpdate = new BehaviorSubject<any>('0.00');
  public graphHasUpdated = new Subject();

  public colorPicker: Object = {};

  public documentElement: any;
  public scaleToTranslate: Number;
  public graphContainer: any;
  public noXmlPresent: String;
  public verifyCellProperty: any;

  public searchFieldContent: String = '';
  public requestInProgress : Boolean = false;
  public hasTriggerAccess: any; //how is this getting the AccessLevel data.?

  public numbers = timer(1000, 1000);
  public hasSubbed;
  public countDown;

  contextMenuEnabled: boolean;
  public isCellAssetRemote: Boolean;
  public isCellConfigured: Boolean;
  public highligtOut: mxCellHighlight;

  public context_shape_name: String = 'el_ID';

  public configPopupData: any = {
    conditionsExist: false,
    device: 'Not Found',
    tag: 'Not Found',
    unit: 'Not Found',
    decimal: 'Not Found',
    live_value: 'Not Found',
    showUnits: true,
    showValue: false,
    header_content: ['Compare', 'Compare value', 'Action', 'Action value'],
    body_content: []
  };
  public action_name: String = 'action';
  public cell_name: String = 'device';
  public cell_id = '01';
  
  
  public cellPropertyData: any = {
    body_content: []
  };
  
  public SVG;
  public devices = {};
  public tags = {};
  public units = {};

  public _scada;


  public clientId = `mqttjs_${Math.random().toString(17).substr(2, 8)}`;

  public Comparison = {
    '==':   {   value: '=='  ,  label:'Equals'                },
    '!=':   {   value: '!='  ,  label:'Not equals'            },
    '&ge;': {   value: '>='  ,  label:'Greater or equal to'   },
    '&le;': {   value: '<='  ,  label:'Less or equal to'      },
    '&gt;': {   value: '>'   ,  label:'Greater than'          },
    '&lt;': {   value: '<'   ,  label:'Less than'             },
    'progress':{ value: '-',   label:'-'}
  };

  // labels set for live data view.
  public Action = {
    "strokeColor":{
      label:"Stroke Color"
    },
    "opacity":{
      label:"Visibility",
      type:'value-to-hide'
    },
    "display":{
      label:"Visibility",
      type:'value-to-hide'
    },
    "fontColor":{
      label:"Font Color"
    },
    "fillColor":{
      label:"Fill Color"
    },
    "fontSize":{
      label:"Font Size"
    },
    "labelBackgroundColor":{
      label:"Text Background"
    },
    "imageBackground":{
      label:"Fill Color"
    },
    "rotation":{
      label:"Rotation"
    },
    "image":{
      label:"Image"
    },
    "textOpacity":{
      label:"Text Visibility",
      type:'value-to-hide'
    },
    "gradientColor":{
      label:"Gradient Color"
    },
    "text":{
      label:"Show content with value"
    },
    "progress":{
      label:"Progress",
      labels:{
        south:'Top to Bottom',
        north:'Bottom to Top',
        east:'Left to Right',
        west:'Right to Left',
      }
    }
  }
  
  contextMenuTop : Number = 284;
  contextMenuLeft : Number = 170;
  public hexReference = {};

  // v--------------set the variable that holds color picker info------------v //
  getScadaColors() {
    const globalColors = this._global._appConfigurations.scadaColors;
    for (const colors of globalColors) {
      this.colorPicker[colors.reference] = {
        value: colors.value,
        label: colors.label,
      };
      this.hexReference[colors.value] = colors.label;
      this.hexReference[colors.label] = colors.value;
    }
    this._appservice.getXmlData().subscribe((data) => {
      this.noXmlPresent = atob(data.SCADAData);
    });
  }

  // v-------used to create a new graph instance and load dashboard data--------v //
  createGraphInstance(graphContainer, Editor, EditorUi, Graph) {
    this.graph = {};
    this.graphContainer = graphContainer;
    this.verifyCellProperty = 0;
    this.SVG = '';
     // v---loading all the assets required for the editor's diagram container----v//
    return mxUtils.getAll(
          ['', '/assets/library/scada/editor/styles/default.xml'], (xhr) => {
            mxResources.parse(xhr[0].getText());
            const themes = new Object();
            themes['default'] = xhr[1].getDocumentElement();
            this.graph = new Graph(null, null, null, null, themes, null);
            this.graph['transparentBackground'] = false;
            // v--------loading the diagram container to an element with the ID ---------v//
            const renderContainer =  new EditorUi(new Editor(null, themes, null, null, this.graph), graphContainer);
          },
          () => {
            // this is type defined through js so it won't have access to toaster unless made available.
            console.log('could not load Scada');
          },
        );
  }

  // v---------used to paint the graph on the created Instance of the graph------------v //
  loadXmlToInstance(dashboardInfo: any, EditorUi, Graph ) {
    let XML = '';
    let XMLexists = true;
    try {
      const widgetList = dashboardInfo['widget'].wcData;
      XML = atob(widgetList[0]['SCADAData']);
      EditorUi.prototype.open = function () { };
    } catch (err) {
      XMLexists = false;
      this.writeXmlToPage(EditorUi, this.noXmlPresent);
    }
    if (XMLexists) {
      this.documentElement = mxUtils.parseXml(XML).documentElement;
      this.writeXmlToPage(EditorUi, this.documentElement);
      const isGraphReady = setInterval(() => {
        if (this.graph && Object.keys(this.graph).length > 0) {
          clearInterval(isGraphReady);
          this.hasScadaLoaded = true;
          // v------ activate the listners for graph (modbus) ---v //
          this.graphHasUpdated.next(true);
          this.hasScadaLoaded = true;
        }
      },                               100);
    }
  }
  // v-----------fetch the UNIT_METADATA and UNIT_GET------------v //

  getUnitData(topicRequestJson, nodes, model) {
    this.unitMetaData = {
      filter: [
        {
          site_id: this._global.getCurrentUserSiteId,
        },
        {
          user_id: this._global.getCurrentUserId,
        },
      ],
    };

    this._appservice.getScadaUnitMetaData(this.unitMetaData).subscribe((factordata) => {
      if (factordata && factordata.status === 'success') {
        this.cellFactors = factordata['data'];
        this._appservice.getScadaUnits().subscribe((unitdata) => {
          if (unitdata && unitdata.status === 'success') {
            this.cellUnits = unitdata['data'];
            this.getTopicsForCells(topicRequestJson, nodes, model);
          } else {
            this._toastLoad.toast('error', 'Error', unitdata.message, true);
            this.cellFactors = null;
            this.cellUnits = null;
          }
        });
      } else {
        this._toastLoad.toast('error', 'Error', factordata.message, true);
        this.cellFactors = null;
      }
    });
  }
  // v---------set cell properties that were provided in the editor---------v //

  setCellProperty(_scada, XML ,propertyOnly) {
    this._scada = _scada;
    this.graphHasUpdated.next(true);
    this.graph = this._handleGraph.getGraphObject();
    this.documentElement = _scada.mxUtils.parseXml(XML).documentElement;
    this.SVG = this._handleGraph.graph.container.querySelector('svg');

    const topicRequestJson = {
      autoRefreshType: 'realTime',
      filter: {
        filtersData: [
          {
            id: 'devices',
            list: [],
            overwrite: true,
            title: 'Devices',
            type: 'multiCheckboxSelect',
            value: [],
          },
        ],
      },
      yaxis: [],
    };
    let requireTopic = false;
    const nodes = this.documentElement.getElementsByTagName('mxCell');
    this._handleGraph.graph['nodes'] = nodes;
    const model = this._handleGraph.graph.getModel();
    if (nodes && model) {
      for (let i = 0; i < nodes.length; i++) {
        const cell_id = nodes[i].getAttribute('id');
        const cell = model.getCell(cell_id);
        if (cell) {
          if (cell.devices && cell.tags) {
            requireTopic = true;
            topicRequestJson.filter.filtersData[0].value.push({
              checked: true,
              label: cell.devices,
              value: cell.devices,
            });
            topicRequestJson.yaxis.push({
              tag: {
                label: cell.tags.split(':')[0],
                type: 'tag',
                unit: {
                  label: cell.tags.split(':')[1],
                  value: cell.tags.split(':')[1],   // units
                },
                value: cell.tags.split(':')[0],   // tags
              },
            });
          }

          // v-------------setting default style to the cell for future use------------------v//
          const defaultStyle = {};
          let styleArray = cell.getStyle();
          if (styleArray) {
            styleArray = styleArray.split(';');
            for (let style = 0; style < styleArray.length; style++) {
              defaultStyle[styleArray[style].split('=')[0]] = styleArray[style].split('=')[1];
            }
            cell['defaultStyle'] = defaultStyle;
            cell.defaultStyle['display'] = 'block';
            cell.defaultStyle['text'] = ' ';
            cell.defaultStyle['geometry'] = cell.geometry;
            cell['isEdges'] = (this._handleGraph.graph.getModel().isEdge(cell));
            (cell.defaultStyle.shape == 'flexArrow') ? cell['flexArrow'] = true: null;
          }

          if(cell.configure && cell.configure.conditions.length > 0){
            var conditions = cell.configure.conditions
            for (const index in conditions){
              if(conditions[index].action.name == 'progress'){
                cell['configured'] = 'progress';
              }
            }
          }

          // Dynamic host and ip for the images
          if (cell.style && cell.style.includes('shape=image;') && cell.style.includes('image=')) {
            const left = cell.style.split('image=')[0];
            const center = this._sidebar.getHostIp(this._util.appMode);
            const right = cell.style.split('//')[1].split('/');
            right.shift();
            cell.style = `${left}image=${center}/${right.join('/')}`;
          }
        }
      }
    }

    // v----------get topic only if any cell is configured-------------v //
    if(!propertyOnly){
      if (requireTopic) {
        this.getUnitData(topicRequestJson, nodes, model);
      } else {
        this.disconnect();
      }
    }
  }

  // v----------get the topics for the devices and tags--------v //
  getTopicsForCells(input: Object, nodes: any, model?: any) {
    this.topicSubscribe = [];
    this.topicNodeData = {};
    this._appservice.getScadaTopics(input).subscribe((data) => {
      if (data && data.status === 'success') {
        const TopicsJSON = data.topics;
        const topicsArray = Object.keys(TopicsJSON);

        // v---------set the individual elements topics based on incoming device and tags---------v //
        for (let j = 0; j < topicsArray.length; j++) {
          const TopicKey = topicsArray[j];
          for (let i = 2; i < nodes.length; i++) {
            const cell_id = nodes[i].getAttribute('id');
            const cell = model.getCell(cell_id);
            if (
              nodes[i].getAttribute('devices') &&
              TopicKey.includes(nodes[i].getAttribute('devices'))
            ) {
              for (let k = 0; k < TopicsJSON[TopicKey].length; k++) {
                if (TopicsJSON[TopicKey][k].includes(nodes[i].getAttribute('tags').split(':')[0])) {
                  nodes[i].setAttribute('topics', topicsArray[j]);
                }
              }
            }
            if (cell && cell.hasOwnProperty('tags')) {
              const unit = cell.tags.split(':')[1];
              if (this.cellFactors && this.cellFactors[unit] !== undefined) {
                this.cellFactors[unit].forEach((element) => {
                  if (element.value === cell.converter) {
                    cell.factor = element.factor;
                  }
                });
              }
  
              // v-------set units for the cells-----------v //
              if (this.cellUnits && cell.hasOwnProperty('converter')) {
                this.cellUnits.forEach((elm) => {
                  if (elm.id === cell.converter) {
                    cell.units = elm.notation;
                  }
                });
              }
            }
            // v----------create the object that contains topic as key and cells as value--------------v //
            const tempTopic = nodes[i].getAttribute('topics');
            if (tempTopic !== '' && tempTopic !== null && !this.topicSubscribe.includes(tempTopic)) {
              this.topicSubscribe.push(tempTopic);
            }
            if (this.topicNodeData[tempTopic]) {
              this.topicNodeData[tempTopic].push(nodes[i]);
            } else {
              this.topicNodeData[tempTopic] = [];
              this.topicNodeData[tempTopic].push(nodes[i]);
            }
          }
        }
        try{
          this.setRealTimeRefresh();
        } catch(err){
          console.log(err);
        }
      } else {
        this._toastLoad.toast('error', 'Error', data.message, true);
      }
    });
  }

 // v---------set up mqtt for the real-time data that will be coming in--------v //
  setRealTimeRefresh() {
    if(this._mqttClient && this._mqttClient.connected){
      this.disconnect();
    }
    const host = Config.CONSTANTS.MQTT.ip;
    const port = Config.CONSTANTS.MQTT.port;
    const clientId = `mqttjs_${Math.random().toString(17).substr(2, 8)}`;
    this.mqttConnect(host, port, clientId);
  }

  mqttConnect(host, port,clientId) {
    // tslint:disable-next-line: no-this-assignment
    const _refObj = this;
    var mqttOptions = {};
    this._mqttClient = null;
    mqttOptions = {
      useSSL: Config.CONSTANTS.MQTT.useSSL,
      userName: Config.CONSTANTS.MQTT.userName,
      password: Config.CONSTANTS.MQTT.password,
      onFailure: _refObj.onFailed.bind(this),
      onSuccess: _refObj.onConnect.bind(this),
      keepAliveInterval:45
    };
      this._mqttClient = new Paho.MQTT.Client(host, Number(port), clientId);

      this._mqttClient.onMessageArrived = (message)=> {
        if(this._mqttClient.isConnected()){
          this.setCellsToUpdate(message.payloadString, message._getDestinationName());
        }
      };
     this._mqttClient.connect(mqttOptions);
  }

  private onConnect() {
    this._mqttClient.connected = true;
    if (this.topicSubscribe.length > 0) {
      for (let i = 0; i < this.topicSubscribe.length; i++) {
        this._mqttClient.subscribe(this.topicSubscribe[i]);
      }
    }
  }
  public disconnect(){
    if(this._mqttClient && this._mqttClient.connected){
      try {
        this._mqttClient.disconnect();
        this._mqttClient.connected = false;
      } catch(err) {
        // console.log(err);
      }
    }
  }

  private onFailed() {
    this._toastLoad.toast('error', 'Error', 'Unable to connect. Please try again later', true);
  }

 // v-----finally the message has arrived so do the necessary stuff to it----------v //
  setCellsToUpdate(payload, topic) {
    const mqttResponse = JSON.parse(payload);
    const model = this._handleGraph.graph.getModel();
    const changeNodes = this.topicNodeData[topic];
    for (let i = 0; i < changeNodes.length; i++) {
      const data = {};
      const cell = model.getCell(changeNodes[i].getAttribute('id'));

      data['cell_id'] = changeNodes[i];
      let tags;
      if (cell) {
        tags = cell.tags.split(':')[0];
      }
      let isShowValue;
      let isShowUnits;

     // v--------to verify showValue and showUnits---------v //
      if (cell && cell.hasOwnProperty('showValue') && cell.hasOwnProperty('showUnits')) {
        isShowValue = (cell.showValue === 0) ? false : true;
        isShowUnits = (cell.showUnits === 0) ? false : true;
      } else {
        isShowValue = true;
        isShowUnits = true;
      }

     // v----display units?-----v //
      if (!isShowUnits) {
        cell.units = '';
      }

      //--IF CELL DECIMAL GOES INTO NEGETIVE REGION MAKE IT '0'--//
      (cell.decimal && cell.decimal > 0 && cell.decimal < 100) ?
      cell.decimal = cell.decimal : cell.decimal = 0;

      if (mqttResponse.hasOwnProperty(tags) && !isNaN(mqttResponse[tags][1]) && mqttResponse[tags].length > 0 && isShowValue) {
        cell.value = '';
        data['value'] = `${(mqttResponse[tags][1] * (cell.factor ? cell.factor : 1)).toFixed(cell.decimal)} ${cell.units}`;
      } 
      const conditionsID = [];
      const styleUpdate = [];
      const styleRemove = [];
      const cellConfigure = cell.configure;
        if (mqttResponse && mqttResponse.hasOwnProperty(tags) && mqttResponse[tags].length > 0) {
        for (let j = 0; j < cellConfigure.conditions.length; j++) {
          // v------------check if change_to is in thsetPageZoome colorPicker----------v//
          if (this.colorPicker[cellConfigure.conditions[j].action.change_to]) {
            cellConfigure.conditions[j].action.change_to = this.colorPicker[cellConfigure.conditions[j].action.change_to].value;
          }

          (cellConfigure.conditions[j].action.name == 'progress') ? cellConfigure.conditions[j]['condition'] = 'progress' : null;

          let Gcondition = cellConfigure.conditions[j].condition;
        
          const action_name = cellConfigure.conditions[j].action.name;
          let action_value = cellConfigure.conditions[j].action.change_to;
          const mqtt_value = mqttResponse[tags][1];
        
          switch (Gcondition) {
            case '==':
              case '=':
              if (!conditionsID[action_name] && (mqtt_value === cellConfigure.conditions[j].value)) {
                // v------------set the style for the cell if the condition satifies------------v//
                this.updateStyleArray(styleUpdate, action_name, action_value);
                // v------------set object key value to set the priority---------------v//
                conditionsID[action_name] = Gcondition;
              } else if (!conditionsID[action_name]) {
                // v------------set default style to the cell if the condition is not satisfied---------v//
                this.updateStyleArray(styleRemove, action_name, action_value);
              }
              break;
            case '!=':
              if (!conditionsID[action_name] && (mqtt_value !== cellConfigure.conditions[j].value)) {
                // v------------set the style for the cell if the condition satifies------------v//
                this.updateStyleArray(styleUpdate, action_name, action_value);
                // v------------set object key value to set the priority---------------v//
                conditionsID[action_name] = Gcondition;
              } else if (!conditionsID[action_name]) {
                // v------------set default style to the cell if the condition is not satisfied---------v//
                this.updateStyleArray(styleRemove, action_name, action_value);
              }
              break;
            case '&ge;':
              if (!conditionsID[action_name] && (mqtt_value >= cellConfigure.conditions[j].value)) {
                // v------------set the style for the cell if the condition satifies------------v//
                this.updateStyleArray(styleUpdate, action_name, action_value);
                // v------------set object key value to set the priority---------------v//
                conditionsID[action_name] = Gcondition;
              } else if (!conditionsID[action_name]) {
                // v------------set default style to the cell if the condition is not satisfied---------v//
                this.updateStyleArray(styleRemove, action_name, action_value);
              }
              break;
            case '&le;':
              if (!conditionsID[action_name] && (mqtt_value <= cellConfigure.conditions[j].value)) {
                // v------------set the style for the cell if the condition satifies------------v//
                this.updateStyleArray(styleUpdate, action_name, action_value);
                // v------------set object key value to set the priority---------------v//
                conditionsID[action_name] = Gcondition;
              } else if (!conditionsID[action_name]) {
                // v------------set default style to the cell if the condition is not satisfied---------v//
                this.updateStyleArray(styleRemove, action_name, action_value);
              }
              break;
            case '&gt;':
              if (!conditionsID[action_name] && (mqtt_value > cellConfigure.conditions[j].value)) {
                // v------------set the style for the cell if the condition satifies------------v//
                this.updateStyleArray(styleUpdate, action_name, action_value);
                // v------------set object key value to set the priority---------------v//
                conditionsID[action_name] = Gcondition;
              } else if (!conditionsID[action_name]) {
                // v------------set default style to the cell if the condition is not satisfied---------v//
                this.updateStyleArray(styleRemove, action_name, action_value);
              }
              break;
            case '&lt;':
              if (!conditionsID[action_name] && (mqtt_value < cellConfigure.conditions[j].value)) {
                // v------------set the style for the cell if the condition satifies------------v//
                this.updateStyleArray(styleUpdate, action_name, action_value);
                // v------------set object key value to set the priority---------------v//
                conditionsID[action_name] = Gcondition;
              } else if (!conditionsID[action_name]) {
                // v------------set default style to the cell if the condition is not satisfied---------v//
                this.updateStyleArray(styleRemove, action_name, action_value);
              }
              break;
            case 'progress':
              if (cellConfigure.conditions[j].action.max < cellConfigure.conditions[j].action.min){
                let max = cellConfigure.conditions[j].action.max;
                cellConfigure.conditions[j].action.max = cellConfigure.conditions[j].action.min;
                cellConfigure.conditions[j].action.min = max;
              }
              if (!conditionsID[action_name] && ((mqtt_value >= cellConfigure.conditions[j].action.min) && (mqtt_value <= cellConfigure.conditions[j].action.max))) {
                // v------------set the style for the cell if the condition satifies------------v//
                cellConfigure.conditions[j].action.value = mqtt_value;
                cellConfigure.conditions[j].action.goBackToDefault = false;

                action_value = JSON.stringify(cellConfigure.conditions[j].action);
                this.updateStyleArray(styleUpdate, action_name, action_value);
                // v------------set object key value to set the priority---------------v//
                conditionsID[action_name] = Gcondition;
              } else if (!conditionsID[action_name]) {
                // v------------set default style to the cell if the condition is not satisfied---------v//
                // cellConfigure.conditions[j].action.value = mqtt_value;
                cellConfigure.conditions[j].action.goBackToDefault = true;

                action_value = JSON.stringify(cellConfigure.conditions[j].action);
                this.updateStyleArray(styleUpdate, action_name, action_value);
              }
              break;
          }
        }
        }
        data['styles'] = {
          update: styleUpdate,
          remove: styleRemove,
        };
        this.cellsToUpdate.next(data);
      }
  }
   // Method to return (an observable) on which cell to update
  getPreviewCells() {
    return this.cellsToUpdate.asObservable();
  }

  // Method to return (an observable) when graph has updated
  getGraphState() {
    return this.graphHasUpdated.asObservable();
  }

  getKeyByValue(object, value) {
    for (const prop in object) {
      if (object.hasOwnProperty(prop)) {
        if (object[prop] === value) {
          return prop;
        }
      }
    }
  }

  updateStyleArray(array: String[], action: String, value: String) {
    array.push(`${action}=${value}`);
  }

  // v-----------set cell style both default and conditional-------------v //
  setCellStyle(style, value, cell, currentValue?, updateRequired?) {
    if (style == 'display' || style == 'text' || style == 'progress'){
      this.setCustomStyles(style, value, cell, currentValue, updateRequired);     
    } else {
      let styleValue;
      if (style === 'rotation' && cell.defaultStyle[style]) {
        // tslint:disable-next-line: radix
        styleValue = parseInt(cell.defaultStyle[style]) + parseInt(value);
      } else {
        styleValue = value;
      }
      if (cell && style) {
        return this._handleGraph.graph.setCellStyles(style, styleValue, [cell]);
      }
    }
  }

  // new style additions that are not available by default in Jgraph is added here.
  setCustomStyles(style, value, cell, currentValue?, updateRequired?): void{
    switch(style){
      case 'display':
        var group = this.SVG.getElementById(cell.id);
        group.style[style] = value;
    
        if(value == 'none'){
          this._handleGraph.graph.model.setValue(cell, '');
        }
        break;
      case 'text':
        if(currentValue && value){
          this._handleGraph.graph.model.setValue(cell, cell.value + " " + value);
        } else if(value){
          this._handleGraph.graph.model.setValue(cell, value);
        }
        break;
      case 'progress':
        var group = this.SVG.getElementById(cell.id);
        this.setCellProgress(group, value, cell);
        break;
    }
  }

  setCellProgress(groups, value, cell){
  var cellState = this._handleGraph.graph.view.getCellStates([cell])[0];
    var settings = JSON.parse(value);

    var heightPer = this.calcPercentage(settings,cell);
    if(cellState){
      cellState['progress'] =
      {
        enabled : true,
        settings: settings,
        percentage : heightPer
      }
      if(cell.hasOwnProperty('isEdges') && cell['isEdges'] && !cell.defaultStyle.hasOwnProperty('shape')){
        if(settings.direction == 'west'){
          (cell.hasOwnProperty('turned')) ? null : 
          this.reverseCellOnRTL(groups, value, cell);
        }
        this.pathPercentage(groups, heightPer, cellState)
      } else {
        this._scada.mxCellRenderer.prototype.redraw(cellState, true, true);
      }
    }
  }

  pathPercentage(group, heightPer, cellState){
    var path = group.querySelectorAll('path')[1];
    var pathHead = group.querySelectorAll('path')[2];
    var pathHead2 = group.querySelectorAll('path')[3];
    if (path){
      var length = path.getTotalLength();
      cellState.cell['edgeProgress'] = {
        dasharray : length,
        dashOffset : length - (heightPer * length) / 100,
      }

      if(pathHead2){
        pathHead.style.display = 'none';
        if(heightPer < 100 && pathHead2){
          pathHead2.style.display = 'none';
          cellState.cell['edgeProgress'].display = 'none';
        } else if(pathHead2) {
          setTimeout(()=>{
            pathHead2.style.display = 'block';
            cellState.cell['edgeProgress'].display = 'block';
          },500)
        }
      } else {
        if(heightPer < 100 && pathHead){
          pathHead.style.display = 'none';
          cellState.cell['edgeProgress'].display = 'none';
        } else if(pathHead) {
          setTimeout(()=>{
            pathHead.style.display = 'block';
            cellState.cell['edgeProgress'].display = 'block';
          },500)
        }
      }
      

      path.style.transition = '0.5s ease-out'
      path.setAttribute('stroke-dasharray', cellState.cell.edgeProgress.dasharray)
      path.setAttribute('stroke-dashoffset', cellState.cell.edgeProgress.dashOffset);
    }
  }

  reverseCellOnRTL(groups, value, cell): void{
    this._handleGraph.graph.turnShapes([cell], true)
    cell['turned'] = true;
  }

  calcPercentage(value,cell){
    var min = value.min;
    var max = value.max;
    var incoming = value.value;

    if(!value.goBackToDefault){
      return ((incoming - min) * 100) / (max - min)
    } else {
      if (incoming <= min){
        return 0;
      } else {
        return cell.defaultStyle.geometry[value.dimension];
      }
    }  
  }

  // v----------reset graph styles----------v //
  setPageZoom() {
    // v-------to set the scale of the graph if it is configured-----v //
    (this._handleGraph.graph.scaleToTranslate !== undefined) ? this.scaleToTranslate = this._handleGraph.graph.scaleToTranslate : this.scaleToTranslate = 1 ;
    this._handleGraph.graph.view.scaleAndTranslate(this.scaleToTranslate);

    var svg = this._handleGraph.graph.container.querySelector('svg');
    this._handleGraph.graph.container.scrollTop = svg.clientHeight/4;
    this._handleGraph.graph.container.scrollLeft = svg.clientWidth/4;
  }

  zoomOut() {
    return this._handleGraph.graph.zoomOut();
  }

  // v---------write the xml onto the graph--------v//
  writeXmlToPage(EditorUi, XML) {
    EditorUi.prototype.open = function () {
      try {
        const doc = XML;
        this.editor.setGraphXml(doc);
        this.editor.setModified(false);
        return;
      } catch (e) {
        console.log('error');
      }
    };
  }

  getCurrentOffset(x, y){
    const offsetType = {}
    var windowHeight = window.innerHeight;
    var windowWidth = window.innerWidth;
    if((windowHeight - x) < 300){
      offsetType['height'] = true;
    }
    if((windowWidth - y) < 350){
      offsetType['width'] = true;
    }
    return offsetType;
  }
  setContextMenu(topCoord, leftCoord): void {
    let isPinned = document.body.classList.contains('pin-sidebar');
    var top = topCoord;
    var left = leftCoord;
    let subMenuLeft = 199;
    let submenuTop = 78;
    let offset = this.getCurrentOffset(top , left);
    this.subMenuContentsLeft = subMenuLeft;
    this.subMenuContentsTop = submenuTop;
    if(isPinned){
      top = topCoord - 48;
      left = leftCoord - 50;
      this.contextMenuTop = top;
      this.contextMenuLeft = left;
      if(offset.hasOwnProperty('height') && offset.hasOwnProperty('width')){
        this.contextMenuTop = top - 160;
        this.contextMenuLeft = left - 220;
        this.subMenuContentsLeft = -(subMenuLeft);
        this.subMenuContentsTop = submenuTop;
      } else {
        if(offset.hasOwnProperty('height')){
          this.contextMenuTop = top - 160;
          this.contextMenuLeft = left;
        }
        if(offset.hasOwnProperty('width')){
          this.contextMenuTop = top;
          this.contextMenuLeft = left - 200;
          this.subMenuContentsLeft = -(subMenuLeft);
          this.subMenuContentsTop = submenuTop;
        }
      }
    } else {
      top = topCoord - 48;
      left = leftCoord - 70;
      this.contextMenuTop = top;
      this.contextMenuLeft = left;
      if(offset.hasOwnProperty('height') && offset.hasOwnProperty('width')){
        this.contextMenuTop = top - 160;
        this.contextMenuLeft = left - 205;
        this.subMenuContentsLeft = -(subMenuLeft);
        this.subMenuContentsTop = submenuTop;
      } else {
        if(offset.hasOwnProperty('height')){
          this.contextMenuTop = top - 160;
          this.contextMenuLeft = left;
        }
        if(offset.hasOwnProperty('width')){
          this.contextMenuTop = top;
          this.contextMenuLeft = left - 205;
          this.subMenuContentsLeft = -(subMenuLeft);
          this.subMenuContentsTop = submenuTop;
        }
      }
    }
  }


  triggerAction () {
    let objGet = {
      "asset_action_id": this.action_id,
      "type": 'scada'
    };
    this._appservice.triggerAssetControlData(objGet).subscribe((triggerResponse) => {
      if (triggerResponse['status'] === 'success') {
        this._toastLoad.toast('success', 'Success', 'Action Triggered Successfully', true);
      }
      else {
        this._toastLoad.toast('error', 'Error', 'Action Couldn`t Be Triggered', true);
      }
    }, (err) => {
      this._toastLoad.toast('error', 'Error', 'Failed To Reach Server', true);
    });
  }

  openTriggerPopup() {
    (this.hasSubbed) ? this.hasSubbed.unsubscribe(): null;
    this.initiateTriggerCountDown();
    document.getElementById('contextTrigger').click();
  }

  initiateTriggerCountDown() {
   this.countDown = 10;
   this.hasSubbed = this.numbers.subscribe(x => {
     if (this.countDown >= 1) {
      this.countDown--;
     } else {
       this.hasSubbed.unsubscribe();
       try{
         const trigger_btn = document.getElementById("dismissTriggerModal");
         const triggerModal = document.getElementById('actionTrigger');
         (triggerModal && triggerModal.classList.contains('show') && trigger_btn) ?
          trigger_btn.click() : null;
       } catch(err){
        console.log(err);
       }
     }
   });
  }

  getMetaData(){
    const requestPayload = {"fetch_meta_data_by":["devices","tags"],"filter":[{"site_id":this._global.getCurrentUserSiteId},{"user_id":this._global.getCurrentUserId}]}
    this._appservice.getChartConfigMetaData(requestPayload).subscribe((res)=>{
      if(res.status = 'success'){
        if(res.hasOwnProperty('data') && res['data'].hasOwnProperty('devices') && res['data'].hasOwnProperty('tags')){
          this.setMetaData(res.data);
        }
      }
    })
  }

  setMetaData(data) {
    for(const asset of data.devices){
      this.devices[asset.value] = asset.label;
    }
    data.tags.forEach(tag => {
      this.tags[tag.value] = tag.label;
    });
    if(this.cellUnits){
      this.cellUnits.forEach(element => {
        this.units[element.id] = element.name;
      });
    }
  }
}


