import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { Router } from '@angular/router';
import { AppService } from '../../../services/app.service';
import { ToastrService } from '../../../components/toastr/toastr.service';
import { AuthGuard } from '../../../pages/auth/auth.guard';
import { DataSharingService } from '../../../services/data-sharing.service';
import { globals } from '../../../utilities/globals';
import { UtilityFunctions } from '../../../utilities/utility-func';

@Component({
  selector: 'kl-dashboard-sidebar',
  templateUrl: './dashboard-sidebar.component.html',
  styleUrls: ['./dashboard-sidebar.component.scss']
})
export class DashboardSidebarComponent implements OnInit {
  @Input('menus') menus: any;
  @Input() heading: any;
  @Input() headingSingular: any;
  @Output() createDashboardEmitter: EventEmitter<any> = new EventEmitter<any>();
  @Output() loadPreviousDashboard: EventEmitter<any> = new EventEmitter<any>();
  nodes = [];
  public queryString: String = '';
  options = {};
  public selectedNode: any;
  public dashBoardsaveData: any = {
    name: '',
    description: ''
  };
  public objDeleteDashBoard: any = {};
  public objRenameDashboard: any = {};
  public folderData: any = {
    name: ''
  };
  router: any;
  public dashboardType = '';
  constructor(
    private _router: Router,
    private appService: AppService,
    public _toastLoad: ToastrService,
    private authGuard: AuthGuard,
    private global: globals,
    private menudataservice: DataSharingService,
    private _utility: UtilityFunctions
  ) {}

  titleDenied: string = '';

  ngOnInit() {
    this.options = {
      allowDrag: false,
      allowDrop: false
    };
    this.updateMenuDataHandler();
  }

  updateMenuDataHandler() {
    this.menudataservice.currentMenuData.subscribe((data) => {
      this.dashboardType = data['type'];
    });
  }

  getSidebarMenus() {
    try {
      if (!this.dashboardType) return;
      const postJSON = {
        type: this.dashboardType
      };
      this.appService
        .getDashboardLeftSideconfigData(postJSON)
        .subscribe((data) => {
          if (data['status'] === 'success') {
            const newData = [];
            data.data.forEach((element) => {
              // element['route'] = this.dashboardType.toLowerCase() + '/' + element['dashboard_id'];
              // element['route'] = this.dashboardType.toLowerCase() + '/' + this._utility.encryptData(element['dashboard_id']);
              newData.push(element);
            });
            this.menus = newData;
            console.log('dashboard side bar ' + this.menus);
          }
          document.getElementById('saveDashboard').removeAttribute('disabled');
        });
    } catch (error) {
      console.log(error);
    }
  }

  onEvent(e) {
    this.selectedNode = e.node.data;
    this._router.navigate([e.node.data.route]);
  }

  saveDashboard(type) {
    try {
      if (!this.dashboardType) return;
      let postData = {};
      if (type === 'folder') {
        postData = this.folderData;
      } else {
        postData = this.dashBoardsaveData;
      }
      postData['type'] = this.dashboardType;
      postData['site_id'] = this.global.getCurrentUserSiteId();
      document.getElementById('saveDashboard').setAttribute('disabled', 'true');
      this.appService.saveDashboard(postData).subscribe((data) => {
        if (data.status === 'success') {
          document.getElementById('dismissAdd').click();
          this.folderData = {};
          this.dashBoardsaveData = {};
          this.getSidebarMenus();
          this._toastLoad.toast(
            'success',
            'Success',
            this.dashboardType + '  saved successfully',
            true
          );
          this._router.navigate([
            this.dashboardType.toLowerCase() + '/' + data['dashboard_id']
          ]);
        } else {
          this._toastLoad.toast('error', '', data.message, true);
        }
      });
    } catch (error) {
      console.log(error);
    }
  }

  // w.r.t; Delete Dashboard - Varshhhhh - starts
  deleteDashboard(action, event) {
    if (action === 'delete') {
      this.objDeleteDashBoard['action'] = action;
      this.objDeleteDashBoard['data'] = event;
      document.getElementById('deleteModalButton').click();
    }
  }
  // w.r.t; Delete Dashboard - Varshhhhhh - ends

  confirmDelete() {
    try {
      const postData = {};
      postData['dashboard_id'] = this.objDeleteDashBoard['data'][
        'dashboard_id'
      ];
      this.appService.deleteDashboard(postData).subscribe((data) => {
        if (data.status === 'success') {
          this.getSidebarMenus();
          this._toastLoad.toast(
            'success',
            'Success',
            this.dashboardType + '   deleted successfully',
            true
          );
          document.getElementById('dismissDelete').click();
          this.loadPreviousDashboard.emit();
        } else {
          // this._toastLoad.toast('error', '', data.message, true);
        }
      });
    } catch (error) {
      console.log(error);
    }
  }

  renameDashboard(menu) {
    document.getElementById('renameModalButton').click();
    this.objRenameDashboard = menu;
  }

  confirmRenameDashboard(data: any) {
    // console.log(this.objRenameDashboard);
    const postData = {};
    postData['dashboard_id'] = this.objRenameDashboard['dashboard_id'];
    postData['name'] = this.dashBoardsaveData.name;
    postData['type'] = this.dashboardType;
    postData['description'] = '';
    postData['site_id'] = this.global.getCurrentUserSiteId();
    this.appService.saveDashboard(postData).subscribe((data) => {
      if (data.status === 'success') {
        this._toastLoad.toast(
          'success',
          'Success',
          'Dashboard renamed successfully',
          true
        );
        this.resetRenameDashboard();
      } else {
        this._toastLoad.toast(
          'error',
          'Error',
          'Dashboard renamed failed',
          true
        );
        this.resetRenameDashboard();
      }
    });
  }

  resetRenameDashboard() {
    document.getElementById('dismissRename').click();
    this.dashBoardsaveData.name = '';
    this.getSidebarMenus();
  }

  modifyDashboard(event) {
    try {
      if (event.action == 'addDashboard') {
        document.getElementById('renameModalButton').click();
        this.objRenameDashboard = event;
        document.getElementById('addModalButton').click();
      } else if (event.action == 'addFolder') {
        document.getElementById('addModalButtonFolder').click();
      } else if (event.action === 'delete') {
        this.objDeleteDashBoard = event;
        document.getElementById('deleteModalButton').click();
      }
    } catch (error) {
      console.log(error);
    }
  }

  allowAccessMouseOver(compName: string, accessType: string) {
    if (this.authGuard.allowAccessComponent(compName, accessType)) {
      this.titleDenied = '';
    } else {
      this.titleDenied = 'Access Denied';
    }
  }

  allowAccess(compName: string, accessType: string) {
    return this.authGuard.allowAccessComponent(compName, accessType);
  }

  onClickParent(item: any) {
    item['route'] =
      item.type.toLowerCase() +
      '/' +
      this._utility.encryptData(item['dashboard_id']);
    this._router.navigate([item.route]);
  }

  allowHide(accessType: string) {
    if (
      this.authGuard.allowAccessComponent(
        this.dashboardType.toLowerCase(),
        accessType
      )
    ) {
      return true;
    } else {
      return false;
    }
  }

  // unique id corresponding to the item
  trackByFn(index) {
    return index;
  }
}
