import { Component, OnInit, Inject, ViewChild } from '@angular/core';
import { DOCUMENT } from '@angular/common';
import { Router } from '@angular/router';
import { AppService } from '../../../app/services/app.service';
import { interval, Subscription, Observable } from 'rxjs';
import { AuthGuard } from '../../../app/pages/auth/auth.guard';
import { AuthService } from '../../pages/auth/auth.service';
import { globals } from '../../../app/utilities/globals';
import { UtilityFunctions } from '../../../app/utilities/utility-func';
import { log } from 'util';
import { PinHeaderComponent } from './pin-header/pin-header.component';
import { VersionsInfoComponent } from './versions-info/versions-info.component';
import { AppTokenService } from '../../services/app-token.service';

@Component({
  selector: 'kl-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss']
})
export class HeaderComponent implements OnInit {
  constructor(
    public router: Router,
    @Inject(DOCUMENT) private document: any,
    private _util: UtilityFunctions,
    private _appService: AppService,
    private _rought: Router,
    private global: globals,
    private _auth: AuthGuard,
    private _authService: AuthService,
    private _appTokenService: AppTokenService
  ) {
    // Method called every 5 seconds
    // const source = interval(10000);

    const site_id = this.global.getCurrentUserSiteId();

    const timeInterval$: Observable<any> = this.global.getTimerSettings(
      site_id,
      'InactiveCount'
    );
    this.isResponseReceived = true;

    timeInterval$.subscribe((data) => {
      let timeInterval: number;

      if (data === null) {
        timeInterval = 10 * 1000;
      } else {
        timeInterval = data * 1000;
      }
      // seconds to milliseconds
      const source = interval(timeInterval);
      this.subscription = source.subscribe((val) => {
        if (this.isResponseReceived) {
          this.getInactiveGatewayAndDeviceCount();
        }
      });
    });
  }
  // @ViewChild(PinHeaderComponent) pinHeader: PinHeaderComponent;
  public tabActive: String = 'dashboard ';
  isPopUpOpen = false;
  public inactiveDeviceCount: number;
  public inactiveGatewayCount: number;
  public alarmRaisedCount: number;
  subscription: Subscription;
  userImage: any;
  isBubbolOpen: boolean = false;
  isInactiveStatusCount: boolean = false;
  isViewedInactiveStatus: boolean = false;
  prevInactiveGatewayCount: number = 0;
  prevInactiveDeviceCount: number = 0;
  prevAlarmRaisedCount: number = 0;
  userImageShow: boolean = false;
  shortUserName: string;

  // Varsha
  showOrHide: any = {
    enlargeOrCompress: true,
    inactiveDeviceCount: true,
    inactiveGatewayCount: true,
    alarmEvents: true
  };

  playToneFile: string;
  userDetails: any;
  fullName: string = '';
  userRole: string = '';
  isMobileView: boolean = false;
  appConfigurations: any;
  versionInfo: string = '';
  timer: any;

  elem;
  isResponseReceived: boolean = false;
  whiteLabel: string;

  @ViewChild(VersionsInfoComponent) version: VersionsInfoComponent;

  ngOnInit() {
    this.appConfigurations = this.global._appConfigurations;
    this.whiteLabel = this.appConfigurations['footer'];
    this.isMobileView = this.appConfigurations['isMobileUser'];
    this.elem = document.documentElement;
    this.allowAccess();
    this.getInactiveGatewayAndDeviceCount();
    // this.getUserDetails();
  }

  hideMinisideBar(event) {
    if (document.body.classList.contains('hide-mini-sidebar')) {
      document.body.classList.remove('hide-mini-sidebar');
    } else {
      document.body.classList.add('hide-mini-sidebar');
    }
  }

  ngOnDestroy() {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }

  allowAccess() {
    const value = this._auth.allowAccessComponent('alarmEvents', '');
    this.showOrHide.alarmEvents = value.view;
  }
  getUserDetails() {
    this.userDetails = this._authService.decryptUserDetails();
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
    } else {
      // this.userImage = 'assets/images/defaultUserImage.png';
      this.userImageShow = false;
    }
  }

  rought(url, activeTab) {
    this.tabActive = activeTab;
    this.router.navigate([url]);
  }

  toggleFullscreen(event) {
    if (event.target.classList.contains('elm-expand')) {
      event.target.classList.remove('elm-expand');
      event.target.classList.add('elm-compress-2');
      if (this.elem.requestFullscreen) {
        this.elem.requestFullscreen();
      } else if (this.elem.mozRequestFullScreen) {
        /* Firefox */
        this.elem.mozRequestFullScreen();
      } else if (this.elem.webkitRequestFullscreen) {
        /* Chrome, Safari and Opera */
        this.elem.webkitRequestFullscreen();
      } else if (this.elem.msRequestFullscreen) {
        /* IE/Edge */
        this.elem.msRequestFullscreen();
      }
    } else {
      event.target.classList.remove('elm-compress-2');
      event.target.classList.add('elm-expand');
      if (this.document.exitFullscreen) {
        this.document.exitFullscreen();
      } else if (this.document.mozCancelFullScreen) {
        /* Firefox */
        this.document.mozCancelFullScreen();
      } else if (this.document.webkitExitFullscreen) {
        /* Chrome, Safari and Opera */
        this.document.webkitExitFullscreen();
      } else if (this.document.msExitFullscreen) {
        /* IE/Edge */
        this.document.msExitFullscreen();
      }
    }
  }

  // Inactive Gateway or Device Count
  getInactiveGatewayAndDeviceCount() {
    this.isResponseReceived = false;
    const dataToSend = {};
    this._appService.getInactiveGatewayAndDeviceCount(dataToSend).subscribe(
      (data) => {
        this.isResponseReceived = true;
        clearTimeout(this.timer);
        // this.inactiveGatewayCount = data.data[0].inactiveGatewayCount - data.data[0].deletedGatewayCount - data.data[0].disabledGatewayCount;
        // this.inactiveDeviceCount = data.data[0].inactiveDeviceCount - data.data[0].deletedDeviceCount - data.data[0].disabledDeviceCount;
        this.inactiveGatewayCount = data.data[0].inactiveGatewayCount;
        this.inactiveDeviceCount = data.data[0].inactiveDeviceCount;
        this.alarmRaisedCount = data.data[0].alarmCount;
        if (
          data.data[0].notificationTone !== undefined &&
          data.data[0].notificationTone !== ''
        ) {
          this.playAlarmTone(data.data[0]);
        }

        // enable circle-ripple on following conditions
        if (
          (this.inactiveGatewayCount > 0 &&
            this.inactiveGatewayCount > this.prevInactiveGatewayCount) ||
          (this.inactiveDeviceCount > 0 &&
            this.inactiveDeviceCount > this.prevInactiveDeviceCount) ||
          (this.alarmRaisedCount > 0 &&
            this.alarmRaisedCount > this.prevAlarmRaisedCount)
        ) {
          this.isInactiveStatusCount = true;
        }
      },
      (err) => {
        this.isResponseReceived = true;
        clearTimeout(this.timer);
      }
    );

    if (this.isResponseReceived) {
      return;
    } else {
      this.callTimeOut();
    }
  }

  callTimeOut() {
    this.timer = setTimeout(() => {
      this.isResponseReceived = true;
    }, 60000);
    // 60000
  }

  playAlarmTone(data: any) {
    // Comment - testing
    // data = [{'alarmPriority': "Notification Tone 1"}]
    // let i = 0;
    const toneName = data.notificationTone;
    this.playToneFile =
      './assets/build-data/common/sounds/' + toneName + '.mp3';
    const audio = new Audio(this.playToneFile);
    audio.src = this.playToneFile;
    audio.play();
    // To Play next tone after the completion of previous tone
    // audio.onended = function () {
    //   if (i < data.length - 1) {
    //     audio.src = data[++i].alarmPriority;
    //     audio.play();
    //   }
    // };
  }

  routeTo(getURL) {
    if (getURL === 'configurations/gatewayDevices/gatewaylist') {
      this.router.navigate([getURL], { queryParams: { gateway: 'inactive' } });
    } else if (
      getURL ===
      'configurations/gatewayDevices/gatewaylist/gateway_instance_all'
    ) {
      this.router.navigate([getURL], { queryParams: { sensor: 'inactive' } });
    } else {
      this.router.navigate([getURL]);
    }
  }
  logout() {
    // this.pinHeader.savePinnedPages();
    // this.global.logout();
    this._appTokenService.logout();
  }

  callVersionInfo() {
    this.version.getVersions();
  }
  mousePosition = {
    x: 0,
    y: 0
  };

  onMouseDown($event) {
    this.mousePosition.x = $event.screenX;
    this.mousePosition.y = $event.screenY;
  }

  handleBubbolClick($event) {
    let xdiff = this.mousePosition.x - $event.screenX;
    let ydiff = this.mousePosition.y - $event.screenY;
    if (xdiff < 0) {
      xdiff = -1 * xdiff;
    }
    if (ydiff < 0) {
      ydiff = -1 * ydiff;
    }
    if (xdiff < 18 || ydiff < 18) {
      this.isBubbolOpen = !this.isBubbolOpen;

      // disable circle-ripple on viewing inactive status count
      this.isInactiveStatusCount = false;
      this.prevInactiveGatewayCount = this.inactiveGatewayCount;
      this.prevInactiveDeviceCount = this.inactiveDeviceCount;
      this.prevAlarmRaisedCount = this.alarmRaisedCount;
    }
  }
  sidebarOverlay() {
    if (document.body.classList.contains('pin-sidebar')) {
    } else {
      document.body.classList.toggle('overlay-sidebar');
    }
  }
}
