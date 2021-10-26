import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';
import { AppService } from '../../../services/app.service';

@Injectable({
  providedIn: 'root'
})
export class SidebarDetailsService {
  /*===========================================  Service Description  =============================================================
    
    1) Makes a request for DRTS list and adds required keys
    2) Delivers new data to component and exposes a method to update sidebar from breadcrumb
===============================================================================================================================*/
  refresh: Subject<any> = new Subject();
  remoteList = [];
  menuItemsPrimary: any;
  currentClickedItem: any;

  constructor(private _appService: AppService) { }

  async getRemoteMenuItems(item) {
    this.currentClickedItem = item;
    const payload = { type: '' };
    payload.type = item.type;
    try {
      const data = await this._appService
        .getDashboardLeftSideconfigData(payload)
        .toPromise();
      if (data['data'].length > 0) {
        this.remoteList = this.assignUrl(data['data'], item);
      } else if (data['data'].length === 0) {
        this.remoteList = [];
      }
    } catch {
      return [];
    }
    return this.remoteList;
  }

  assignUrl(children: any, item) {
    let holdIdAsString;
    let holdIdAsNumber;
    for (let i = 0; i < children.length; i++) {
      children[i]['url'] =
        children[i].type.toLowerCase() + '/' + children[i].dashboard_id;
      children[i]['isShowLeftSideBar'] = true;
      children[i]['hasChildren'] = false;
      children[i]['pId'] = item.id;
      children[i]['isShowMobileView'] = item['isShowMobileView'];
      children[i]['accessLevel'] = item['accessLevel'];
      !children[i]['isOwner'] ? children[i]['icon'] = 'fa fa-share' : '';
      children[i]['reference'] = item['reference'];
      holdIdAsString = children[i]['dashboard_id'].replace(/^\D+/g, '') + 99;
      holdIdAsNumber = parseInt(holdIdAsString);
      children[i]['id'] = holdIdAsNumber;
    }
    return children;
  }

  async updateSidebar() {
    const payload = { type: '' };
    if (this.currentClickedItem !== undefined) {
      payload.type = this.currentClickedItem.type;
      const data = await this._appService
        .getDashboardLeftSideconfigData(payload)
        .toPromise();
      if (data['data'].length > 0) {
        this.remoteList = await this.assignUrl(
          data['data'],
          this.currentClickedItem
        );
      } else if (data['data'].length === 0) {
        this.remoteList = [];
      }
    }
    if (this.currentClickedItem !== undefined) {
      if (this.currentClickedItem.hasOwnProperty('reference')) {
        this.refresh.next(this.remoteList);
      }
    }
  }
}
