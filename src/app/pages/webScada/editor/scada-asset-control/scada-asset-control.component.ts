import { Component, ElementRef, Input, OnInit, ViewChild } from '@angular/core';
import { globals } from '../../../../../../src/app/utilities/globals';
import { ToastrService } from '../../../../../../src/app/components/toastr/toastr.service';
import { AppService } from '../../../../../../src/app/services/app.service';
import { HandleGraphService } from '../editor-services/handle-graph.service';
import { SidebarService } from '../editor-services/sidebar.service';

@Component({
  selector: 'kl-scada-asset-control',
  templateUrl: './scada-asset-control.component.html',
  styleUrls: ['./scada-asset-control.component.scss','../scada-live-configuration/scada-live-configuration.component.scss']
})
export class ScadaAssetControlComponent implements OnInit {

  constructor(private _app: AppService,
              private _toaster: ToastrService,
              private _global:globals,
              private _sidebar:SidebarService,
              private _graph:HandleGraphService) { }

  @Input() isPopupOpened;
  @ViewChild('closeModal') closeModal: ElementRef;

  public currentState = "Create";
  public devicesMeta = [];
  public tagsMeta = [];
  public isDevicesLoading = false;
  public isTagsLoading = false;

  public elementsName;
  public _defaultTag;
  public control_enabled = true;

  public actions = [];
  public actionRaw = {
    action_label:'',
    assets:[],
    tags:[],
    write_value:'',
  }

  public savingAssetControl = false;

  multiselectSettings = {
    primaryKey: 'value',
    labelKey: 'label',
    singleSelection: false,
    text: "Select",
    selectAllText: 'Select All',
    unSelectAllText: 'Deselect All',
    enableCheckAll: true,
    enableSearchFilter: true,
    enableFilterSelectAll: true,
    lazyLoading: true,
    noDataLabel: 'No items found',
    badgeShowLimit: 1,
    filterSelectAllText: "Select Filtered",
    filterUnSelectAllText: "Unselect Filtered",
    maxHeight: 220,
    searchAutofocus: false,
    // position: 'bottom',
     autoPosition: true,
  }

  public currentCell;
  public actionID;

  ngOnInit() {}

  ngOnChanges() {
    if (this.isPopupOpened) {
      this.currentState = "Create";
      this.actions = [];
      this.elementsName = '';
      this.actionID = '';
      this.control_enabled = true;
      this.getMetaData();
      var graph = this._graph.getGraphObject();
      if (graph && graph.hasOwnProperty("CELL")) {
        this.currentCell = graph.CELL;
        if (this.currentCell.hasOwnProperty('cellName')) {
          if(this.currentCell.cellName !== 'el_'+this.currentCell.id){
            this.elementsName = this.currentCell.cellName;
          }
        }
        if(this.currentCell.hasOwnProperty('asset_control')){
          this.setDefaultValues(graph.CELL);
        } else {
          this.addRows();
        }
      }
    }
  }

  setDefaultValues(CELL):void {
    this.currentState = 'Edit';
    this.control_enabled = CELL.asset_control.isEnabled
    this.actionID = CELL.asset_control.action_id;
    this.fetchSavedActionFromId();
  }

  fetchSavedActionFromId(): void {
    this._app.editAssetControlData({
      asset_action_id: this.actionID,
      type: 'scada'
    }).subscribe((resp)=>{
      if(resp.hasOwnProperty('actions') && resp.actions.length !== 0){
        this.actions = resp.actions;
      } else {
        this._toaster.toast('error', 'Error', "Failed to retrieve action, Please try again later.", true);
      }
      this.isDevicesLoading = false;
    }, (err) => {
      this.isDevicesLoading = false;
      this._toaster.toast('error', 'Error', "Unable to reach server, Please try again later.", true);
    })
  }

  getMetaData():void{
    this.isDevicesLoading = true;
    this._app.getChartConfigMetaData({
      fetch_meta_data_by:['devices','tags'],
      cType:'modbus_write_widget',
      filter:[
        { site_id:this._global.getCurrentUserSiteId() },
        { user_id:this._global.getCurrentUserClientId() }
      ]
    }).subscribe((resp)=>{
      if(resp.status == 'success'){
        this.devicesMeta = resp.data.devices;
        this.tagsMeta = resp.data.tags;
      } else {
        this._toaster.toast('error', 'Error', 'Failed to retrieve Assets and Tags, Please try again later.', true);
      }
      this.isDevicesLoading = false;
    }, (err) => {
      this.isDevicesLoading = false;
      this._toaster.toast('error', 'Error', 'Unable to reach server, Please try again later.', true);
    })
  }

  deleteRow(index):void{
    this.actions.splice(index, 1);
  }

  addRows():void{
    this.actions.push({
      action_label:'',
      assets:[],
      tags:[],
      write_value:'',
    })
  }

  saveAssetControl(): void {
    if (!this.elementsName) {
      this._toaster.toast('error', 'Error', 'Please enter elements name', true);
      return;
    }
    var valid = this.validateEmptyFields();

    if (!valid) {
      this._toaster.toast('error', 'Error', 'All fields are mandatory', true);
      return;
    }
    if(this.savingAssetControl){
      return;
    } else {
      this.savingAssetControl = true;
    }

    var payload = {
      action_name : this.elementsName,
      actions : this.actions,
      description:'description empty',
      labels:[],
      schedule:{
        schedule:false
      },
      type:'scada'
    };
    (this.actionID) ? payload['asset_action_id'] = this.actionID : null;
    this._app.saveAssetControlConfig(payload).subscribe((resp)=>{
      if(resp.status == 'success'){
        this._toaster.toast('success', 'Success', resp.message, true);
        this.actionID = resp.asset_action_id;
        this._graph.graph.CELL['cellName'] = this.elementsName;
        this._graph.graph.CELL['asset_control'] = {
          isEnabled :  this.control_enabled,
          action_id: this.actionID,
          name:this.elementsName,
          action_name:this.elementsName
        };
        (this._graph.graph['clickSource'].querySelector('title')) ? this._graph.graph['clickSource'].querySelector('title').innerHTML = this.elementsName : this._graph.graph['clickSource'].title = this.elementsName;
        this._sidebar.Scada._editorUi.editor.setModified(true);
        this.closeModal.nativeElement.click();
      } else {
        this._toaster.toast('error', 'Error', "Failed to save, Please try again later.", true);
      }
      this.savingAssetControl = false;
    }, (err)=>{
      this.savingAssetControl = false;
      this._toaster.toast('error', 'Error', 'Unable to reach server, Please try again later.', true);
    })
  }

  /**
   * Angular 2 multiselect clear does not automatically clear the input field
   * and has to be done manually.
   * @param event current value of the form field
   * @param index current index from which the item is cleared
   * @param key the key to access the array
   */
  onDeSelectAll(event, index, key): void{
    this.actions[index][key] = event;
  }

  validateEmptyFields(){
    for(const action of this.actions){
      if(action.assets.length == 0 || action.tags.length == 0 || !action.action_label){
        return false
      }
      if(action.tags.length == 1 && action.tags[0].value === 'tag_1473' && !action.write_value){
        action.write_value = '';
      } else if(!action.write_value){
        return false;
      }
    }
      return true;
  }
}
