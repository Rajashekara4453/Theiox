import { Injectable } from '@angular/core';
import {
  HttpEvent,
  HttpInterceptor,
  HttpHandler,
  HttpRequest,
  HttpResponse,
  HttpErrorResponse
} from '@angular/common/http';
import { Observable, empty, EMPTY, BehaviorSubject, throwError } from 'rxjs';
import { map, catchError, switchMap, filter, take } from 'rxjs/operators';
import { environment } from '../../environments/environment';
import { UtilityFunctions } from '../utilities/utility-func';
import { JWTService } from './JWT.service';
import { AppTokenService } from './app-token.service';
import { globals } from '../utilities/globals';

// the following class intercepts an http request, before sending the request and after getting the response
@Injectable()
export class HttpRequestInterceptor implements HttpInterceptor {
  private refreshTokenSubject: BehaviorSubject<any> = new BehaviorSubject<any>(
    null
  );

  constructor(
    private _utility: UtilityFunctions,
    private _jwtService: JWTService,
    private _appTokenService: AppTokenService,
    private _globals: globals
  ) {}

  intercept(
    req: HttpRequest<any>,
    next: HttpHandler
  ): Observable<HttpEvent<any>> {
    if (environment.encryptionEnabled) {
      // encrypting the request body before sending it
      if (req.method !== 'GET') {
        req = req.clone({ body: this._utility.encrypt(req.body) });
      }
    }

    if (req.method !== 'GET') {
      // Add configurationOptions to be added to request header
      const configurationOptions = {
        excludeURL: ['login', 'token', 'refresh', '/user/license_update']
      };
      if (
        !this._jwtService.isAccessTokenExpired &&
        !this._jwtService.isRefreshTokenExpired &&
        this._jwtService.isAccessTokenExpired !== undefined
      ) {
        req = this._jwtService.addTokenToRequest(req, configurationOptions);
      }

      if (
        this._utility.appMode === 'server' ||
        this._utility.appMode === 'cloud'
      ) {
        const serverIP = this._utility.serverAddress;
        req = req.clone({ url: `${serverIP}${req.url}` });
      }

      return next.handle(req).pipe(
        catchError((error) => {
          if (
            !req.url.includes('token') &&
            error instanceof HttpErrorResponse &&
            error.status === 401
          ) {
            return this.handle401Error(req, next);
          } else {
            return throwError(error);
          }
        })
      );
    }
    if (req.method === 'GET') {
      return this.handleRequest(req, next);
    }
  }

  private isRefreshing = false;
  // private refreshTokenSubject: BehaviorSubject<any> = new BehaviorSubject<any>(null);

  private handle401Error(request: HttpRequest<any>, next: HttpHandler) {
    if (!this.isRefreshing) {
      this.isRefreshing = true;
      this.refreshTokenSubject.next(null);
      return this._appTokenService.getAccessToken(false).pipe(
        switchMap((token: any) => {
          this.isRefreshing = false;
          this.refreshTokenSubject.next(token.jwt);
          return next.handle(this._jwtService.addTokenToRequest(request));
        })
      );
    } else {
      return this.refreshTokenSubject.pipe(
        filter((token) => token != null),
        // take(1),
        switchMap((jwt) => {
          return next.handle(this._jwtService.addTokenToRequest(request));
        })
      );
    }
  }

  handleRequest(req, next) {
    return next.handle(req).pipe(
      map((event: HttpEvent<any>) => {
        if (event instanceof HttpResponse) {
          // checking whether the http event is a response event
          if (typeof event.body === 'string') {
            if (environment.encryptionEnabled) {
              // decrypting the response
              event = event.clone({
                body: JSON.parse(this._utility.decrypt(event.body))
              });
            }
          }
        }
        return event;
      })
    );
  }
}
