import { Component, ElementRef, Input, OnInit, ViewChild } from '@angular/core';
import { globals } from '../../../../../../src/app/utilities/globals';
import { ToastrService } from '../../../../../../src/app/components/toastr/toastr.service';
import { AuthService } from '../../../../../../src/app/pages/auth/auth.service';
import { AppService } from '../../../../../../src/app/services/app.service';
import { EditorUiService } from '../editor-services/editor-ui.service';
import { HandleGraphService } from '../editor-services/handle-graph.service';
import { SidebarService } from '../editor-services/sidebar.service';
import { UtilityFunctions } from '../../../../../../src/app/utilities/utility-func';
import { WebscadaService } from '../../webscada.service';

@Component({
  selector: 'kl-scada-live-configuration',
  templateUrl: './scada-live-configuration.component.html',
  styleUrls: ['./scada-live-configuration.component.scss']
})
export class ScadaLiveConfigurationComponent implements OnInit {

  constructor(private _app: AppService,
              private _toaster: ToastrService,
              private _auth: AuthService,
              private _global: globals,
              private _sidebar: SidebarService,
              private _editor: EditorUiService,
              private _util: UtilityFunctions,
              private _webScada: WebscadaService,
              private _graph: HandleGraphService) { }
              
  @Input() isPopupOpened;
  @ViewChild('closeModal') closeModal: ElementRef;
  @ViewChild('tableBody') tableBody: ElementRef;
  
  public currentState = "Loading..";
  public devicesMeta = [];
  public tagsMeta = [];
  public unitsMeta = [];
  public isGetMetaLoading = false;
  public isUnitLoading = false;

  public _defaultDevice;
  public _defaultTag;
  public _defaultUnit;
  public restrictDecimal = 2;
  public currentCell;

  public showValue = true;
  public showUnits = true;

  public elementsName;
  public operators;
  public actions = [];
  public currentCellType;
  public scadaColors = [];
  scadaColorsMeta = {};
  public test;
  public currentaction = 'fillColor';

  public conditonsMeta = {
    action:{
      name:'',
      change_to:''
    },
    condition:'',
    value:''
  }
  hexReference = {};
  conditions = [];
  public imagePickerImages;
  public cellType;
  ngOnInit() {
    this.getOperators();
    this.getScadaColors();
  }
  
  ngOnChanges(){
    if(this.isPopupOpened){
      this.currentState = 'Loading..'
      this.restrictDecimal = 2;
      this.showUnits = true;
      this.showValue = true;
      this.getMetaData();
    }
  }


  setCellProperties(){
    this.imagePickerImages = [];
    (this._sidebar.uploaded_images.length !== 0) ?
    this.imagePickerImages = this.imagePickerImages.concat(this._sidebar.uploaded_images) : null;
    (this._sidebar.default_images.length !== 0) ?
    this.imagePickerImages = this.imagePickerImages.concat(this._sidebar.default_images) : null;

    this.conditions = [];
    this.elementsName = '';
    var graph = this._graph.getGraphObject();
    if (graph && graph.hasOwnProperty("CELL")) {
      this.currentCell = graph.CELL;

      if(this.currentCell.hasOwnProperty('configure') && this.currentCell.configure.hasOwnProperty('conditions') && this.currentCell.configure.conditions.length > 0) {
        var conditions = this.currentCell.configure.conditions;
        this.setCellConditions(conditions);
      }
      if (graph.CELL.hasOwnProperty('cellName')) {
        if(graph.CELL.cellName !== 'el_'+graph.CELL.id){
          this.elementsName = graph.CELL.cellName;
        }
      }
      this.currentCellType = graph.getModel().isEdge(graph.CELL);
      this.setActionFromCellType();

      if (graph.CELL.devices && graph.CELL.tags) {
        this.setDefaultValues(graph.CELL);
      } else if (this._defaultDevice && this._defaultDevice.length > 0) {
        this.currentState = "Create";
        this._defaultDevice = this.devicesMeta[0].value;
        this._defaultTag = this.tagsMeta[0];
        if (this._defaultTag.unit && this._defaultTag.unit.length) {
          this._defaultUnit = this._defaultTag.unit[0].value;
        } else {
          this._defaultUnit = this._defaultTag.unit.value;
        }
      }
    }
  }

  setCellConditions(conditions): void {
    for(const condition of conditions){
      let configured = {
        action:{
          name:'',
          change_to:''
        },
        condition:'',
        value:''
      }
      configured.action.name = condition.action.name;
      if(this.hexReference[condition.action.change_to]) {
        configured.action.change_to = this.hexReference[condition.action.change_to]
      } else {
        configured.action.change_to = condition.action.change_to;
        const unknownColor =  condition.action.change_to;
        this.scadaColors.push({
          value : unknownColor,
          reference : unknownColor,
          label: unknownColor
        })
        this.hexReference[unknownColor] = unknownColor;
      }
      
      configured.condition = (condition.condition) ? condition.condition : this.operators[0].value;
      configured.value = condition.value;
      //--- if configured is progress need more action params ---//
      if(condition.action.name == 'progress'){
        configured.action['direction'] = condition.action.direction;
        configured.action['max'] = condition.action.max;
        configured.action['min'] = condition.action.min;
      }

      this.conditions.push(configured);
    }
  }

  getScadaColors(): void{
    this.scadaColors =  this._global._appConfigurations.scadaColors;
    for(const colors of this.scadaColors){
      this.scadaColorsMeta[colors['reference']] = colors['value'];

      this.hexReference[colors.value] = colors.reference;
      this.hexReference[colors.reference] = colors.reference;
    }
  }

  addConditions(): void{
    this.conditions.push({
      action:{
        name: (this.cellType == 'edge') ? 'strokeColor' : (this.cellType == 'image') ? 'imageBackground' : 'fillColor',
        change_to: this.scadaColors[0].reference,
      },
      condition:'==',
      value:''
    });
    this.updateActionName(this.conditions.length - 1, this.conditions[this.conditions.length - 1].action.name)
  }

  getOperators(): void{
    this.operators = this._graph.operators;
  }

  updateActionName(index, name){
    let progress = 0;

    this.conditions[index].action = {
      name : this.conditions[index].action.name,
      change_to : this.conditions[index].action.change_to,
    };

    for (const condition of  this.conditions) {
      if (condition.action.name === 'progress') {
        progress++;
        if (progress > 1) {
          this._toaster.toast('info', '', 'There can only be one progress action in the conditions list', true);
          name = (this.cellType == 'edge') ? 'strokeColor' : (this.cellType == 'image') ? 'imageBackground' : 'fillColor';
          this.conditions[index].action.name = name;
        }
      }
    }

    switch(name){
      case 'fillColor':
        case 'strokeColor':
          case 'imageBackground':
            case 'labelBackgroundColor':
              case 'fontColor':
                case 'gradientColor':
                  this.conditions[index].action.change_to = this.scadaColors[0].reference;
                  break;
      case 'display':
        this.conditions[index].action.change_to = 'show';
        break;
      case 'rotation':
        case 'fontSize':
          case 'text':
            this.conditions[index].action.change_to = '';
            break;
      case 'image':
        this.conditions[index].action.change_to = this._sidebar.getHostIp(this._util.appMode) + this.imagePickerImages[0].value;
        break;
      case 'progress':
        this.conditions[index].action.change_to = 'direction';
        this.conditions[index].action.direction = 'south';
        this.conditions[index].action.min = '';
        this.conditions[index].action.max = '';
    }
  }

  setActionFromCellType():void{
    if (this.currentCellType){ // isEdge is true == shape is a line
      this.actions = this._graph.isEdge;
      this.cellType = 'edge';
    } else if(!this.currentCellType && this.currentCell.style.includes('shape=image;')) { // its and shape + image
      this.actions = this._graph.isImage;
      this.cellType = 'image';
    } else { // its a shape
      this.actions = this._graph.isCell;
      this.cellType = 'shape';
    }
  }

  setDefaultValues(CELL):void {
    this.currentState = 'Edit';

    this._defaultDevice = CELL.devices;
    var requiredTag = CELL.tags.split(':');
    this._defaultTag = (this.tagsMeta.filter(tags => tags.value == requiredTag[0]))[0];
    this._defaultUnit = CELL.converter;
    this.restrictDecimal = CELL.decimal;

    (CELL.hasOwnProperty('showValue')) ? this.showValue = CELL.showValue : this.showValue = true;
    (CELL.hasOwnProperty('showUnits')) ? this.showUnits = CELL.showUnits : this.showUnits = true;
  }

  getMetaData():void {
    this.isGetMetaLoading = true;
    this._app.getChartConfigMetaData(
      {
        fetch_meta_data_by: ["devices","tags"],
        filter: [{ 
            site_id:this._auth.getCurrentUserSiteId()
          },{
            user_id:this._auth.serviceUserId()
          }
        ]
      }
    ).subscribe((resp)=>{
      if(resp.status == 'success'){
        this.devicesMeta = resp.data.devices;
        this.tagsMeta = resp.data.tags;
        this._defaultDevice = this.devicesMeta[0].value;
        this._webScada.setMetaData(resp.data);
      } else {
        this._toaster.toast('error', 'Error', "Failed to retrieve Assets and Tags, Please try again later.", true);
      }
      this.setCellProperties();
      this.getUnitMetaData();
      this.isGetMetaLoading = false;
    }, (err) => {
      this.isGetMetaLoading = false;
      this._toaster.toast('error', 'Error', 'Unable to reach server, Please try again later.', true);
    })
  }

  getUnitMetaData():void{
    this.isUnitLoading = true;
    this._app.getChartUnitMetaData(
      {
        filter: [{ 
            site_id:this._auth.getCurrentUserSiteId()
          },{
            user_id:this._auth.serviceUserId()
          }
        ]
      }
    ).subscribe((resp)=>{
      if(resp.status == 'success'){
        this.unitsMeta = resp.data;
        if (this.currentCell && this.currentCell.devices) {
          var unit = this.currentCell.tags.split(':')[1];
          let unitsKey = Object.keys(this.unitsMeta);
          for (const key of unitsKey) {
            if (!this._defaultUnit.length) {
              (unit) ?
              this._defaultUnit = this.unitsMeta[key].filter(units => units.value == unit).value:
              null;
            }
          }
        }
        this.getUnits();
      } else {
        this._toaster.toast('error', 'Error', 'Unable to retrieve units, Please try again later.', true);
      }
      this.isUnitLoading = false;
    }, (err) => {
      this.isUnitLoading = false;
      this._toaster.toast('error', 'Error', 'Unable to reach server, Please try again later.', true);
    })
  }

  getUnits(){
    if(!this.tagsMeta || !this.unitsMeta){
      return;
    }
    var defaultTemp;
    (!this._defaultTag) ? defaultTemp = this.tagsMeta[0]: defaultTemp = this._defaultTag;
    if (defaultTemp && defaultTemp.unit) {
      if (!Array.isArray(defaultTemp.unit)) {
        var requiredUnit = defaultTemp.unit.value;
        defaultTemp.unit = [defaultTemp.unit];
        if (this.unitsMeta[requiredUnit]) {
          for (let factor of this.unitsMeta[requiredUnit]) {
            defaultTemp.unit.push(factor);
          }
        }
      }
      const isPresent = this.isDefaultTagPresent(this._defaultUnit, defaultTemp.unit);
      (isPresent) ? this._defaultUnit = defaultTemp.unit[isPresent].value : this._defaultUnit = defaultTemp.unit[0].value;
      this._defaultTag = defaultTemp;
      return this._defaultTag.unit;
    }

  }

  /**
   * loops through the array and returns the index where its present else returns false
   * @param tag 
   * @param array 
   */
  isDefaultTagPresent(tag, array): any{
    let length = array.length;
    // loop through the array and return the index
    while(length--) {
      if (array[length]['value'] == tag) {
        return length;
      }
    }
    return false;
  }

  closeDialog(){
    this._editor.toggleLiveData();
  }

  public isShowUnitsEnabled = true;
  isShowUnitEnabled():void{
    if (this.showValue) {
      this.isShowUnitsEnabled = false
      this.showUnits = false;
    } else {
      this.isShowUnitsEnabled = true;
      this.showUnits = true;
    }
  }

  deleteRow(index):void{
    this.conditions.splice(index, 1);
  }

  saveCurrentSettings() :void{
    if (!this.elementsName) {
      this._toaster.toast('error', 'Error', 'Please enter elements name', true);
      return;
    }

    if(this.restrictDecimal && this.restrictDecimal < 0){
      this._toaster.toast('error', 'Error', 'Restrict to decimal cannot be a negative value.', true);
      return;
    }

    var validations = this.validateConditions();
    if (!validations['isValid']) {
      this._toaster.toast('error', 'Error', validations['message'], true);
      return;
    }

    try {
      this._graph.graph.CELL['cellName'] = this.elementsName;
      this._graph.graph.CELL['devices'] = this._defaultDevice;
      this._graph.graph.CELL['units'] = this._defaultTag.label;
      this._graph.graph.CELL['converter'] = this._defaultUnit;
      this._graph.graph.CELL['tags'] = this._defaultTag.value + ":" + this._defaultTag.unit[0].value;
      this._graph.graph.CELL['decimal'] = (!this.restrictDecimal) ? 0: this.restrictDecimal;
      this._graph.graph.CELL['showValue'] = this.showValue;
      this._graph.graph.CELL['showUnits'] = this.showUnits;
      this._graph.graph.CELL['configure'] = {};
      this._graph.graph.CELL['configure']['conditions'] = this.conditions;

      (this._graph.graph['clickSource'].querySelector('title')) ? this._graph.graph['clickSource'].querySelector('title').innerHTML = this.elementsName : this._graph.graph['clickSource'].title = this.elementsName;
      
      this._sidebar.Scada._editorUi.editor.setModified(true)
    } catch(err){
      console.log(err);
    }
    this.closeModal.nativeElement.click();
  }

  validateConditions() : object {
    var validator = {
      isValid : true,
      message: 'All fields are mandatory'
    }
    if(this.conditions.length !== 0){
      for(const row of this.conditions){
        if(row.action.name == 'progress' && !row.value){
        } else if(!row.value && row.value !== 0){
          return {
            isValid : false,
            message: 'All fields are mandatory'
          }
        }
      var keys = Object.keys(row.action)
        for (const key of keys) {
          if (!row.action[key] && row.action[key] !== 0) {
            return {
              isValid :false,
              message:'All fields are mandatory'
            }
          }
        }
      }
      return validator;
    }
    return validator;
  }

  moveItems(mover, movee): void {
    const movableTo = this.conditions[movee];
    this.conditions[movee] = this.conditions[mover];
    this.conditions[mover] = movableTo;
  }
}
