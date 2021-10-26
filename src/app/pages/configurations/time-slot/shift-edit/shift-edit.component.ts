import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { AppService } from '../../../../services/app.service';
import {
  TreeComponent,
  TreeModel,
  TreeNode,
  TREE_ACTIONS,
  KEYS,
  IActionMapping,
  ITreeOptions
} from 'angular-tree-component';
import { Router, ActivatedRoute } from '@angular/router';
import { DatePipe } from '@angular/common';
import { ToastrService } from '../../../../components/toastr/toastr.service';
import { FormBuilder, Validators, FormGroup } from '@angular/forms';
import { AuthGuard } from '../../../auth/auth.guard';
import { globals } from '../../../../utilities/globals';

@Component({
  selector: 'kl-shift-edit',
  templateUrl: './shift-edit.component.html',
  styleUrls: ['./shift-edit.component.scss']
})
export class ShiftEditComponent implements OnInit {
  @Output() changeViewEmitter: EventEmitter<any> = new EventEmitter<any>();
  @Input() editID: any;
  @Input() accessLevel: any = {};
  shiftLists: Array<any> = new Array();
  timeSlotName: any;
  nodes = [];
  options = {};
  currentDate: any;
  currentTime: any;
  shiftHeaderCol = ['StartDate', 'EndDate', 'StartTime', 'EndTime'];
  startDate: Date;
  ShiftName: any;
  Description = '';
  datetime1: Date;
  datetime2: Date;
  newOrUpdate: boolean;
  newtimeSlot: any;
  settings: {
    bigBanner: boolean;
    timePicker: boolean;
    format: string;
    defaultOpen: boolean;
  };
  timeSlotJSON: any;
  flgTreeChecked = true;
  timeSlotList: any;
  timeSlotGroupItem: any = null;
  selectedId = [];
  parentId: any;
  hierarchy: any = [];
  selectedNodesTree: any = [];
  sitesHeirarchy: any = [];
  originalTree: any = [];
  disableBtn = false;
  disableSaveBtn = false;
  // accessLevel: any;
  currentSiteID: any;
  default: Boolean;
  client_id: any;
  endPointUrl: any;
  depMode: any;
  nextDay: any;
  nextDayValue: any;
  isPermission: any;
  actionMapping: IActionMapping = {
    mouse: {
      click: (tree, node, e: Event) => this.check(node, !node.data.checked, e)
    }
  };
  constructor(
    private appservice: AppService,
    private router: Router,
    private _toastLoad: ToastrService,
    public _auth: AuthGuard,
    private _globals: globals
  ) {}

  ngOnInit() {
    this.currentSiteID = this._globals.getCurrentUserSiteId();
    this.default = this._globals.isSystemAdminLoggedIn();
    this.client_id = this._globals.getCurrentUserClientId();
    this.depMode = this._globals.deploymentMode;
    this.endPointUrl = this._globals.deploymentModeAPI;
    // this.allowAccessComponent('');
    this.getShiftId();
    this.getTree();

    this.settings = {
      bigBanner: false,
      timePicker: false,
      format: 'dd-MM-yyyy',
      defaultOpen: false
    };
    this.currentTime = new Date().toISOString().split('T')[1];
    this.currentDate = new Date().toISOString().split('T')[0];
    this.options = {
      actionMapping: this.actionMapping,
      allowDrag: true,
      allowDrop: true
    };
    this.getSelectTimeSlot();
    this.getTimeSlotGroup();
    this.getNextDayValues();
  }
  // allowAccessComponent(acess: String) {
  //   const val = this._auth.allowAccessComponent('masterConfiguration', '');
  //   this.accessLevel = val;
  //   if (!this.accessLevel.view) {
  //     this.router.navigate(['/un-authorized']);
  //     return false;
  //   }
  //   // return val;
  // }

  onInitialized(tree: any) {
    setTimeout(() => {
      tree.treeModel.expandAll();
    });
  }
  getTimeSlotGroup() {
    //for site id
    // const dataToSend = {
    //   filter: [{
    //     site_id: this.currentSiteID,
    //   }],
    // };
    let dataToSend;
    if (this.depMode === 'EL') {
      dataToSend = {
        filter: [
          {
            site_id: this.currentSiteID
          }
        ]
      };
    } else {
      dataToSend = {};
    }
    this.appservice
      .getTimeSlotGrp(this.endPointUrl.TIME_SLOT_GROUP_GET, dataToSend)
      .subscribe((data) => {
        this.timeSlotList = data.data;
      });
  }
  getNextDayValues() {
    const json = [
      {
        id: 1,
        value: 'Yes'
      },
      {
        id: 2,
        value: 'No'
      }
    ];
    // data.push(json)
    this.nextDay = json;
  }
  getShiftId() {
    // this.route.params.subscribe((data) => {
    //   this.ShiftName = data['id'];
    // });
    this.ShiftName = this.editID;
  }
  getTree() {
    // const dataToSend = {
    //   filter: [{
    //     site_id: this.currentSiteID,
    //   }],
    // };
    let dataToSend;
    if (this.depMode === 'EL') {
      dataToSend = {
        filter: [
          {
            site_id: this.currentSiteID
          }
        ]
      };
    } else {
      dataToSend = {};
    }
    this.appservice
      .getFullTree(this.endPointUrl.FULLTREE_GET, dataToSend)
      .subscribe((data) => {
        this.nodes = data.tree;
        this.sitesHeirarchy = data.tree;
        this.originalTree = data.tree;
      });
  }
  getSelectTimeSlot() {
    if (this.ShiftName === '') {
      this.startDate = this.currentDate;
      this.newOrUpdate = true;
      if (this.accessLevel.create) {
        this.isPermission = true;
      } else {
        this.isPermission = false;
      }
    } else {
      this.newOrUpdate = false;
      if (this.accessLevel.edit) {
        this.isPermission = true;
      } else {
        this.isPermission = false;
      }
      this.appservice.getTimeSlot(this.ShiftName).subscribe((data) => {
        if (data.data.length > 0) {
          data.data[0].EndDate = this.currentDate;
          this.timeSlotName = data.TimeSlotName;
          this.Description = data.Description;
          this.timeSlotGroupItem = data.timeSlotGroupId;
        }
        this.shiftLists = data.data;
        this.startDate = this.currentDate;
        this.sitesHeirarchy = this.buildUserTree(
          this.sitesHeirarchy,
          data.data[0].SelectedNodes
        );
        this.nodes = this.sitesHeirarchy;
      });
    }
  }

  saveTimeSlot() {
    this.disableSaveBtn = true;
    try {
      if (this.datetime1 == null) {
        this._toastLoad.toast(
          'warning',
          'Warning',
          'Start Time Is Mandatory',
          true
        );
        this.getSelectTimeSlot();
        this.disableSaveBtn = false;
        //  return;
      } else if (this.datetime2 == null) {
        this._toastLoad.toast(
          'warning',
          'Warning',
          'End Time Is Mandatory',
          true
        );
        this.getSelectTimeSlot();
        this.disableSaveBtn = false;
        //return;
      }
      const start_date = new Date(this.startDate);
      const startMinutes =
        this.datetime1.getMinutes() < 10
          ? '0' + this.datetime1.getMinutes()
          : this.datetime1.getMinutes();
      const endMinutes =
        this.datetime2.getMinutes() < 10
          ? '0' + this.datetime2.getMinutes()
          : this.datetime2.getMinutes();

      if (this.depMode === 'EL') {
        this.newtimeSlot = {
          TimeSlotName: this.timeSlotName,
          Description: this.Description,
          StartDate: start_date.toISOString().split('T')[0],
          EndDate: start_date.toISOString().split('T')[0],
          StartTime: this.datetime1.getHours() + ':' + startMinutes,
          EndTime: this.datetime2.getHours() + ':' + endMinutes,
          timeSlotGroupId: this.timeSlotGroupItem,
          site_id: this.currentSiteID,
          client_id: this.client_id,
          default: this.default,
          day: this.nextDayValue === 1 ? 'next' : 'false'
        };
      } else {
        this.newtimeSlot = {
          TimeSlotName: this.timeSlotName,
          Description: this.Description,
          StartDate: start_date.toISOString().split('T')[0],
          EndDate: start_date.toISOString().split('T')[0],
          StartTime: this.datetime1.getHours() + ':' + startMinutes,
          EndTime: this.datetime2.getHours() + ':' + endMinutes,
          timeSlotGroupId: this.timeSlotGroupItem,
          // site_id: this.currentSiteID,
          client_id: this.client_id,
          default: this.default,
          day: this.nextDayValue === 1 ? 'next' : 'false'
        };
      }
      // this.newtimeSlot = {
      //   TimeSlotName: this.timeSlotName,
      //   Description: this.Description,
      //   StartDate: start_date.toISOString().split('T')[0],
      //   EndDate: start_date.toISOString().split('T')[0],
      //   StartTime: this.datetime1.getHours() + ':' + startMinutes,
      //   EndTime: this.datetime2.getHours() + ':' + endMinutes,
      //   timeSlotGroupId: this.timeSlotGroupItem,
      //   site_id: this.currentSiteID,
      //   client_id: this.client_id,
      //   default: this.default,
      // }
      this.extractUserTreeNodes(this.selectedNodesTree);

      if (this.timeSlotName == '' || this.timeSlotName == null) {
        this._toastLoad.toast(
          'warning',
          'Warning',
          'Time Slot Name Is Mandatory',
          true
        );
        this.getSelectTimeSlot();
        this.disableSaveBtn = false;
      } else if (
        this.timeSlotGroupItem == '' ||
        this.timeSlotGroupItem == null
      ) {
        this._toastLoad.toast(
          'warning',
          'Warning',
          'Time Slot Group Is Mandatory',
          true
        );
        this.getSelectTimeSlot();
        this.disableSaveBtn = false;
      } else if (this.startDate == null) {
        this._toastLoad.toast(
          'warning',
          'Warning',
          'Start Date is Mandatory',
          true
        );
        this.getSelectTimeSlot();
        this.disableSaveBtn = false;
      } else if (this.flgTreeChecked) {
        this._toastLoad.toast(
          'warning',
          'warning',
          'Please Select Hierarchy',
          true
        );
        this.getSelectTimeSlot();
        this.disableSaveBtn = false;
      } else {
        this.timeSlotJSON = {
          timeSlotList: this.newtimeSlot,
          SelectedNodes: this.selectedId
        };

        // for site id
        // const json = {
        //   site_id: this.currentSiteID,
        // };

        // this.timeSlotJSON = Object.assign(this.timeSlotJSON, json);

        this.appservice.saveTimeSlot(this.timeSlotJSON).subscribe((data) => {
          if (data.status === 'success') {
            this.disableSaveBtn = false;
            this._toastLoad.toast('success', 'Success', data.message, true);
            this.changeViewEmitter.emit('parentComponent');
          } else {
            this.disableSaveBtn = false;
            this._toastLoad.toast('error', 'Error', data.message, true);
          }
          this.disableSaveBtn = false;
        });
      }
    } catch (error) {}
  }
  cancelTimeSlot() {
    this.changeViewEmitter.emit('parentComponent');
  }

  updateTimeSlot(tree: any) {
    this.disableBtn = true;
    try {
      if (this.datetime1 == null) {
        this._toastLoad.toast(
          'warning',
          'Warning',
          'Start Time Is Mandatory',
          true
        );
        this.getSelectTimeSlot();
        this.disableBtn = false;
        // return;
      } else if (this.datetime2 == null) {
        this._toastLoad.toast(
          'warning',
          'Warning',
          'End Time Is Mandatory',
          true
        );
        // return;
        this.getSelectTimeSlot();
        this.disableBtn = false;
      }
      const start_date = new Date(this.startDate);
      const startMinutes =
        this.datetime1.getMinutes() < 10
          ? '0' + this.datetime1.getMinutes()
          : this.datetime1.getMinutes();
      const endMinutes =
        this.datetime2.getMinutes() < 10
          ? '0' + this.datetime2.getMinutes()
          : this.datetime2.getMinutes();

      if (this.depMode === 'EL') {
        this.newtimeSlot = {
          TimeSlotName: this.timeSlotName,
          Description: this.Description,
          StartDate: start_date.toISOString().split('T')[0],
          EndDate: start_date.toISOString().split('T')[0],
          StartTime: this.datetime1.getHours() + ':' + startMinutes,
          EndTime: this.datetime2.getHours() + ':' + endMinutes,
          timeSlotGroupId: this.timeSlotGroupItem,
          site_id: this.currentSiteID,
          client_id: this.client_id,
          default: this.default,
          day: this.nextDayValue === 1 ? 'next' : 'false'
        };
      } else {
        this.newtimeSlot = {
          TimeSlotName: this.timeSlotName,
          Description: this.Description,
          StartDate: start_date.toISOString().split('T')[0],
          EndDate: start_date.toISOString().split('T')[0],
          StartTime: this.datetime1.getHours() + ':' + startMinutes,
          EndTime: this.datetime2.getHours() + ':' + endMinutes,
          timeSlotGroupId: this.timeSlotGroupItem,
          // site_id: this.currentSiteID,
          client_id: this.client_id,
          default: this.default,
          day: this.nextDayValue === 1 ? 'next' : 'false'
        };
      }
      // this.newtimeSlot = {
      //   TimeSlotName: this.timeSlotName,
      //   Description: this.Description,
      //   StartDate: start_date.toISOString().split('T')[0],
      //   EndDate: start_date.toISOString().split('T')[0],
      //   StartTime: this.datetime1.getHours() + ':' + startMinutes,
      //   EndTime: this.datetime2.getHours() + ':' + endMinutes,
      //   timeSlotGroupId: this.timeSlotGroupItem,
      //   site_id: this.currentSiteID,
      //   client_id: this.client_id,
      //   default: this.default,
      // }
      this.extractUserTreeNodes(this.selectedNodesTree);
      if (this.timeSlotName == '' || this.timeSlotName == null) {
        this._toastLoad.toast(
          'warning',
          'Warning',
          'Time Slot Name Is Mandatory',
          true
        );
        this.getSelectTimeSlot();
        this.disableBtn = false;
      } else if (
        this.timeSlotGroupItem == '' ||
        this.timeSlotGroupItem == null
      ) {
        this._toastLoad.toast(
          'warning',
          'Warning',
          'Time Slot Group Is Mandatory',
          true
        );
        this.getSelectTimeSlot();
        this.disableBtn = false;
      } else if (this.startDate == null) {
        this._toastLoad.toast(
          'warning',
          'Warning',
          'Start Date is Mandatory',
          true
        );
        this.getSelectTimeSlot();
        this.disableBtn = false;
      } else if (this.flgTreeChecked) {
        this._toastLoad.toast(
          'error',
          'Error',
          'Please Select Hierarchy',
          true
        );
        this.getSelectTimeSlot();
        this.disableBtn = false;
      } else {
        this.timeSlotJSON = {
          timeslot_id: this.ShiftName,
          timeSlotList: this.newtimeSlot,
          SelectedNodes: this.selectedId
        };
        //for site id
        // const json = {
        //   site_id: this.currentSiteID,
        // };
        // this.timeSlotJSON = Object.assign(this.timeSlotJSON, json);
        this.appservice.saveTimeSlot(this.timeSlotJSON).subscribe((data) => {
          if (data.status === 'success') {
            this.disableBtn = false;
            this.router.navigate(['configurations/shiftmanagement']);
            this._toastLoad.toast('success', 'Success', data.message, true);
          } else {
            this._toastLoad.toast('error', 'Error', data.message, true);
            this.disableBtn = false;
          }
          this.disableBtn = false;
        });
      }
    } catch (error) {}
  }

  public check(node, checked, e) {
    try {
      e.stopPropagation();
      if (node.realParent == null) {
        this.updateParentNodeCheckbox(node);
      } else {
        this.updateParentNodeCheckbox(node.realParent);
      }
      this.updateChildNodeCheckbox(node, checked);
      this.selectedNodesTree = node.treeModel.nodes;
    } catch (error) {}
  }

  public updateChildNodeCheckbox(node, checked) {
    node.data.checked = checked;
    if (node.children) {
      node.children.forEach((child) =>
        this.updateChildNodeCheckbox(child, checked)
      );
    }
  }

  public updateParentNodeCheckbox(node) {
    try {
      if (!node) {
        return;
      }
      let allChildrenChecked = true;
      let noChildChecked = true;
      for (const child of node.children) {
        if (!child.data.checked || child.data.indeterminate) {
          this.flgTreeChecked = false;
          allChildrenChecked = false;
        }
        if (child.data.checked) {
          noChildChecked = false;
        }
      }
      if (allChildrenChecked) {
        this.flgTreeChecked = true;
        node.data.checked = true;
        node.data.indeterminate = false;
      } else if (noChildChecked) {
        node.data.checked = false;
        node.data.indeterminate = false;
      } else {
        node.data.checked = false;
        node.data.indeterminate = false;
      }
      this.updateParentNodeCheckbox(node.parent);
    } catch (error) {}
  }

  //Edit Shift
  checkNodesofATree(node, selectedNodes) {
    for (let ind = 0; ind < node.length; ind++) {
      for (let jind = 0; jind < selectedNodes.length; jind++) {
        if (
          selectedNodes[jind] &&
          node[ind].node_id === selectedNodes[jind].node_id
        ) {
          node[ind].isChecked = true;
        }
      }
      if (node[ind].children) {
        this.checkNodesofATree(node[ind].children, selectedNodes);
      }
    }
  }

  buildUserTree(originalTree: any, userTree: any) {
    try {
      userTree.forEach((nodeObject) => {
        for (let i = 0; i < originalTree.length; i++) {
          const treeRootNode = originalTree[i];
          if (nodeObject.parent_id == treeRootNode.node_id) {
            const nodeFound = this.updateNodeInformation(
              nodeObject.node_id,
              treeRootNode,
              'node_id'
            );
            if (nodeFound == '') {
              this.sitesHeirarchy = this.originalTree;
            }
          }
        }
      });
      return this.sitesHeirarchy;
    } catch (error) {}
  }

  updateNodeInformation(
    valueTobeSearched: any,
    currentNode: any,
    InkeyToFind: any
  ) {
    if (valueTobeSearched == currentNode[InkeyToFind]) {
      currentNode['checked'] = true;
    } else {
      for (const index in currentNode.children) {
        const node = currentNode.children[index];
        this.updateNodeInformation(valueTobeSearched, node, InkeyToFind);
      }
      return '';
    }
  }

  extractUserTreeNodes(allTreeNodes) {
    this.selectedId = [];
    allTreeNodes.forEach((eachTreeNode) => {
      this.parentId = eachTreeNode.node_id;
      this.getSelectedNodes(eachTreeNode, 'checked');
    });
  }

  getSelectedNodes(currentNode, InkeyToFind: any) {
    try {
      if (currentNode[InkeyToFind] == true) {
        this.selectedId.push({
          node_id: currentNode.node_id,
          parent_id: this.parentId
        });
        for (const index in currentNode.children) {
          const node = currentNode.children[index];
          this.getSelectedNodes(node, InkeyToFind);
        }
      } else {
        for (const index in currentNode.children) {
          const node = currentNode.children[index];
          this.getSelectedNodes(node, InkeyToFind);
        }
      }
      this.hierarchy = this.selectedId;
    } catch (error) {}
  }
}
