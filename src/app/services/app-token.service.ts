import { Injectable } from '@angular/core';
import {
  Subscription,
  Observable,
  interval,
  BehaviorSubject,
  of,
  throwError
} from 'rxjs';
import { AppService } from './app.service';
import { JWTService } from './JWT.service';
import { Router } from '@angular/router';
import { UtilityFunctions } from '../utilities/utility-func';
import { ToastrService } from '../components/toastr/toastr.service';
import { catchError } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class AppTokenService {
  constructor(
    private _jwtService: JWTService,
    private _appService: AppService,
    private _router: Router,
    private _utility: UtilityFunctions,
    private _toastLoad: ToastrService
  ) {}

  tokenSupscription: Subscription;
  userId: string;
  userRoleId: any;
  siteId: string;
  clientId: string;
  isSystemAdmin: boolean;
  isSuperUser: boolean;
  tokenExpiry: number;
  userDetails: any = {};
  authorizedMenuJSON: any;
  source;
  userInfo_Permissions: any;

  //  access-menu service
  jsonMenus: any = [];
  userPermissions: any;
  // isSystemAdmin: boolean = false;
  // isSuperUser: boolean = false;
  isJSONReady: boolean = false;
  // userInfo_Permissions: any;
  defaultRoute = '/dashboard';

  landOnIndex = 0;

  /* Call on login (or) refresh.
     @Parameters; (1) getNewAccessToken; on refresh -> true; on login -> false;
                  (2) username?, tokens?; on login -> pass values
     Get login state of user from JWT service.
     Returns to either; landing page (or) login page based on login and token state.
    */
  doTokenOnLoginRefresh(
    getNewAccessToken: boolean,
    username?: string,
    tokens?: string
  ): Observable<any> {
    const loginDone$ = this._jwtService.doLoginUser(username, tokens);
    const subject = new BehaviorSubject('default');
    loginDone$.subscribe((userLoggedIn) => {
      /* on browser refresh; refresh token exists in local storage. */
      if (userLoggedIn && getNewAccessToken) {
        /* get new access token using refresh token */
        const OnReloading = getNewAccessToken;
        const tokenReady$ = this.getAccessToken(OnReloading);
        tokenReady$.subscribe((tokenReady) => {
          if (tokenReady === 'true') {
            const initReady$ = this.initUserData();
            initReady$.subscribe((data) => {
              this.trackTokens();
              subject.next(data);
            });
          } else if (tokenReady === 'false') {
            /* Refresh token expired in local storage */
            subject.next('initLogin');
          }
          // else if (this._utility.isMobile) {
          //   this._toastLoad.toast('info', 'Information', 'Logged Out: Unable to reach server', true);
          //   this.logout();
          //   subject.next('initLogin');
          // }
        });
      } else if (userLoggedIn && !getNewAccessToken) {
        /* On login; not required to get new access token */
        const initReady$ = this.initUserData();
        initReady$.subscribe((data) => {
          this.trackTokens();
          subject.next(data);
        });
      } else {
        /* on browser refresh; refresh token does not exists in local storage. */
        subject.next('initLogin');
        this.logout();
      }
    });
    return subject.asObservable();
  }

  /* On access token expiry; Return new access token */
  getAccessToken(onReload?: boolean): Observable<any> {
    try {
      // const currTime: any = new Date();
      // console.log('Fetch Access Token ', currTime);
      const isRefreshTokenExpired$ = this._jwtService.isTokenExpired(
        'refreshToken'
      );
      const subject = new BehaviorSubject('default');
      isRefreshTokenExpired$.subscribe((isTokenExpired) => {
        if (!isTokenExpired) {
          const currTime: any = Math.floor(Date.now() / 1000);
          const dataToSend = {
            token: this._jwtService.fetchRefreshToken(),
            current_time: currTime
          };
          this._appService
            .getNewAccessToken(dataToSend)
            .pipe(
              catchError((err) => {
                if (err['status'] === 401) {
                  subject.next('false');
                  this.logout();
                }
                return throwError('Error thrown from catchError');
              })
            )
            .subscribe((token) => {
              if (token['status'] === 'success') {
                const isTokenExpired$ = this._jwtService.storeAccessToken(
                  token['Access-Token']
                );
                if (
                  token.hasOwnProperty('license_expiry_days') &&
                  token['license_expiry_days'] >= 30
                ) {
                  this.displayLicenseExpiry(token['license_expiry_days']);
                }
                isTokenExpired$.subscribe((isExpired) => {
                  if (!isExpired && !onReload) {
                    const keys = [
                      'user_role_id',
                      'isSuperUser',
                      'isSystemAdmin'
                    ];
                    const userRoleInfo = this._jwtService.getTokenPayloadValueFor(
                      'accessToken',
                      keys
                    );
                    if (
                      (!(
                        this.userRoleId == undefined ||
                        this.userRoleId.length === 0
                      ) &&
                        (this.userRoleId !== userRoleInfo['user_role_id'] ||
                          userRoleInfo['user_role_id'].length === 0)) ||
                      (!(this.isSuperUser == undefined) &&
                        this.isSuperUser !== userRoleInfo['isSuperUser']) ||
                      (!(this.isSystemAdmin == undefined) &&
                        this.isSystemAdmin !== userRoleInfo['isSystemAdmin'])
                    ) {
                      const initData$ = this.initUserData(true);
                      initData$.subscribe((data) => {
                        if (
                          data === 'dataInitialized' ||
                          data === 'initLogin'
                        ) {
                          this.processJSON(this._router.url, false);
                          // this._toastLoad.toast('info', 'Information', 'Your access is been updated.', true);
                          return initData$;
                        }
                      });
                    } else {
                      subject.next('true');
                    }
                  } else if (!isExpired && onReload) {
                    subject.next('true');
                  } else {
                    subject.next('false');
                  }
                });
              } else {
                // this.logout();
                subject.next('false');
              }
            });
        } else if (isTokenExpired) {
          subject.next('false');
          alert(
            'Your session has been expired. Please login again to continue.'
          );
          this.logout();
        }
      });
      return subject.asObservable();
    } catch (error) {
      // subject.next('false');
      this.logout();
    }
  }

  /* Initialise user data obtained from token's payload  */
  initUserData(isUserRoleChanged?: boolean): Observable<any> {
    const tokenPayload = this._jwtService.getTokenPayloadValueFor(
      'accessToken'
    );
    this.userId = tokenPayload['user_id'];
    this.userRoleId = tokenPayload['user_role_id'];
    this.siteId = tokenPayload['site_id'];
    this.clientId = tokenPayload['client_id'];
    this.isSystemAdmin = tokenPayload['isSystemAdmin'];
    this.isSuperUser = tokenPayload['isSuperUser'];
    this.tokenExpiry = tokenPayload['session_exp'];
    return this.getInitAppData(true, isUserRoleChanged);
  }

  /* Fetch and store user details and authorised menu JSON for the user
      Return if initial data fetched and app is ready to load. */
  getInitAppData(
    isApplyAccess: boolean,
    isUserRoleChanged: boolean
  ): Observable<any> {
    try {
      const subject = new BehaviorSubject('default');

      /*  Payload to get user details.  */
      const userReqPayload = {
        filter: [{ site_id: this.siteId }],
        user_id: this.userId
      };

      /*  Payload to get authorization Menu JSON */
      const authMenuReqPayload = {
        isApplyAccessLevel: isApplyAccess
      };

      /*  Gets user details and authorization menu both.. */
      this._appService
        .getInitAppData(userReqPayload, authMenuReqPayload)
        .subscribe((response) => {
          if (response.length > 0) {
            if (response[0]['status'] === 'success') {
              this.userDetails = response[0]['data']['user'];
            } else {
              subject.next('initLogin');
            }
            if (response[1].hasOwnProperty('menu')) {
              this.authorizedMenuJSON = response[1]['menu'];
            } else if (response[1]['status'] === 'failed') {
              this._toastLoad.toast(
                'error',
                'Error',
                response[1]['message'],
                true
              );
            } else {
              subject.next('initLogin');
            }
            if (
              Object.keys(this.userDetails).length > 0 &&
              this.authorizedMenuJSON.length > 0
            ) {
              subject.next('dataInitialized');
              // if (isUserRoleChanged) {
              //   this._router.navigate([this._router.url]);
              // } else {
              //   subject.next('dataInitialized');
              // }
            } else {
              this._toastLoad.toast(
                'error',
                'Error',
                'Error fetching user details..',
                true
              );
              console.error('Exit: Error fetching init app data..');
            }
          } else {
            this._toastLoad.toast(
              'error',
              'Error',
              'Error fetching user details..',
              true
            );
            console.error('Exit: Error fetching init app data..');
          }
        });
      return subject.asObservable();
    } catch (error) {
      console.error('Error in init app response.', error);
    }
  }

  /*  Call JWT service to check token validity every specified seconds */
  trackTokenValidity(tokenType: any, timeMs: number) {
    this.source = interval(timeMs);
    this.tokenSupscription = this.source.subscribe((val) => {
      const isTokenExpired$ = this._jwtService.isTokenExpired(tokenType);
      isTokenExpired$.subscribe((isTokenExpired) => {
        if (isTokenExpired && tokenType === 'accessToken') {
          this.getAccessToken(false);
        } else if (isTokenExpired && tokenType === 'refreshToken') {
          this.logout();
        }
      });
    });
  }

  /* If user is logged-in start checking token validity.  */
  trackTokens() {
    this.trackTokenValidity('accessToken', 20000);
    this.trackTokenValidity('refreshToken', 20000);
  }

  // Method to get static menu JSON and further process it based on system admin Login and user login.
  processJSON(routeTo?, isReload?): Observable<any> {
    const subject = new BehaviorSubject<any>('default');
    if (this.isSystemAdmin) {
      return this.filterJSONForSALogin(routeTo, isReload);
    } else if (this.isSuperUser) {
      return this.filterJSONForSuperUser(routeTo, isReload);
    } else {
      this.jsonMenus = this.authorizedMenuJSON;
      const storeLocalStorage$: Observable<any> = this.storeLocalStorage(
        this.userDetails,
        this.jsonMenus
      );
      storeLocalStorage$.subscribe((response) => {
        if (response) {
          this.landingPage(isReload, routeTo);
          return subject.next('jsonReady');
        }
      });
      // }
    }
    return subject.asObservable();
  }

  // Method to give all access to SALogin in static menu JSON
  filterJSONForSALogin(routeTo, isReload) {
    try {
      const subject = new BehaviorSubject('default');
      this.jsonMenus = this.authorizedMenuJSON;
      for (let i = 0; i < this.jsonMenus.length; i++) {
        const menu = this.jsonMenus[i];
        const accessKeys = this.jsonMenus[i]['accessLevel'];
        if (
          menu.hasOwnProperty('isAccessOnlyAdmin') &&
          menu.hasOwnProperty('isShowLeftSideBar') &&
          menu['isAccessOnlyAdmin']
        ) {
          menu['isShowLeftSideBar'] = true;
        }
        Object.keys(accessKeys).forEach((v) => (accessKeys[v] = true));
      }
      const storeLocalStorage$: Observable<any> = this.storeLocalStorage(
        this.userDetails,
        this.jsonMenus
      );
      storeLocalStorage$.subscribe((response) => {
        if (response) {
          this.landingPage(isReload, routeTo);
          return subject.next('jsonReady');
        }
      });
      return subject.asObservable();
    } catch (error) {
      console.log(error);
    }
  }

  // Method to give all access to Super User in static menu JSON except those menus with isAccessOnlyAdmin = true
  filterJSONForSuperUser(routeTo, isReload) {
    try {
      const subject = new BehaviorSubject('default');
      this.jsonMenus = this.authorizedMenuJSON;
      for (let i = 0; i < this.jsonMenus.length; i++) {
        const menu = this.jsonMenus[i];
        const accessKeys = this.jsonMenus[i]['accessLevel'];
        if (
          menu.hasOwnProperty('isAccessOnlyAdmin') &&
          menu['isAccessOnlyAdmin']
        ) {
          Object.keys(accessKeys).forEach((v) => (accessKeys[v] = false));
        } else {
          Object.keys(accessKeys).forEach((v) => (accessKeys[v] = true));
          menu['isShowLeftSideBar'] = true;
        }
      }
      const storeLocalStorage$: Observable<any> = this.storeLocalStorage(
        this.userDetails,
        this.jsonMenus
      );
      storeLocalStorage$.subscribe((response) => {
        if (response) {
          this.landingPage(isReload, routeTo);
          return subject.next('jsonReady');
        }
      });
      return subject.asObservable();
    } catch (error) {
      console.log(error);
    }
  }
  // Storing user data in local storage.
  storeLocalStorage(userData, userRole) {
    userData['userRolePermissions'] = userRole;
    this.userInfo_Permissions = userData;
    const encryptedUserObj = this._utility.encryptIntially(userData);
    localStorage.setItem('userDetails', encryptedUserObj);
    return of(true);
  }

  // Method to filter the objects based on the user permissions (access)
  filterJSONBasedOnAccess(routeTo) {
    try {
      for (let i = 0; i < this.jsonMenus.length; i++) {
        const menu = this.jsonMenus[i];
        for (const accessTicket in this.userPermissions) {
          if (
            menu.hasOwnProperty('ticket') &&
            menu['ticket'] === accessTicket
          ) {
            menu['isTicketFound'] = true;
            const accessKeysObject = this.userPermissions[accessTicket];
            if (accessKeysObject['view']) {
              for (const key in accessKeysObject) {
                if (accessKeysObject.hasOwnProperty(key)) {
                  const element = accessKeysObject[key];
                  if (
                    menu['accessLevel'].hasOwnProperty(key) &&
                    menu['accessLevel'][key] !== 'name' &&
                    menu['accessLevel'][key] !== 'id' &&
                    menu['accessLevel'][key] !== 'url'
                  ) {
                    menu['accessLevel'][key] = element;
                    if (accessKeysObject.hasOwnProperty('count')) {
                      menu['accessLevel']['count'] = accessKeysObject['count'];
                    }
                  }
                }
              }
              break;
            } else if (!accessKeysObject['view']) {
              this.jsonMenus.splice(i, 1);
              if (i !== 0) {
                i = i - 1;
              } else {
                i = -1;
              }
              break;
            }
          } else {
            menu['isTicketFound'] = false;
          }
        }
        if (menu.hasOwnProperty('ticket')) {
          if (
            menu.hasOwnProperty('isTicketFound') &&
            menu['ticket'] !== 'default' &&
            !menu['isTicketFound']
          ) {
            this.jsonMenus.splice(i, 1);
            if (i !== 0) {
              i = i - 1;
            } else {
              i = -1;
            }
          } else if (menu['ticket'] === 'default') {
            Object.keys(menu['accessLevel']).forEach(
              (v) => (menu['accessLevel'][v] = true)
            );
          }
        }
      }
      this.isJSONReady = true;
      if (routeTo !== undefined) {
        this._router.navigate([routeTo]);
      }
    } catch (error) {
      console.log(error);
    }
  }

  /*  Logout of application and clear data
      Call JWT service 'doLogoutUser' method to clear token data and login state. */
  logout() {
    if (this.source) {
      window.clearInterval(this.source);
    }
    if (this.tokenSupscription) {
      this.tokenSupscription.unsubscribe();
    }
    this.authorizedMenuJSON = [];
    this._jwtService.doLogoutUser();
    localStorage.removeItem('REFRESH_TOKEN');
    localStorage.removeItem('userDetails');
    this._router.navigate(['/login']);
  }

  /* Method to land on first available page to view for the user. */
  landingPage(isReload, routeTo?) {
    const subject = new BehaviorSubject('default');

    this.isJSONReady = true;
    if (isReload) {
    } else if (routeTo !== undefined) {
      for (let i = 0; i < this.jsonMenus.length; i++) {
        const element = this.jsonMenus[i];
        if (element['url'] === routeTo && element['accessLevel']['view']) {
          this._router.navigate([routeTo]);
        } else {
          this.landingPage(false, routeTo);
        }
      }
    } else {
      // this._route.navigate([this.defaultRoute]);
      if (
        this.jsonMenus[this.landOnIndex].hasOwnProperty('accessLevel') &&
        this.jsonMenus[this.landOnIndex]['accessLevel']['view'] &&
        this.jsonMenus[this.landOnIndex].hasOwnProperty('url') &&
        this.jsonMenus[this.landOnIndex]['url'] !== ''
      ) {
        this._router.navigate([this.jsonMenus[this.landOnIndex]['url']]);
        this.landOnIndex = 0;
      } else {
        this.landOnIndex++;
        this.landingPage(false);
      }
    }
    // return subject.next('jsonReady');
  }

  // Method to display toaster for License Expiry Days.
  displayLicenseExpiry(licenseExpDays) {
    // tslint:disable-next-line: prefer-template
    const expiryHeading: string = 'License Expiry Alert';
    const expiryMessage: string =
      'Your License is about to expire in ' + licenseExpDays + ' days.';
    if (licenseExpDays > 15 && licenseExpDays <= 30) {
      this._toastLoad.toast('warning', expiryHeading, expiryMessage, true);
    }
    if (licenseExpDays <= 15) {
      this._toastLoad.toast('error', expiryHeading, expiryMessage, true);
    }
  }
}
