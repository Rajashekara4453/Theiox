import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { DataSharingService } from '../../../services/data-sharing.service';
import { Observable } from 'rxjs/Observable';
import { WdgShowService } from './wdg-show/wdg-show.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'kl-widget-manager',
  templateUrl: './widget-manager.component.html',
  styleUrls: ['./widget-manager.component.scss']
})
export class WidgetManagerComponent implements OnInit {
  @Input() dWidgets: any; // to get the complete widget data
  @Input() dashboardInfo: any; // to get dashboard informations like dashboard name, dashboard id, type, isOwner etc
  @Input() showDashboardFilter: any = false; // for show or not dashboard filter
  @Input() createWidgetEvent: Observable<void>; // create widget data
  @Input() startRezingWidget: Observable<void>;
  @Output() closeDashboradFilterEmitter: EventEmitter<any> = new EventEmitter<any>(); // output emitter for emitting dashboard filter show or not flag
  @Output('wdgManagerEmitter') wdgManagerEmitter = new EventEmitter(); // for emitting widget config data to save
  @Output('wdgManagerResizeEmitter') wdgManagerResizeEmitter = new EventEmitter();
  @Output() deleteWidgetEmitter: EventEmitter<any> = new EventEmitter<any>();
  public resizeWidgetLevelSubject={};
  @Output() saveResizeConfigEmitter: EventEmitter<any> = new EventEmitter<any>();
  public filteredData = []; // to store dashboard filter data

  public dWidgetsLoading: Boolean = false; // flag for setting widget loading completed or not
  public wcType: String = ''; // for saving widget type
  public showWdgConfig: Boolean = false; // flag for showing widget configurtaion page or not
  public editWidgetData: any; // to store widget data for editing configuration
  subscriptionInstance: Subscription;

  constructor(private _dataSharing:DataSharingService,private _wdgShow:WdgShowService) { }

  ngOnInit() {
    this.dWidgetsLoading = false;
    this.wcType = this.dWidgets['wcType'];
    this.dWidgetsLoading = true;
    this.createWidgetEvent.subscribe((str) => {
      this.createNewWidgetAction(str);
    });
    this.startRezingWidget.subscribe((resize) => this.resizeWidgetAction(resize));
  }

  ngOnChanges() {
    this.dWidgetsLoading = false;
    this.wcType = this.dWidgets['wcType'];
    this.dWidgetsLoading = true;
    if(this.dWidgets['wcData']){
      this._dataSharing.dashboardWidgetCount(this.dWidgets['wcData'].length);
    }
   this.addClassForDatePopup();
    }

  ngOnDestroy() {
    this.dWidgetsLoading = false;
    this.dWidgets = undefined;
    this.subscriptionInstance.unsubscribe();
  }

  /**
   * For closing dashboard filter
   * @param data data passed for dashboard filter
   */
  closeDashboardFilter(data) {
    this.closeDashboradFilterEmitter.emit(false);
  }

  /**
   * Method for updating dashboard filter data
   * @param data data from dashboard filter
   */
  updateFilterData(data) {
    this.filteredData = data;
  }

  /**
   * Event emitted from dashboard filter for performing some actions
   * @param event emitted data
   */
  filterActions(event) {
    if (!event || !event.action) {
      return
    }
    switch (event.action) {
      case 'close': this.closeDashboardFilter(event.data); break;
      case 'filterChange': this.updateFilterData(event.data); break;
    }
  }

  /**
   * For opening a widget config page for configuring a new widget
   * @param actionKey 
   */
  createNewWidgetAction(actionKey) {
    try {
      if (!actionKey || actionKey !== 'createNewWidget') {
        return false;
      }
      this.editWidgetData = undefined;
      this.showWdgConfig = true;
    } catch(error) {
      console.log(error);
    }
  }

  /**
   * Method used to get the emitted data from wdg-create component and perform action
   * @param emitData emitted data
   */
  wdgConfigActions(emitData) {
    try {
      switch (emitData.type) {
        case 'close': this.closeWidgetConfig(); break;
        case 'save': this.emitWidgetConfigForSave(emitData.data); break;
        case 'save resize':this.emitWidgetResizeForSave(emitData.data); break;
      }
    } catch (error) {
      console.log(error);
    }
  }

  /**
   * For closing widget config page
   */
  closeWidgetConfig() {
    this.showWdgConfig = false; 
  }

  /**
   * Method for emitting the widget configuration data to dashboard component to save
   * @param configData  widget config data
   */
  emitWidgetConfigForSave(configData) {
    this.wdgManagerEmitter.emit(this.getCopy(configData));
    //this.closeWidgetConfig();
  }
  emitWidgetResizeForSave(configData) {
    this.wdgManagerResizeEmitter.emit(this.getCopy(configData));
  }

  /**
   * Method for taking a clone of the a JSON passed into this
   * @param obj JSON data to clone
   */
  getCopy(obj) {
    return obj ? JSON.parse(JSON.stringify(obj)) : obj;
  }

  /**
   * Method for opening the widget configuration page in edit mode
   * @param data widget configuration data to edit
   */
  editWidget(data) {
    const editInput = {
      wcType: 'update',
      wcSelect: data.wcType,
      wcData: data
    };
   this.editWidgetData = this.getCopy(editInput);
    this.showWdgConfig = true;
    this._dataSharing.sendEventpinFilter("pin-filter")
  }
  resizeWidgetAction(actionKey) {
    if (!actionKey.action && actionKey.action !== 'startResize' && actionKey.action !== 'stopResize' &&
      actionKey.action !== 'saveResize') {
      return false;
    }
    this.resizeWidgetLevelSubject = actionKey;
  }

  handleDeleteWidget(){
    this.deleteWidgetEmitter.emit();
  }

  addClassForDatePopup() {
    this.subscriptionInstance = this._wdgShow.addClass.subscribe((value)=>{
     const ele = document.getElementById('dashBoradContainerMain');
      value?ele.classList.add('datePopup'):ele.classList.remove('datePopup');
    })
  }
}
