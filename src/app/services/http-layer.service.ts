import { Router } from '@angular/router';
import { HttpClient, HttpHeaders, HttpResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, throwError } from 'rxjs';
import { ServiceloaderService } from '../components/loader/serviceloader/serviceloader.service';
import { ToastrService } from '../components/toastr/toastr.service';
import { UtilityFunctions } from '../utilities/utility-func';
import 'rxjs/Rx';
import 'rxjs/add/observable/of';
import 'rxjs/add/observable/empty';
import 'rxjs/add/operator/catch';
import 'rxjs/add/operator/finally';

@Injectable({
  providedIn: 'root'
})
export class HttpLayerService {
  constructor(
    private _http: HttpClient,
    private _router: Router,
    public _commonLoader: ServiceloaderService,
    public _toastLoad: ToastrService
  ) {}
  private monitoring = {
    pendingRequestsNumber: 0
  };

  public counter = 0;
  public httpOptions = {
    headers: new HttpHeaders({
      'Content-Type': 'application/json'
    })
  };

  toasterState: boolean = false;

  private showLoader(): void {
    this._commonLoader.show();
  }
  private hideLoader(): void {
    this._commonLoader.hide();
  }

  get(url: string, options?: any): Observable<any> {
    try {
      // this.showLoader();
      this.monitoring.pendingRequestsNumber++;
      return this.handleResponse(this._http.get(url)).finally(() => {
        this.monitoring.pendingRequestsNumber--;
        // this.hideLoader();
      });
    } catch (error) {
      console.log(error);
    }
  }

  post(url: string, data: any, values?: any): Observable<any> {
    try {
      // this.showLoader();
      // url = this._utility.serverAddress + url;
      return this.handleResponse(this._http.post(url, data, values)).finally(
        () => {
          // this.hideLoader();
        }
      );
    } catch (error) {
      console.log(error);
    }
  }

  postDashboard(url: string, data: any, values?: any): Observable<any> {
    try {
      return this.handleResponseDashboard(
        this._http.post(url, data, values)
      ).finally(() => {});
    } catch (error) {
      console.log(error);
    }
  }

  handleResponse(
    observable: Observable<any>,
    isBackgroundServiceCall: boolean = false
  ): Observable<any> {
    return observable
      .catch((err, source) => {
        // (!err.url.endsWith('api/account/login') ||)
        if (err.status === 401 && !err.url.includes('refresh')) {
          Observable.empty();
        } else if (err.status !== 0 || err.statusText === 'Unknown Error') {
          if (!this.toasterState) {
            this.toasterState = true;
            setTimeout(() => {
              this.errorCodeMessages(err.status);
            }, 1000);
            return Observable.throw(err);
          }
        } else {
          return Observable.throw(err);
        }
      })
      .finally(() => {});
  }

  handleResponseDashboard(
    observable: Observable<any>,
    isBackgroundServiceCall: boolean = false
  ): Observable<any> {
    return observable
      .catch((err, source) => {
        // this._toastLoad.toast('error', 'Error', 'Error while fetching data', true);
        console.log('Error while fetching data..');
        if (err.status === 401 && !err.url.endsWith('api/account/login')) {
          return Observable.empty();
        } else if (err.status !== 0) {
          if (!this.toasterState) {
            this.toasterState = true;
            setTimeout(() => {
              this.errorCodeMessages(err.status);
            }, 1000);
          }
        } else {
          return Observable.throw(err);
        }
      })
      .finally(() => {
        this.counter--;
      });
  }
  public handleError(error: any) {
    const errMsg = error.message
      ? error.message
      : error.status
      ? `${error.status} - ${error.statusText}`
      : 'Server error';
    return Observable.throw(errMsg);
  }

  errorCodeMessages(errorCode) {
    let errorMessage =
      'Unable to reach server at the moment. \
   Please check your network connection.';
    switch (errorCode) {
      case 500:
        errorMessage = 'Something went wrong.';
        // this._toastLoad.toast('error', 'Connection Failed', errorMessage, true);
        break;
      case 503:
        errorMessage =
          'Unable to reach server at the moment. \
 Please check your network connection.';
        // this._toastLoad.toast('error', 'Connection Failed', errorMessage, true);
        break;
      case 504:
        errorMessage = 'Server Busy.';
        // this._toastLoad.toast('error', 'Connection Failed', errorMessage, true);
        break;
      case 400:
        errorMessage = 'Request Error';
        // this._toastLoad.toast('error', 'Connection Failed', errorMessage, true);
        break;
      case 401:
        errorMessage = 'Access Denied.';
        // this._toastLoad.toast('error', 'Connection Failed', errorMessage, true);
        break;
      case 404:
        errorMessage = 'File not found.';
        // this._toastLoad.toast('error', 'Connection Failed', errorMessage, true);
        break;
      case 204:
        errorMessage = 'Data Unavailable.';
        // this._toastLoad.toast('error', 'Connection Failed', errorMessage, true);
        break;
      case 0:
      case 'Unknown Error':
        errorMessage =
          'Unable to reach server at the moment. \
 Please check your network connection.';
        // this._toastLoad.toast('error', 'Connection Failed', errorMessage, true);
        break;
      default:
    }
    console.log(errorCode + ':', errorMessage);
    this.toasterState = false;
    // setTimeout(() => { this.toasterState = false }, 5000)
  }
}
