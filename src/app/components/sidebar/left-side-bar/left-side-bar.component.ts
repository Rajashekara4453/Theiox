import { Component, OnInit, Input } from '@angular/core';
import { Router } from '@angular/router';
import { AuthGuard } from '../../../pages/auth/auth.guard';
import { globals } from '../../../utilities/globals';

@Component({
  selector: 'kl-left-side-bar',
  templateUrl: './left-side-bar.component.html',
  styleUrls: ['./left-side-bar.component.scss']
})
export class LeftSideBarComponent implements OnInit {
  @Input('menus') menus: any;
  @Input() heading: any;
  nodes = [];
  options = {};
  public selectedNode: any;
  public deleteDashBoard: any;
  router: any;

  // Variables for Left-side-bar Access Levels
  configurationsAccessPermissions: any;
  accessibleMenus: any = [];
  hasChildren: boolean = true;
  copiedMenuElement: any;
  // originalMenuElement: any;
  isView: boolean = false;
  isFirstChild: boolean = true;
  loopCount: number = 0;
  deleteForIdMatch: boolean;
  copyMenuElement: any = {
    id: '',
    name: '',
    children: []
  };
  isSystemAdmin: boolean = false;

  // Variable for search elmfilter pipe
  queryString: string = '';

  constructor(
    private _router: Router,
    private _auth: AuthGuard,
    private _globals: globals
  ) {}

  ngOnInit() {
    this.isSystemAdmin = this._globals.isSystemAdminLoggedIn();
    this.options = {
      allowDrag: true,
      allowDrop: true
    };
    this.filterMenu();
  }

  onEvent(e) {
    if (e.data.lookup_id) {
      this._router.navigate([
        'configurations/lookup_tables/' + e.node.data.lookup_id
      ]);
    } else if (e.data.route) {
      this._router.navigate([e.data.route]);
    }
  }

  // Left side bar Access Permissions

  filterMenu() {
    for (let i = 0; i < this.menus.length; i++) {
      const menuElement = this.menus[i];
      this.isView = this.checkAccessForMenus(menuElement.id, menuElement);
      if (this.isView === true) {
        if (menuElement.hasOwnProperty('children')) {
          this.arrRecursive(menuElement);
        } else {
          menuElement['isCollapsed'] = false;
        }
        this.accessibleMenus.push(menuElement);
        // console.log(this.accessibleMenus);
        this.isView = false;
        this.deleteForIdMatch = true;
        this.hasChildren = false;
      }
      if (this.isView === false && this.deleteForIdMatch === true) {
        if (this.deleteForIdMatch === true) {
          delete this.menus[i];
        }
        this.deleteForIdMatch = false;
      }
    }

    // Adding menus with No Access Object defined in Access Levels
    for (let i = 0; i < this.menus.length; i++) {
      if (this.menus[i] !== undefined) {
        const menuElement = this.menus[i];
        if (
          !this.isSystemAdmin &&
          menuElement['route'] === 'configurations/client-management'
        ) {
          delete this.menus[i];
          continue;
        }
        menuElement.isCollapsed = false;
        this.accessibleMenus.push(menuElement);
      }
    }

    //  console.log(this.accessibleMenus);
  }

  checkViewMasterConfiguration(menuElementId: any, menuElement: any) {
    this.deleteForIdMatch = true;
    return false;
  }

  checkAccessForMenus(menuElementId: number, menuElement: any) {
    this.configurationsAccessPermissions = this._auth.accessObjectAll();
    let conf: any;

    // tslint:disable-next-line: forin
    for (const configurations in this.configurationsAccessPermissions) {
      conf = this.configurationsAccessPermissions[configurations];
      this.loopCount++;

      // menu id matches access levels id - on first level
      if (menuElementId === conf['id']) {
        if (conf['view'] === true) {
          this.hasChildren = false;
          return true;
        } else {
          this.deleteForIdMatch = true;
          return false;
        }
      }

      // menu id does-not match access levels id - on first level and has children
      // Loop into children find a match
      if (
        menuElementId !== conf['id'] &&
        menuElement['children'] &&
        menuElement['name'] !== 'Master Configuration'
      ) {
        for (let i = 0; i < menuElement.children.length; i++) {
          this.hasChildren = true;

          if (this.isFirstChild) {
            this.copiedMenuElement = this.cloneMenuElement(
              this.hasChildren,
              menuElement
            );
          }

          if (menuElement.children[i].id === conf['id']) {
            if (conf['view']) {
              this.isView = this.checkAccessForMenus(
                menuElement.children[i].id,
                menuElement.children[i]
              );
              // un-comment - bkup
              // if (this.isView) {
              //   this.copiedMenuElement.children.push(menuElement.children[i]);
              //    console.log(this.copiedMenuElement);
              // }
            } else {
              // if menu id matches access levels id , but view is false - Perform slice.
              menuElement.children.splice(i, 1);
              if (menuElement.children.length === 0) {
                this.deleteForIdMatch = true;
                return false;
              }
            }
          }
        }
      }
    }

    //this.addToaccessibleMenu(menuElement);
    this.copiedMenuElement = {};
    this.copyMenuElement = {};
    this.loopCount = 0;
    this.deleteForIdMatch = false;
    return false;
  }

  // addToaccessibleMenu(copiedMenuElement) {
  //   if (this.isView && this.hasChildren) {
  //     this.accessibleMenus.push(copiedMenuElement);
  //     this.hasChildren = false;
  //   }
  // }

  // cloneOriginalMenuElement(menuElement) {
  //   return JSON.parse(JSON.stringify(menuElement));
  // }

  cloneMenuElement(hasChildren, menuElement) {
    if (hasChildren) {
      this.isFirstChild = false;
      this.copyMenuElement = JSON.parse(JSON.stringify(menuElement));
      this.copyMenuElement.id = menuElement.id;
      this.copyMenuElement.name = menuElement.name;
      this.copyMenuElement.children = [];
    }
    return this.copyMenuElement;
  }

  onClickCollapse(item: any) {
    if (item.isCollapsed === undefined && item.hasOwnProperty('children')) {
      item['isCollapsed'] = true;
    } else {
      item['isCollapsed'] = !item.isCollapsed;
    }
    // this._router.navigate([item.route]);
  }

  onClickChildren(item: any) {
    this._router.navigate([item.route]);
  }

  onClickParent(item: any) {
    if (item.hasOwnProperty('children')) {
      if (item.isCollapsed === undefined) {
        item['isCollapsed'] = true;
      } else {
        item['isCollapsed'] = !item.isCollapsed;
      }
    } else {
      this._router.navigate([item.route]);
    }
  }

  arrRecursive(arrRecursiveObj) {
    //const arrRecursive  = this.nodesData[0].childern;
    for (let index = 0; index < arrRecursiveObj.children.length; index++) {
      const element = arrRecursiveObj.children[index];

      //console.log(element.id);
      if (element.hasOwnProperty('children')) {
        this.arrRecursive(element.children);
      } else {
        this.onClickCollapse(element);
      }
    }
    //this.assignDynamicNodeId(this.nodesData[0],this.nodesData[0].data.id);
  }

  routeLink(route: any) {
    this._router.navigate(route.route);
  }

  // unique id corresponding to the item
  trackByFn(index) {
    return index;
  }
}
