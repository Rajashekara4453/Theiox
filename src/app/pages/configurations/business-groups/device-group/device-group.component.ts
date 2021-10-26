import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { AppService } from '../../../../services/app.service';
import { TREE_ACTIONS, TreeComponent } from 'angular-tree-component';

import { ToastrService } from '../../../../components/toastr/toastr.service';
import { AuthGuard } from '../../../auth/auth.guard';
import { Router } from '@angular/router';
import { globals } from '../../../../utilities/globals';

@Component({
  selector: 'kl-device-group',
  templateUrl: './device-group.component.html',
  styleUrls: ['./device-group.component.scss']
})
export class DeviceGroupComponent implements OnInit {
  public pageLoaded: Boolean = false;
  public sideMenus: any = {};
  public loadingDeviceGroup: Boolean = false;
  public saving_devicegroup: Boolean = true;
  public title: String = '';
  accessLevel: any;
  disableBtn = false;
  currentSiteID: any;
  default: Boolean;
  client_id: any;
  autoIncrimentValue = 1;
  // Tree Variables
  public nodesData: any = [
    {
      name: 'New-sub-group' + ' : ' + this.autoIncrimentValue
    }
  ];
  public activeNode: any;
  public nodeStoredData: any = {
    name: '',
    description: ''
  };
  public groupInfo: any = {
    groupname: '',
    groupDescription: ''
  };
  public device_group_id: String = '';
  // Wizard Variables
  public wizardSettings = [
    {
      stepnumber: 1,
      label: 'Device group Info',
      active: true
    },
    {
      stepnumber: 2,
      label: 'Device group Structure',
      active: false
    }
  ];
  public step_number: any = 1;
  @ViewChild(TreeComponent) tree;
  visible = false;
  @ViewChild('close') close: ElementRef;
  step1: String;
  step2: string;
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
            // const tmpObj = { station_id: from.station_id, type: 'station', station_name: from.station_name, name: from.station_name };
            // to.parent.data.children.push(tmpObj);
            tree.update();
          } else {
            TREE_ACTIONS.MOVE_NODE(tree, node, $event, { from, to });
          }
        }
      }
    }
    // expanderClick: TREE_ACTIONS.TOGGLE_EXPANDED,
  };
  public state = localStorage.treeState && JSON.parse(localStorage.treeState);
  depMode: any;
  // endPointUrl: any;
  dataToPost: { page_name: string; filter: any };
  setState(state) {
    localStorage.treeState = JSON.stringify(state);
  }
  constructor(
    public appservice: AppService,
    public _toastLoad: ToastrService,
    public _auth: AuthGuard,
    private _router: Router,
    private _globals: globals
  ) {}
  ngOnInit() {
    this.currentSiteID = this._globals.getCurrentUserSiteId();
    this.default = this._globals.isSystemAdminLoggedIn();
    this.client_id = this._globals.getCurrentUserClientId();
    this.depMode = this._globals.deploymentMode;
    // this.endPointUrl = this._globals.deploymentModeAPI;
    this.allowAccessComponent('');
    this.getDeviceGroupMenus();
    this.getAccordianHeaderNames();
    this.getLabels();
  }
  getLabels() {
    this._auth.getMenuLabel().subscribe((data) => {
      this.title = 'Create ' + data;
    });
  }
  getAccordianHeaderNames() {
    this.appservice.getAccordianHeaderNames().subscribe((data) => {
      this.step1 = data.deviceGroup.step1;
      this.step2 = data.deviceGroup.step2;
    });
  }
  allowAccessComponent(acess: String) {
    const val = this._auth.allowAccessComponent('masterConfiguration', '');
    this.accessLevel = val;
    if (!this.accessLevel.view) {
      this._router.navigate(['/un-authorized']);
      return false;
    }
    // return val;
  }
  onCancel() {
    this.addDeviceGroup();
  }
  getDeviceGroupMenus() {
    this.pageLoaded = false;
    this.step_number = 1;
    let dataToPost;
    if (this.depMode === 'EL') {
      dataToPost = {
        page_name: 'device_group',
        filter: [
          {
            site_id: this.currentSiteID
          }
        ]
      };
    } else {
      dataToPost = {
        page_name: 'device_group',
        filter: undefined
      };
    }
    this.appservice.getdeviceGroupsList(dataToPost).subscribe((data) => {
      if (data.status === 'success') {
        this.sideMenus['menuheading'] = 'Asset Group';
        this.sideMenus['placeholder'] = 'Search Asset Group';
        this.sideMenus['buttonlabel'] = 'Create  New Asset Group';
        this.sideMenus['data'] = data.device_group;
        this.pageLoaded = true;
        this.getDeviceGroup({ device_group_id: '' });
      } else {
        this._toastLoad.toast('error', 'Error', 'Error while loading', true);
      }
    });
  }
  getDeviceGroup(deviceGroup) {
    if (deviceGroup['device_group_id'] !== '') {
      if (this.accessLevel.edit) {
        this.accessLevel.create = true;
      } else {
        this.accessLevel.create = false;
      }
      this.title = 'Edit ' + deviceGroup['name'];
    } else {
      this.allowAccessComponent('');
    }
    this.loadingDeviceGroup = false;
    // this.title = (deviceGroup['device_group_id'] !== '') ? ('Edit ' + deviceGroup['name']) : 'Create  Asset Group';
    this.device_group_id = deviceGroup['device_group_id'];
    if (deviceGroup['device_group_id'] !== '') {
      this.appservice.loadDeviceGroup(deviceGroup).subscribe((data) => {
        if (data.status === 'success') {
          if (data.data['device_group_structure'].length > 0) {
            this.nodesData = data.data['device_group_structure'];
          }
          this.groupInfo = data.data['device_group_info'];
          this.loadingDeviceGroup = true;
        } else {
          this._toastLoad.toast('error', 'Error', 'Error while loading', true);
        }
      });
    } else {
      this.appservice.loadDeviceGroup(deviceGroup).subscribe((data) => {
        if (data.status === 'success') {
          // this.nodesData = data['device_group'];
          this.nodesData = [
            {
              name: 'New-sub-group' + ' : ' + this.autoIncrimentValue
            }
          ];
          this.groupInfo = {
            groupname: '',
            groupDescription: ''
          };
          this.loadingDeviceGroup = true;
        } else {
          this._toastLoad.toast('error', 'Error', 'Error while loading', true);
        }
      });
    }
  }
  getDeviceModelData(deviceGroup) {
    this.autoIncrimentValue = 1;
    this.step_number = 1;
    this.getDeviceGroup(deviceGroup);
  }
  addDeviceGroup() {
    this.getLabels();
    this.getDeviceGroupMenus();
    this.step_number = 1;
    this.autoIncrimentValue = 1;
    this.getDeviceGroup({ device_group_id: '' });
  }
  addGroupInfo(groupInfo) {
    this.nodeStoredData.name = '';
    this.nodeStoredData.description = '';
    const temp = groupInfo['groupname'];
    if (temp === temp.trim()) {
      this.groupInfo = groupInfo;
      this.step_number = 2;
    } else {
      this._toastLoad.toast('info', 'Information', 'Enter Valid name', true);
    }
  }
  /**
   * Update node Data on click of Config Button
   */
  configNode(formData) {
    if (Object.keys(formData).length === 0) {
      this._toastLoad.toast('error', 'Error', 'Enter Name', true);
    } else if (formData.name === '' || formData.name === undefined) {
      this._toastLoad.toast('error', 'Error', 'Enter Name', true);
    } else {
      this.activeNode.node.data['data'] = formData;
      this.activeNode.node.data.name = formData.name;
      this.activeNode.node.data.description = formData.description;
      this.close.nativeElement.click();
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
      name: 'New-sub-group' + ' : ' + this.autoIncrimentValue
    };
    node.parent.data.children.push(addnodeobject);
    this.tree.treeModel.update();
    this.visible = false;
  }
  onExpand() {
    this.visible = false;
  }
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
  // Site structure functions
  /**
   *
   * @param value On changing of Element Type
   */
  typeOfElementChanged(value) {
    if (value !== undefined) {
      if (this.activeNode.node.data.data) {
        if (this.activeNode.node.data.data.name != '') {
          this.nodeStoredData = this.activeNode.node.data.data;
        } else {
          this.nodeStoredData = {
            name: this.activeNode.node.data.name,
            description: this.activeNode.node.data.description
          };
        }
      } else if (this.activeNode.node.data.name) {
        this.nodeStoredData = {
          name: this.activeNode.node.data.name,
          description: this.activeNode.node.data.description
        };
      } else {
        // this.DFMinput['bodyContent'] = {};
      }
    }
  }
  /**
   * On Clicking of Node gets Active
   * @param event Node Active event
   */
  onActivenode(event) {
    this.visible = true;
    this.activeNode = event;
    if (this.activeNode.node.data.data) {
      if (this.activeNode.node.data.data.name != '') {
        this.typeOfElementChanged(this.activeNode.node.data.data);
      } else {
        this.typeOfElementChanged(this.activeNode.node.data);
      }
    } else if (this.activeNode.node.data.name) {
      this.typeOfElementChanged(this.activeNode.node.data);
    } else {
      this.nodeStoredData = {};
    }
  }
  /**
   * Wizard Settings
   */
  getstepnumber(event) {
    this.step_number = event.stepnumber;
  }
  previousStep() {
    this.step_number = this.step_number - 1;
  }
  cancel() {
    this.nodeStoredData = {
      name: '',
      description: ''
    };
    this.onCancel();
  }
  /**
   * Save the structure of the Device Config
   */
  saveDeviceGroup(groupInfo) {
    this.nodeStoredData.name = '';
    this.nodeStoredData.description = '';
    const temp = groupInfo['groupname'];
    if (temp === temp.trim() && temp != '') {
      this.groupInfo = groupInfo;
      this.disableBtn = true;
      this.saving_devicegroup = false;
      let DataToSend;
      if (this.depMode === 'EL') {
        DataToSend = {
          device_group_info: this.groupInfo,
          device_group_structure: this.nodesData,
          device_group_id: this.device_group_id,
          site_id: this.currentSiteID,
          client_id: this.client_id,
          default: this.default
        };
      } else {
        DataToSend = {
          device_group_info: this.groupInfo,
          device_group_structure: this.nodesData,
          device_group_id: this.device_group_id,
          // site_id: this.currentSiteID,
          client_id: this.client_id,
          default: this.default
        };
      }
      this.appservice.updateDeviceGroup(DataToSend).subscribe((data) => {
        if (data.status === 'success') {
          this.saving_devicegroup = true;
          // this.nodesData = data;
          this._toastLoad.toast(
            'success',
            'Success',
            'Saved Successfully',
            true
          );
          this.getDeviceGroupMenus();
          this.getLabels();
        } else {
          this.saving_devicegroup = true;
          this._toastLoad.toast('error', 'Error', 'Error while saving', true);
        }
        this.disableBtn = false;
      });
    } else {
      this._toastLoad.toast('error', 'Error', 'Enter Name', true);
    }
  }
}
