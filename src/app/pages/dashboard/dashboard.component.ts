import { Component, OnInit } from '@angular/core';
import { AppService } from '../../services/app.service';
import { ActivatedRoute, Router } from '@angular/router';
import { ToastrService } from '../../components/toastr/toastr.service';
import { Subject } from 'rxjs/Subject';
import { globals } from '../../../app/utilities/globals';
import { UtilityFunctions } from '../../utilities/utility-func';
import { WdgShowService } from './widget-manager/wdg-show/wdg-show.service';
import { switchMap } from 'rxjs/operators';
import { BehaviorSubject, Subscription } from 'rxjs';
import { PreviewPopUpService } from './preview-pop-up.service';

@Component({
  selector: 'kl-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit {
  public showDashboardFilter: Boolean = false;
  public showResize: boolean = false;
  public widgetData: Object = {};
  public widgetLoading: Boolean = false;
  public sideMenus: any;
  public dashboardId: String;
  public dashboardData: any = {
    dashboardName: '',
  };
  public dashboardInfo: any = {};
  public dashBoardsaveData: any = {
    name: '',
    description: '',
  };
  public deleteDashBoard;
  public folderData: any = {
    name: ''
  };
  public pageType: any;
  public resizeWidgetSubject: Subject<any> = new Subject<any>();
  public addWidgetSubject: Subject<any> = new Subject<any>();
  subjectLabel = new BehaviorSubject('default');
  private responseObserver:Subscription;
  constructor(
    private _router: Router,
    private _activeRoute: ActivatedRoute,
    private appservice: AppService,
    private _toastLoad: ToastrService,
    private global: globals,
    private _wdgShow:WdgShowService,
    private previewService:PreviewPopUpService

  ) {
    this._activeRoute.params.subscribe(params => {
      this._activeRoute.url.subscribe(activeUrl => {
        this.pageType = activeUrl[0].path; // for getting the dashboard id from the url
      });
      // this.dashboardId = params['id'];
      this.dashboardId  = params['id'];
      if (this.dashboardId) {
        this.loadWidgets();
      } else {
        this.loadFirstDashboard(); // if first time load then calling a method for loading the first dashboard
      }
    });
  }

  ngOnInit() {
    this.getSidebarMenus('');
  }

  /**
   * Method for getting dashboard list
   * @param key action performed
   */
  getSidebarMenus(key) {
    try {
      let postJson = {
        type: this.pageType == 'dashboard' ? 'Dashboard' : (this.pageType == 'reports' ? 'Reports':this.pageType == 'Scada' ? 'Scada': 'Trends') 
      };
      this.appservice.getDashboardLeftSideconfigData(postJson).subscribe((data) => {
        if (data['status'] === 'success') {
          let newData = [];
          data.data.forEach(element => {
            element['route'] = this.pageType + '/' + element['dashboard_id'];
            newData.push(element);
          });
          this.sideMenus = newData;
          if (key == 'delete' || !this.dashboardId) {
            this.loadFirstDashboard();
          }
        }
      });
    } catch (error) {
      //console.log(error);
    }
  }

  ngOnDestroy() {
    this.widgetLoading = false;
    this.widgetData = undefined;
  }

  /**
   * Method for getting widget list
   */
   loadWidgets() {
    try {
      this.widgetLoading = false;
      if (!this.dashboardId) {
        this.widgetLoading = false;
        return;
      }
       if(this.responseObserver){
          this.responseObserver.unsubscribe();
        } 
      
      const input = {
        "dashboard_id": this.dashboardId
      }
      this.responseObserver =
     this.subjectLabel.pipe(
        switchMap(() => this.appservice.getDashboardData(input))
    )
    .subscribe( (data) => {
      
        if (data && data.status === 'success') {
        
          this.widgetData = data['data']['widget'];
         
          if(this.widgetData['wcData'].length>0){
            this.widgetData['wcData'].forEach(element => {
            element.cData.chartData = {};
          });} else {
            this._wdgShow.setResize(false);
             } 
          this._wdgShow.createOrEditwidget(false);
          this.dashboardData = data['data'];
          this.dashboardData['pageType'] = this.pageType;
          this.dashboardData['isReset']= false;
          this.dashboardData['isOwner'] = data['data']['isOwner'];
          this.dashboardData['ownerId']=data['data']['ownerId'];
          this.dashboardData['ownerName'] = data['data']['ownerName'];
          this.dashboardInfo = {
            dashboardName: this.dashboardData['dashboardName'],
            dashboardId: this.dashboardData['dashboardId'],
            pageType: this.pageType,
            isOwner: data['data']['isOwner']
          }
          
          this.widgetLoading = true;
         
        } else {
          // this._toastLoad.toast('error', 'Error', data.message, true);
                }
               
      } );
     
    } catch (error) {
      //console.log(error);
    }
   
 
  }

  /**
   * Method for updating dashboard filter flag either to show or not 
   * @param event 
   */
  updateDashboardFilterFlag(event) {
    this.showDashboardFilter = event;
  }

  /**
   * Method for identify the first dashboard in the first page load
   */
  loadFirstDashboard() {
    try {
      if (this.sideMenus && this.sideMenus.length > 0) {
        this.dashboardId = this.sideMenus[0]['dashboard_id'];
        this._router.navigate([this.pageType + '/' +  this.dashboardId]);
        this.loadWidgets();
      }
    } catch(error) {
      //console.log(error);
    }
  }


  modifyDashboard(event) { // not using here - moved this to dashboard-sidebar component
    try {
      if (event.action == 'addDashboard') {
        document.getElementById('addModalButton').click();
      } else if (event.action == 'addFolder') {
        document.getElementById('addModalButtonFolder').click();
      } else if (event.action === 'delete') {
        this.deleteDashBoard = event;
        document.getElementById('deleteModalButton').click();
      }
    } catch (error) {
      //console.log(error);
    }
  }

  saveDashboard(type) { // not using here - moved this to dashboard-sidebar component
    try {
      let postData = {};
      if (type === 'folder') {
        postData = this.folderData;
      } else {
        postData = this.dashBoardsaveData;
      }
      this.appservice.saveDashboard(postData).subscribe((data) => {
        if (data.status === 'success') {
          this.folderData = {};
          this.dashBoardsaveData = {};
          this.getSidebarMenus('save');
          this._toastLoad.toast('success', 'Success', data.message, true);
          this._router.navigate([this.pageType + '/' + data['dashboard_id']]);
          document.getElementById('dismissAdd').click();
        } else {
          // this._toastLoad.toast('error', '', data.message, true);
        }
      });
    } catch (error) {
      //console.log(error);
    }
  }
  confirmDelete() { // not using here - moved this to dashboard-sidebar component
    try {
      let postData = {};
      postData['dashboard_id'] = this.deleteDashBoard['data']['dashboard_id'];
      this.appservice.deleteDashboard(postData).subscribe((data) => {
        if (data.status === 'success') {
          this.getSidebarMenus('delete');
          this._toastLoad.toast('success', 'Success', 'Dashboard deleted successfully', true);
          document.getElementById('dismissDelete').click();
        } else {
          // this._toastLoad.toast('error', '', data.message, true);
        }
      });
    } catch (error) {
      //console.log(error)
    }
  }

  /**
   * Method for opening widget configuration page.
   * This will emit into the children component and there the widget configuration will start
   * @param event 
   */
  createWidget(event) {
    try {
      this.addWidgetSubject.next('createNewWidget');
    } catch (error) {
      //console.log(error)
    }
  }

  /**
   * Method for saving widget data to backend.
   * @param data widget configuration data
   */
  saveWidgetData(data) {
    try {
      if (!data || !this.dashboardId) {
        return
      }
         const input = {
        "dashboard_id": this.dashboardId,
        "widget_data": data,
        "site_id": this.global.getCurrentUserSiteId()
      };
      if (data['widget_id']) {
        input['widget_id'] = data['widget_id'];
      }
     this.appservice.saveWidgetConfigData(input).subscribe((data) => {
        if (data && data.status === 'success') {
          this._toastLoad.toast('success', 'Success', data.message, true);
         
          setTimeout(() => {
            this.loadWidgets();
          }, 1000);
          
        } else {
          this._toastLoad.toast('error', 'Error', data.message, true);
        }
      });
    } catch(error) {
      // //console.log(error);
    }
  }

  saveWidgetResize(data) {
    try {
      if (!data || !this.dashboardId) {
        return
      }
         const input = {
        "dashboard_id": this.dashboardId,
        "widget_data": [],
        "site_id": this.global.getCurrentUserSiteId()
      };
      
      data.forEach(element => {
        input.widget_data.push({
          'widget_id':element['widget_id'],
          'values': element['wResize']
        })
      });
      
      this.appservice.saveWidgetResizeData(input).subscribe((data) => {
        if (data && data.status === 'success') {
          this._toastLoad.toast('success', 'Success', data.message, true);
         
          setTimeout(() => {
            this.loadWidgets();
          }, 1000);
          
        } else {
          this._toastLoad.toast('error', 'Error', data.message, true);
        }
      });
    } catch(error) {
      // //console.log(error);
    }
  }

/* Resize Starts here */
  startResize(actionKey) {
    try {
      if(!actionKey.action && actionKey.action !== 'startResize' && actionKey.action !== 'stopResize' &&
      actionKey.action !== 'saveResize'){
        return false;
      }
      this.resizeWidgetSubject.next(actionKey);
    } catch (error) {
      // //console.log(error)
    }
  }
}
