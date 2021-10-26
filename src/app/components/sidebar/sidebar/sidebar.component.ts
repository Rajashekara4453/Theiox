import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { globals } from '../../../../app/utilities/globals';
import { SidebarDetailsService } from './sidebar-details.service';
import { AccessMenuService } from '../../../services/access-menu.service';
import { UtilityFunctions } from './../../../utilities/utility-func';
import { AuthGuard } from '../../../../app/pages/auth/auth.guard';
import { AppService } from '../../../../app/services/app.service';
import { ToastrService } from '../../toastr/toastr.service';
import { AuthService } from '../../../pages/auth/auth.service';
import { AppTokenService } from '../../../services/app-token.service';
import { DataStoreService } from '../../../services/data-store.service';
import { Subscription } from 'rxjs';
import { DataSharingService } from '../../../services/data-sharing.service';

@Component({
  selector: 'kl-sidebar',
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.scss']
})
export class SidebarComponent implements OnInit, OnDestroy {
  /*======================================== Component Description ========================================================

  1) Requests the appTokenService to return the sidebar data.
  2) Receives the data and renders/update the view.
  3) On demand receives the Backend list and updates the view
  4) After updation leaf nodes are used for routing
  5) Template has two parts 1) with search 2) without search

  =======================================================================================================================*/

  /* ==================================== Sidebar properties =============================================================*/

  menuItemsPrimary: any; // holds list of primary menuitems
  menuItemsSecondary: any; // holds list of secondary menuitems
  isShowPrimary: boolean = true; // controls primary menu items visibility
  isShowSecondary: boolean; // controls sub-menu dependent interactions
  activeItem: object = {}; // shows primary menu item name in secondary menu as a title
  globalItem: any; // holds clicked item for subsequent execution
  userInput: string = ''; // holds search keywords
  menuItemsSearch: any; // holds a list to search sidebar items
  isSearchEnabled: boolean; // controls search template visibility
  previouspId: number = 0; // holds item's parent id for filterning
  itemNameObj: any; // holds found result
  createButtonActive: boolean; // controls create new button's visibility
  isActive: number; // Apply active class for current selection using item id
  currentClikedItem: any; // Holds object for updating the list on save
  subscription: Subscription;
  isListLoading: boolean = false; // Loader control for BE items
  isBackHomeClicked: boolean = false; //back and home indicator
  currentStaticItem: any; // holds item to differentiate BE & non BE items
  /* ==================================== User properties =============================================================*/
  isMobileView: boolean = false;
  isCreateAccess: boolean = false;
  appConfigurations: any;
  public isShowTemplates: Boolean = false;
  userDetails: any;
  fullName: any;
  userImage: any;
  userRole: any;
  userImageShow: boolean;
  shortUserName: string;
  newDashboard: any = { name: '', description: '' };
  menuType: string;
  public folderData: any = {
    name: ''
  };
  dashboardTemplate: string;
  dashboardtemplateData: object = {};
  encDecKey = 'thisissecret';
  storedProfiles:any = [];
  
  constructor(
    private sidebarService: SidebarDetailsService,
    private router: Router,
    private _accessMenuService: AccessMenuService,
    private _global: globals,
    private _auth: AuthGuard,
    private _appService: AppService,
    private _toastLoad: ToastrService,
    private _router: Router,
    private _authService: AuthService,
    private _appTokenService: AppTokenService,
    private _dataStore: DataStoreService,
    private _utility: UtilityFunctions,
    private _dataSharing: DataSharingService,
  ) {}

  /* get menu items from access menu service */

  async getMenu() {
    // this.menuItemsPrimary = this._accessMenuService.jsonMenus;
    this.menuItemsPrimary = this._appTokenService.jsonMenus;
    if (this.isMobileView) {
      this.menuItemsSearch = this.menuItemsPrimary.filter((item) => {
        if (item['isShowMobileView']) {
          return item;
        }
      });
    } else {
      this.menuItemsSearch = this.menuItemsPrimary;
    }
    this.filterMenuItems(this.previouspId);
  }

  /* filter the menu list with root/submenu items & picks label accordingly */
  filterMenuItems(itemID: any) {
    this.sidebarService.currentClickedItem = undefined;
    if (itemID > 0) {
      this.isShowSecondary = true;
      this.itemNameObj = this.menuItemsPrimary.find((item) => {
        if (item.id === itemID) {
          return item;
        }
      });
      if (this.itemNameObj['hasChildren']) {
        this.activeItem = this.itemNameObj;
        this.menuItemsSecondary = this.menuItemsPrimary.filter((item) => {
          if (item.id === itemID) {
            this.previouspId = item.pId;
          }
          return item.pId === itemID;
        });
      } else {
        this.menuItemsSecondary = this.menuItemsPrimary.filter((item) => {
          if (item.id === this.itemNameObj.pId) {
            this.previouspId = item.pId;
            this.activeItem = item;
          }
          return item.pId === this.itemNameObj.pId;
        });
      }
    } else {
      this.isShowSecondary = false;
      this.previouspId = 0;
      this.menuItemsSecondary = this.menuItemsPrimary.filter((item) => {
        return item.pId === this.previouspId;
      });
    }
    this.isActive = 0;
  }

  /*Checks an item for ..
   1) Direct routing,
   2) Showing sub menu items, 
   3) Differentiating dynamic and static list
   4) Opening a link in new tab
   */

  async onItemClick(item: any) {
    this.currentStaticItem = item;
    this.isBackHomeClicked = false;
    this.menuType = item.type;
    this.createButtonActive = false;
    this.previouspId = item.pId;
    this.userInput = '';
    this.isSearchEnabled = false;
    this.isActive = item.id;
    if (!item.hasChildren && item['url'] !== '' && !item.openNewTab) {
      this.globalItem = item;
      // this.router.navigate([item.url]);
      if (this.isMobileView) {
        this.overlaySideBar();
      }
      if (item.pId > 0 && !item.hasOwnProperty('dashboard_id')) {
        this.isShowSecondary = true;
        this.menuItemsSecondary = this.menuItemsPrimary.filter((items) => {
          if (items.id === item.pId) {
            this.previouspId = items.pId;
            this.activeItem = items;
          }
          return items.pId === item.pId;
        });
      } else if (item.pId > 0 && item.hasOwnProperty('dashboard_id')) {
        this.isShowSecondary = true;
        this.previouspId = 0;
        this.createButtonActive = true;
      } else {
        this.isShowSecondary = false;
        this.previouspId = 0;
        this.filterMenuItems(0);
      }
    }

    if (item.openNewTab && item.url !== '') {
      window.open('#' + item.url, 'blank');
    }

    if (item.hasChildren) {
      if (item.reference === 'dashboard') {
        this.isCreateAccess = this.allowAccess(
          this.menuType == 'Dashboard'
            ? 'dashboard'
            : this.menuType == 'Reports'
            ? 'reports'
            : this.menuType == 'Scada'
            ? 'webscada'
            : 'trends',
          'create'
        );
        this.menuItemsSecondary = [];
        this.isShowSecondary = true;
        this.isListLoading = true;
        this.currentClikedItem = item;
        this.activeItem = item;
        this.createButtonActive = item.createBtn;
        const allDashboardList = await this.sidebarService.getRemoteMenuItems(
          item
        );
        if (!this.isBackHomeClicked) {
          if (
            allDashboardList.length > 0 &&
            this.currentStaticItem.hasOwnProperty('type') &&
            allDashboardList[0]['type'] === this.currentClikedItem.type
          ) {
            this.menuItemsSecondary = allDashboardList;
          }
        }
        this.isListLoading = false;
        if (this.isMobileView) {
          this.menuItemsSearch = this.menuItemsSecondary
            .concat(this.menuItemsPrimary)
            .filter((item) => {
              if (item['isShowMobileView']) {
                return item;
              }
            });
        } else {
          this.menuItemsSearch = this.menuItemsSecondary.concat(
            this.menuItemsPrimary
          );
        }
      } else {
        this.globalItem = item;
        this.activeItem = item;
        // this.previouspId = item.pId;

        this.menuItemsSecondary = this.menuItemsPrimary.filter((item) => {
          return item.pId === this.globalItem.id;
        });

        if (this.isMobileView) {
          this.menuItemsSearch = this.menuItemsPrimary.filter((item) => {
            if (item['isShowMobileView']) {
              return item;
            }
          });
        } else {
          this.menuItemsSearch = this.menuItemsPrimary;
        }
        this.isShowSecondary = true;
      }
    }
    //  }
  }

  /*filter to show previous menu items*/
  onBackShowPreviousMenu() {
    this.isBackHomeClicked = true;
    this.isListLoading = false;
    this.isActive = 0;
    this.filterMenuItems(this.previouspId);
    this.sidebarService.currentClickedItem = undefined;
  }

  /* filter to show root menu items */
  onHomeShowRootMenu() {
    this.isBackHomeClicked = true;
    this.isListLoading = false;
    this.filterMenuItems(0);
  }

  /*Check minimum number of characters to enable search template*/
  onSearch() {
    if (this.userInput.length > 2) {
      this.isSearchEnabled = true;
    } else {
      this.isSearchEnabled = false;
    }
  }

  /*call global logout method to logout */
  onLogOut() {
    // this._global.logout();
    this._appTokenService.logout();
  }

  /* Receives url from template and navigates  */
  onUserRouteTo(url) {
    this.router.navigate([url]);
    if (this.isMobileView) {
      this.overlaySideBar();
    }
  }

  /*Get user details  */
  getUserDetails() {
    // this.userDetails = this._authService.decryptUserDetails();
    this.userDetails = this._dataStore.userInfo;
    this.fullName = this.userDetails.fullName;
    this.shortUserName = this.userDetails.fullName.substring(0, 1);
    if (this.userDetails.userRoleName !== '') {
      this.userRole = this.userDetails.userRoleName;
    }
    if (
      this.userDetails.theme.userImage &&
      this.userDetails.theme.userImage !== ''
    ) {
      this.userImage =
        'data:image/png;base64,' + this.userDetails.theme.userImage;
      this.userImageShow = true;
      this.storeUserImage();
    } else {
      this.userImage = this.shortUserName;
      // this.userImage = 'assets/images/defaultUserImage.png';
      this.userImageShow = false;
      this.storeUserImage();
    }
  }

    /**Store user profile picture */
    storeUserImage(){
      const decryptSavedProfiles:any = this._utility.decryptCryptoAES(localStorage.getItem('ACCOUNTS'),this.encDecKey);
      this.storedProfiles=JSON.parse(decryptSavedProfiles);
      // console.log("this.storedProfiles------------------",this.storedProfiles)
        for (let i = 0; i < this.storedProfiles.length; i++) {
  
          if(this.storedProfiles[i]['username']===this.userDetails['userName']){
            // console.log("storedProfiles----------",this.storedProfiles[i]);
            if (this.userDetails.theme.userImage && this.userDetails.theme.userImage !== '') {
              this.userImage = 'data:image/png;base64,' +  this.userDetails.theme.userImage;
              this.storedProfiles[i]['profileImage'] = this.userImage;
            } else {
              // this.userImage= '/assets/images/defaultImages/avatardefault_7.svg';
              this.shortUserName = this.userDetails.fullName.substring(0, 1);
              this.storedProfiles[i]['profileImage'] = this.shortUserName;
            }
          }
        }
        localStorage.setItem('ACCOUNTS',this._utility.encryptCryptoAES(this.storedProfiles, this.encDecKey));
    }

  /*Show default template */
  onSearchClear() {
    if (this.userInput === '') {
      this.isSearchEnabled = false;
    }
  }

  /* 1.Subscribe to 'refresh' subject and keep the subscription open to update the- 
       -search when dashboard/report/trends are created or deleted */
  ngOnInit() {
    this.appConfigurations = this._global._appConfigurations;
    this.isMobileView = this.appConfigurations['isMobileUser'];
    this.subscription = this.sidebarService.refresh.subscribe((data) => {
      this.menuItemsSecondary = data;
      if (this.isMobileView) {
        this.menuItemsSearch = this.menuItemsSecondary
          .concat(this.menuItemsPrimary)
          .filter((item) => {
            if (item['isShowMobileView']) {
              return item;
            }
          });
      } else {
        this.menuItemsSearch = this.menuItemsSecondary.concat(
          this.menuItemsPrimary
        );
      }
    });
    this._global.onLoadDataLogin();
    this.getMenu();
    this.getUserDetails();
  }

  ngOnDestroy() {
    this.subscription.unsubscribe();
  }

  // Varsha - create dashboard, reports trends
  allowAccess(compName: string, accessType: string) {
    return this._auth.allowAccessComponent(compName, accessType);
  }

  saveDashboard(type) {
    try {
      if (!this.menuType) {
        return;
      }
      let postData = {};
      if (type === 'folder') {
        postData = this.folderData;
      } else {
        postData = this.newDashboard;
      }
      postData['name'] = this.newDashboard.name.trim();
      postData['type'] = this.menuType;
      postData['site_id'] = this._global.getCurrentUserSiteId();

      if (this.newDashboard.dashboard_template_id == null) {
        delete this.newDashboard.dashboard_template_id;
      }
      document.getElementById('saveDashboard').setAttribute('disabled', 'true');
      if (this.validateSaveForm(postData)) {
        this._appService.saveDashboard(postData).subscribe(async (data) => {
          if (data.status === 'success') {
            document.getElementById('dismissAdd').click();
            this.folderData = { name: '' };
            this.newDashboard = { name: '', description: '' };
            // this.getSidebarMenus();
            this.menuItemsSecondary = await this.sidebarService.getRemoteMenuItems(
              this.currentClikedItem
            );
            if (this.isMobileView) {
              this.menuItemsSearch = this.menuItemsSecondary
                .concat(this.menuItemsPrimary)
                .filter((item) => {
                  if (item['isShowMobileView']) {
                    return item;
                  }
                });
            } else {
              this.menuItemsSearch = this.menuItemsSecondary.concat(
                this.menuItemsPrimary
              );
            }
            this._toastLoad.toast(
              'success',
              'Success',
              this.menuType + '  saved successfully',
              true
            );
            if (this.menuType == 'Scada') {
              const queryParams: Params = { view: 'editor' };
              const url =
                this.menuType.toLowerCase() + '/' + data['dashboard_id'];
              this.router.navigate([url], {
                queryParams: queryParams
              });
            } else {
              this._router.navigate([
                this.menuType.toLowerCase() + '/' + data['dashboard_id']
              ]);
            }
          } else {
            this._toastLoad.toast('error', '', data.message, true);
          }
        });
      }
    } catch (error) {
      // console.log(error);
    }
    this.isActive = 0;
  }
  validateSaveForm(postData) {
    let isSave = false;
    if (postData['name'] == '' && postData['dashboard_template_id'] == null) {
      isSave = false;
    } else if (postData['name'] !== '') {
      isSave = true;
    } else if (postData['dashboard_template_id'] !== null) {
      isSave = true;
    }
    return isSave;
  }
  // openGrapheditor(){

  // }
  mouseLeave() {
    if (document.body.classList.contains('pin-sidebar')) {
    } else {
      document.body.classList.remove('overlay-sidebar');
    }
  }
  overlaySideBar() {
    if (document.body.classList.contains('overlay-sidebar')) {
      document.body.classList.remove('overlay-sidebar');
    }
  }

  async onReload() {
    const allDashboardList = await this.sidebarService.getRemoteMenuItems(
      this.currentClikedItem
    );
    if (!this.isBackHomeClicked) {
      this.menuItemsSecondary = allDashboardList;
    }
    if (this.isMobileView) {
      this.menuItemsSearch = this.menuItemsSecondary
        .concat(this.menuItemsPrimary)
        .filter((item) => {
          if (item['isShowMobileView']) {
            return item;
          }
        });
    } else {
      this.menuItemsSearch = this.menuItemsSecondary.concat(
        this.menuItemsPrimary
      );
    }
  }

  onAddModalOpen() {
    this._dataSharing.sendEventpinFilter('pin-filter');
    this.newDashboard.name = '';
    this.newDashboard['dashboard_template_id'] = null;
    const postJSON = {
      type: ''
    };
    postJSON.type = this.menuType;
    this._appService.getDashboardTemplate(postJSON).subscribe((data) => {
      if (data.status === 'success') {
        this.dashboardtemplateData[postJSON.type] = data.data;
        this.isShowTemplates =
          this.dashboardtemplateData[postJSON.type].length > 0 ? true : false;
      }
    });
  }
}
