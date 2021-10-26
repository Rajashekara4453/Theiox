import { Component, OnInit, ViewChild } from '@angular/core';
import { AppService } from '../../../../services/app.service';
import { TREE_ACTIONS, TreeComponent } from 'angular-tree-component';
import { NgForm } from '@angular/forms';
import { ToastrService } from '../../../../components/toastr/toastr.service';
import { AuthGuard } from '../../../auth/auth.guard';
import { Router } from '@angular/router';
import { globals } from '../../../../utilities/globals';

@Component({
  selector: 'kl-tag-group',
  templateUrl: './tag-group.component.html',
  styleUrls: ['./tag-group.component.scss']
})
export class TagGroupComponent implements OnInit {
  @ViewChild('tag_group_form') public taggroup_form: NgForm;

  public saving_taggroup: Boolean = true;
  public pageLoaded: Boolean = false;
  public sideMenus: any = {};
  public loadingTagGroup: Boolean = false;
  isUpdate: String = 'Save';
  accessLevel: any;
  disableBtn = false;
  allowAccess = true;
  currentSiteID: any;
  default: Boolean;
  client_id: any;
  public groupInfo: any = {
    groupname: '',
    groupDescription: '',
    tagsGroup: []
  };
  title: string;
  public tag_group_id: String = '';
  public tagslist = [
    {
      id: '',
      itemName: ''
    }
  ];
  settings = {
    text: 'Select Tags',
    selectAllText: 'Select All',
    unSelectAllText: 'UnSelect All',
    classes: 'myclass custom-class',
    enableSearchFilter: true,
    enableFilterSelectAll: true,
    filterSelectAllText: 'Select the Filtered  Tags',
    filterUnSelectAllText: 'Un-select the Filtered  Tags'
  };
  depMode: any;
  // endPointUrl: any;
  dataToPost: { page_name: string; filter: any };
  DataToSend: {
    tag_group_info: any;
    tag_group_id: String;
    site_id: any;
    client_id: any;
    default: Boolean;
  };

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
    this.getTagGroupMenus();
    this.getTagsList();
    this.getLabels();
  }
  getLabels() {
    this._auth.getMenuLabel().subscribe((data) => {
      this.title = 'Create ' + data;
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
  getTagsList() {
    this.appservice.getTagsList().subscribe((data) => {
      if (data.status === 'success') {
        this.tagslist = data.data;
      }
    });
  }

  getTagGroupMenus() {
    this.isUpdate = 'Save';
    this.pageLoaded = false;
    if (this.depMode === 'EL') {
      this.dataToPost = {
        page_name: 'tag_group',
        filter: [
          {
            site_id: this.currentSiteID
          }
        ]
      };
    } else {
      this.dataToPost = {
        page_name: 'tag_group',
        filter: undefined
      };
    }
    this.appservice.getTagGroupsList(this.dataToPost).subscribe((data) => {
      if (data.status === 'success') {
        this.sideMenus['menuheading'] = 'Tag Group';
        this.sideMenus['placeholder'] = 'Search Tag Group';
        this.sideMenus['buttonlabel'] = 'Create  New Tag Group';
        this.sideMenus['data'] = data.tag_group;
        this.pageLoaded = true;
        this.getTagGroup({ tag_group_id: '' });
      } else {
        this._toastLoad.toast(
          'error',
          'Error',
          'Error while loading Tag group list',
          true
        );
      }
    });
  }

  getTagGroup(TagGroup) {
    if (TagGroup.tag_group_id !== '') {
      this.isUpdate = 'Update';
      if (this.accessLevel.edit) {
        this.accessLevel.create = true;
      } else {
        this.accessLevel.create = false;
      }
      this.title = 'Edit ' + TagGroup['name'];
    } else {
      this.allowAccessComponent('');
    }
    // this.title = (TagGroup['tag_group_id'] !== '') ? ('Edit ' + TagGroup['name']) : 'Create  Tag Group';
    this.loadingTagGroup = false;
    this.tag_group_id = TagGroup['tag_group_id'];
    if (TagGroup['tag_group_id'] !== '') {
      this.appservice.loadTagGroup(TagGroup).subscribe((data) => {
        if (data.status === 'success') {
          this.groupInfo.groupname = data.data['tag_group_info'].groupname;
          this.groupInfo.groupDescription =
            data.data['tag_group_info'].groupDescription;
          this.groupInfo.tagsGroup = data.data['tag_group_info'].tagsGroup;
          this.loadingTagGroup = true;
        } else {
          this._toastLoad.toast(
            'error',
            'Error',
            'Error while loading Tag group',
            true
          );
        }
      });
    } else {
      this.appservice.loadTagGroup(TagGroup).subscribe((data) => {
        if (data.status === 'success') {
          // this.nodesData = data['Tag_group'];
          this.groupInfo = {
            groupname: '',
            groupDescription: ''
          };
          this.loadingTagGroup = true;
        } else {
          this._toastLoad.toast(
            'error',
            'Error',
            'Error while loading Tag group',
            true
          );
        }
      });
    }
  }
  saveTagGroup() {
    this.disableBtn = true;
    const temp = this.groupInfo['groupname'];
    if (temp === temp.trim() && this.taggroup_form.valid === true) {
      this.saving_taggroup = false;
      let DataToSend;
      if (this.depMode === 'EL') {
        DataToSend = {
          tag_group_info: this.groupInfo,
          tag_group_id: this.tag_group_id,
          site_id: this.currentSiteID,
          client_id: this.client_id,
          default: this.default
        };
      } else {
        DataToSend = {
          tag_group_info: this.groupInfo,
          tag_group_id: this.tag_group_id,
          // site_id: this.currentSiteID,
          client_id: this.client_id,
          default: this.default
        };
      }

      this.appservice.updateTagGroup(DataToSend).subscribe((data) => {
        if (data.status === 'success') {
          this.isUpdate = 'Save';
          this.saving_taggroup = true;
          this._toastLoad.toast('success', 'Success', data.message, true);
          this.taggroup_form.reset();
          this.getTagGroupMenus();
          this.getLabels();
        } else {
          this._toastLoad.toast(
            'error',
            'Error',
            'Error while Saving Tag group',
            true
          );
          this.saving_taggroup = true;
        }
        this.disableBtn = false;
      });
    } else {
      this._toastLoad.toast('info', 'Information', 'Enter valid name', true);
    }
  }
  addTagGroup() {
    this.getLabels();
    this.getTagGroupMenus();
    this.getTagGroup({ tag_group_id: '' });
    this.isUpdate = 'Save';
  }
  reset_form() {
    this.addTagGroup();
  }

  onDeSelectAllTags() {
    this.groupInfo.tagsGroup = [];
  }
}
