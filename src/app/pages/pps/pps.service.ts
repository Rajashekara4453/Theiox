import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { HttpLayerService } from '../../services/http-layer.service';
import { Config } from '../../config/config';
import { from, Observable, observable, of } from 'rxjs';
import { delay } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class PpsService {
  constructor(private http: HttpClient, private _httplayer: HttpLayerService) { }

  getMeterList(req) {
    return this._httplayer.post(Config.API.GET_METER_LIST, req);
  }

  getBlockContent(req) {
    return this._httplayer.post(Config.API.GET_BLOCK_DFM, req);
  }

  saveCustomer(req) {
    return this._httplayer.post(Config.API.SAVE_METER, req);
  }

  writeMeter(req) {
    return this._httplayer.post(Config.API.WRITE_METER, req);
  }

  readMeter(req) {
    return this._httplayer.post(Config.API.READ_METER, req);
  }

  readCustomerInfo(req) {
    return this._httplayer.post(Config.API.READ_CUSTOMER, req);
  }

  deleteCustomer(req) {
    return this._httplayer.post(Config.API.DELETE_METER, req);
  }

  disableCustomer(req) {
    const reply = { status: 'success', message: 'Disabled' };
    return of(reply);
  }
  /////////////////
  GetList(url, dataToPost): Observable<any> {
    const re = /smartmeter/gi;
    const configAPI = Config.API.GET_SMARTMETER_LIST;
    const endPoint = configAPI.replace(re, url);
    return this._httplayer.post(endPoint, dataToPost);
  }

  fetchDFM(url, dataToPost): Observable<any> {
    const re = /smartmeter/gi;
    const configAPI = Config.API.GET_SMARTMETER_DFM;
    const endPoint = configAPI.replace(re, url);
    return this._httplayer.post(endPoint, dataToPost);
    // return this.http.get('../../../assets/dev-data/pps/general_info_v3.json')
  }
  saveDFMData(url, dataToPost): Observable<any> {
    const re = /smartmeter/gi;
    const configAPI = Config.API.SAVE_SMARTMETER;
    const endPoint = configAPI.replace(re, url);
    return this._httplayer.post(endPoint, dataToPost);
  }
  fetchList(url, dataToPost): Observable<any> {
    return this._httplayer.post(url, dataToPost);
  }

  dynamicEndpointGenerator( moduleName, pageType, action, dataToPost ) {
    let endPoint;
    const moduleKey = /qzyxwpsk/gi
    const pageTypeKey = /asdaduhsakdgyla/gi;
    const actionKey = /uyewi/gi;
    const configAPI = Config.API.DYNAMIC_URL;
    endPoint = configAPI.replace(moduleKey, moduleName);
    endPoint = endPoint.replace(pageTypeKey, pageType);
    endPoint = endPoint.replace(actionKey, action);
    return this._httplayer.post(endPoint, dataToPost);
  }

}
