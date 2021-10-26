import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, Subject, ReplaySubject, forkJoin } from 'rxjs';
import { HttpLayerService } from './http-layer.service';
import { Config } from '../config/config';
import { AuthService } from '../pages/auth/auth.service';
@Injectable({
  providedIn: 'root'
})
export class AppService {
  private collections: any;
  constructor(
    private _http: HttpClient,
    private _httplayer: HttpLayerService,
    private _auth: AuthService
  ) {
    this.collections = {
      sensor: 'device_instance_id',
      alarm_configuration: 'id',
      protocol_category: 'id'
    };
  }

  // login functions
  getSessionkeyService(): Observable<any> {
    return this._httplayer.get(Config.API.SESSION_KEY);
  }

  loginService(data) {
    return this._httplayer.post(Config.API.LOGIN, data);
  }

  saloginService(data) {
    return this._httplayer.post(Config.API.SA_LOGIN, data);
  }

  forgotPassword(data) {
    return this._httplayer.post(Config.API.FORGOT_PASSWORD, data);
  }

  changePassword(data) {
    return this._httplayer.post(Config.API.UPDATEPASSWORD, data);
  }

  resetPassword(data) {
    return this._httplayer.post(Config.API.RESET_PASSWORD, data);
  }

  updateLicense(data) {
    return this._httplayer.post(Config.API.UPDATE_LICENSE, data);
  }
  updateLicenseKL(data) {
    return this._httplayer.post(Config.API.UPDATE_LICENSEKL, data);
  }

  updateLicenseFD(data): Observable<any> {
    return this._httplayer.post(Config.API.UPDATE_LICENSE, data);
  }

  getPassSA(data) {
    return this._httplayer.post(Config.API.GET_PASS_SA, data);
  }
  getLoginApplicationList() {
    return this._http.get<any>(
      './assets/build-data/common/master-form/login.json'
    );
  }
  register(endPointExt, data) {
    return this._httplayer.post(endPointExt.REGISTER_APPLICATION_ENQUIRY, data);
  }

  // ===================================================JWT=================================

  getNewAccessToken(data): Observable<any> {
    // return this._http.get<any>('./assets/build-data/jwt/newAccessToken.json');
    return this._httplayer.post(Config.API.GET_ACCESS_TOKEN, data);
  }

  // Temp Method
  onLoginTokens(): Observable<any> {
    return this._http.get<any>('./assets/build-data/jwt/loginToken.json');
  }

  getUserDetails(data): Observable<any> {
    return this._httplayer.post(Config.API.GET_USER_DETAILS, data);
  }

  getInitAppData(userReqPayload, authMenuReqPayload): Observable<any> {
    const userDetails = this._httplayer.post(
      Config.API.GET_USER_DETAILS,
      userReqPayload
    );
    // const authMenuJSON = this._http.get<any>('./assets/dev-data/menu.json');
    const authMenuJSON = this._httplayer.post(
      Config.API.GET_AUTHORIZED_MENU_JSON,
      authMenuReqPayload
    );
    return forkJoin([userDetails, authMenuJSON]);
  }

  // ===================================================globals=================================

  allowedCountLicense(dataToSend) {
    return this._httplayer.post(Config.API.GET_PASS_SA, dataToSend);
  }

  // ===================================================Default Mail Settings===================

  getdefaultMailSettings(dataToPost): Observable<any> {
    return this._httplayer.post(
      Config.API.EMAIL_ID_GET_DEFAULT_MAIL_SETTINGS,
      dataToPost
    );
  }

  // =================================================== Registeration ===================

  loadRegisterDFM(): Observable<any> {
    return this._http.get<any>(
      './assets/build-data/register/registerFormDFM.json'
    );
  }

  // ===================================================Report Download Settings (Download from UI)===================

  getReportDownloadSettings(dataToPost): Observable<any> {
    return this._httplayer.post(
      Config.API.REPORT_DOWNLOAD_SETTINGS,
      dataToPost
    );
  }

  // Configurations

  // leftsidebar

  // getLeftSideconfigData(): Observable<any> {
  //   return this._http.get<any>('./assets/build-data/common/configlist.json');
  //   // return this._httplayer.post(Config.API.CONFIGURATIONS_SIDEBAR,{});
  // }

  // Read JSON for Left-side-bar from data-content of DB
  getLeftSideBarConfigurationsData(
    type: string,
    deploymentMode: string,
    endpointExt: any
  ): Observable<any> {
    // Config.API.Config.BASE_POINT_API2 + 'data_content/
    if (deploymentMode === 'EL') {
      return this._httplayer.post(
        endpointExt.LEFT_SIDE_BAR_CONFIGURATIONS +
          'configurations_list_' +
          type +
          '/read',
        {}
      );
    } else if (deploymentMode === 'KL') {
      return this._http.get<any>('./assets/build-data/common/configlist.json');
    }
  }

  getComponentJson(): Observable<any> {
    // return this._http.get<any>('./assets/dev-data/master-form/masterForm.json');
    return this._httplayer.get(
      './assets/build-data/common/master-form/masterForm.json'
    );
  }
  getSldUrls(): Observable<any> {
    return this._http.get<any>('./assets/app-load-data/sldconfig.json');
    // return this._httplayer.post(Config.API.CONFIGURATIONS_SIDEBAR,{});
  }

  getgridData(): Observable<any> {
    return this._http.get<any>(
      './assets/static-data/config/manualData/gridloaddata.json'
    );
    // return this._httplayer.post(Config.API.CONFIGURATIONS_SIDEBAR,{});
  }

  // Alarm Configurations
  getAlarmList(url: string, data: object): Observable<any> {
    return this._httplayer.post(url, data);
  }
  getAlarmConf(url: string, data: object): Observable<any> {
    return this._httplayer.post(url, data);
  }

  getTagsForRuleset(url: string, data: object): Observable<any> {
    return this._httplayer.post(url, data);
  }

  enableOrDisableAlarm(data: any): Observable<any> {
    return this._httplayer.post(Config.API.ALARM_ENABLE_OR_DISABLE, data);
  }

  getWidgetDetailsService(widgetURL: string) {
    return this._http.get(widgetURL);
  }
  // gettacogatewaysData(key): Observable<any> {
  //   return this._http.get<any>('./assets/jsons/' + key + '.json');
  // }
  getDataService(dataURL: string) {
    return this._http.get(dataURL);
  }
  getDashboardGridDetails(dataURL: string) {
    return this._http.get(dataURL);
  }

  getFilters(dataToSend): Observable<any> {
    return this._httplayer.post(Config.API.FETCH_FILTER_DATA, dataToSend);
  }

  getAllUsers(): Observable<any> {
    return this._httplayer.get('./assets/login-data/registeredUsers.json');
  }

  getHeaderMenus(): Observable<any> {
    return this._httplayer.get('./assets/header-data/headerMenuData.json');
  }

  getLeftSideData(): Observable<any> {
    return this._http.get<any>('./assets/left-tree/dashboardlist.json');
  }

  getDashboardLeftSideconfigData(data): Observable<any> {
    return this._httplayer.post(Config.API.LIST_DASHBOARD, data);
  }
  saveDashboard(data): Observable<any> {
    const subject = new Subject<any>();
    const licenseData$ = this.getLicenseVerificiation(
      'dashboard',
      'site_id',
      data
    );
    licenseData$.subscribe((licenseData) => {
      if (licenseData.hasOwnProperty('isProceed') && licenseData.isProceed) {
        this._httplayer.post(Config.API.SAVE_DASHBOARD, data).subscribe(
          (dataPost) => {
            subject.next(dataPost);
          },
          (error) => {
            return subject.error(error);
          }
        );
        return subject.asObservable();
      } else {
        return subject.next(licenseData);
      }
    });
    return subject.asObservable();
  }
  deleteDashboard(data): Observable<any> {
    return this._httplayer.post(Config.API.DELETE_DASHBOARD, data);
  }

  getgateways(): Observable<any> {
    return this._http.get<any>('./assets/jsons/gateways.json');
  }
  getSitesData(): Observable<any> {
    return this._http.get<any>('./assets/jsons/sites.json');
  }

  getSiteStructureForm(): Observable<any> {
    return this._http.get<any>(
      './assets/static-data/config/sites/sitestructureformTemplete.json'
    );
  }
  getStructureForm(): Observable<any> {
    return this._http.get<any>('./assets/jsons/sites/sitestructureform.json');
  }
  getgatewaysData(key): Observable<any> {
    return this._http.get<any>('./assets/jsons/gateways/' + key + '.json');
  }
  getSites(key): Observable<any> {
    return this._http.get<any>('./assets/jsons/sites/' + key + '.json');
  }

  getUserManagementDataService(dataURL: string) {
    return this._http.get(dataURL);
  }

  getUserGroupsService(dataURL: string) {
    return this._http.get(dataURL);
  }
  getDevicesLocal(): Observable<any> {
    return this._httplayer.get('./assets/jsons/devices/device.json');
  }

  updateDashboardGridDetails(dataURL: string, innerHeight: any) {
    return this._http.patch(dataURL, { height: innerHeight });
  }

  getTagConfig(): Observable<any> {
    return this._httplayer.get(
      './assets/configurations-data/defaultTagConfig.json'
    );
  }

  getSitesNew(): Observable<any> {
    return this._httplayer.get('./assets/dashboard-filters/sites.json');
  }
  getDevicesNew(): Observable<any> {
    return this._httplayer.get('./assets/dashboard-filters/devices.json');
  }

  getDateType(): Observable<any> {
    return this._httplayer.get('./assets/dashboard-filters/date-type.json');
  }
  getDateTypeQuikPicks(): Observable<any> {
    return this._httplayer.get(
      './assets/dashboard-filters/dateType-Quikpicks.json'
    );
  }

  // getSitesNew():Observable<any>{
  //   return this._httplayer.get("./assets/dashboard-filters/sites.json");
  // }
  // getDevicesNew():Observable<any>{
  //   return this._httplayer.get("./assets/dashboard-filters/devices.json");
  // }

  // getDateType():Observable<any>{
  //   return this._httplayer.get("./assets/dashboard-filters/date-type.json");
  // }
  // getDateTypeQuikPicks():Observable<any>{
  //   return this._httplayer.get("./assets/dashboard-filters/dateType-Quikpicks.json");
  // }

  // getDevices(): Observable<any> {
  // return this._httplayer.get('./assets/jsons/devices/device.json');
  // }
  getDeviceConfig(): Observable<any> {
    return this._httplayer.get('./assets/jsons/devices/device_config.json');
  }
  // ===================================================Version Information======================================
  // getVersion() {
  //   return this._http.get<any>('./assets/build-data/common/generalSettings.json');
  // }

  getVersions(dataToPost): Observable<any> {
    return this._httplayer.post(
      Config.API.VERSIONS_INFO_GET_VERSION_INFO,
      dataToPost
    );
  }

  saveVersions(dataToPost): Observable<any> {
    return this._httplayer.post(
      Config.API.VERSIONS_INFO_UPSERT_VERSION_INFO,
      dataToPost
    );
  }

  // ===================================================Pin Header======================================

  getPinnedPages(endPoint, dataToPost): Observable<any> {
    return this._httplayer.post(endPoint, dataToPost);
  }

  savePinnedPages(endPoint, dataToPost): Observable<any> {
    return this._httplayer.post(endPoint, dataToPost);
  }

  // ===================================================Client Management======================================

  getClientList(dataToPost): Observable<any> {
    return this._httplayer.post(
      Config.API.CLIENTLIST_GET_CLIENT_LIST,
      dataToPost
    );
  }

  // Remove later - method reading JSON data for testing
  getClientData(url) {
    return this._httplayer.get(url);
  }

  viewClientData(dataToPost): Observable<any> {
    return this._httplayer.post(Config.API.CLIENTLIST_VIEW_CLIENT, dataToPost);
  }

  saveClientData(dataToPost): Observable<any> {
    // return;
    return this._httplayer.post(Config.API.CLIENTLIST_SAVE_CLIENT, dataToPost);
  }

  deleteClientData(dataToPost): Observable<any> {
    return this._httplayer.post(
      Config.API.CLIENTLIST_DELETE_CLIENT,
      dataToPost
    );
  }

  //extra method if required
  getDefaultClientLogo(imageURL): Observable<any> {
    return this._http.get(imageURL);
  }

  // ++++++++++++++++++++++++++++++++++++++++++++++++Configuration+++++++++++++++++++++++++++++++++++++
  // ============================================DFM Testing ========================================
  dfmTesting(): Observable<any> {
    return this._http.get<any>('./assets/static-data/dfmTestingData.json');
  }
  // ===================================================SitePage ======================================

  getSitesList(url, dataToPost): Observable<any> {
    return this._httplayer.post(url, dataToPost);
  }
  getSiteData(dataToPost): Observable<any> {
    return this._httplayer.post(Config.API.INDUSTRY_LOAD_TEMPLETE, dataToPost);
  }
  getSiteDataMap(dataToPost): Observable<any> {
    return this._httplayer.post(Config.API.MAP_DATA, dataToPost);
  }
  saveSiteData(dataToPost): Observable<any> {
    return this._httplayer.post(Config.API.INDUSTRY_SAVE, dataToPost);
  }
  updateSiteData(dataToPost): Observable<any> {
    return this._httplayer.post(Config.API.INDUSTRY_UPDATE, dataToPost);
  }
  // ================================================== MAnual Entry Page =============================
  getManualentrymenus(dataToPost): Observable<any> {
    return this._httplayer.post(Config.API.MANUAL_ENTRY_MENU, dataToPost);
  }
  getManualEntryMetaData(dataToPost, extension): Observable<any> {
    return this._httplayer.post(
      Config.API.MANUAL_ENTRY_GETMETADATA,
      dataToPost
    );
  }
  saveConfigManualEntry(dataToPost): Observable<any> {
    return this._httplayer.post(
      Config.API.MANUAL_ENTRY_SAVE_CONFIG,
      dataToPost
    );
  }
  getManualEntryRecord(dataToPost): Observable<any> {
    return this._httplayer.post(Config.API.MANUAL_ENTRY_GET_ENTRY, dataToPost);
  }
  getManualEntryTableData(dataToPost): Observable<any> {
    return this._httplayer.post(
      Config.API.MANUAL_ENTRY_FETCH_TABLE,
      dataToPost
    );
  }
  getBatchList(data): Observable<any> {
    return this._httplayer.post(Config.API.MANUAL_ENTRY_BATCH_LIST, data);
  }
  saveManualEntry(data): Observable<any> {
    return this._httplayer.post(Config.API.MANUAL_ENTRY_SAVE, data);
  }
  saveMetaDataServ(data): Observable<any> {
    return this._httplayer.post(Config.API.MANUAL_ENTRY_SAVE_METADATA, data);
  }
  addMetaKeys(data): Observable<any> {
    return this._httplayer.post(Config.API.MANUAL_ENTRY_SAVE_METAKEYS, data);
  }
  getMetaKeyValuePairs(data): Observable<any> {
    return this._httplayer.post(Config.API.MANUAL_ENTRY_GET_METAKEYS, data);
  }
  fetchDeviceLatestData(data): Observable<any> {
    // return this._http.get('./assets/dev-data/manual-entry/fetchDeviceLatestData-sample.json');
    return this._httplayer.post(
      Config.API.MANUAL_ENTRY_FETCH_DEVICE_LATEST_DATA,
      data
    );
  }
  fetchDeviceHistory(data): Observable<any> {
    // return this._http.get('./assets/dev-data/manual-entry/showHistory-sample-data.json');
    return this._httplayer.post(
      Config.API.MANUAL_ENTRY_SHOW_HISTORY_DEVICE,
      data
    );
  }

  // ===================================================UserManagementPage ======================================
  //------------------------------------User List------------------------------------------
  getUserList(dataToPost): Observable<any> {
    return this._httplayer.post(Config.API.USERLIST_GET_USER_LIST, dataToPost);
  }
  getUserMgmtDropdown(dataToPost): Observable<any> {
    return this._httplayer.post(Config.API.USERLIST_GET_DROPDOWN, dataToPost);
  }

  // editUserData(dataToPost): Observable<any> {

  //   const subject = new Subject<any>();
  //   const licenseData$ = this.getLicenseVerificiation('user', 'site_id', dataToPost);
  //   licenseData$.subscribe((licenseData) => {
  //     if (licenseData.hasOwnProperty('isProceed') && licenseData['isProceed']) {
  //       this._httplayer.post(Config.API.USERLIST_EDIT_USER, dataToPost).subscribe((data) => {
  //         subject.next(data);
  //       });
  //       return subject.asObservable();
  //     } else if (!licenseData['isProceed']) {
  //       subject.next(licenseData);
  //       return subject.asObservable();
  //     } else {
  //       return subject.asObservable();
  //     }
  //   });
  //   return subject.asObservable();
  // }

  saveUserData(action, dataToPost): Observable<any> {
    switch (action) {
      case 'addUser':
        const subject = new Subject<any>();
        const licenseData$ = this.getLicenseVerificiation(
          'user',
          'site_id',
          dataToPost
        );
        licenseData$.subscribe((licenseData) => {
          if (
            licenseData.hasOwnProperty('isProceed') &&
            licenseData['isProceed']
          ) {
            this._httplayer
              .post(Config.API.USERLIST_SAVE_USER, dataToPost)
              .subscribe((data) => {
                subject.next(data);
              });
            return subject.asObservable();
          } else if (!licenseData['isProceed']) {
            subject.next(licenseData);
            return subject.asObservable();
          } else {
            return subject.asObservable();
          }
        });
        return subject.asObservable();
        break;

      case 'editUser':
        return this._httplayer.post(Config.API.USERLIST_EDIT_USER, dataToPost);
        break;

      default:
        break;
    }
  }

  deleteUserData(dataToPost): Observable<any> {
    return this._httplayer.post(Config.API.USERLIST_DELETE_USER, dataToPost);
  }

  getDefaultUserImage(imageURL): Observable<any> {
    return this._http.get(imageURL);
  }

  // ------------------------------------Work Group------------------------------------------

  getWorkGroupList(dataToPost): Observable<any> {
    return this._httplayer.post(
      Config.API.WORKGROUP_GET_WORKGROUP_LIST,
      dataToPost
    );
  }

  saveWorkGroup(dataToPost): Observable<any> {
    return this._httplayer.post(
      Config.API.WORKGROUP_SAVE_WORKGROUP,
      dataToPost
    );
  }
  deleteWorkGroup(dataToPost): Observable<any> {
    return this._httplayer.post(
      Config.API.WORKGROUP_DELETE_WORKGROUP,
      dataToPost
    );
  }

  //------------------------------------Access Levels------------------------------------------

  getUserRoleAcessLevelTree(dataToPost): Observable<any> {
    return this._httplayer.post(
      Config.API.ACCESS_LEVEL_GET_USER_ROLE_PERMISSION_TREE,
      dataToPost
    );
  }
  getAccessLevelDataList(dataToPost): Observable<any> {
    return this._httplayer.post(Config.API.GET_USER_ROLE_LIST, dataToPost);
  }
  getAccessLevel(dataToPost): Observable<any> {
    return this._httplayer.post(Config.API.GET_USER_ROLE_LIST_KL, dataToPost);
  }

  editAccessLevel(dataToPost): Observable<any> {
    return this._httplayer.post(Config.API.GET_USER_ROLE_LIST_KL, dataToPost);
  }
  saveAccessLevelData(dataToPost): Observable<any> {
    return this._httplayer.post(Config.API.ADD_USER_ROLE, dataToPost);
  }
  deleteAccessLevelData(dataToPost): Observable<any> {
    return this._httplayer.post(Config.API.DELETE_USER_ROLE, dataToPost);
  }

  // getAccessFromLicense(dataToSend): Observable<any> {
  //   return this._httplayer.post(Config.API.GET_USER_ROLE_LICENSE_DETAILS, dataToSend);
  // }

  getAccessFromLicense(dataToSend): Observable<any> {
    return this._httplayer.post(
      Config.API.GET_USER_ROLE_LICENSE_DETAILS_KL,
      dataToSend
    );
  }

  getFeatureAccessList(): Observable<any> {
    return this._httplayer.get(
      './assets/build-data/user-management/access-level/accessLevelsList.json'
    );
  }

  getMenuJSON(dataToSend): Observable<any> {
    // return this._httplayer.get('./assets/dev-data/menu.json');
    return this._httplayer.post(
      Config.API.GET_AUTHORIZED_MENU_JSON,
      dataToSend
    );
  }

  // ------------------------------------User Profile--------------------------------------------

  // getUserProfileData(dataToPost): Observable<any> {
  //   return this._httplayer.post(Config.API.USERLIST_GET_USER_LIST, dataToPost);
  // }

  getUserProfileData(endPoint, dataToPost): Observable<any> {
    return this._httplayer.post(endPoint, dataToPost);
  }

  saveUserProfileData(dataToPost): Observable<any> {
    return this._httplayer.post(Config.API.USERLIST_EDIT_USER, dataToPost);
    // return this._httplayer.post(Config.API.USERLIST_SAVE_USER, dataToPost);
  }

  getThemes() {
    return this._http.get('./assets/build-data/common/configurations.json');
  }

  // getData(urlString){
  //   return this._http.get(urlString);
  // }

  //------------------------------------other methods - User Management------------------------------------------

  upload(fileToUpload: any) {
    const input = new FormData();
    input.append('file', fileToUpload);

    return this._httplayer.post('/api/uploadFile', input);
  }

  // =============================================Business Groups======================================
  // ---------------------------------------------Device Groups----------------------------------------
  getdeviceGroupsList(dataToPost): Observable<any> {
    return this._httplayer.post(Config.API.DEVICE_GROUP_LIST, dataToPost);
  }
  loadDeviceGroup(dataToPost): Observable<any> {
    return this._httplayer.post(Config.API.DEVICE_GROUP_FETCH, dataToPost);
  }
  updateDeviceGroup(dataToPost): Observable<any> {
    return this._httplayer.post(Config.API.DEVICE_GROUP_UPDATE, dataToPost);
  }
  getAccordianHeaderNames() {
    return this._http.get<any>('./assets/build-data/common/stepper.json');
  }
  // ---------------------------------------------Tag Groups----------------------------------------
  getTagGroupsList(dataToPost): Observable<any> {
    return this._httplayer.post(Config.API.TAG_GROUP_LIST, dataToPost);
  }

  loadTagGroup(dataToPost): Observable<any> {
    return this._httplayer.post(Config.API.TAG_GROUP_FETCH, dataToPost);
  }
  updateTagGroup(dataToPost): Observable<any> {
    return this._httplayer.post(Config.API.TAG_GROUP_UPDATE, dataToPost);
  }

  // ===========================================Master Config=========================================
  // -------------------------------------------Device Model------------------------------------------
  getDeviceModelsList(dataToPost): Observable<any> {
    return this._httplayer.post(Config.API.DEVICE_MODEL_GETLIST, dataToPost);
  }
  getDeviceModelList(dataToPost): Observable<any> {
    // return this._httplayer.get('./assets/jsons/devices/device_config.json');
    return this._httplayer.post(
      Config.API.DEVICE_MODEL_LOAD_TEMPLETE,
      dataToPost
    );
  }
  saveDeviceModelData(dataToPost): Observable<any> {
    return this._httplayer.post(Config.API.DEVICE_MODEL_LOAD_SAVE, dataToPost);
  }

  // Lookup Tables

  lookupsList(url, dataToPost): Observable<any> {
    return this._httplayer.post(url, dataToPost);
  }
  getlookuptabledata(dataToPost): Observable<any> {
    return this._httplayer.post(Config.API.LOOKUPS_TABLE, dataToPost);
  }

  submitlookup(dataToPost): Observable<any> {
    return this._httplayer.post(Config.API.SUBMIT_LOOKUP, dataToPost);
  }
  // -------------------------------------------Unit Converter------------------------------------------

  getUnitConverterData(dataToPost): Observable<any> {
    return this._httplayer.post(
      Config.API.GET_UNIT_CONVERTER_OR_UNITS,
      dataToPost
    );
  }

  saveUnitConverter(dataToPost): Observable<any> {
    return this._httplayer.post(Config.API.SAVE_UNIT_CONVERTER, dataToPost);
  }

  // ===================================================Unit and Threshold Configuratioin ======================================
  getUnits(): Observable<any> {
    return this._httplayer.post(Config.API.UNIT_GET, {});
  }
  saveOrUpdateUnit(dataToPost: any): Observable<any> {
    // return this._http.get<any>('./assets/static-data/config/sites/sitestructureformTemplete.json');
    return this._httplayer.post(Config.API.UNIT_SAVE, dataToPost);
  }

  deleteUnit(dataToPost: any): Observable<any> {
    // return this._http.get<any>('./assets/static-data/config/sites/sitestructureformTemplete.json');
    return this._httplayer.post(Config.API.UNIT_DELETE, dataToPost);
  }

  getThresholds(url: string, data: object): Observable<any> {
    return this._httplayer.post(url, data);
  }

  saveOrUpdateThreshold(dataToPost: any): Observable<any> {
    // return this._http.get<any>('./assets/static-data/config/sites/sitestructureformTemplete.json');
    return this._httplayer.post(Config.API.THRESHOLD_SAVE, dataToPost);
  }

  deleteThreshold(data: any): Observable<any> {
    return this._httplayer.post(Config.API.THRESHOLD_DELETE, data);
  }
  // ++++++++++++++++++++++++++++++++++++++++++++++++Dashboard+++++++++++++++++++++++++++++++++++++

  getChartInfo(dataToPost): Observable<any> {
    return this._httplayer.postDashboard(
      Config.API.CHART_PREVIEW_DATA_KL,
      dataToPost
    );
    // return this._http.get('./assets/dev-data/Dashboard/compareResponse.json');
  }

  getChartInfoReport(dataToPost): Observable<any> {
    return this._httplayer.postDashboard(
      Config.API.REPORT_PREVIEW_DATA,
      dataToPost
    );
  }

  getFilterMenu() {
    return this._httplayer.post(Config.API.FILTER_SHOW_HIDE, {});
  }
  // +++++++++++++++++++++++++++++++++++++++++++++++ Widget Config +++++++++++++++++++++++++++++++++++++
  getPreviewChartData(dataToPost): Observable<any> {
    return this._httplayer.postDashboard(
      Config.API.CHART_PREVIEW_DATA_KL,
      dataToPost
    );
    // return this._http.get('./assets/dev-data/Dashboard/compareResponse.json');
  }
  getPreviewChartDataReport(dataToPost): Observable<any> {
    return this._httplayer.postDashboard(
      Config.API.REPORT_PREVIEW_DATA,
      dataToPost
    );
  }
  getPreviewChartDataTopics(dataToPost): Observable<any> {
    // return this._httplayer.get(`./assets/static-data/${type}.json`);
    return this._httplayer.post(
      Config.API.CHART_PREVIEW_DATA_TOPICS,
      dataToPost
    );
    // return this._httplayer.get(`./assets/dev-data/Dashboard/harmonicsresp.json`);
  }
  getChartConfigMetaData(dataToPost): Observable<any> {
    // return this._httplayer.get(`./assets/static-data/${type}.json`);
    return this._httplayer.post(Config.API.CHART_GET_METADATA, dataToPost);
  }
  getChartUnitMetaData(dataToPost): Observable<any> {
    // creturn this._httplayer.get(`./assets/static-data/${type}.json`);
    return this._httplayer.post(Config.API.CHART_GET_UNIT_METADATA, dataToPost);
  }
  saveWidgetConfigData(dataToPost): Observable<any> {
    const subject = new Subject<any>();
    const licenseData$ = this.getLicenseVerificiation(
      'widget',
      'site_id',
      dataToPost
    );
    licenseData$.subscribe((licenseData) => {
      if (licenseData.hasOwnProperty('isProceed') && licenseData.isProceed) {
        this._httplayer
          .post(Config.API.SAVE_WIDGET_DATA, dataToPost)
          .subscribe((data) => {
            subject.next(data);
          });
        return subject.asObservable();
      } else {
        return subject.next(licenseData);
      }
    });
    return subject.asObservable();
  }
  saveWidgetResizeData(dataToPost): Observable<any> {
    const subject = new Subject<any>();
    const licenseData$ = this.getLicenseVerificiation(
      'widget',
      'site_id',
      dataToPost
    );
    licenseData$.subscribe((licenseData) => {
      if (licenseData.hasOwnProperty('isProceed') && licenseData.isProceed) {
        this._httplayer
          .post(Config.API.SAVE_WIDGET_RESIZE_DATA, dataToPost)
          .subscribe((data) => {
            subject.next(data);
          });
        return subject.asObservable();
      } else {
        return subject.next(licenseData);
      }
    });
    return subject.asObservable();
  }

  getDashboardData(dataToPost): Observable<any> {
    return this._httplayer.post(Config.API.GET_DASHBOARD_DATA, dataToPost);
  }

  deleteWidget(dataToPost): Observable<any> {
    return this._httplayer.post(Config.API.DELETE_WIDGET, dataToPost);
  }

  getReportTemplate(data: object): Observable<any> {
    return this._httplayer.post(Config.API.GET_REPORT_TEMPLATE, data);
  }
  getDashboardTemplate(data: object): Observable<any> {
    return this._httplayer.post(Config.API.GET_DASHBOARD_TEMPLATE, data);
    // return this._http.get<any>('./assets/dev-data/Dashboard/dashboardTemplate.json');
  }

  getDFMOfReportTemplate(data: object): Observable<any> {
    return this._httplayer.post(Config.API.GET_DFM_REPORT_TEMPLATE, data);
    // return this._httplayer.get('./assets/build-data/register/registerFormDFM.json');
  }

  generateReport(data: object): Observable<any> {
    return this._httplayer.post(Config.API.GENERATE_REPORT, data);
  }

  generateReportKL(data: object): Observable<any> {
    return this._httplayer.post(Config.API.GENERATE_REPORT_KL, data);
  }

  downloadReport(fileName: string) {
    location.href = Config.API.DOWNLOAD_REPORT + fileName;
  }

  // ****************************************** Mater gateway and Channel Configuration************/

  // MASTER CONFIGURATION GATEWAY APIS

  getProtocols(): Observable<any> {
    return this._httplayer.post(Config.API.GATEWAY_MODEL_PROTOCOL_LIST, {});
  }
  // gateway model protocols
  getModelProtocolsBody(protocl): Observable<any> {
    return this._httplayer.post(Config.API.GATEWAY_MASTER_DFM, protocl);
  }

  createGatewayModel(jsonData): Observable<any> {
    return this._httplayer.post(Config.API.GATEWAY_SAVE, jsonData);
  }

  getSavedogatewaysData(key): Observable<any> {
    return this._httplayer.post(Config.API.GATEWAY_MASTER_DFM, { key });
  }

  getgatewaysDataLists(): Observable<any> {
    return this._httplayer.post(Config.API.GATEWAY_GET_LIST, {});
  }

  // CHANNEL CONFIGURATION APIS

  // channel gateway configuration
  getChannelConfigurationPageHeadings() {
    return this._http.get<any>(
      './assets/build-data/channel-configuration/page-headings.json'
    );
  }
  getGatewaysDataBYID(dataToPost): Observable<any> {
    // return this._httplayer.post(Config.API.GATEWAY_LOAD_MODEL_INSTANCE_TEMPLETE, { key });
    return this._httplayer.post(
      Config.API.GATEWAY_LOAD_MODEL_INSTANCE_TEMPLETE,
      dataToPost
    );
    // return this._httplayer.post(Config.API.GATEWAY_MASTER_DFM, { key: key });
  }
  getGatewaysDataByModel(key): Observable<any> {
    return this._httplayer.post(Config.API.GATEWAY_LOAD_TEMPLETE1, { key });
  }
  getChannelRowProtocols(): Observable<any> {
    return this._httplayer.post(Config.API.GATEWAY_INSTANCE_PROTOCOL_LIST, {});
  }
  getChannelgatewaysModels(): Observable<any> {
    return this._httplayer.post(
      Config.API.GATEWAY_INSTANCE_GET_GATEWAY_MODEL_LIST,
      {}
    );
  }
  getChannelRowProtocolsWithDFM(dataToPost): Observable<any> {
    // return this._httplayer.post(Config.API.GATEWAY_LOAD_TEMPLETE1, {});
    return this._httplayer.post(Config.API.GATEWAY_LOAD_TEMPLETE1, dataToPost);
  }
  createGateway(data): Observable<any> {
    const subject = new Subject<any>();
    const licenseData$ = this.getLicenseVerificiation(
      'gateway_instance',
      'site_id',
      data
    );
    licenseData$.subscribe((licenseData) => {
      if (licenseData.hasOwnProperty('isProceed') && licenseData['isProceed']) {
        this._httplayer
          .post(Config.API.GATEWAY_CREATE, data)
          .subscribe((data) => {
            subject.next(data);
          });
        return subject.asObservable();
      } else if (!licenseData['isProceed']) {
        subject.next(licenseData);
        return subject.asObservable();
      } else {
        return subject.asObservable();
      }
    });
    return subject.asObservable();
  }

  getChannelRowGatewaysDataByModel(key): Observable<any> {
    //for app2 purpose
    // return this._httplayer.post(Config.API.GATEWAY_LOAD_GET_INSTANCE, { key });
    // return this._httplayer.post(Config.API.GATEWAY_LOAD_TEMPLETE1, dataToPost);
    return this._httplayer.post(Config.API.GATEWAY_LOAD_TEMPLETE1, key);
  }
  getCardSettings(dataToPost): Observable<any> {
    return this._httplayer.post(Config.API.GATEWAY_INSTANCE_LIST, dataToPost);
  }
  getDeviceModelData(): Observable<any> {
    return this._httplayer.post(Config.API.CHANNEL_DEVICE_MODEL_LIST, {});
  }
  // getDevices(key): Observable<any> {
  //   return this._httplayer.post(Config.API.GATEWAY_SILO, { gateway_instance_id: key });
  // }
  getDevices(key): Observable<any> {
    return this._httplayer.post(Config.API.GATEWAY_GET_DATA_KL, {
      gateway_instance_id: key
    });
  }
  getDFMDeviceModelBodyByID(key): Observable<any> {
    //for dynamic
    // return this._httplayer.post(Config.API.DEVICE_LOAD_MODEL_INSTANCE_TEMPLETE, { "device_model_id": key });
    return this._httplayer.post(
      Config.API.DEVICE_LOAD_MODEL_INSTANCE_TEMPLETE,
      key
    );
  }
  getDFMDeviceModelBody(): Observable<any> {
    return this._httplayer.post(Config.API.DEVICE_MODEL_LOAD_INSTANCE, {});
  }
  getDFMDeviceModelBodyContentByID(key): Observable<any> {
    return this._httplayer.post(Config.API.DEVICE_MODEL_LOAD_INSTANCE, key);
    // return this._httplayer.post(Config.API.DEVICE_MODEL_DEVICE_INSTANCE, { device_instance_id: key });
    // return this._httplayer.post(Config.API.DEVICE_MODEL_LOAD_INSTANCE, { device_instance_id: key });
  }
  deleteGateway(key, value): Observable<any> {
    return this._httplayer.post(Config.API.GATEWAY_DELETE, {
      gateway_instance_id: key,
      action: value
    });
  }

  disableGateway(key, value): Observable<any> {
    return this._httplayer.post(Config.API.GATEWAY_DISABLE, {
      gateway_instance_id: key,
      action: value
    });
  }

  deleteDevice(key, value): Observable<any> {
    return this._httplayer.post(Config.API.DEVICE_DELETE, {
      device_instance_id: key,
      action: value
    });
  }
  disableDevice(key, value): Observable<any> {
    return this._httplayer.post(Config.API.DEVICE_DISABLE, {
      device_instance_id: key,
      action: value
    });
  }

  getDeviceModelsConfiguraionList(dataToPost): Observable<any> {
    return this._httplayer.post(Config.API.DEVICE_INSTANCE_LIST, dataToPost);
  }

  getDeviceModelConfigurationList(dataToPost): Observable<any> {
    return this._httplayer.post(
      Config.API.DEVICE_MODEL_LOAD_INSTANCE,
      dataToPost
    );
  }
  saveDeviceModelConfigurationData(dataToPost): Observable<any> {
    const subject = new Subject<any>();
    const licenseData$ = this.getLicenseVerificiation(
      'sensor',
      'site_id',
      dataToPost
    );
    licenseData$.subscribe((licenseData) => {
      if (licenseData.hasOwnProperty('isProceed') && licenseData['isProceed']) {
        this._httplayer
          .post(Config.API.DEVICE_MODEL_LOAD_CREATE, dataToPost)
          .subscribe((data) => {
            subject.next(data);
          });
        return subject.asObservable();
      } else if (!licenseData['isProceed']) {
        subject.next(licenseData);
        return subject.asObservable();
      } else {
        return subject.asObservable();
      }
    });
    return subject.asObservable();
    // return this._httplayer.post(Config.API.DEVICE_MODEL_LOAD_CREATE, dataToPost);
  }
  saveDeviceModelConfigurationDataSensorCreate(dataToPost): Observable<any> {
    const subject = new Subject<any>();
    const licenseData$ = this.getLicenseVerificiation(
      'sensor',
      'site_id',
      dataToPost
    );
    licenseData$.subscribe((licenseData) => {
      if (licenseData.hasOwnProperty('isProceed') && licenseData['isProceed']) {
        this._httplayer
          .post(Config.API.SENSOR_SINGLE_DEVICE_CREATE, dataToPost)
          .subscribe((data) => {
            subject.next(data);
          });
        return subject.asObservable();
      } else if (!licenseData['isProceed']) {
        subject.next(licenseData);
        return subject.asObservable();
      } else {
        return subject.asObservable();
      }
    });
    return subject.asObservable();
    // return this._httplayer.post(Config.API.SENSOR_SINGLE_DEVICE_CREATE, dataToPost);
  }

  //static gatewya tags/models
  // getStaticGatewayTags(): Observable<any> {
  //   return this._httplayer.post(Config.API.Static_Gateway_Tags_GET, {});
  // }

  // createStaticGatewayTags(dataToPost): Observable<any> {
  //   return this._httplayer.post(Config.API.Static_Gateway_Tags_SAVE, dataToPost);
  // }

  getStaticGatewayTags(id): Observable<any> {
    return this._httplayer.post(Config.API.GATEWAY_TAGS + id + '/get', {});
  }

  createStaticGatewayTags(id, dataToPost): Observable<any> {
    return this._httplayer.post(
      Config.API.GATEWAY_TAGS + id + '/create',
      dataToPost
    );
  }
  // getStaticGatewayModels(): Observable<any> {
  //   return this._httplayer.post(Config.API.Dynamic_Gateway_Models_GET, {});
  // }
  // tslint:disable-next-line: function-name
  // StaticDynamicModuleContent(dataPost): Observable<any> {
  //   return this._httplayer.post(Config.API.Dynamic_Gateway_Models_INSERT, dataPost);
  // }
  // tslint:disable-next-line: function-name

  getStaticGatewayModels(id): Observable<any> {
    return this._httplayer.post(
      Config.API.GET_DATA_CONTENT_GATEWAY_MODELS + id + '/read',
      {}
    );
  }
  StaticDynamicModuleContent(id, dataPost): Observable<any> {
    return this._httplayer.post(
      Config.API.GET_DATA_CONTENT_GATEWAY_MODELS + id + '/upsert',
      dataPost
    );
  }

  dynamicGatewaysDragDropList(data, dataPost): Observable<any> {
    return this._httplayer.post(data, dataPost);
  }
  getDynamicGatewayList(data): Observable<any> {
    return this._httplayer.post(data, {});
  }
  getTimerSettings(): Observable<any> {
    return this._httplayer.post(Config.API.TIMER_SETTINGS_DC, {});
  }
  //static device tags/models
  // getStaticDeviceTags(): Observable<any> {
  //   return this._httplayer.post(Config.API.Static_Device_Tags_GET, {});
  // }
  // createStaticDeviceTags(dataToPost): Observable<any> {
  //   return this._httplayer.post(Config.API.Static_Device_Tags_SAVE, dataToPost);
  // }
  // getStaticDeviceTags(dataUrl): Observable<any> {
  //   return this._httplayer.post(dataUrl, {});
  // }
  // createStaticDeviceTags(dataUrl, dataToPost): Observable<any> {
  //   return this._httplayer.post(dataUrl, dataToPost);
  // }

  // getStaticDeviceModels(): Observable<any> {
  //   return this._httplayer.post(Config.API.Dynamic_Device_Models_GET, {});
  // }

  getStaticDeviceModels(id): Observable<any> {
    return this._httplayer.post(
      Config.API.GET_DATA_CONTENT_SENSOR_MODELS + id + '/read',
      {}
    );
  }

  // tslint:disable-next-line: function-name
  // StaticDynamicModuleDeviceContent(dataPost): Observable<any> {
  //   return this._httplayer.post(Config.API.Dynamic_Device_Models_INSERT, dataPost);
  // }
  StaticDynamicModuleDeviceContent(id, dataPost): Observable<any> {
    return this._httplayer.post(
      Config.API.GET_DATA_CONTENT_SENSOR_MODELS + id + '/upsert',
      dataPost
    );
  }

  // virtual device
  getVirualDeviceList(dataToPost): Observable<any> {
    return this._httplayer.post(
      Config.API.Virual_Device_LOAD_INSTANCE,
      dataToPost
    );
  }

  getVirtualLists(data) {
    return this._httplayer.post(Config.API.Virual_Device_List, data);
  }

  saveVirtualDeviceData(dataToPost): Observable<any> {
    const subject = new Subject<any>();
    const licenseData$ = this.getLicenseVerificiation(
      'device_instance',
      'site_id',
      dataToPost
    );
    licenseData$.subscribe((licenseData) => {
      if (licenseData.hasOwnProperty('isProceed') && licenseData['isProceed']) {
        this._httplayer
          .post(Config.API.Virual_Device_CREATE, dataToPost)
          .subscribe((data) => {
            subject.next(data);
          });
        return subject.asObservable();
      } else if (!licenseData['isProceed']) {
        subject.next(licenseData);
        return subject.asObservable();
      } else {
        return subject.asObservable();
      }
    });
    return subject.asObservable();
    // return this._httplayer.post(Config.API.Virual_Device_CREATE, dataToPost);
  }

  getVirtualDFMDeviceBodyContentByID(key): Observable<any> {
    return this._httplayer.post(Config.API.Virual_Device_LOAD_INSTANCE, key);
    // return this._httplayer.post(url, key);
  }
  getManualTagLists() {
    return this._httplayer.post(Config.API.Virual_Device_Manual_Tag_List, {});
  }
  saveVirtualManualTagData(dataToPost) {
    return this._httplayer.post(
      Config.API.Virual_Device_Manual_Tag_Create,
      dataToPost
    );
  }
  getVirtualDeviceTag(dataToPost): Observable<any> {
    return this._httplayer.post(
      Config.API.Virual_Device_LOAD_Tag_Data,
      dataToPost
    );
  }
  getVirtualManualTagData(key) {
    return this._httplayer.post(Config.API.Virual_Device_Manual_Tag_List, {
      device_instance_id: key
    });
    //Virual_Device_Manual_Tag_List
  }
  //

  // gateway status

  getGatewayStatus(dataToPost) {
    return this._httplayer.post(Config.API.GATEWAY_STATUS, dataToPost);
  }

  // Aggregation Type
  getAggregationType(): Observable<any> {
    return this._httplayer.post(Config.API.AGGREGATION_TYPE_GET, {});
  }
  saveOrUpdateAggregationType(dataToPost: any): Observable<any> {
    return this._httplayer.post(Config.API.AGGREGATION_TYPE_SAVE, dataToPost);
  }
  //   saveOrUpdateAggregationType(dataToPost: any, apiName: any): Observable<any> {
  //     return this._httplayer.post(Config.API[apiName], dataToPost);
  // }
  deleteAggregationType(dataToPost: any): Observable<any> {
    return this._httplayer.post(Config.API.AGGREGATION_TYPE_DELETE, dataToPost);
  }
  // Alarm Notification Type
  getAlarmNotifyType(): Observable<any> {
    return this._httplayer.post(Config.API.ALARM_NOTIFY_TYPE_GET, {});
  }
  saveOrUpdateAlarmNotificationType(dataToPost: any): Observable<any> {
    return this._httplayer.post(Config.API.ALARM_NOTIFY_TYPE_SAVE, dataToPost);
  }
  deleteAlarmNotificationType(dataToPost: any): Observable<any> {
    return this._httplayer.post(
      Config.API.ALARM_NOTIFY_TYPE_DELETE,
      dataToPost
    );
  }
  //

  getDeviceTypes(): Observable<any> {
    return this._httplayer.post(Config.API.DEVICE_TYPES_GET, {});
  }

  saveDeviceType(data: any): Observable<any> {
    // return this._httplayer.post(Config.API.DEVICE_TYPES_CREATE, { data : [data] });
    return this._httplayer.post(Config.API.DEVICE_TYPES_CREATE, data);
  }

  deleteDeviceType(id: string): Observable<any> {
    return this._httplayer.post(Config.API.DEVICE_TYPES_DELETE, { id });
  }

  getGatewayTypes(): Observable<any> {
    return this._httplayer.post(Config.API.GATEWAY_TYPES_GET, {});
  }

  saveGatewayType(data: any): Observable<any> {
    return this._httplayer.post(Config.API.GATEWAY_TYPES_CREATE, data);
  }

  deleteGatewayType(id: string): Observable<any> {
    return this._httplayer.post(Config.API.GATEWAY_TYPES_DELETE, { id });
  }

  getAlarmPriorityTypes(url: string, data: object): Observable<any> {
    return this._httplayer.post(url, data);
  }

  getPriorityLevels(): Observable<any> {
    return this._http.get<any>(
      './assets/build-data/dashboard/prioritytype.json'
    );
  }

  saveAlarmPriorityType(data: any): Observable<any> {
    return this._httplayer.post(Config.API.ALARM_PRIORITY_TYPE_CREATE, data);
  }

  deleteAlarmPriorityType(id: string): Observable<any> {
    return this._httplayer.post(Config.API.ALARM_PRIORITY_TYPE_DELETE, { id });
  }

  saveAlarmConfig(data: any) {
    return this._httplayer.post(Config.API.ALARM_CONFIGURATION_CREATE, data);
  }

  deleteAlarmConfig(id: string) {
    return this._httplayer.post(Config.API.ALARM_CONFIGURATION_DELETE, { id });
  }

  getMultiplicationFactors(): Observable<any> {
    return this._httplayer.post(Config.API.MULTIPLICATION_FACTOR_GET, {});
  }

  saveMultiplicationFactor(data: any): Observable<any> {
    return this._httplayer.post(Config.API.MULTIPLICATION_FACTOR_CREATE, data);
  }

  deleteMultiplicationFactor(id: string): Observable<any> {
    return this._httplayer.post(Config.API.MULTIPLICATION_FACTOR_DELETE, {
      multiplication_factor_id: id
    });
  }

  // Time Slot
  getShiftDetails(dataToPost): Observable<any> {
    return this._httplayer.post(Config.API.LATESTTIMESLOT_GET, dataToPost);
  }
  getFullTree(url, data): Observable<any> {
    return this._httplayer.post(url, data);
  }
  getTimeSlot(name: any): Observable<any> {
    return this._httplayer.post(Config.API.TIMESLOT_GET, { timeslot_id: name });
  }
  saveTimeSlot(data: any): Observable<any> {
    return this._httplayer.post(Config.API.TIMESLOT_SAVE, data);
  }
  // Alarm Type
  getAlarmType(): Observable<any> {
    return this._httplayer.post(Config.API.ALARMTYPE_GET, {});
  }
  saveOrUpdateAlarmType(dataToPost: any): Observable<any> {
    return this._httplayer.post(Config.API.ALARMTYPE_SAVE, dataToPost);
  }
  deleteAlarmType(dataToPost: any): Observable<any> {
    return this._httplayer.post(Config.API.ALARMTYPE_DELETE, dataToPost);
  }

  // Function Code
  getModbusFunctionCode(): Observable<any> {
    return this._httplayer.post(Config.API.FUNCTION_CODE_GET, {});
  }
  saveOrUpdateFunctionCode(dataToPost: any): Observable<any> {
    return this._httplayer.post(Config.API.FUNCTION_CODE_SAVE, dataToPost);
  }
  deleteFunctionCode(dataToPost: any): Observable<any> {
    return this._httplayer.post(Config.API.FUNCTION_CODE_DELETE, dataToPost);
  }
  // -------------------------------------------Batch Entry------------------------------------------

  getTagGroupsOrBatchDetails(dataToPost): Observable<any> {
    return this._httplayer.post(
      Config.API.GET_TAG_GROUPS_OR_BATCH_DETAILS,
      dataToPost
    );
  }
  getTagsForBatchEntry(dataToPost): Observable<any> {
    return this._httplayer.post(Config.API.GET_TAGS_IN_TAG_GROUP, dataToPost);
  }

  getBatchEntry(dataToPost): Observable<any> {
    return this._httplayer.post(Config.API.GET_BATCH_ENTRY, dataToPost);
  }

  saveBatchEntry(dataToPost): Observable<any> {
    return this._httplayer.post(Config.API.SAVE_BATCH_ENTRY, dataToPost);
  }

  deleteBatchEntry(dataToPost): Observable<any> {
    return this._httplayer.post(Config.API.DELETE_BATCH_ENTRY, dataToPost);
  }
  // Data Type
  getAllDataType(): Observable<any> {
    return this._httplayer.post(Config.API.DATA_TYPE_GET, {});
  }
  saveOrUpdateDataType(dataToPost: any): Observable<any> {
    return this._httplayer.post(Config.API.DATA_TYPE_SAVE, dataToPost);
  }
  deleteDataType(dataToPost: any): Observable<any> {
    return this._httplayer.post(Config.API.DATA_TYPE_DELETE, dataToPost);
  }
  // Frequenct List
  getFrequencyList(): Observable<any> {
    return this._httplayer.post(Config.API.FREQUENCY_LIST_GET, {});
  }
  saveOrUpdateFrequencyList(dataToPost: any): Observable<any> {
    return this._httplayer.post(Config.API.FREQUENCY_LIST_SAVE, dataToPost);
  }
  deleteFrequencyList(dataToPost: any): Observable<any> {
    return this._httplayer.post(Config.API.FREQUENCY_LIST_DELETE, dataToPost);
  }
  // Lookup Configuration

  savelookup(formdata): Observable<any> {
    return this._httplayer.post(Config.API.ADD_LOOKUP, formdata);
  }

  lookupConfigurationtabledata(url, dataToPost): Observable<any> {
    return this._httplayer.post(url, dataToPost);
  }

  deletelookup(lookupid): Observable<any> {
    return this._httplayer.post(Config.API.DELETE_LOOKUP, {
      lookup_id: lookupid
    });
  }
  getMasterUnits(): Observable<any> {
    return this._httplayer.post(Config.API.MASTER_UNIT_GET_ALL, {});
  }

  getTags(): Observable<any> {
    return this._httplayer.post(Config.API.TAG_GET, {});
  }
  getTagsList(): Observable<any> {
    return this._httplayer.post(Config.API.GET_TAGS_LIST, {});
  }

  saveTag(data: any): Observable<any> {
    return this._httplayer.post(Config.API.TAG_SAVE, { data: [data] });
  }

  deleteTag(id: string): Observable<any> {
    return this._httplayer.post(Config.API.TAG_DELETE, { id });
  }

  // Protocol Category
  getProtocolCategory(): Observable<any> {
    return this._httplayer.post(Config.API.PROTOCOL_CATEGORY_GET, {});
  }
  saveOrUpdateProtocolCategory(dataToPost: any): Observable<any> {
    return this._httplayer.post(Config.API.PROTOCOL_CATEGORY_SAVE, dataToPost);
  }
  deleteProtocolCategory(dataToPost: any): Observable<any> {
    return this._httplayer.post(
      Config.API.PROTOCOL_CATEGORY_DELETE,
      dataToPost
    );
  }

  // Protocol List
  getProtocolList(): Observable<any> {
    return this._httplayer.post(Config.API.PROTOCOL_LIST_GET, {});
  }
  saveOrUpdateProtocolList(dataToPost: any): Observable<any> {
    return this._httplayer.post(Config.API.PROTOCOL_LIST_SAVE, dataToPost);
  }
  deleteProtocolList(dataToPost: any): Observable<any> {
    return this._httplayer.post(Config.API.PROTOCOL_LIST_DELETE, dataToPost);
  }

  // Manual Entry Configuration
  // getManualentrymenus(): Observable<any> {
  //   return this._http.get<any>('./assets/jsons/manualentry.json', {});
  // }
  // Time Slot Group
  getTimeSlotGrp(url, dataToPost): Observable<any> {
    return this._httplayer.post(url, dataToPost);
  }
  saveOrUpdateTimeSlotGroup(dataToPost: any): Observable<any> {
    return this._httplayer.post(Config.API.TIME_SLOT_GROUP_SAVE, dataToPost);
  }
  deleteTimeSlotGroup(dataToPost: any): Observable<any> {
    return this._httplayer.post(Config.API.TIME_SLOT_GROUP_DELETE, dataToPost);
  }

  // email gateway Configuration
  getemailgatewaytable(url, dataToSend): Observable<any> {
    return this._httplayer.post(url, dataToSend);
  }

  saveEmailgateway(dataToSend): Observable<any> {
    return this._httplayer.post(Config.API.SAVE_EMAIL_GATEWAY, dataToSend);
  }

  deleteEmailgateway(dataToSend): Observable<any> {
    return this._httplayer.post(Config.API.DELETE_EMAIL_GATEWAY, dataToSend);
  }
  sendTestmail(dataToSend): Observable<any> {
    return this._httplayer.post(Config.API.SEND_TEST_MAIL, dataToSend);
  }
  emailDefaultGateway(dataToSend): Observable<any> {
    return this._httplayer.post(Config.API.EMAIL_DEFAULT_GATEWAY, dataToSend);
  }

  // sms gateway Configuration
  getsmsgatewaytable(url, datatopost): Observable<any> {
    return this._httplayer.post(url, datatopost);
  }
  deletesmsgateway(datatopost): Observable<any> {
    return this._httplayer.post(Config.API.DELETE_SMS_GATEWAY, datatopost);
  }
  saveSmsgateway(dataToSend): Observable<any> {
    return this._httplayer.post(Config.API.SAVE_SMS_GATEWAY, dataToSend);
  }
  sendTestsms(dataToSend): Observable<any> {
    return this._httplayer.post(Config.API.SEND_TEST_SMS, dataToSend);
  }

  smsDefaultGateway(dataToSend): Observable<any> {
    return this._httplayer.post(Config.API.SMS_DEFAULT_GATEWAY, dataToSend);
  }
  // Get Static Page List
  getPageList(): Observable<any> {
    return this._http.get<any>(
      './assets/app-load-data/master-configuration.json'
    );
  }

  /* ==================================Alarms & Events============================== */

  getAlarmJson(dataToPost): Observable<any> {
    return this._httplayer.post(Config.API.GET_ALARMS_EVENTS, dataToPost);
    // return this._http.get('./assets/dev-data/Dashboard/alarmevents.json');
  }
  getNotesList(): Observable<any> {
    return this._httplayer.get('./assets/dashboard-filters/date-type.json');
  }
  getAcknowledge(dataToPost: any): Observable<any> {
    return this._httplayer.post(Config.API.GET_ACK_AlARMS, dataToPost);
  }
  /* ==================================new modbus ============================== */
  getModbusJson(dataToPost): Observable<any> {
    // return this._httplayer.get('./assets/dev-data/Dashboard/modbus.json');
    return this._httplayer.post(Config.API.GET_MODBUS_WDG_DATA, dataToPost);
  }
  getModbusCreate(dataToPost): Observable<any> {
    // return this._httplayer.get('./assets/dev-data/Dashboard/modbus.json');
    return this._httplayer.post(
      Config.API.GET_CREATE_MODBUS_WDG_DATA,
      dataToPost
    );
  }
  /* ==================================Rule Engine Sevices Starts Here============================== */
  /* ----------------------------------------------------------------------------------------------- */
  /**
   * Method for getting the table and read row data
   * @param data is an object (empty or id) for fetch row
   */
  getTableDataAndRowData(data) {
    return this._httplayer.post(Config.API.GET_RULE_TABLE_AND_ROW_DATA, data);
  }

  /**
   * Method for creating/editing the rule form
   * @param data is an object (empty or id)
   */
  saveAndEditRuleForm(data) {
    return this._httplayer.post(Config.API.SAVE_RULE_FORM_DATA, data);
  }
  /**
   * Method for deleting the rule by id
   * @param data is rule id
   */
  deleteRuleById(id) {
    const id_Obj = { rule_engine_id: id };
    return this._httplayer.post(Config.API.DELETE_RULE_BY_ID, id_Obj);
  }
  /**
   * Method for deleting the rule by id
   */
  getAllRuleMetaData() {
    return this._httplayer.post(Config.API.RULE_ENGINE_METADATA, {});
  }
  /**
   * Method for getting all tag suggetion for rule builder
   */
  getAllMonacoSuggetion() {
    return this._httplayer.post(Config.API.GET_MONACO_SUGGETION, {});
  }
  /**
   * LookUp table Suggessions in the Rule Engine
   */
  getLookupSuggession() {
    return this._httplayer.post(Config.API.GET_LOOKUP_TABLES_SUGGESSIONS, {});
  }

  /**
   * Method for checking if tag is overide or not
   */
  checkIfTagIsOveride(data) {
    return this._httplayer.post(Config.API.CHECK_IF_TAG_OVERRIDE, data);
  }

  /* ==================================Business Rule Sevices Starts Here============================== */
  /* ----------------------------------------------------------------------------------------------- */
  /**
   * Method for getting the table and read row data
   * @param data is an object (empty or id) for fetch row
   */
  getBusinessRuleTableDataAndRowData(data) {
    return this._httplayer.post(
      Config.API.GET_BUSINESS_RULE_TABLE_AND_ROW_DATA,
      data
    );
  }

  /**
   * Method for creating/editing the Business rule form
   * @param data is an object (empty or id)
   */
  saveAndEditBusinessRuleForm(data) {
    return this._httplayer.post(Config.API.SAVE_BUSINESS_RULE_FORM_DATA, data);
  }
  /**
   * Method for deleting the Business rule by id
   * @param data is rule id
   */
  deleteBusinessRuleById(id) {
    const id_Obj = { business_rule_engine_id: id };
    return this._httplayer.post(Config.API.DELETE_BUSINESS_RULE_BY_ID, id_Obj);
  }
  /**
   * Method for deleting the Business rule by id
   */
  getAllBusinessRuleMetaData() {
    return this._httplayer.post(Config.API.BUSINESS_RULE_ENGINE_METADATA, {});
  }
  /**
   * Method for getting all tag suggetion for rule builder
   */
  getAllBusinessMonacoSuggetion(dataToSend) {
    return this._httplayer.post(
      Config.API.GET_BUSINESS_MONACO_SUGGETION,
      dataToSend
    );
  }
  /**
   * LookUp table Suggessions in the Business Rule
   */
  getBusinessLookupSuggession() {
    return this._httplayer.post(
      Config.API.GET_BUSINESS_LOOKUP_TABLES_SUGGESSIONS,
      {}
    );
  }

  getAllMonacoSuggetionTags(data) {
    return this._httplayer.post(Config.API.GET_BUSINESS_TAG_SUGGESSIONS, data);
  }

  // Sld Services
  getSldsidebar() {
    return this._httplayer.post(Config.API.SLD_LEFTSIDEBAR, {});
  }
  getOperatorData() {
    return this._httplayer.post(Config.API.SLD_OPERATOR_DATA, {});
  }
  getEngineerData() {
    return this._httplayer.post(Config.API.SLD_ENGINEER_DATA, {});
  }
  create_sld(dataToPost) {
    return this._httplayer.post(Config.API.CREATE_SLD, dataToPost);
  }
  create_new_sld(dataPost) {
    return this._httplayer.post(Config.API.CREATE_SLD_POINT, dataPost);
  }
  update_sld(dataPost) {
    return this._httplayer.post(Config.API.UPDATE_SLD, dataPost);
  }
  delete_sld(dataPost) {
    return this._httplayer.post(Config.API.DELETE_SLD, dataPost);
  }
  get_sld_data(dataPost) {
    return this._httplayer.post(Config.API.GET_SLD_DATA, dataPost);
  }
  get_sld_config(dataPost) {
    return this._httplayer.post(Config.API.GET_SLD_CONFIG, dataPost);
  }

  getMinutesInfo(): Observable<any> {
    return this._httplayer.get('./assets/build-data/rule-engine/minute.json');
  }

  getHoursInfo(): Observable<any> {
    return this._httplayer.get('./assets/build-data/rule-engine/hours.json');
  }
  getMonthsInfo(): Observable<any> {
    return this._httplayer.get('./assets/build-data/rule-engine/months.json');
  }
  getWeekdaysInfo(): Observable<any> {
    return this._httplayer.get('./assets/build-data/rule-engine/weekday.json');
  }
  getDaysInfo(): Observable<any> {
    return this._httplayer.get('./assets/build-data/rule-engine/days.json');
  }
  get_sld_tag_extention(dataPost) {
    return this._httplayer.post(Config.API.GET_SLD_TAG_EXTENTION, dataPost);
  }

  update_tree(dataToPost) {
    return this._httplayer.post(Config.API.UPDATE_SLD_TREE, dataToPost);
  }

  // ++++++++++++++++++++++++++++++++++++++++++++++++Dashboard+++++++++++++++++++++++++++++++++++++

  getInactiveGatewayAndDeviceCount(dataToPost) {
    return this._httplayer.post(
      Config.API.INACTIVE_GATEWAY_AND_DEVICE_COUNT,
      dataToPost
    );
  }

  // -----------------------------------------------License Management-----------------------------
  getlicensetable(data) {
    return this._httplayer.post(Config.API.LICENSE_TABLE, data);
  }

  getKLLicense() {
    return this._httplayer.post(Config.API.LICENSE_TABLE_KL, {});
  }

  submit_license_key(dataToPost) {
    return this._httplayer.post(Config.API.SUBMIT_LICENSE_KEY, dataToPost);
  }
  getUserListAndUserGroups(data): Observable<any> {
    return this._httplayer.post(Config.API.GET_USER_META, data);
  }

  getScheduleInfo(data): Observable<any> {
    return this._httplayer.post(Config.API.GET_SCHEDULE_INFO, data);
  }

  getPueData(data): Observable<any> {
    // return this._httplayer.get('assets/dev-data/Dashboard/PUEreponse.json', data);
    return this._httplayer.post(Config.API.PUE_CHART_PREVIEW, data);
    // return this._http.get('./assets/dev-data/Dashboard/PFresponse.json');
  }

  saveScheduleInfo(data): Observable<any> {
    // return this._httplayer.post(Config.API.SAVE_SCHEDULE_INFO, data);
    return this._httplayer.post(Config.API.SAVE_SCHEDULE_INFO, data);
  }

  getDashboardShareInfo(data): Observable<any> {
    return this._httplayer.post(Config.API.GET_DASHBOARD_SHARE_INFO, data);
  }

  saveDashboardShareInfo(data): Observable<any> {
    return this._httplayer.post(Config.API.SAVE_DASHBOARD_SHARE_INFO, data);
  }
  getLicenseInfo(data): Observable<any> {
    return this._httplayer.post(Config.API.GET_LICENSE_INFO, data);
  }
  loginLicense(data): Observable<any> {
    return this._httplayer.post(Config.API.GET_LICENSE_LOGIN, data);
  }

  getLicenseVerificiation(
    collectionName,
    keyName,
    extraOptions
  ): Observable<any> {
    const objInput: any = {};
    const subInput: any = {};
    let returnObj: any = {};
    const subject = new ReplaySubject();
    if (!this._auth.Download) {
      returnObj.isProceed = true;
      subject.next(returnObj);
    } else if (
      this.collections.hasOwnProperty(collectionName) &&
      extraOptions.hasOwnProperty(this.collections[collectionName]) &&
      extraOptions[this.collections[collectionName]] != null &&
      extraOptions[this.collections[collectionName]] != undefined &&
      extraOptions[this.collections[collectionName]] != '' &&
      extraOptions[this.collections[collectionName]] != 'new'
    ) {
      returnObj.isProceed = true;
      subject.next(returnObj);
    } else if (
      extraOptions.hasOwnProperty(collectionName + '_id') &&
      extraOptions[collectionName + '_id'] != null &&
      extraOptions[collectionName + '_id'] != undefined &&
      extraOptions[collectionName + '_id'] != ''
    ) {
      returnObj.isProceed = true;
      subject.next(returnObj);
    } else {
      objInput['collection_name'] = collectionName;
      objInput['user_id'] = this._auth.serviceUserId();
      objInput['extra_options'] = {};
      objInput['client_id'] = this._auth.getCurrentUserClientId();
      objInput['filter'] = {};
      objInput['filter'][keyName] = this._auth.getCurrentUserSiteId();
      if (extraOptions.hasOwnProperty('dashboard_id')) {
        const typeValues = extraOptions['dashboard_id'].split('_');
        objInput['filter']['type'] = typeValues[0];
      } else if (
        extraOptions.hasOwnProperty('type') &&
        extraOptions.type == 'Reports'
      ) {
        objInput['filter']['type'] = extraOptions.type;
      }
      try {
        this.getLicenseInfo(objInput).subscribe(
          (res) => {
            if (res && res.data.status === Config.CONSTANTS.SUCCESS) {
              res.data.isProceed = res.data.license;
              returnObj = res.data;
              subject.next(returnObj);
            } else {
              returnObj = res.data;
              returnObj.isProceed = false;
              subject.next(returnObj);
            }
          },
          (error) => {
            console.log('error while fetching license data');
            returnObj.isProceed = false;
            subject.next(returnObj);
          }
        );
      } catch (error) {
        console.log(error);
      }
    }
    return subject.asObservable();
  }

  //-------------------------------------- Image library-----------------------------------------------------
  getAllImagesInfo(data) {
    // return this._httplayer.post(Config.API.GET_LIBRARY_IMAGES, data);
    return this._http.get('/assets/images/defaultImages/defaultImages.json');
  }

  uploadImagesAndData(fd) {
    return this._httplayer.post(Config.API.UPLOAD_LIBRARY_IMAGES_INFO, fd);
  }

  getKeywords() {
    return this._http.get('./assets/build-data/chips/defaultKeywords.json');
  }
  // ++++++++++++++++++++++++++++++++++++++++!--Web SCADA--!+++++++++++++++++++++++++++++++++++++++++++++++//
  // Code review feedback, do not use same services in multiple components since they are subject to change.

  //save scada automatically into widget[0]
  saveScada(dataToPost): Observable<any> {
    return this._httplayer.post(Config.API.SAVE_WIDGET_DATA, dataToPost);
  }

  // return units converter data
  getScadaUnitMetaData(dataToPost): Observable<any> {
    return this._httplayer.post(Config.API.CHART_GET_UNIT_METADATA, dataToPost);
  }

  // return units data
  getScadaUnits(): Observable<any> {
    return this._httplayer.post(Config.API.UNIT_GET, {});
  }

  // return topics from device and tags
  getScadaTopics(dataToPost): Observable<any> {
    return this._httplayer.post(
      Config.API.CHART_PREVIEW_DATA_TOPICS,
      dataToPost
    );
  }

  // return scada data from the scada ID
  getScadaData(dataToPost): Observable<any> {
    return this._httplayer.post(Config.API.GET_DASHBOARD_DATA, dataToPost);
  }

    //save scada automatically into widget[0]
    getUploadedImages(dataToPost): Observable<any> {
      return this._httplayer.post(Config.API.GET_LIBRARY_IMAGES, dataToPost);
    }

  // return scada data from the scada ID
  getXmlData(): Observable<any> {
    return this._http.get(
      '/assets/library/scada/resources/stencils/defaultXML.json'
    );
  }

  //-------------------------------------- Asset Control -----------------------------------------------------//
  getAssetControlList(data): Observable<any> {
    return this._httplayer.post(Config.API.GET_ASSET_CONTROL_LIST, data);
    // return this._http.get(
    //   './assets/dev-data/asset-control/asset_control_list(resp).json',
    //   data
    // );
  }
  deleteAssetControlData(data): Observable<any> {
    return this._httplayer.post(Config.API.ASSET_CONTROL_DELETE, data);
    // return this._http.get(
    //   './assets/dev-data/asset-control/asset_control_delete(resp).json'
    // );
  }
  moreInfoAssetControlData(data): Observable<any> {
    return this._httplayer.post(Config.API.ASSET_CONTROL_MOREINFO, data);
    // return this._http.get(
    //   './assets/dev-data/asset-control/asset_control_moreinfo(resp).json',
    //   data
    // );
  }
  historyAssetControlData(data): Observable<any> {
    return this._httplayer.post(Config.API.GET_ASSET_CONTROL_HISTORY, data);
    // return this._http.get(
    //   './assets/dev-data/asset-control/asset_control_history(resp).json'
    // );
  }
  historyInfoAssetControlData(data): Observable<any> {
    return this._httplayer.post(
      Config.API.GET_ASSET_CONTROL_HISTORY_GETINFO,
      data
    );
    // return this._http.get(
    //   './assets/dev-data/asset-control/asset_control_history_getinfo(resp).json',
    //   data
    // );
  }
  triggerAssetControlData(data): Observable<any> {
    return this._httplayer.post(Config.API.POST_ASSET_CONTROL_TRIGGER, data);
    // return this._http.get(
    //   './assets/dev-data/asset-control/asset_control_trigger(resp).json'
    // );
  }

  getAssetControlLabel(): Observable<any> {
    return this._http.get(
      '../../assets/build-data/asset-control/assetControlLabel.json'
    );
  }
  saveAssetControlConfig(data): Observable<any> {
    return this._httplayer.post(Config.API.SAVE_ASSET_CONTROL_CONFIG, data);
    // return this._http.get(
    //   './assets/dev-data/asset-control/asset_control_save(resp).json'
    // );
  }
  editAssetControlData(data): Observable<any> {
    return this._httplayer.post(Config.API.POST_ASSET_CONTROL_EDIT, data);
    // return this._http.get('./assets/dev-data/asset-control/asset_control_edit(resp).json');
  }

  getAssetMonthsInfo(): Observable<any> {
    return this._httplayer.get(
      './assets/build-data/asset-control/assetControlmonth.json'
    );
  }
  getAssetWeekdaysInfo(): Observable<any> {
    return this._httplayer.get(
      './assets/build-data/asset-control/assetControlWeekdays.json'
    );
  }
  getVersionInfo(data): Observable<any> {
    // return this._http.get('https://api.npoint.io/371256cedf5254b16779', {});
    return this._httplayer.post(Config.API.GET_SERVICE_VERSION, data);
  }
  /* -------------------------Activity Log---------------------------------- */
  getAcitivityLogFilter(data): Observable<any> {
    return this._httplayer.post(Config.API.GET_ACTIVITY_LOG_FILTERS, data);
    // return this._http.get(
    //   '../../assets/dev-data/ActivityLog/activity_log_filters(res).json'
    // );
  }

  getActivityLoglist(data): Observable<any> {
    return this._httplayer.post(Config.API.GET_ACTIVITY_LOG_DATA, data);

    // return this._http.get(
    //   '../../assets/dev-data/ActivityLog/activity_log_list(res).json'
    // );
  }

  getDynamicFilterPageData(url, action, dataToPost?): Observable<any>{
    return this._httplayer.post(url+'/'+action, dataToPost);
  }
}
