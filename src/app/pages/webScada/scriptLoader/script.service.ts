import { Injectable, Inject } from '@angular/core';
import { ReplaySubject, Observable, forkJoin } from 'rxjs';
import { WebscadaService } from '../webscada.service';

@Injectable({
  providedIn: 'root',
})
export class ScriptService {
  private _loadedLibraries: { [url: string]: ReplaySubject<any> } = {};
  public hasGraphLoaded: Boolean = false;
  constructor() {}

  lazyloadlibrary(): Observable<any> {
    return forkJoin([
      this.loadScript('/assets/library/scada/src/js/mxPreviewClient.js'),
      this.loadStyle('/assets/library/scada/editor/styles/grapheditor.css'),
    ]);
  }

  private loadScript(url: string): Observable<any> {

    if (this._loadedLibraries[url]) {
      return this._loadedLibraries[url].asObservable();
    }

    this._loadedLibraries[url] = new ReplaySubject();

    const script = document.createElement('script');
    script.type = 'text/javascript';
    script.async = true;
    script.src = url;
    script.onload = () => {
      this._loadedLibraries[url].next();
      this._loadedLibraries[url].complete();
    };
    document.body.appendChild(script);
    return this._loadedLibraries[url].asObservable();
  }

  loadWebScript(url?: any) {
    const script = document.createElement('script');
    script['src'] = url;
    script.onload = () => {
      this.hasGraphLoaded = !this.hasGraphLoaded;
    };
    const loadScriptToDom = function () {
      document.head.appendChild(script);
      document.removeEventListener('jGraphLoaded', loadScriptToDom);
    }

    document.addEventListener('jGraphLoaded', loadScriptToDom);
  }

  private loadStyle(url: string): Observable<any> {
    if (this._loadedLibraries[url]) {
      return this._loadedLibraries[url].asObservable();
    }

    this._loadedLibraries[url] = new ReplaySubject();

    const style = document.createElement('link');
    style.type = 'text/css';
    style.href = url;
    style.rel = 'stylesheet';
    style.onload = () => {
      this._loadedLibraries[url].next();
      this._loadedLibraries[url].complete();
    };

    const head = document.getElementsByTagName('head')[0];
    head.appendChild(style);

    return this._loadedLibraries[url].asObservable();
  }

}
