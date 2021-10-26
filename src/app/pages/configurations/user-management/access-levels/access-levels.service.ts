import { Injectable } from '@angular/core';
import { AppService } from '../../../../../app/services/app.service';
import { globals } from '../../../../../app/utilities/globals';
import { Subject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AccessLevelsService {
  constructor(private _appService: AppService, private _globals: globals) {}
  menuList: any = [];
  accessLevelDB: any;
  accessLevel: any = {};

  test() {
    console.log('access-level service called from access-menu service');
  }

  updateOldAccessLevel(userRoleId: any, menuList: any) {
    const subject = new Subject();
    const requestPayload = {
      user_role_id: userRoleId
    };
    this._appService.getAccessLevel(requestPayload).subscribe(async (data) => {
      this.accessLevelDB = data['data'][0];
      menuList.forEach((menu) => {
        const menuAccessLevel: any = menu['accessLevel'];
        const allUserRolesDB: any = this.accessLevelDB['userRolePermissions'];
        for (const key in allUserRolesDB) {
          if (allUserRolesDB.hasOwnProperty(key) && key === menu['ticket']) {
            const eachUserRole = allUserRolesDB[key];
            for (const accessKeyDB in eachUserRole) {
              if (eachUserRole.hasOwnProperty(accessKeyDB)) {
                const element = eachUserRole[accessKeyDB];
                if (
                  menuAccessLevel.hasOwnProperty(accessKeyDB) &&
                  menuAccessLevel[accessKeyDB] !== 'name' &&
                  menuAccessLevel[accessKeyDB] !== 'id' &&
                  menuAccessLevel[accessKeyDB] !== 'url'
                ) {
                  menuAccessLevel[accessKeyDB] = element;
                }
              }
            }
          }
        }
      });
      const reducedMenuList = await this.reduceMenuList(menuList);
      const dataToUpdate = await this.setAccessLevelData(reducedMenuList);
      this._appService.saveAccessLevelData(dataToUpdate).subscribe((data) => {
        if (data.status === 'success') {
          subject.next('updated');
        } else {
          console.log('some error on updating old access levels..');
        }
      });
    });
    return subject.asObservable();
  }

  // Method to save only specific keys.
  async reduceMenuList(menuList) {
    const reducedMenuList: any = [];
    const keys_to_keep = ['id', 'name', 'ticket', 'accessLevel'];
    // To keep only required keys defined in an array keys_to_keep
    menuList.forEach((menuObject) => {
      if (
        menuObject.hasOwnProperty('isShowAccessLevel') &&
        menuObject['isShowAccessLevel'] === true
      ) {
        const reducedObject = keys_to_keep.reduce((newObject: any, key) => {
          if (menuObject.hasOwnProperty(key)) {
            newObject[key] = menuObject[key];
            return newObject;
          } else if (!menuObject['isShowAccessLevel']) {
            return;
          }
        }, {});
        reducedMenuList.push(reducedObject);
      }
    });
    return reducedMenuList;
  }

  // Method to return an object with access level data to be saved.
  async setAccessLevelData(reducedMenuList) {
    this.accessLevel['userRolePermissions'] = reducedMenuList;
    // tslint:disable-next-line: max-line-length
    this.accessLevel['client_id'] =
      typeof this.accessLevelDB['clientId'] === 'undefined'
        ? this._globals.getCurrentUserClientId()
        : this.accessLevelDB['clientId'];
    this.accessLevel['default'] = this.accessLevelDB['default'];
    this.accessLevel['site_id'] = this.accessLevelDB['site_id'];
    this.accessLevel['user_role_id'] = this.accessLevelDB['user_role_id'];
    this.accessLevel['userRoleName'] = this.accessLevelDB['userRoleName'];
    this.accessLevel['version'] = '1';
    this.accessLevel['timeStamp'] = this.getDateTime();
    return this.accessLevel;
  }

  // Method to get current Date and time
  getDateTime() {
    const today = new Date();
    const date =
      today.getFullYear() +
      '-' +
      (today.getMonth() + 1) +
      '-' +
      today.getDate();
    const time =
      today.getHours() + ':' + today.getMinutes() + ':' + today.getSeconds();
    const dateTime = date + ' ' + time;
    return dateTime;
  }

  userAccess: any;
}
