import { Component, OnInit, EventEmitter, Output, Input } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { filter, count } from 'rxjs/operators';
import { CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';
import { DataSharingService } from '../../../services/data-sharing.service';
import { AppService } from '../../../services/app.service';
import { globals } from '../../../utilities/globals';
import { Observable, Subject } from 'rxjs';
import { UtilityFunctions } from '../../../utilities/utility-func';

@Component({
  selector: 'kl-pin-header',
  templateUrl: './pin-header.component.html',
  styleUrls: ['./pin-header.component.scss']
})
export class PinHeaderComponent implements OnInit {
  constructor(
    public _route: Router,
    private _globals: globals,
    private _appservice: AppService,
    private dataSharing: DataSharingService,
    private _utility: UtilityFunctions
  ) {
    this.checkDeploymentMode();
    this.fetchPinnedPages();

    this._route.events
      .pipe(filter((val) => val instanceof NavigationEnd))
      .subscribe(async (val) => {
        if (val instanceof NavigationEnd) {
          this.getCurrenturlPath();
        }
      });
  }

  @Output() emitcurrentPageNameToBreadCrumb: EventEmitter<
    any
  > = new EventEmitter();
  @Input() dashMenus: any;

  breadCrumbTitleName: string = '';
  currentPinnablePage: string = '';
  showPinnableTab: boolean = false;
  currentPageUrl: string;
  sideMenus: any;
  currentPageInfo: any = {};
  pinnedPages: any = [];
  user_id: string;
  pinType: string = '';
  menuType: string = '';

  // Variable for Multi-tenant model
  deploymentMode: string = 'EL';
  endPointExt: any;

  pinTypesDB: any = [];
  allMenus: any = [];
  isClicked: boolean = false;
  ngOnInit() {}

  checkDeploymentMode() {
    //  Endpoint extensions && Deployment Mode
    this.deploymentMode = this._globals.deploymentMode;
    this.endPointExt = this._globals.deploymentModeAPI;
  }

  // Bread crumb title
  getCurrenturlPath() {
    this.currentPageUrl = this._route.url;
    // From Dashboard-side-bar - doesnt work for URL refresh.
    // this.dataSharing.currentMenuData.subscribe((data) => {
    //   this.pinType = data['type'];
    // });

    this.pinType =
      this._route.url.split('/')[1].slice(0, 1).toUpperCase() +
      this._route.url
        .split('/')[1]
        .slice(1, this._route.url.length - 1)
        .toLowerCase();
    this.prepareToPin(this.pinType);
  }

  // Fetch data based on current side-bar selected by user
  prepareToPin(pinType: string): Observable<any> {
    let postJSON = {};
    let menus: any;
    const subject = new Subject<string>();

    switch (pinType) {
      case 'Configurations':
      case 'Masterconfig':
        pinType = 'Configurations';
        const configMenus$: Observable<any> = this.getLeftSideBarConfigurationsData(
          pinType
        );
        configMenus$.subscribe((configMenus) => {
          menus = configMenus;
          subject.next(menus);
          this.getTitle(this.currentPageUrl, pinType, configMenus);
        });

        break;

      case 'Dashboard':
      case 'Reports':
      case 'Trends':
      case 'Maps':
        postJSON = {
          type: pinType
        };
        const menus$: Observable<any> = this.getLeftSideBarData(
          pinType,
          postJSON
        );
        menus$.subscribe((leftSideBarMenus) => {
          menus = leftSideBarMenus;
          subject.next(menus);
          this.getTitle(this.currentPageUrl, pinType, leftSideBarMenus);
        });
        break;

      case 'SLD':
        break;

      case 'Alarm-events':
        // this.getTitle(this.currentPageUrl, pinType);
        this.breadCrumbTitleName =
          this.pinType.split('-')[0] +
          ' ' +
          this.pinType.split('-')[1].charAt(0).toUpperCase() +
          this.pinType
            .split('-')[1]
            .slice(1, this.pinType.split('-')[1].length);

        this.currentPageInfo = {
          pinType: pinType,
          pageTitle: this.breadCrumbTitleName,
          pageRoute: this.currentPageUrl
        };
        this.dataSharing.breadCrumbTitleUpdate(this.currentPageInfo);
        break;

      default:
        break;
    }
    return subject.asObservable();
  }

  // Fetch Configurations Menu Data
  getLeftSideBarConfigurationsData(pinType: string): Observable<any> {
    let configMenus: any = {};
    const subject = new Subject<string>();
    this._appservice
      .getLeftSideBarConfigurationsData(
        'default',
        this.deploymentMode,
        this.endPointExt
      )
      .subscribe((data) => {
        if (this.deploymentMode === 'EL') {
          configMenus = data[0].data.nodes;
          subject.next(configMenus);
        } else if (this.deploymentMode === 'KL') {
          configMenus = data.nodes;
          this.allMenus.push(configMenus[0]);
          subject.next(configMenus);
        }
      });
    return subject.asObservable();
  }

  // Fetch Dashboard and Reports Menu Data
  getLeftSideBarData(pinType: string, postJSON: any) {
    let menus: any;
    const subject = new Subject<string>();

    this._appservice
      .getDashboardLeftSideconfigData(postJSON)
      .subscribe((data) => {
        if (data['status'] === 'success') {
          const newData = [];
          data.data.forEach((element) => {
            // element['route'] = pinType.toLowerCase() + '/' + element['dashboard_id'];
            element['route'] =
              pinType.toLowerCase() +
              '/' +
              this._utility.encryptData(element['dashboard_id']);
            newData.push(element);
          });
          menus = newData;
          subject.next(menus);
        }
      });
    return subject.asObservable();
  }

  // Method to pass current page's title to bread-crumb
  // and display current page's title on pin-header
  getTitle(currentURL: string, pinType?: string, menuList?: any) {
    menuList.some((element) => {
      if (element['route'] === undefined && element['children']) {
        element['children'].forEach((childElement) => {
          this.currentPageInfo = this.compareUrls(
            pinType,
            childElement,
            currentURL
          );
          this.dataSharing.breadCrumbTitleUpdate(this.currentPageInfo);
        });
      }
      if (element['route'] !== undefined) {
        this.currentPageInfo = this.compareUrls(pinType, element, currentURL);
        this.dataSharing.breadCrumbTitleUpdate(this.currentPageInfo);
      }
      if (currentURL === this.currentPageInfo['pageRoute']) {
        this.showPinnableTab = true;
        this.handlePinnedPage(currentURL);
        return true;
      }
    });
  }

  // Method to match current page URL and URL's in list
  // to get the current Page Title from the list.
  compareUrls(pinType: string, configListObject: any, currentURL: string) {
    const configuredRoute = '/' + configListObject['route'];

    if (configuredRoute === currentURL) {
      this.breadCrumbTitleName = configListObject['name'];
      this.currentPageInfo = {
        pinType: pinType,
        pageTitle: this.breadCrumbTitleName,
        pageRoute: configuredRoute
      };
    }
    return this.currentPageInfo;
  }

  handlePinnedPage(currentURL) {
    if (currentURL === this.currentPageInfo['pageRoute']) {
      for (let i = 0; i < this.pinnedPages.length; i++) {
        const pinnedPage = this.pinnedPages[i];
        if (currentURL === pinnedPage['pageRoute']) {
          // Show current page on top if already pinned
          // this.pinnedPages.splice(i, 1);
          // this.pinnedPages.unshift(pinnedPage);

          // Do not show pin option for already pinned page
          this.showPinnableTab = false;
          return true;
        }
      }
    }
  }

  pinTab(currentPinnablePage) {
    // // To store all types of menus pinned
    // if (this.pinTypesDB.length >= 0) {
    //   if (this.pinTypesDB.includes(currentPinnablePage['pinType'])) {
    //     // return;
    //   } else {
    //     this.pinTypesDB.unshift(currentPinnablePage['pinType']);
    //   }
    // }

    // To store all pages pinned
    this.pinnedPages.unshift(currentPinnablePage);
    this.showPinnableTab = false;
    this.filterPinTypesDB(this.pinnedPages);
    this.savePinnedPages();
  }

  unPinTab(unPinPage) {
    for (let i = 0; i < this.pinnedPages.length; i++) {
      const pinnedPage = this.pinnedPages[i];

      if (pinnedPage['pageRoute'] === unPinPage['pageRoute']) {
        this.pinnedPages.splice(i, 1);
        this.filterPinTypesDB(this.pinnedPages);
        this.savePinnedPages();

        if (unPinPage['pageRoute'] === this.currentPageUrl) {
          this.showPinnableTab = true;
        }
      }
    }
  }

  // To store all pin-types of menus pinned
  filterPinTypesDB(pinnedPages) {
    this.pinTypesDB = [];
    pinnedPages.forEach((element) => {
      if (!this.pinTypesDB.includes(element['pinType'])) {
        this.pinTypesDB.push(element['pinType']);
      }
    });
  }

  reArrangePinnedTabs(event: CdkDragDrop<string[]>) {
    moveItemInArray(this.pinnedPages, event.previousIndex, event.currentIndex);
    this.savePinnedPages();
  }

  routeTo(eachPage) {
    this._route.navigate(['/' + eachPage['pageRoute']]);
    this.currentPageInfo = eachPage;
  }

  // Method called on logout from login.ts
  savePinnedPages() {
    let dataToPost = {};

    this.getUserId();

    if (this.pinnedPages.length > 0) {
      dataToPost = {
        data: {
          pinnedPages: this.pinnedPages,
          pinTypesDB: this.pinTypesDB
        }
      };
    } else if (this.pinnedPages.length === 0) {
      dataToPost = {
        data: {
          pinnedPages: [],
          pinTypesDB: []
        }
      };
    }
    const endPoint =
      this.endPointExt.SAVE_USER_PINNED_HEADER + this.user_id + '/upsert';

    this._appservice.savePinnedPages(endPoint, dataToPost).subscribe((data) => {
      if (data.status === 'success') {
        this.fetchPinnedPages();
      } else {
      }
    });
  }

  fetchPinnedPages() {
    this.getUserId();
    const dataToPost = {};
    const endPoint =
      this.endPointExt.READ_USER_PINNED_HEADER + this.user_id + '/read';

    this._appservice.getPinnedPages(endPoint, dataToPost).subscribe((data) => {
      if (data.length > 0) {
        if (
          data[0].data.pinnedPages.length > 0 &&
          data[0].data.pinTypesDB.length > 0
        ) {
          this.pinnedPages = data[0].data.pinnedPages;
          this.pinTypesDB = data[0].data.pinTypesDB;
          const allMenus$ = this.getAllMenus(this.pinTypesDB);
          allMenus$.subscribe((allMenus) => {
            // console.log(allMenus);
            this.addRouteToMenus(allMenus);
            this.mapPageNames(allMenus);
          });
        }
      }
    });
  }

  getAllMenus(pinTypesDB): Observable<any> {
    // const pinTypes = ['Configurations', 'Dashboard', 'Reports', 'Maps', 'Trends'];
    const pinTypes = pinTypesDB;
    const subject = new Subject<any>();
    const allMenuArray: any = [];

    pinTypes.forEach((pinType) => {
      const menus$: Observable<any> = this.prepareToPin(pinType);
      menus$.subscribe((menus) => {
        allMenuArray.push({
          pinType: pinType,
          menuItems: menus
        });
        subject.next(allMenuArray);
      });
    });
    return subject.asObservable();
  }

  addRouteToMenus(allMenus: any) {
    allMenus.forEach((menu) => {
      if (
        menu['pinType'] === 'Dashboard' ||
        menu['pinType'] === 'Reports' ||
        menu['pinType'] === 'Trends' ||
        menu['pinType'] === 'Maps'
      ) {
        menu['menuItems'].forEach((element) => {
          element['route'] =
            menu['pinType'].toLowerCase() + '/' + element['dashboard_id'];
        });
      }
      // if (menu['pinType'] === 'Configurations') {
      //   menu['menuItems'].forEach((element) => {
      //     element['route'] = '/' + element['route'];
      //   });
      // }
      // console.log(allMenus);
    });
    return allMenus;
  }

  mapPageNames(allMenus: any) {
    if (allMenus.length > 0) {
      allMenus.forEach((menus) => {
        const menuItems = menus['menuItems'];

        for (let i = 0; i < this.pinnedPages.length; i++) {
          for (let j = 0; j < menuItems.length; j++) {
            switch (menus['pinType']) {
              case 'Configurations':
              case 'Masterconfig':
                if (
                  menuItems[j].hasOwnProperty('route') &&
                  this.pinnedPages[i]['pageRoute'] ===
                    '/' + menuItems[j]['route']
                ) {
                  this.pinnedPages[i]['pageTitle'] = menuItems[j]['name'];
                } else if (menuItems[j].hasOwnProperty('children')) {
                  menuItems[j]['children'].forEach((childMenu) => {
                    if (
                      this.pinnedPages[i]['pageRoute'] ===
                      '/' + childMenu['route']
                    ) {
                      this.pinnedPages[i]['pageTitle'] = childMenu['name'];
                    }
                  });
                }
                break;

              case 'Dashboard':
              case 'Reports':
              case 'Trends':
              case 'Maps':
                if (
                  this.pinnedPages[i]['pageRoute'] ===
                  '/' + menuItems[j]['route']
                ) {
                  this.pinnedPages[i]['pageTitle'] = menuItems[j]['name'];
                  // console.log("pinned pages = " + JSON.stringify(this.pinnedPages));
                }
                break;

              default:
                break;
            }
          }
        }
      });
    }
  }

  getUserId() {
    this._globals.onLoadDataLogin();
    this.user_id = this._globals.userId;
  }

  // unique id corresponding to the item
  trackByFn(index) {
    return index;
  }
  onClick(eachPage) {
    this.pinnedPages.forEach((ele) => {
      ele.isClicked = eachPage.pageTitle == ele.pageTitle ? true : false;
    });
  }
}
