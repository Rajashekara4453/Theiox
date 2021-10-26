import { AuthService } from './../auth/auth.service';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router, CanDeactivate } from '@angular/router';
import { Observable, Subscription } from 'rxjs-compat';
import { AppService } from '../../services/app.service';

import { AuthGuard } from '../auth/auth.guard';
import { EditorMenuService } from './editor/editor-services/editor-menu.service';
import { EditorUiService } from './editor/editor-services/editor-ui.service';
import { HandleGraphService } from './editor/editor-services/handle-graph.service';
import { WebscadaService } from './webscada.service';

import * as _scada from 'flowchart-diagram-editor/index';
import { HandleXmlService } from './editor/editor-services/handle-xml.service';
import { ToastrService } from '../../../../src/app/components/toastr/toastr.service';

@Component({
  selector: 'kl-scada',
  templateUrl: './webscada.component.html',
  styleUrls: ['./webscada.component.scss', './preview/preview.component.scss'],
})
export class WebScadaComponent implements OnInit {

  public dashboardId: String;
  public pageType: any;
  public showDashboardFilter: Boolean = false;
  public dashboardData: any = {
    dashboardId : ''
  };
  public widgetData: Object = {};
  public widgetLoading: Boolean = false;
  public dashboardInfo: any = {};
  public hasEditAccess: boolean;

  public highligtOut: mxCellHighlight;
  contextMenuEnabled: boolean;
  hasTriggerAccess: any;

  public action_name: String = 'action';
  public cell_name: String = 'device';
  public context_shape_name: String = 'el_ID';
  public cell_id = '01';

  hasGraphUpdated: Subscription;
  

  public cellPropertyData: any = {
    body_content: []
  };
  public cellType = 'Shapes';
  public isCellConfigured: Boolean;
  public isCellAssetRemote: Boolean;
  public action_id;


  public typeOfView;
  public sideMenus: any;

  constructor(
    private appservice: AppService,
    private _activeRoute: ActivatedRoute,
    private _authGuard: AuthGuard,
    public _editor:EditorUiService,
    public _menu:EditorMenuService,
    private _router: Router,
    public _auth: AuthService,
    public _handleGraph:HandleGraphService,
    public _handleXml:HandleXmlService,
    public _webScada:WebscadaService,
    private _toaster:ToastrService,
    ) {
      this._activeRoute.params.subscribe((params) => {
        this.dashboardId = params['id'];
        const menuObject = this._authGuard.getMenuObject;
        this.pageType = menuObject['ticket'];
        if (this.dashboardId) {
            this.loadWidgets(false , true);
        } else {
          this.loadFirstScada();
        }
    });
  }

  public editorDashboardData;
  public previewDashboardData;
  ngOnInit() {
    this._editor.loaderToggleOn();
    this._activeRoute.queryParams.subscribe(params => {
      let view = params['view'];
      let dashboardDataReady = setInterval(()=>{
        if(this.dashboardData.dashboardId !== ''){
          this.hasEditAccess = this._authGuard.getMenuObject.accessLevel.edit;
          if (view == 'editor' && this.dashboardData.hasOwnProperty('isOwner')) {
            if (this.hasEditAccess && this.dashboardData['isOwner']) {
              this.typeOfView = 'editor';
            } else {
              this._router.navigate(['/un-authorized']);
            }
          } else {
            this.typeOfView = 'preview';
          }
          clearInterval(dashboardDataReady);
          if(this.typeOfView == 'editor'){
            this.editorDashboardData = this.dashboardData;
          } else if(this.typeOfView == 'preview'){
            this.previewDashboardData = this.dashboardData;
          }
        }
      },100) 
    });
    window.addEventListener('beforeunload', (e) => {
      if (this.typeOfView === 'editor' && _scada['_editorUi'].editor.modified) {
        e.preventDefault();
        e.returnValue = '';
      }
    });
  }

  ngOnChanges(){
    if(this.typeOfView == 'editor'){
      _scada.mxKeyHandler.prototype.setEnabled(false);
    }
  }

  /**
   * Method to identify the first scada in the first page load
   */
  loadFirstScada() {
    try {
      const postJson = {
        type: this.pageType === 'webscada' ? 'Scada' : 'Scada',
      };
      this.appservice.getDashboardLeftSideconfigData(postJson).subscribe((data) => {
        if (data['status'] === 'success') {
          const newData = [];
          data.data.forEach((element) => {
            element['route'] = `scada/${element['dashboard_id']}`;
            newData.push(element);
          });
          this.sideMenus = newData;
        }
        if (this.sideMenus && this.sideMenus.length > 0) {
          this.dashboardId = this.sideMenus[0]['dashboard_id'];
          this._router.navigate([`scada/${this.dashboardId}`]);
        }
      });
    } catch (error) {
      console.log(error);
    }
  }

    /**
     * Confirm trigger for the respective action
     */
  triggerConfirm() {
    this.triggerCountDown();
    this._webScada.contextMenuEnabled = false;
    this._webScada.triggerAction();
  }

  triggerCountDown() {
    this._webScada.hasSubbed ? this._webScada.hasSubbed.unsubscribe() : null;
    this._webScada.initiateTriggerCountDown();
  }
  
  copyInputMessage(val) {
    val.focus();
    val.select();
    document.execCommand('copy');
  }

  canDeactivate() {
    if (this.typeOfView == 'editor' && _scada['_editorUi'].editor.modified) {
      const result = window.confirm('There are unsaved changes! Are you sure?');
      return Observable.of(result);
    } else {
      return true;
    }
  }

  loadWidgets(isBreadcrumbRefresh, isPreview?) {
    this.previewDashboardData = {}
    this.editorDashboardData = {}
    if(isBreadcrumbRefresh){
      if (_scada.hasOwnProperty('_editorUi') && _scada['_editorUi'].hasOwnProperty('editor') && this.typeOfView == 'editor') {
        if (_scada['_editorUi'].editor.modified) {  
          var con = confirm('There are unsaved changes! Are you sure?');
          if(!con){
            return;
          }
        }
      }
    }
    try {
      this._editor.loaderToggleOn();
      this.widgetLoading = false;
      if (!this.dashboardId) {
        this.widgetLoading = false;
        return;
      }
      const input = {
        dashboard_id: this.dashboardId,
      };
      this.appservice.getScadaData(input).subscribe((resp) => {
        if (resp && resp.status === 'success') {
          if (resp.data.widget.wcData.length == 0) {
            this.createDefaultWidget();
          } else {
            this.widgetData = resp['data']['widget'];
            this.widgetData['wcData'].forEach((element) => {
              element.cData.chartData = {};
            });
            this.dashboardData = resp['data'];
            this.dashboardData['pageType'] = this.pageType;
            this.dashboardData['isReset'] = false;
            this.dashboardData['isOwner'] = resp['data']['isOwner'];
            this.dashboardData['ownerId'] = resp['data']['ownerId'];
            this.dashboardData['ownerName'] = resp['data']['ownerName'];
            this.dashboardInfo = {
              dashboardName: this.dashboardData['dashboardName'],
              dashboardId: this.dashboardData['dashboardId'],
              pageType: this.pageType,
              isOwner: resp['data']['isOwner'],
            };
              if(isPreview){
                this.previewDashboardData = this.dashboardData;
              }
              if(this.typeOfView == 'editor'){
                this.editorDashboardData = this.dashboardData;
              }
          }
          this.widgetLoading = true;
        } else {
          console.log('error');
        }
      });
    } catch (error) {
      console.log('error');
    }
  }

  createDefaultWidget(){
    const request = {
      dashboard_id: this.dashboardId,
      widget_data: {
        SCADAData: "PG14R3JhcGhNb2RlbCBkeD0iMTAyMSIgZHk9IjYxOSIgZ3JpZD0iMSIgZ3JpZFNpemU9IjEwIiBndWlkZXM9IjEiIHRvb2x0aXBzPSIxIiBjb25uZWN0PSIxIiBhcnJvd3M9IjEiIGZvbGQ9IjEiIHBhZ2U9IjEiIHBhZ2VTY2FsZT0iMSIgcGFnZVdpZHRoPSI4NTAiIHBhZ2VIZWlnaHQ9IjExMDAiIGJhY2tncm91bmQ9Im51bGwiIHNhdmVUb1ByZXZpZXc9InRydWUiIGZpdFRvU2NyZWVuPSJmYWxzZSIgZ3JpZENvbG9yPSIjZDBkMGQwIiBncmlkRW5hYmxlZD0idHJ1ZSI+CiAgICAgIDxyb290PgogICAgICAgIDxteENlbGwgaWQ9IjAiIC8+CiAgICAgICAgPG14Q2VsbCBpZD0iMSIgcGFyZW50PSIwIiAvPgogICAgICA8L3Jvb3Q+CiAgICA8L214R3JhcGhNb2RlbD4=",
        cData: {
          chartOptions: {
            reportFormat: {},
          },
        },
        cType: "Scada",
      },
      site_id: this._auth.getCurrentUserSiteId(),
    }
    this.appservice.saveScada(request).subscribe((resp)=>{
      if(resp.status == 'success'){
        this.loadWidgets(false);
      } else {
        this._toaster.toast('error', 'Error', "Failed to load, please try again later.", true);
      }
    }, (err)=>{
      this._toaster.toast('error', 'Error', "Unable to reach server, please try again later.", true);
    })
  }

  ngOnDestroy(){
   this._editor.loaderToggleOff();
  }
}
