import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class ChannelConfigurationService {
  dataFromService;
  gatewayDevice;
  gateWayInfo;
  addCustom;
  devieEditFromSilo;
  gtewayInstanceId;
  ondeviceEditFromSilo;
  editDeviceStatus;
  disableSelectField;
  GateawayInstanceFromSilo;
  showPopUP;
  onRefreshGatewayInstanceID;
  showModelPopUpFromsensorPage;
  holdFilterValueForSensor;
  holdFilterValueForGateway: string = '';
  constructor() {}
}
