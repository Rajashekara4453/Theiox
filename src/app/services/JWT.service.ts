import { Injectable } from '@angular/core';
import { HttpRequest } from '@angular/common/http';
import { of, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class JWTService {
  constructor() {}

  public set clearAccessToken(value: string) {
    this.accessToken = '';
  }

  accessToken: any;
  refreshToken: any;
  loggedUser: string;
  private readonly REFRESH_TOKEN = 'REFRESH_TOKEN';

  accessPayload: any = {};
  refreshPayload: any = {};

  isAccessTokenExpired: boolean;
  isRefreshTokenExpired: boolean;

  /*   Holds (or) store Access-Token in app memory.   */
  storeAccessToken(accsToken: any) {
    this.accessToken = accsToken;
    if (this.decodeToken('accessToken', this.accessToken)) {
      return this.isTokenExpired('accessToken');
    }
  }

  /*   Returns Access-Token in app memory.   */
  fetchAccessToken() {
    return this.accessToken;
  }

  /*  Writes (or) store Refresh-Token in browser's local storage.  */
  storeRefeshToken(refToken: string) {
    localStorage.setItem(this.REFRESH_TOKEN, refToken);
    this.readRefreshToken();
    if (this.decodeToken('refreshToken', this.refreshToken)) {
      this.isTokenExpired('refreshToken');
    }
  }

  /* Returns Refresh-Token in app memory   */
  fetchRefreshToken(): String {
    return this.refreshToken;
  }

  /*   Reads and returns RefreshToken from browser's local storage.
    Also saves in memory.  */
  readRefreshToken() {
    this.refreshToken = localStorage.getItem('REFRESH_TOKEN');
    this.decodeToken('refreshToken', this.refreshToken);
    return this.refreshToken;
  }

  /*   Store tokens and user-login details.
       Returns the login-state of user. */
  doLoginUser(username?: string, tokens?: any): Observable<boolean> {
    if (username !== undefined && tokens !== undefined) {
      this.loggedUser = username;
      this.storeAccessToken(tokens['Access-Token']);
      this.storeRefeshToken(tokens['Refresh-Token']);
      return of(true);
    } else if (this.readRefreshToken() !== null) {
      return of(true);
    } else {
      return of(false);
    }
  }

  /*   Call right after logout to clear tokens and user-login details    */
  doLogoutUser() {
    this.loggedUser = '';
    this.accessToken = '';
    this.refreshToken = '';
    this.accessPayload = {};
    this.refreshPayload = {};
    this.isAccessTokenExpired = true;
    this.isRefreshTokenExpired = true;
    localStorage.removeItem('REFRESH_TOKEN');
  }

  /*   Decodes the tokens and returns the token payload.     */
  decodeToken(tokenType: string, token: string): any {
    const splitToken = this.isTokenValid(token);
    if (splitToken !== undefined && splitToken.length === 3) {
      switch (tokenType) {
        case 'accessToken':
          this.accessPayload = JSON.parse(atob(splitToken[1]));
          return this.accessPayload;

        case 'refreshToken':
          this.refreshPayload = JSON.parse(atob(splitToken[1]));
          return this.refreshPayload;

        default:
          break;
      }
    }
  }

  /* Parameter - 'key' is optional;
     key exist - Returns a particular value for the 'key' passed.
     no key - Returns entire token payload.
     */
  getTokenPayloadValueFor(tokenType: string, keys?: any) {
    const keyValue: any = {};
    const keysData: any = [];

    switch (tokenType) {
      case 'accessToken':
        if (keys != undefined && keys.length > 0) {
          for (let i = 0; i < keys.length; i++) {
            const key = keys[i];
            keyValue[key] = this.accessPayload[key];
            // keysData.push({
            //   [key]: this.accessPayload[key]
            // });
          }
          return keyValue;
        } else {
          return this.accessPayload;
        }

      case 'refreshToken':
        if (keys.length > 0) {
          for (let i = 0; i < keys.length; i++) {
            const key = keys[i];
            // keyValue[key] = this.accessPayload[key];
            keysData.push({
              [key]: this.refreshPayload[key]
            });
          }
          return keysData;
        } else {
          return this.refreshPayload;
        }
    }
  }

  /*   Validates the token structure.  */
  isTokenValid(token: string) {
    if (token !== null) {
      const splitToken = token.split('.');
      if (splitToken.length === 3) {
        return splitToken;
      } else {
        console.error('Invalid Token Structure');
        return [];
      }
    } else {
      return;
    }
  }

  /* Checks and Returns the expiry status of token. */
  isTokenExpired(tokenType: string): Observable<boolean> {
    switch (tokenType) {
      case 'accessToken':
        this.isAccessTokenExpired = this.calculateExpiry(
          this.accessPayload['session_exp'],
          tokenType
        );
        return of(this.isAccessTokenExpired);

      case 'refreshToken':
        this.isRefreshTokenExpired = this.calculateExpiry(
          this.refreshPayload['session_exp'],
          tokenType
        );
        return of(this.isRefreshTokenExpired);
    }
  }

  /*   Calculates the expiry time and returns if the token is expired (or) still valid.   */
  calculateExpiry(exp, tokenType) {
    const currTime: any = new Date();
    const dateForExp: any = new Date(0);
    dateForExp.setUTCSeconds(exp);
    const timeDifference: number = Math.floor((dateForExp - currTime) / 1000);

    switch (tokenType) {
      case 'accessToken':
        if (timeDifference <= 120) {
          // let x = new Date(exp);
          // console.log('Expired Access Token @ ', dateForExp);
          return true;
        } else {
          return false;
        }

      case 'refreshToken':
        if (timeDifference <= 600) {
          return true;
        } else {
          return false;
        }
    }
  }

  /* Call this function to attach token to the request with customized configOptions.
     @parameter - configOptions is of type object  -  {}
     @configOptions keys & values; headerName - header name to be attached in request payload,
                                   authScheme - authentication scheme,
                                   excludeURL - URL's to which headers need not be set.
                                                (Incase of any initial requests you don't want to send tokens)
    @configOptions default keys & values; headerName - Access-Token
                                          authScheme - '' (empty)
                                          excludeURL - no default
                                          */

  addTokenToRequest(request: HttpRequest<any>, configOptions?: any) {
    let headerName = 'Access-Token';
    let authScheme = '';
    let header = {};
    const token = this.fetchAccessToken();
    if (
      configOptions !== undefined &&
      Object.keys(configOptions).length !== 0
    ) {
      if (configOptions.hasOwnProperty('headerName')) {
        headerName = configOptions['headerName'];
      }
      if (configOptions.hasOwnProperty('authScheme')) {
        authScheme = configOptions['authScheme'];
      }
      if (configOptions.hasOwnProperty('excludeURL')) {
        const excludeURL = configOptions['excludeURL'];
        for (let i = 0; i < excludeURL.length; i++) {
          const element = excludeURL[i];
          if (request.url.includes(element)) {
            header = {};
            break;
          } else {
            header = this.setHeader(headerName, authScheme, token);
          }
        }
      }
    } else {
      header = this.setHeader(headerName, authScheme, token);
    }
    return request.clone(header);
  }

  /*   Set the request header with user defined or default values and
       Return the request with header.   */
  setHeader(headerName, authScheme, token) {
    return {
      setHeaders: {
        [headerName]: `${token}`
      }
    };
  }
}
