import { Component, ViewChild } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { globals } from './utilities/globals';
import { Config } from './config/config';
import { DataSharingService } from './services/data-sharing.service';
import { Subscription } from 'rxjs/Subscription';
import { Router, NavigationEnd } from '@angular/router';
import { AuthService } from './pages/auth/auth.service';
import { AppTokenService } from './services/app-token.service';
import { DataStoreService } from './services/data-store.service';
import { UtilityFunctions } from './utilities/utility-func';
import { PwaAppUpdateService } from './services/pwa-app-update.service';
import { SwUpdate } from '@angular/service-worker';
import { interval } from 'rxjs';

@Component({
  selector: 'kl-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  constructor(
    private http: HttpClient,
    private globals: globals,
    private _dataSharing: DataSharingService,
    private router: Router,
    private _auth: AuthService,
    private _appTokenService: AppTokenService,
    private _dataStore: DataStoreService,
    private _utility: UtilityFunctions,
    private _pwaAppUp: PwaAppUpdateService,
    private _updates: SwUpdate
  ) {
    /*PWA - Check updates*/
    this._updates.available.subscribe((event) => {
      // console.log('update available... from app component', event);
      this.triggerUpdatePopUp();
    });

    this._dataSharing.currentUserTheme.subscribe((data) => {
      this.userTheme = data;
      const bodyElement = document.getElementsByTagName('body')[0];
      bodyElement.className = this.userTheme;
      bodyElement.classList.add(this.userTheme);
    });

    // Local storage - event listener
    const self = this;
    window.addEventListener(
      'storage',
      function (e) {
        const refArr = Object.keys(e.storageArea);
        if (e.key === 'REFRESH_TOKEN') {
          if (refArr.length > 0 && refArr.includes('REFRESH_TOKEN')) {
            self.duplicateLogin = true;
            self.loadSettingsIntoApplication();
          } else {
            _appTokenService.logout();
          }
        } else if (
          e.key !== 'REFRESH_TOKEN' &&
          !refArr.includes('REFRESH_TOKEN')
        ) {
          _appTokenService.logout();
        }
      },
      false
    );
  }

  isReload: boolean = false;
  duplicateLogin: boolean = false;
  updateAvailable: boolean = false;
  @ViewChild('content') content: any;

  userTheme: any;
  subscription: Subscription;
  browserRefresh: boolean = false;
  apiEndpoints: any;
  configLoaded: boolean = false;

  tokenSupscription: Subscription;
  initApp: boolean = false;
  public isMobile = false;

  isUpdateCancelled: boolean = false;

  ngOnInit() {
    console.log('App Started.');
    console.log('Loading Settings....');
    this.loadSettingsIntoApplication();
    /* Detecting device type */
    // if (/Android|webOS|iPhone|iPad|iPod|BlackBerry|BB|PlayBook|IEMobile|Windows Phone|Kindle|Silk|Opera Mini/i.test(navigator.userAgent)) {
    //   this.isMobile = true;
    // }
    // console.log('Height', window.screen.height);
    // console.log('Width', window.screen.width);
  }

  ngOnDestroy() {
    this.subscription.unsubscribe();
    console.log('App Component destroyed..');
  }

  /** PWA - Method to trigger a pop-up if updates are available.*/
  triggerUpdatePopUp() {
    // console.log('triggered popup.. ');
    this.isUpdateCancelled = false;
    this.updateAvailable = true;
    document.getElementById('pwaUpdateAvailableModalButton').click();
  }

  /** PWA - Method to update latest changes.*/
  updatePWA() {
    this._pwaAppUp.promptUser();
    this.updateAvailable = false;
  }

  /** PWA - Method to cancel the changes and
   * re-trigger at a defined time until user updates. */
  cancelUpdatePWA() {
    // console.log('update cancelled..');
    this.isUpdateCancelled = true;
    if (this.isUpdateCancelled) {
      interval(60000).subscribe(() => this.triggerUpdatePopUp());
    }
  }

  checkBrowserRefresh() {
    this.subscription = this.router.events.subscribe((event) => {
      if (event instanceof NavigationEnd) {
        this.browserRefresh = !this.router.navigated;
        if (this.browserRefresh) {
          // this.getUserTheme();
        }
      }
    });
  }

  getUserTheme() {
    try {
      const userDetails = this._dataStore.userInfo;
      this.userTheme = userDetails.theme.selectedTheme;
      if (this.userTheme === '' || this.userTheme === undefined) {
        this.userTheme = 'theme-default';
      }
      this._dataSharing.userThemeDataSharing(this.userTheme);
    } catch {
      console.log('Error fetching theme after Browser refresh..');
    }
  }

  loadSettingsIntoApplication() {
    try {
      const promise = this.http
        .get('./assets/build-data/common/configurations.json')
        .toPromise()
        .then((data) => {
          Object.assign(this, data);
          Config.API = data['api'];
          this.configLoaded = true;
          this.globals._appConfigurations = data;
          const appMode = data['mode'];
          this._utility.appMode = appMode;
          const title = data['title'] + ' ' + data['currentVersion'];
          switch (appMode) {
            case 'server':
              let serverInfo = localStorage.getItem('SERVER_INFO');
              if (serverInfo) {
                serverInfo = JSON.parse(
                  this._utility.decryptCryptoAES(serverInfo, 'thisissecret')
                );
                this._utility.serverAddress =
                  serverInfo['protocol'] + '://' + serverInfo['ip'];
                this._utility.serverIP = serverInfo['ip'];
                this._utility.transferProtocol = serverInfo['protocol'];
              } else {
                this._appTokenService.logout();
              }
              break;

            case 'cloud':
              let transferProtocol = 'http';
              if (data['MQTT']['useSSL']) {
                transferProtocol = 'https';
              } else {
                transferProtocol = 'http';
              }
              this._utility.serverAddress =
                transferProtocol + '://' + data['MQTT']['ip'];
              this._utility.serverIP = data['MQTT']['ip'];
              this._utility.transferProtocol = transferProtocol;
              break;
          }
          const initReady$ = this._appTokenService.doTokenOnLoginRefresh(true);
          const initSubscription = initReady$.subscribe((data1) => {
            if (data1 === 'dataInitialized') {
              this.getUserTheme();
              let routeToURL;
              if (!this.duplicateLogin) {
                routeToURL = this.router.url;
                this.isReload = true;
              } else {
                this.isReload = false;
              }
              const isJSONReady$ = this._appTokenService.processJSON(
                routeToURL,
                this.isReload
              );
              isJSONReady$.subscribe((data2) => {
                if (data2 === 'jsonReady') {
                  this.initApp = true;
                }
              });
            } else if (data1 === 'initLogin') {
              this.initApp = true;
            }
          });
          if (data.hasOwnProperty('print') && data['print'] === true) {
            console.log('Loaded Configuration: ');
            // console.log(data);
          }
          // if (data.hasOwnProperty('MQTT')) {
          //   // ALL MQTT SETTINGS START
          //   if (data['MQTT'].hasOwnProperty('ip') && data['MQTT']['ip'] !== '') {
          //     if (appMode === 'server') {
          //       Config.CONSTANTS.MQTT.ip = this._utility.serverAddress;
          //       console.log('Config.CONSTANTS.MQTT.ip', Config.CONSTANTS.MQTT.ip);
          //     } else {
          //       Config.CONSTANTS.MQTT.ip = data['MQTT'].ip;
          //     }
          //     // Config.CONSTANTS.MQTT.ip = data['MQTT'].ip;
          //   }
          //   if (data['MQTT'].hasOwnProperty('port') && data['MQTT']['port'] !== '') {
          //     Config.CONSTANTS.MQTT.port = data['MQTT'].port;
          //   }
          //   if (data['MQTT'].hasOwnProperty('userName') && data['MQTT']['userName'] !== '') {
          //     Config.CONSTANTS.MQTT.userName = data['MQTT'].userName;
          //   }
          //   if (data['MQTT'].hasOwnProperty('password') && data['MQTT']['password'] !== '') {
          //     Config.CONSTANTS.MQTT.password = data['MQTT'].password;
          //   }
          //   if (data['MQTT'].hasOwnProperty('useSSL') && data['MQTT']['useSSL'] !== '') {
          //     Config.CONSTANTS.MQTT.useSSL = data['MQTT'].useSSL;
          //   }
          // }
          // ALL MQTT SETTINGS END

          this._utility.mqttSettings(this.globals._appConfigurations);
          //Elmeasure Mode or KL mode
          if (data.hasOwnProperty('deploymentMode')) {
            if (data['deploymentMode'] !== '') {
              this.globals.deploymentMode = data['deploymentMode'];
            }
          }
          //Elmeasure License Mode
          if (data.hasOwnProperty('download')) {
            if (data['download'] !== '') {
              this._auth.Download = data['download'];
            }
          }
        });
      // return subject.asObservable();
    } catch (error) {
      console.log('Error While Loading Configurations.');
      console.log(error);
    }
  }
}
