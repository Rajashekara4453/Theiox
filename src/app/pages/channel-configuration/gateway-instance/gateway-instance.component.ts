import {
  Component,
  OnInit,
  Output,
  EventEmitter,
  Input,
  ViewChild,
  ElementRef,
  HostBinding
} from '@angular/core';
import { AppService } from '../../../services/app.service';
import { Router } from '@angular/router';
import { ChannelConfigurationService } from '../../../services/channelconfiguration.service';
import { ToastrService } from '../../../components/toastr/toastr.service';
import { AuthGuard } from '../../auth/auth.guard';
import { globals } from '../../../utilities/globals';
import { AuthService } from '../../auth/auth.service';
import { Config } from '../../../config/config';
import { Observable } from 'rxjs';
import { ISubscription } from 'rxjs/Subscription';
import { ServiceloaderService } from '../../../components/loader/serviceloader/serviceloader.service';
@Component({
  selector: 'kl-gateway-instance',
  templateUrl: './gateway-instance.component.html',
  styleUrls: ['./gateway-instance.component.scss']
})
export class GatewayInstanceComponent implements OnInit {
  // Variable Declarations
  @HostBinding('class.delete')
  gatewayLists: Array<any> = [];
  gatewayStatusLists: Array<any> = [];
  gateways: Array<any> = [];
  public DFMinput: any;
  dmfData = false;
  key: String;
  gatewayInfo: any;
  @Input() gatewayKey: any;
  gatewaydata = false;
  id: any;
  allGatewayCount = 0;
  activeGatewayCount = 0;
  inactiveGatewayCount = 0;
  deletedGatewayCount = 0;
  disabledGatewayCount = 0;
  @Output() deviceInstance = new EventEmitter();
  @Output() gatewayInstance = new EventEmitter();
  currentSiteID: any;
  default: Boolean;
  client_id: any;
  // endPointUrl: any;
  depMode: any;
  statusMode = true;
  clearTime: any;
  private subscription: ISubscription;
  @Output() selectedFilterValue = new EventEmitter();
  constructor(
    private appservice: AppService,
    private _router: Router,
    public dataService: ChannelConfigurationService,
    public _toastLoad: ToastrService,
    public _auth: AuthGuard,
    private _globals: globals,
    private _authservice: AuthService,
    private loader: ServiceloaderService
  ) {}
  ngOnInit() {
    this.loader.show();
    this.currentSiteID = this._globals.getCurrentUserSiteId();
    this.default = this._globals.isSystemAdminLoggedIn();
    this.depMode = this._globals.deploymentMode;
    // this.endPointUrl = this._globals.deploymentModeAPI;
    this.getTimer();
    this.client_id = this._globals.getCurrentUserClientId();
    // this.allowAccess('');
    if (this.dataService.gatewayDevice !== undefined) {
      // this.onEditSilo(this.dataService.gatewayDevice);
      this.dataService.gatewayDevice = undefined;
    } else {
      this.getConfigJson();
    }
  }
  getTimer() {
    //  we have to pass site id :this.currentSiteID
    // GatewayStatus : it is the key used in the data_Content;
    const timer$: Observable<any> = this._globals.getTimerSettings(
      this.currentSiteID,
      'GatewayStatus'
    );
    timer$.subscribe((data) => {
      if (data === null) {
        this.id = setInterval(() => {
          this.gatewayStatus();
        }, 10000);
      } else {
        this.id = setInterval(() => {
          this.gatewayStatus();
        }, data * 1000);
      }
    });
  }
  // allowAccess(acess: string) {
  //   const val = this._auth.allowAccessComponent('gateways', '');
  //   this.accessLevel = val;
  //   return val;
  // }
  hideSubsideBar() {
    if (document.body.classList.contains('hide-sub-sidebar')) {
      document.body.classList.remove('hide-sub-sidebar');
    } else {
      document.body.classList.add('hide-sub-sidebar');
    }
  }
  ngOnDestroy() {
    if (this.id) {
      clearInterval(this.id);
    }
  }
  getConfigJson() {
    let dataToSend;
    if (this.depMode === 'EL') {
      dataToSend = {
        filter: [
          {
            site_id: this.currentSiteID
          }
        ]
      };
    } else {
      dataToSend = {};
    }
    this.gatewaydata = false;
    this.appservice.getCardSettings(dataToSend).subscribe((data) => {
      if (data.status === 'success') {
        this.gatewayLists = data['nodes'];
        this.gatewaydata = false;
        this.dmfData = false;
        this.gatewayLists['activeGatewayCount'] = 0;
        this.gatewayLists['inactiveGatewayCount'] = 0;
        this.gatewayLists['allGatewayCount'] = 0;
        this.activeGatewayCount = 0;
        this.inactiveGatewayCount = 0;
        this.deletedGatewayCount = 0;
        this.disabledGatewayCount = 0;
        const dataToSend = {};
        this.appservice.getGatewayStatus(dataToSend).subscribe((data) => {
          for (let i = 0; i < data.gatewayLists.length; i++) {
            for (let j = 0; j < this.gatewayLists.length; j++) {
              if (
                data.gatewayLists[i].gatewayID ===
                this.gatewayLists[j].gateway_instance_id
              ) {
                this.gatewayLists[j]['comStatus'] =
                  data.gatewayLists[i].comStatus;
                //gateway status
                if (this.gatewayLists[j].comStatus === 'active') {
                  this.activeGatewayCount++;
                  this.gatewayLists[
                    'activeGatewayCount'
                  ] = this.activeGatewayCount;
                } else {
                  this.inactiveGatewayCount++;
                  this.gatewayLists[
                    'inactiveGatewayCount'
                  ] = this.inactiveGatewayCount;
                }
                this.gatewayLists['allGatewayCount'] =
                  this.activeGatewayCount + this.inactiveGatewayCount;
                if (this.gatewayLists[j].isdeleted === 'true') {
                  this.deletedGatewayCount++;
                  this.gatewayLists[
                    'deletedGatewayCount'
                  ] = this.deletedGatewayCount;
                  this.gatewayLists[j].comStatus = 'delete';
                  this.gatewayLists[j]['deleted'] = 'Restore';
                } else {
                  this.gatewayLists[
                    'deletedGatewayCount'
                  ] = this.deletedGatewayCount;
                  this.gatewayLists[j]['deleted'] = 'Delete';
                }
                if (this.gatewayLists[j].isdisabled === 'true') {
                  if (this.gatewayLists[j].deleted === 'Restore') {
                    //deleted /disabled
                    this.gatewayLists[
                      'disabledGatewayCount'
                    ] = this.disabledGatewayCount;
                  } else {
                    this.disabledGatewayCount++;
                    this.gatewayLists[
                      'disabledGatewayCount'
                    ] = this.disabledGatewayCount;
                    this.gatewayLists[j].comStatus = 'disable';
                  }
                  this.gatewayLists[j]['disabled'] = 'Enable';
                } else {
                  if (this.gatewayLists[j].deleted === 'Restore') {
                    this.gatewayLists[
                      'disabledGatewayCount'
                    ] = this.disabledGatewayCount;
                  } else {
                    this.gatewayLists[
                      'disabledGatewayCount'
                    ] = this.disabledGatewayCount;
                  }
                  this.gatewayLists[j]['disabled'] = 'Disable';
                }
                //gateway show
                if (this.gatewayLists[j].deleted === 'Delete') {
                  this.gatewayLists[j]['show'] = true;
                } else {
                  this.gatewayLists[j]['show'] = false;
                }
                let deleteCount = 0;
                let disableCount = 0;
                let activeDeviceCount = 0;
                let inactiveDeviceCount = 0;
                this.gatewayLists[j]['activeDeviceCount'] = 0;
                this.gatewayLists[j]['inactiveDeviceCount'] = 0;
                this.gatewayLists[j]['deviceCount'] = 0;
                for (let k = 0; k < data.gatewayLists[i].devices.length; k++) {
                  for (
                    let l = 0;
                    l < this.gatewayLists[j].devices.length;
                    l++
                  ) {
                    if (
                      data.gatewayLists[i].devices[k].deviceID ===
                      this.gatewayLists[j].devices[l].device_instance_id
                    ) {
                      this.gatewayLists[j].devices[l]['status'] =
                        data.gatewayLists[i].devices[k].status;
                      if (this.gatewayLists[j].devices[l].status === 'active') {
                        activeDeviceCount++;
                        this.gatewayLists[j][
                          'activeDeviceCount'
                        ] = activeDeviceCount;
                      } else {
                        inactiveDeviceCount++;
                        this.gatewayLists[j][
                          'inactiveDeviceCount'
                        ] = inactiveDeviceCount;
                      }
                      this.gatewayLists[j]['deviceCount'] =
                        activeDeviceCount + inactiveDeviceCount;
                      if (
                        this.gatewayLists[j].devices[l].isdeleted === 'true'
                      ) {
                        deleteCount++;
                        this.gatewayLists[j]['deleteCount'] = deleteCount;
                        this.gatewayLists[j].devices[l].status = 'delete';
                        this.gatewayLists[j].devices[l]['deleted'] = 'Restore';
                      } else {
                        this.gatewayLists[j]['deleteCount'] = deleteCount;
                        this.gatewayLists[j].devices[l]['deleted'] = 'Delete';
                      }
                      if (
                        this.gatewayLists[j].devices[l].isdisabled === 'true'
                      ) {
                        if (
                          this.gatewayLists[j].devices[l].deleted === 'Restore'
                        ) {
                          this.gatewayLists[j]['disableCount'] = disableCount;
                        } else {
                          disableCount++;
                          this.gatewayLists[j].devices[l].status = 'disable';
                          this.gatewayLists[j]['disableCount'] = disableCount;
                        }
                        this.gatewayLists[j].devices[l]['disabled'] = 'Enable';
                      } else {
                        if (
                          this.gatewayLists[j].devices[l].deleted === 'Restore'
                        ) {
                          this.gatewayLists[j]['disableCount'] = disableCount;
                        } else {
                          this.gatewayLists[j]['disableCount'] = disableCount;
                        }
                        this.gatewayLists[j].devices[l]['disabled'] = 'Disable';
                      }
                      //device show
                      if (
                        this.gatewayLists[j].devices[l].deleted === 'Delete'
                      ) {
                        this.gatewayLists[j].devices[l]['show'] = true;
                      } else {
                        this.gatewayLists[j].devices[l]['show'] = false;
                      }
                    }
                  }
                  continue;
                }
                if (
                  this.gatewayLists[j]['disableCount'] > 0 ||
                  this.gatewayLists[j]['deleteCount'] > 0
                ) {
                  this.gatewayLists[j]['inactiveDeviceCount'] =
                    this.gatewayLists[j]['inactiveDeviceCount'] -
                    (this.gatewayLists[j]['disableCount'] +
                      this.gatewayLists[j]['deleteCount']);
                  this.gatewayLists[j]['deviceCount'] =
                    this.gatewayLists[j]['deviceCount'] -
                    this.gatewayLists[j]['deleteCount'];
                }
              }
            }
          }
          if (
            this.gatewayLists['disabledGatewayCount'] > 0 ||
            this.gatewayLists['deletedGatewayCount'] > 0
          ) {
            this.gatewayLists['inactiveGatewayCount'] =
              this.gatewayLists['inactiveGatewayCount'] -
              (this.gatewayLists['disabledGatewayCount'] +
                this.gatewayLists['deletedGatewayCount']);
            this.gatewayLists['allGatewayCount'] =
              this.gatewayLists['allGatewayCount'] -
              this.gatewayLists['deletedGatewayCount'];
          }
          let allDevicesCount = 0;
          let deletedDevicesCount = 0;
          let disabledDevicesCount = 0;
          let activeDevicesCount = 0;
          let inactiveDevicesCount = 0;
          for (let m = 0; m < this.gatewayLists.length; m++) {
            if (this.gatewayLists[m].deviceCount > 0) {
              allDevicesCount =
                allDevicesCount + this.gatewayLists[m].deviceCount;
              this.gatewayLists['totalDeviceCount'] = allDevicesCount;
            } else {
              this.gatewayLists['totalDeviceCount'] = allDevicesCount;
            }
            if (this.gatewayLists[m].activeDeviceCount > 0) {
              activeDevicesCount =
                activeDevicesCount + this.gatewayLists[m].activeDeviceCount;
              this.gatewayLists['totalDeviceActiveCount'] = activeDevicesCount;
            } else {
              this.gatewayLists['totalDeviceActiveCount'] = activeDevicesCount;
            }
            if (this.gatewayLists[m].inactiveDeviceCount > 0) {
              inactiveDevicesCount =
                inactiveDevicesCount + this.gatewayLists[m].inactiveDeviceCount;
              this.gatewayLists[
                'totalDeviceInActiveCount'
              ] = inactiveDevicesCount;
            } else {
              this.gatewayLists[
                'totalDeviceInActiveCount'
              ] = inactiveDevicesCount;
            }
            if (this.gatewayLists[m].deleteCount > 0) {
              deletedDevicesCount =
                deletedDevicesCount + this.gatewayLists[m].deleteCount;
              this.gatewayLists['totalDeviceDeleteCount'] = deletedDevicesCount;
            } else {
              this.gatewayLists['totalDeviceDeleteCount'] = deletedDevicesCount;
            }
            if (this.gatewayLists[m].disableCount > 0) {
              disabledDevicesCount =
                disabledDevicesCount + this.gatewayLists[m].disableCount;
              this.gatewayLists[
                'totalDeviceDisableCount'
              ] = disabledDevicesCount;
            } else {
              this.gatewayLists[
                'totalDeviceDisableCount'
              ] = disabledDevicesCount;
            }
          }
          if (
            this.gatewayLists['totalDeviceDeleteCount'] > 0 ||
            this.gatewayLists['totalDeviceDisableCount'] > 0
          ) {
            this.gatewayLists['totalDeviceInActiveCount'] =
              this.gatewayLists['totalDeviceInActiveCount'] -
              this.gatewayLists['totalDeviceDeleteCount'];
            this.gatewayLists['totalDeviceCount'] =
              this.gatewayLists['totalDeviceCount'] -
              this.gatewayLists['totalDeviceDeleteCount'];
          }
          this.gatewayLists;
          this.gatewaydata = true;
        });
      } else {
        this._toastLoad.toast('error', 'Error', data.message, true);
      }
    });
  }
  onExapandSilo(value) {
    this.dataService.devieEditFromSilo = undefined;
    this.dataService.disableSelectField = false;
    this.deviceInstance.emit(value);
  }
  onDeviceEditFromSilo(value) {
    this._router.navigate(['configurations/gatewayDevices/gatewaylist']);
    this.deviceInstance.emit(value);
  }
  // Method to shows the gateway and devices status based on interval
  gatewayStatus() {
    const dataToSend = {};
    if (this.statusMode) {
      this.statusMode = false;
      this.appservice.getGatewayStatus(dataToSend).subscribe(
        (data) => {
          this.statusMode = true;
          clearTimeout(this.clearTime);
          this.gatewayStatusLists = data.gatewayLists;
          this.gatewayLists['gatewayCount'] = 0;
          this.gatewayLists['activeGatewayCount'] = 0;
          this.gatewayLists['inactiveGatewayCount'] = 0;
          this.gatewayLists['allGatewayCount'] = 0;
          this.activeGatewayCount = 0;
          this.inactiveGatewayCount = 0;
          for (let i = 0; i < data.gatewayLists.length; i++) {
            for (let j = 0; j < this.gatewayLists.length; j++) {
              if (
                data.gatewayLists[i].gatewayID ===
                this.gatewayLists[j].gateway_instance_id
              ) {
                this.gatewayLists[j]['comStatus'] =
                  data.gatewayLists[i].comStatus;
                this.gatewayLists[j]['deviceCount'] = 0;
                this.gatewayLists[j]['activeDeviceCount'] = 0;
                this.gatewayLists[j]['inactiveDeviceCount'] = 0;
                let activeDeviceCount = 0;
                let inactiveDeviceCount = 0;
                //gateway status
                if (this.gatewayLists[j].comStatus === 'active') {
                  this.activeGatewayCount++;
                  this.gatewayLists[
                    'activeGatewayCount'
                  ] = this.activeGatewayCount;
                } else {
                  this.inactiveGatewayCount++;
                  this.gatewayLists[
                    'inactiveGatewayCount'
                  ] = this.inactiveGatewayCount;
                }
                if (this.gatewayLists[j].isdeleted === 'true') {
                  this.gatewayLists[j].comStatus = 'delete';
                }
                if (this.gatewayLists[j].isdisabled === 'true') {
                  this.gatewayLists[j].comStatus = 'disable';
                }
                this.gatewayLists['allGatewayCount'] =
                  this.activeGatewayCount + this.inactiveGatewayCount;
                if (
                  data.gatewayLists[i].devices.length !==
                  this.gatewayLists[j].devices.length
                ) {
                  this.getConfigJson();
                }
                for (let k = 0; k < data.gatewayLists[i].devices.length; k++) {
                  for (
                    let l = 0;
                    l < this.gatewayLists[j].devices.length;
                    l++
                  ) {
                    if (
                      data.gatewayLists[i].devices[k].deviceID ===
                      this.gatewayLists[j].devices[l].device_instance_id
                    ) {
                      this.gatewayLists[j].devices[l]['status'] =
                        data.gatewayLists[i].devices[k].status;
                      //Devie status
                      if (this.gatewayLists[j].devices[l].status === 'active') {
                        activeDeviceCount++;
                        this.gatewayLists[j][
                          'activeDeviceCount'
                        ] = activeDeviceCount;
                      } else {
                        inactiveDeviceCount++;
                        this.gatewayLists[j][
                          'inactiveDeviceCount'
                        ] = inactiveDeviceCount;
                      }
                      this.gatewayLists[j]['deviceCount'] =
                        activeDeviceCount + inactiveDeviceCount;
                      if (
                        this.gatewayLists[j].devices[l].isdeleted === 'true'
                      ) {
                        this.gatewayLists[j].devices[l].status = 'delete';
                      }
                      if (
                        this.gatewayLists[j].devices[l].isdisabled === 'true'
                      ) {
                        this.gatewayLists[j].devices[l].status = 'disable';
                      }
                    }
                  }
                  continue;
                }
                if (
                  this.gatewayLists[j]['disableCount'] > 0 ||
                  this.gatewayLists[j]['deleteCount'] > 0
                ) {
                  this.gatewayLists[j]['inactiveDeviceCount'] =
                    this.gatewayLists[j]['inactiveDeviceCount'] -
                    (this.gatewayLists[j]['disableCount'] +
                      this.gatewayLists[j]['deleteCount']);
                  this.gatewayLists[j]['deviceCount'] =
                    this.gatewayLists[j]['deviceCount'] -
                    this.gatewayLists[j]['deleteCount'];
                }
              }
            }
          }
          if (
            this.gatewayLists['disabledGatewayCount'] > 0 ||
            this.gatewayLists['deletedGatewayCount'] > 0
          ) {
            this.gatewayLists['inactiveGatewayCount'] =
              this.gatewayLists['inactiveGatewayCount'] -
              (this.gatewayLists['disabledGatewayCount'] +
                this.gatewayLists['deletedGatewayCount']);
            this.gatewayLists['allGatewayCount'] =
              this.gatewayLists['allGatewayCount'] -
              this.gatewayLists['deletedGatewayCount'];
          }
          let allDevicesCount = 0;
          let deletedDevicesCount = 0;
          let disabledDevicesCount = 0;
          let activeDevicesCount = 0;
          let inactiveDevicesCount = 0;
          this.gatewayLists['totalDeviceCount'] = 0;
          this.gatewayLists['totalDeviceActiveCount'] = 0;
          this.gatewayLists['totalDeviceInActiveCount'] = 0;
          this.gatewayLists['totalDeviceDeleteCount'] = 0;
          this.gatewayLists['totalDeviceDisableCount'] = 0;
          for (let m = 0; m < this.gatewayLists.length; m++) {
            if (this.gatewayLists[m].deviceCount > 0) {
              allDevicesCount =
                allDevicesCount + this.gatewayLists[m].deviceCount;
              this.gatewayLists['totalDeviceCount'] = allDevicesCount;
            } else {
              this.gatewayLists['totalDeviceCount'] = allDevicesCount;
            }
            if (this.gatewayLists[m].activeDeviceCount > 0) {
              activeDevicesCount =
                activeDevicesCount + this.gatewayLists[m].activeDeviceCount;
              this.gatewayLists['totalDeviceActiveCount'] = activeDevicesCount;
            } else {
              this.gatewayLists['totalDeviceActiveCount'] = activeDevicesCount;
            }
            if (this.gatewayLists[m].inactiveDeviceCount > 0) {
              inactiveDevicesCount =
                inactiveDevicesCount + this.gatewayLists[m].inactiveDeviceCount;
              this.gatewayLists[
                'totalDeviceInActiveCount'
              ] = inactiveDevicesCount;
            } else {
              this.gatewayLists[
                'totalDeviceInActiveCount'
              ] = inactiveDevicesCount;
            }
            if (this.gatewayLists[m].deleteCount > 0) {
              deletedDevicesCount =
                deletedDevicesCount + this.gatewayLists[m].deleteCount;
              this.gatewayLists['totalDeviceDeleteCount'] = deletedDevicesCount;
            } else {
              this.gatewayLists['totalDeviceDeleteCount'] = deletedDevicesCount;
            }
            if (this.gatewayLists[m].disableCount > 0) {
              disabledDevicesCount =
                disabledDevicesCount + this.gatewayLists[m].disableCount;
              this.gatewayLists[
                'totalDeviceDisableCount'
              ] = disabledDevicesCount;
            } else {
              this.gatewayLists[
                'totalDeviceDisableCount'
              ] = disabledDevicesCount;
            }
          }
          if (
            this.gatewayLists['totalDeviceDeleteCount'] > 0 ||
            this.gatewayLists['totalDeviceDisableCount'] > 0
          ) {
            this.gatewayLists['totalDeviceInActiveCount'] =
              this.gatewayLists['totalDeviceInActiveCount'] -
              this.gatewayLists['totalDeviceDeleteCount'];
            this.gatewayLists['totalDeviceCount'] =
              this.gatewayLists['totalDeviceCount'] -
              this.gatewayLists['totalDeviceDeleteCount'];
          }
          this.gatewayLists;
        },
        (err) => {
          clearTimeout(this.clearTime);
          this.statusMode = true;
          this.gatewaydata = true;
        }
      );
      if (this.statusMode) {
      } else {
        this.startTimer();
      }
    }
  }
  startTimer() {
    this.clearTime = setTimeout(() => {
      this.statusMode = true;
    }, 60000);
  }
  sendSensorFilterValue(value) {
    this.selectedFilterValue.emit(value);
  }
}
