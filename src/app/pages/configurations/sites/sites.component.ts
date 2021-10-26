import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { AppService } from '../../../services/app.service';
import { library } from '@fortawesome/fontawesome-svg-core';
// import { ToastrService } from 'ngx-toastr';
import { ToastrService } from '../../../components/toastr/toastr.service';
import {
  TreeModule,
  TREE_ACTIONS,
  TreeNode,
  KEYS,
  IActionMapping,
  ITreeOptions,
  TreeComponent
} from 'angular-tree-component';
import { AuthGuard } from '../../auth/auth.guard';
import { globals } from '../../../utilities/globals';
import { Router } from '@angular/router';

@Component({
  selector: 'kl-sites',
  templateUrl: './sites.component.html',
  styleUrls: ['./sites.component.scss']
})
export class SitesComponent implements OnInit {
  public sideMenus: any = {};
  public settings: any;
  public step_number: any;

  // Common Variables
  public siteStructure: any = {};
  public DFMinput: any = {};
  public DFMinput1: any = {};
  public pageLoaded: Boolean = false;
  public selectedsitedata: Object = {};
  public nodeIndexCount = 0;
  // Site Info
  public siteInfoData: any = {};
  public siteInfoLoading: Boolean = false;

  // site Details Form
  public siteDataLoading: Boolean = false;
  public structureDFMLoading: Boolean = false;
  public typeofElement: String;

  // tree:TreeComponent; variables
  public submittingSite: Boolean = true;
  public activeNode: any;
  genericData: any;
  genericData1: any;
  accessLevel: any;
  disableBtn = false;
  hierachyDisableBtn = false;
  showAddEditButton: any;
  currentSiteID: any;
  @ViewChild('close') close: ElementRef;
  display: boolean;
  visible = false;
  tableView = false;
  autoIncrimentValue = 0;
  @ViewChild(TreeComponent) tree;
  public treeOptions: Object = {
    allowDrag: true,
    actionMapping: {
      mouse: {
        dblClick: (tree, node, $event) => {
          if (node.hasChildren) {
            TREE_ACTIONS.TOGGLE_EXPANDED(tree, node, $event);
          }
        },
        drop: (tree, node, $event, { from, to }) => {
          if (typeof from.station_id !== 'undefined') {
            if (typeof to.parent.data.children === 'undefined') {
              to.parent.data.children = [];
            }
            const tmpObj = {
              station_id: from.station_id,
              type: 'station',
              station_name: from.station_name,
              name: from.station_name
            };
            to.parent.data.children.push(tmpObj);
            tree.update();
          } else {
            TREE_ACTIONS.MOVE_NODE(tree, node, $event, { from, to });
          }
        }
      }
    }
    // expanderClick: TREE_ACTIONS.TOGGLE_EXPANDED,
  };
  public nodesData: any = [];
  private state = localStorage.treeState && JSON.parse(localStorage.treeState);
  url: any;
  setState(state) {
    localStorage.treeState = JSON.stringify(state);
  }

  constructor(
    private appservice: AppService,
    public _toastLoad: ToastrService,
    public _auth: AuthGuard,
    private _globals: globals,
    private _router: Router
  ) {
    this.settings = [
      {
        stepnumber: 1,
        label: 'Site Info',
        active: true
      },
      {
        stepnumber: 2,
        label: 'Site Structure',
        active: false
      }
    ];
  }

  ngOnInit() {
    this.currentSiteID = this._globals.getCurrentUserSiteId();
    this.url = this._router.url;
    if (this.url === '/configurations/siteHierarchy') {
      this.allowAccess('siteHierarchy');
      this.getSiteKey({ industry_id: this.currentSiteID });
      this.hierachyView();
    } else {
      this.allowAccess('siteInfo');
      this.getSiteKey({ industry_id: this.currentSiteID });
    }
  }
  allowAccess(acess: string) {
    const val = this._auth.allowAccessComponent(acess, '');
    this.accessLevel = val;
    return val;
  }
  addNewSite() {
    this.allowAccess('');
    this.getSiteKey({ industry_id: '' });
  }

  /**
   * Get side Bar data on load
   */
  getSitesMenus() {
    this.showAddEditButton = 'Create  Hierarchy';
    this.display = true;
    const dataToPost = {
      page_name: 'site_config',
      filter: [
        {
          site_id: this.currentSiteID
        }
      ]
    };
    this.appservice
      .getSitesList(
        this._globals.deploymentModeAPI.INDUSTRY_GET_LIST,
        this._globals.deploymentMode === 'EL' ? dataToPost : {}
      )
      .subscribe((data) => {
        if (data.status === 'success') {
          this.sideMenus['menuheading'] = 'Sites';
          this.sideMenus['placeholder'] = 'Search Sites';
          this.sideMenus['buttonlabel'] = 'Create  New Site';
          this.sideMenus['data'] = data.data;
          // this.getSiteKey({ industry_id: '' });
          this.pageLoaded = true;
          this.tableView = true;
        } else {
          this._toastLoad.toast(
            'error',
            'Error',
            'Error while loading Site list',
            true
          );
        }
      });
  }

  /**
   * On clicking of the created site loading the Perticular Clicked site
   * @param key name of the site
   */
  hierachyView() {
    this.siteInfoLoading = true;
    this.siteDataLoading = true;
    this.display = false;
    if (this.nodesData.length <= 0) {
      this.nodesData = [
        {
          name: 'New-hierarchy' + ' : ' + this.autoIncrimentValue,
          type: 'Type',
          id: new Date().getTime(),
          description: ''
        }
      ];
    }
  }
  backToSiteView() {
    this.display = true;
  }
  onModelCancel() {
    this.close.nativeElement.click();
  }
  getSiteKey(key) {
    this.display = true;
    if (key['industry_id'] !== '') {
      if (this.accessLevel.edit) {
        this.accessLevel.create = true;
      } else {
        this.accessLevel.create = false;
      }
      this.showAddEditButton = 'Edit Hierarchy';
    } else {
      this.allowAccess('');
      this.showAddEditButton = 'Create  Hierarchy';
    }
    this.pageLoaded = false;
    this.siteInfoLoading = false;
    this.siteDataLoading = false;
    this.step_number = 1;
    this.selectedsitedata = key;
    const dataToSend = {
      industry_id: key['industry_id']
    };
    this.appservice.getSiteData(dataToSend).subscribe((data) => {
      if (data.status === 'success') {
        this.siteStructure = data['data'];
        this.genericData = this.siteStructure['site_info'];
        for (
          let i = 0;
          i < this.genericData.headerContent[0].data.length;
          i++
        ) {
          this.genericData.headerContent[0].sectionTitle = 'Organisation';
          if (this.genericData.headerContent[0].data[i].key === 'street') {
            this.genericData.headerContent[0].data[i].placeholder =
              'Enter Street Name';
          }
        }
        for (
          let j = 0;
          j < this.genericData.headerContent[1].data.length;
          j++
        ) {
          if (this.genericData.headerContent[1].data[j].key === 'region') {
            this.genericData.headerContent[1].data[j].placeholder =
              'Enter Region Name';
          }
          if (this.genericData.headerContent[1].data[j].key === 'latitude') {
            this.genericData.headerContent[1].data[j].placeholder =
              'Enter Latitude';
          }
          if (this.genericData.headerContent[1].data[j].key === 'longitude') {
            this.genericData.headerContent[1].data[j].placeholder =
              'Enter Longitude';
          }
          if (this.genericData.headerContent[1].data[j].key === 'timezone') {
            this.genericData.headerContent[1].data[j].placeholder =
              'Select Timezone';
          }
          if (this.genericData.headerContent[1].data[j].key === 'selectday') {
            this.genericData.headerContent[1].data[j].label = 'Week Starts On';
          }
          if (this.genericData.headerContent[1].data[j].key === 'fystartson') {
            this.genericData.headerContent[1].data[j].label = 'FY Starts On';
          }
          if (this.genericData.headerContent[1].data[j].key === 'daystartsat') {
            this.genericData.headerContent[1].data[j].label = 'Day Starts At';
          }
        }
        this.genericData.userActions = {
          save: {
            label: 'Apply changes'
          },
          cancel: {
            label: 'Cancel'
          }
        };
        this.DFMinput = this.genericData;
        this.siteInfoData = this.siteStructure['site_info']['bodyContent'];
        if (
          this.siteStructure['tree_data'] !== null &&
          this.siteStructure['tree_data'].length > 0
        ) {
          this.nodesData = this.siteStructure['tree_data'];
        } /* else {                                // As we are adding this in edit/add heirarchy
          this.nodesData = [
            {
              name: 'Configure Element',
              type: 'Type',
              id: new Date().getTime(),
              description: '',
            },
          ];
        } */
        this.siteInfoLoading = true;
        this.siteDataLoading = true;
        this.pageLoaded = true;
        this.tableView = false;
      } else {
        this._toastLoad.toast('error', 'Failed', 'Failed to load Site', true);
      }
    });
  }

  assignDynamicNodeId(arrChange, string) {}

  async arrRecursive(arrRecursiveObj) {
    //const arrRecursive  = this.nodesData[0].childern;
    for (let index = 0; index < arrRecursiveObj.length; index++) {
      await setTimeout(function name() {
        this.assignDynamicNodeId();
      }, 500);
      const element = arrRecursiveObj[index];
      element.id = new Date().getTime();
      if (element.hasOwnProperty('children')) {
        stop;
        setTimeout(() => this.arrRecursive(element.children), 500);
      }
    }
    //this.assignDynamicNodeId(this.nodesData[0],this.nodesData[0].data.id);
  }
  /**
   *
   * @param siteInfoData Getting site info from DFM
   */
  // getSiteInfo(siteInfoData) {
  //   if (siteInfoData.siteName === null || siteInfoData.description === null) {
  //     this.step_number = 1;
  //   } else {
  //     this.siteInfoLoading = false;
  //     this.siteInfoLoading = false;
  //     this.step_number = 2;
  //     this.siteInfoData = siteInfoData;
  //     // this.DFMinput = this.siteStructure['site_structure'];
  //     this.DFMinput1 = this.siteStructure['site_structure']['dfm_data']['area'];
  //     this.structureDFMLoading = true;
  //     this.typeofElement = this.siteStructure['site_structure']['typeDropdown'][0].value;
  //     this.siteInfoLoading = true;
  //     this.siteDataLoading = true;

  //   }
  // }

  /**
   *
   * @param dataBingingToTree Data is going to bind with The tree
   */
  getBindDatatoTree(dataBingingToTree) {
    this.visible = true;
    const formData = dataBingingToTree;
    this.activeNode.node.data.data = formData;
    this.activeNode.node.data.name = formData[this.typeofElement + '_name'];
    //this.activeNode.node.data.ids = formData[this.typeofElement + '_id_no'];  //causing duplicating of ids,so commented
    this.activeNode.node.data.description =
      formData[this.typeofElement + '_description'];
    this.activeNode.node.data.type = this.typeofElement;
    this.onModelCancel();
  }
  showFields(data) {}

  /**
   *
   * @param step On clicking Of stepper
   */
  // getstepnumber(step) {
  //   this.step_number = step.stepnumber;
  //   if (this.step_number === 1) {
  //     this.siteStructure['site_info']['bodyContent'] = this.siteInfoData;
  //     this.DFMinput = this.siteStructure['site_info'];
  //   } else if (this.step_number === 2) {
  //     this.DFMinput1 = this.siteStructure['site_structure']['dfm_data']['area'];
  //     this.typeofElement = '';
  //   }
  //   this.siteInfoLoading = true;
  //   this.siteDataLoading = true;
  // }
  // getnextstepnumber(nextstep) {
  //   this.step_number = nextstep;
  // }
  // getpreviousstepnumber(previousstep) {
  //   this.step_number = previousstep;
  // }
  // previousStep() {
  //   this.step_number = this.step_number - 1;
  //   if (this.step_number === 1) {
  //     this.siteStructure['site_info']['bodyContent'] = this.siteInfoData;
  //     this.DFMinput = this.siteStructure['site_info'];
  //   } else if (this.step_number === 2) {
  //     this.DFMinput1 = this.siteStructure['site_structure']['dfm_data']['area'];
  //     this.typeofElement = '';
  //   }
  //   this.siteInfoLoading = true;
  //   this.siteDataLoading = true;
  // }
  /**
   *
   * @param node Removing node Data
   */
  onRemoveNode(node) {
    let delIndex;
    let nodeId;
    for (let i = 0; i < node.parent.data.children.length; i++) {
      if (node.id === node.parent.data.children[i].id) {
        delIndex = i;
        nodeId = node.id;
      }
    }
    if (node.treeModel.nodes.length > 1) {
      node.parent.data.children.splice(delIndex, 1);
      this.tree.treeModel.update();
    } else if (
      node.treeModel.nodes.length === 1 &&
      node.parent.data.children.length > 0 &&
      nodeId !== node.treeModel.nodes[0].id
    ) {
      node.parent.data.children.splice(delIndex, 1);
      this.tree.treeModel.update();
    }
  }

  /**
   * Adding Node to Tree Structure
   * @param index index of Clonning Node
   * @param node Node Data
   */
  addNode(index, node) {
    this.autoIncrimentValue++;
    index.stopPropagation();
    const addnodeobject = {
      name: 'New-hierarchy' + ' : ' + this.autoIncrimentValue,
      type: 'Type',
      id: new Date().getTime(),
      description: ''
    };
    node.parent.data.children.push(addnodeobject);
    this.tree.treeModel.update();
    this.visible = false;
  }
  onExpand() {
    this.visible = false;
  }

  // Site structure functions
  /**
   *
   * @param value On changing of Element Type
   */
  typeOfElementChanged(value, type) {
    this.visible = true;
    this.structureDFMLoading = false;
    this.genericData1 = this.siteStructure['site_structure']['dfm_data'][value];
    if (value !== undefined) {
      if (value === 'line') {
        // this.genericData1 = this.siteStructure['site_structure']['dfm_data'][value];
        this.genericData1.headerContent[0].data[0].placeholder = 'Line Name';
        this.genericData1.headerContent[0].data[0].required = true;
        this.genericData1.userActions = {
          buttonsPosition: 'fixed',
          save: {
            label: 'Apply changes'
          },
          close: {
            label: 'Cancel'
          }
        };
        this.DFMinput1 = this.genericData1;
      } else if (value === 'area') {
        this.genericData1.headerContent[0].data[0].placeholder = 'Area Name';
        this.genericData1.headerContent[0].data[0].required = true;
        this.genericData1.userActions = {
          buttonsPosition: 'fixed',
          save: {
            label: 'Apply changes'
          },
          close: {
            label: 'Cancel'
          }
        };
        this.DFMinput1 = this.genericData1;
      } else if (value === 'building') {
        this.genericData1.headerContent[0].data[0].placeholder =
          'Building Name';
        this.genericData1.headerContent[0].data[0].required = true;
        this.genericData1.headerContent[0].data[2].label = 'ID / No.';
        this.genericData1.headerContent[0].data[2].placeholder =
          'Building ID/No.';
        this.genericData1.userActions = {
          buttonsPosition: 'fixed',
          save: {
            label: 'Apply changes'
          },
          close: {
            label: 'Cancel'
          }
        };
        this.DFMinput1 = this.genericData1;
      } else if (value === 'floor') {
        this.genericData1.headerContent[0].data[0].placeholder = 'Floor Name';
        this.genericData1.headerContent[0].data[0].required = true;
        this.genericData1.userActions = {
          buttonsPosition: 'fixed',
          save: {
            label: 'Apply changes'
          },
          close: {
            label: 'Cancel'
          }
        };
        this.DFMinput1 = this.genericData1;
      } else if (value === 'department') {
        this.genericData1.headerContent[0].data[0].placeholder =
          'Department Name';
        this.genericData1.headerContent[0].data[0].required = true;
        this.genericData1.userActions = {
          buttonsPosition: 'fixed',
          save: {
            label: 'Apply changes'
          },
          close: {
            label: 'Cancel'
          }
        };
        this.DFMinput1 = this.genericData1;
      } else if (value === 'machine') {
        this.genericData1.headerContent[0].data[0].placeholder = 'Machine Name';
        this.genericData1.headerContent[0].data[0].required = true;
        this.genericData1.headerContent[0].data[2].label = 'ID / No.';
        this.genericData1.headerContent[0].data[2].placeholder =
          'Machine ID/No.';
        this.genericData1.userActions = {
          buttonsPosition: 'fixed',
          save: {
            label: 'Apply changes'
          },
          close: {
            label: 'Cancel'
          }
        };
        this.DFMinput1 = this.genericData1;
      }
      this.DFMinput1['bodyContent'] = {};
      if (this.activeNode) {
        if (this.activeNode.node.data.data && type === 'update') {
          this.DFMinput1['bodyContent'] = this.activeNode.node.data.data;
        } else if (this.activeNode.node.data.data && type === 'change') {
          const element = {};
          for (
            let i = 0;
            i < this.DFMinput1.headerContent[0].data.length;
            i++
          ) {
            const key = this.DFMinput1.headerContent[0].data[i]['key'];
            element[key] = '';
          }
          const CurrentKeys = Object.keys(element);
          const valueKeys = Object.keys(this.activeNode.node.data.data);

          for (let j = 0; j < valueKeys.length; j++) {
            for (let k = 0; k < CurrentKeys.length; k++) {
              const valA = valueKeys[j].split('_');
              const valB = CurrentKeys[k].split('_');
              if (valA[1] === valB[1]) {
                element[CurrentKeys[k]] = this.activeNode.node.data.data[
                  valueKeys[j]
                ];
              }
            }
          }
          this.DFMinput1['bodyContent'] = element;
        } else {
          const name = {};
          name[value + '_name'] = this.activeNode.node.data.name;
          name[value + '_description'] = this.activeNode.node.data.description;
          this.DFMinput1['bodyContent'] = name;
        }
      }
      setTimeout(() => {
        this.structureDFMLoading = true;
      }, 0);
    }
  }
  /**
   * On Clicking of Node gets Active
   * @param event Node Active event
   */
  onActivenode(event) {
    this.visible = true;
    this.typeofElement = null;
    this.structureDFMLoading = false;
    this.activeNode = event;
    // if (this.activeNode.node.data.data) {
    //   this.typeofElement = this.activeNode.node.data.type;
    //   this.typeOfElementChanged(this.activeNode.node.data.type, 'update');
    // }
    if (this.activeNode.node.data) {
      if (this.activeNode.node.data.children) {
        if (
          this.activeNode.node.data.data[
            this.activeNode.node.data.type + '_description'
          ] === null
        ) {
          this.activeNode.node.data.data[
            this.activeNode.node.data.type + '_description'
          ] = this.activeNode.node.data.description;
        }
        if (
          this.activeNode.node.data.data[
            this.activeNode.node.data.type + '_name'
          ] === null
        ) {
          this.activeNode.node.data.data[
            this.activeNode.node.data.type + '_name'
          ] = this.activeNode.node.data.name;
        }
        this.typeOfElementChanged(this.activeNode.node.data.type, 'update');
        this.typeofElement = this.activeNode.node.data.type;
      } else if (this.activeNode.node.data.data) {
        if (
          this.activeNode.node.data.data[
            this.activeNode.node.data.type + '_description'
          ] === null
        ) {
          this.activeNode.node.data.data[
            this.activeNode.node.data.type + '_description'
          ] = this.activeNode.node.data.description;
        }
        if (
          this.activeNode.node.data.data[
            this.activeNode.node.data.type + '_name'
          ] === null
        ) {
          this.activeNode.node.data.data[
            this.activeNode.node.data.type + '_name'
          ] = this.activeNode.node.data.name;
        }
        this.typeOfElementChanged(this.activeNode.node.data.type, 'update');
        this.typeofElement = this.activeNode.node.data.type;
      } else {
        this.typeofElement = 'area';
        this.typeOfElementChanged('area', 'change');
        // this.typeOfElementChanged(this.activeNode.node.data.type, 'change');
      }
    } else {
      // this.typeofElement = '';
    }
  }

  /**
   * Saving of entire Site Data
   */
  saveSite(siteInfoData) {
    let time = siteInfoData.daystartsat;
    if (time.length < 6) {
      time += ':00';
      siteInfoData.daystartsat = time;
    }
    this.disableBtn = true;
    this.submittingSite = false;
    let DataToSend;
    if (this.siteInfoData.siteName) {
      DataToSend = {
        industry_id: this.selectedsitedata['industry_id'],
        site_info: this.siteInfoData,
        site_structure: this.nodesData
      };
    } else {
      DataToSend = {
        industry_id: this.selectedsitedata['industry_id'],
        site_info: siteInfoData,
        site_structure: this.nodesData
      };
    }
    if (DataToSend['industry_id'] !== '') {
      this.appservice.updateSiteData(DataToSend).subscribe((data) => {
        if (data.status === 'success') {
          this._toastLoad.toast(
            'success',
            'Success',
            'Site Updated Successfully',
            true
          );
          this.submittingSite = true;
          this.showSiteInfo();
          // this.toastr.success('Success', 'Site Updated Successfully');
          // this.pageRefresh();
        } else {
          this._toastLoad.toast(
            'error',
            'Error',
            'Error in Saving of Site Data',
            true
          );
        }
        this.disableBtn = false;
        // this.onCancel();
      });
    } else {
      this.appservice.saveSiteData(DataToSend).subscribe((data) => {
        if (data.status === 'success') {
          this._toastLoad.toast(
            'success',
            'Success',
            'Site saved Successfully',
            true
          );
          this.submittingSite = true;
          this.showSiteInfo();
          // this.toastr.success('Success', 'Site Saved Successfully');
          // this.pageRefresh();
        } else {
          this._toastLoad.toast(
            'error',
            'Error',
            'Error in Saving of Site Data',
            true
          );
        }
        this.disableBtn = false;
        // this.onCancel();
      });
    }
  }
  showSiteInfo() {
    this.getSiteKey({ industry_id: this.currentSiteID });
  }
  SaveHierachy() {
    this.hierachyDisableBtn = true;
    this.submittingSite = false;
    let DataToSend = {};
    DataToSend = {
      industry_id: this.selectedsitedata['industry_id'],
      site_info: this.siteStructure['site_info'].bodyContent,
      site_structure: this.nodesData
    };
    if (DataToSend['industry_id'] !== '') {
      this.appservice.updateSiteData(DataToSend).subscribe((data) => {
        if (data.status === 'success') {
          this._toastLoad.toast(
            'success',
            'Success',
            'Site Updated Successfully',
            true
          );
          this.submittingSite = true;
          this.tree.treeModel.collapseAll();
          this.showHierachy();
        } else {
          this._toastLoad.toast(
            'error',
            'Error',
            'Error in Saving of Site Data',
            true
          );
        }
        this.hierachyDisableBtn = false;
      });
    } else {
      this.appservice.saveSiteData(DataToSend).subscribe((data) => {
        if (data.status === 'success') {
          this._toastLoad.toast(
            'success',
            'Success',
            'Site saved Successfully',
            true
          );
          this.submittingSite = true;
          this.tree.treeModel.collapseAll();
          this.showHierachy();
        } else {
          this._toastLoad.toast(
            'error',
            'Error',
            'Error in Saving of Site Data',
            true
          );
        }
        this.hierachyDisableBtn = false;
      });
    }
  }
  showHierachy() {
    this.autoIncrimentValue = 0;
    this.allowAccess('siteHierarchy');
    this.getSiteKey({ industry_id: this.currentSiteID });
    this.hierachyView();
  }
  onCancel() {
    // this.tableView = true;
    // this.siteInfoLoading = false;
    // this.siteDataLoading = false;
    this.showSiteInfo();
  }
  pageRefresh() {
    this.sideMenus = undefined;
    this.settings = undefined;
    this.step_number = undefined;
    // Common Variables
    this.siteStructure = {};
    this.DFMinput = {};
    this.DFMinput1 = {};
    this.pageLoaded = false;
    // Site Info
    this.siteInfoData = {};
    this.siteInfoLoading = false;
    // site Details Form
    this.siteDataLoading = false;
    this.structureDFMLoading = false;
    this.typeofElement = null;
    // tree:TreeComponent; variables
    this.activeNode = undefined;
    this.getSitesMenus();
    this.step_number = 1;
  }
  refreshHeirachy() {
    this.autoIncrimentValue = 0;
    this.getSiteKey({ industry_id: this.currentSiteID });
    this.hierachyView();
  }
}
