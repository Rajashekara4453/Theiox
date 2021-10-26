import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { Router } from '@angular/router';
import { AppService } from '../../../services/app.service';
import { AuthGuard } from '../../../../app/pages/auth/auth.guard';
import { DataSharingService } from '../../../services/data-sharing.service';
import { globals } from '../../../utilities/globals';
import { UtilityFunctions } from '../../../utilities/utility-func';

@Component({
  selector: 'kl-mini-sidebar-menu',
  templateUrl: './mini-sidebar-menu.component.html',
  styleUrls: ['./mini-sidebar-menu.component.scss']
})
export class MiniSidebarMenuComponent implements OnInit {
  @Input('pageName') getpageName: any;
  @Output() loadPreviousDashboard: EventEmitter<any> = new EventEmitter<any>();
  public sideMenus: any;
  public heading: any;
  public headingSingular: any;
  public leftSidebar = false;
  public dashboardSidebar = false;
  public sldSidebar = false;
  @Output() loadSldPage: EventEmitter<any>;

  showOrHide: any = {
    dashboard: false,
    reports: false,
    trends: false,
    sld: false,
    alarmEvents: false,
    channelConfiguration: false,
    Configurations: false
  };

  // Variable for Multi-tenant model
  deploymentMode: string = 'EL';
  endPointExt: any;

  constructor(
    private appservice: AppService,
    private menudataservice: DataSharingService,
    private router: Router,
    private _auth: AuthGuard,
    private _globals: globals,
    private _utility: UtilityFunctions
  ) {
    this.loadSldPage = new EventEmitter<any>();
  }

  ngOnInit() {
    this.checkDeploymentMode();
    this.allowAccess();
    this.getSidebarMenus(this.getpageName);
    // let x = this._utility.encryptData('1234');
    // console.log('x  =  ' + x)
    // let y = this._utility.decryptData(x);
    // console.log('y  =  ' + y)
  }

  checkDeploymentMode() {
    //  Endpoint extensions && Deployment Mode
    this.deploymentMode = this._globals.deploymentMode;
    this.endPointExt = this._globals.deploymentModeAPI;
  }

  // Method to display and hide modules based on user access permission
  allowAccess() {
    const accessPermissions = this._auth.accessObjectAll();
    this.showOrHide = {
      dashboard: accessPermissions.hasOwnProperty('dashboard')
        ? accessPermissions.dashboard.view
        : false,
      reports: accessPermissions.hasOwnProperty('reports')
        ? accessPermissions.reports.view
        : false,
      trends: accessPermissions.hasOwnProperty('trends')
        ? accessPermissions.trends.view
        : false,
      sld: accessPermissions.hasOwnProperty('trends')
        ? accessPermissions.trends.view
        : false,
      alarmEvents: accessPermissions.hasOwnProperty('alarmEvents')
        ? accessPermissions.alarmEvents.view
        : false,
      channelConfiguration: accessPermissions.hasOwnProperty('gateways')
        ? accessPermissions.gateways.view
        : false,
      maps: accessPermissions.hasOwnProperty('maps')
        ? accessPermissions.maps.view
        : false,
      Configurations: true
    };
  }

  mouseEnter() {
    if (document.body.classList.contains('pin-sidebar')) {
    } else {
      document.body.classList.add('overlay-sidebar');
    }
  }

  mouseLeave() {
    if (document.body.classList.contains('pin-sidebar')) {
    } else {
      document.body.classList.remove('overlay-sidebar');
    }
  }

  getSidebarMenus(pageName) {
    this.heading = pageName;
    if (pageName === 'Configurations') {
      this.appservice
        .getLeftSideBarConfigurationsData(
          'default',
          this.deploymentMode,
          this.endPointExt
        )
        .subscribe((data) => {
          if (this.deploymentMode === 'EL' && data.length > 0) {
            this.sideMenus = data[0].data.nodes;
          } else if (this.deploymentMode === 'KL' && data['nodes'].length > 0) {
            this.sideMenus = data.nodes;
          }
          this.leftSidebar = true;
          this.dashboardSidebar = false;
          this.sldSidebar = false;
          this.menudataservice.change({
            type: 'Configurations',
            data: this.sideMenus
          });
          document.body.classList.remove('no-sidebar');
        });
    } else if (pageName === 'Dashboard') {
      this.headingSingular = 'Dashboard';
      const postJSON = {
        type: pageName
      };
      this.appservice
        .getDashboardLeftSideconfigData(postJSON)
        .subscribe((data) => {
          if (data['status'] === 'success') {
            const newData = [];
            data.data.forEach((element) => {
              element['route'] = 'dashboard/' + element['dashboard_id'];
              // element['route'] = 'dashboard/' + this._utility.encryptData(element['dashboard_id']);
              // console.log( element['route']);
              newData.push(element);
            });
            this.sideMenus = newData;
            this.dashboardSidebar = true;
            this.leftSidebar = false;
            this.sldSidebar = false;
            this.menudataservice.change({
              type: 'Dashboard',
              data: this.sideMenus
            });
            document.body.classList.remove('no-sidebar');
          }
        });
    } else if (pageName === 'Reports') {
      this.headingSingular = 'Report';
      const postJSON = {
        type: pageName
      };
      this.appservice
        .getDashboardLeftSideconfigData(postJSON)
        .subscribe((data) => {
          if (data['status'] === 'success') {
            const newData = [];
            data.data.forEach((element) => {
              element['route'] = 'reports/' + element['dashboard_id'];
              newData.push(element);
            });
            this.sideMenus = newData;
            this.dashboardSidebar = true;
            this.leftSidebar = false;
            this.sldSidebar = false;
            this.menudataservice.change({
              type: 'Reports',
              data: this.sideMenus
            });
            document.body.classList.remove('no-sidebar');
          }
        });
    } else if (pageName === 'Trends') {
      this.headingSingular = 'Trend';
      const postJSON = {
        type: pageName
      };
      this.appservice
        .getDashboardLeftSideconfigData(postJSON)
        .subscribe((data) => {
          if (data['status'] === 'success') {
            const newData = [];
            data.data.forEach((element) => {
              element['route'] = 'trends/' + element['dashboard_id'];
              newData.push(element);
            });
            this.sideMenus = newData;
            this.dashboardSidebar = true;
            this.leftSidebar = false;
            this.sldSidebar = false;
            this.menudataservice.change({
              type: 'Trends',
              data: this.sideMenus
            });
            document.body.classList.remove('no-sidebar');
          }
        });
    } else if (pageName === 'Maps') {
      this.headingSingular = 'Map';
      const postJSON = {
        type: pageName
      };
      this.appservice
        .getDashboardLeftSideconfigData(postJSON)
        .subscribe((data) => {
          if (data['status'] === 'success') {
            const newData = [];
            data.data.forEach((element) => {
              element['route'] = 'maps/' + element['dashboard_id'];
              newData.push(element);
            });
            this.sideMenus = newData;
            this.dashboardSidebar = true;
            this.leftSidebar = false;
            this.sldSidebar = false;
            this.menudataservice.change({ type: 'Maps', data: this.sideMenus });
            document.body.classList.remove('no-sidebar');
          }
        });
    } else if (pageName === 'SLD') {
      this.appservice.getSldsidebar().subscribe((data) => {
        if (data['status'] === 'success') {
          this.sideMenus = data.nodes;
          this.sldSidebar = true;
          this.dashboardSidebar = false;
          this.leftSidebar = false;
          this.menudataservice.change({ type: 'SLD', data: this.sideMenus });
        }
      });
      this.sldSidebar = true;
      this.dashboardSidebar = false;
      this.leftSidebar = false;
      // this.router.navigate(['/sld']);
    } else if (pageName === 'Alarms') {
      this.sldSidebar = false;
      this.dashboardSidebar = false;
      this.leftSidebar = false;
      this.sldSidebar = false;
      this.menudataservice.change({ type: 'Alarms', data: this.sideMenus });
      this.router.navigate(['/alarm-events']);
      // document.body.classList.remove('pin-sidebar');
    } else if (pageName === 'Channel_Configuraton') {
      // document.body.classList.add('no-sidebar');
      this.sldSidebar = false;
      this.dashboardSidebar = false;
      this.leftSidebar = false;
      this.router.navigate(['/configurations/gatewayDevices/gatewaylist']);
    } else {
      this.sldSidebar = false;
      this.dashboardSidebar = false;
      this.leftSidebar = false;
      this.sideMenus = [];
    }
  }

  // w.r.t; Delete Dashboard - Varshhhhh - starts
  loadDefaultDashBoard() {
    this.loadPreviousDashboard.emit();
  }
  emitSideBar(event) {
    this.loadSldPage.emit(event.data);
  }
  // w.r.t; Delete Dashboard - Varshhhhh - ends
  overlaySideBar(event) {
    if (document.body.classList.contains('overlay-sidebar')) {
      event.target.classList.remove('elm-list');
      event.target.classList.add('elm-menu');
      document.body.classList.remove('overlay-sidebar');
    } else {
      document.body.classList.add('overlay-sidebar');
      event.target.classList.remove('elm-menu');
      event.target.classList.add('elm-list');
    }
  }
}
