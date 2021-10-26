import { Component, OnInit } from '@angular/core';
import { AppService } from '../../../services/app.service';
import { ToastrService } from '../../../components/toastr/toastr.service';
import { FormGroup, FormBuilder, NgForm } from '@angular/forms';
import { AuthGuard } from '../../auth/auth.guard';
import { Router } from '@angular/router';
import { globals } from '../../../utilities/globals';

@Component({
  selector: 'kl-batch-entry',
  templateUrl: './batch-entry.component.html',
  styleUrls: ['./batch-entry.component.scss']
})
export class BatchEntryComponent implements OnInit {
  batchEntry: any = {};
  batchList: any = [];
  selectedBatchEntry: any = [];
  batch_id: string = '';
  batchName: string = '';
  batchDescription: string = '';
  action: string = '';
  tagGroupList: Array<any> = [];
  tagList: Array<any> = [];
  tagGroup: string = '';
  selectedTagGroup: any = [];
  public sideMenus: any = {};
  public displayProperty: any = {};
  tagGroupDropdownSettings: any = [];
  tag_group_id: string = '';
  tagsInTagGroup: any[];
  showTagsInTagGroup: boolean = false;
  showDeleteButton: boolean = false;
  batchEntryTagValuesForm: FormGroup;
  tagValue: string = '';
  id: string = '';
  tagsReady: boolean = false;
  formName: NgForm;
  encapsulatedTagValueArray: any = [];
  encapsulatedTagValue: any = {};
  tagValueArray: any = [];
  batchTagValueArray: any = [];
  selectedBatch: any = {};
  tagValuesForTagGroup: any[];
  isUpdate: boolean = false;
  accessLevel: any;
  disableBtn = false;
  currentSiteID: any;
  default: Boolean;
  client_id: any;
  depMode: any;
  endPointUrl: any;
  dataToSend: {};
  title: String;
  public isPageLoad = false;
  deleteBatch: any;
  constructor(
    private _appService: AppService,
    private _toastLoad: ToastrService,
    public _auth: AuthGuard,
    private _router: Router,
    private _globals: globals
  ) {}

  ngOnInit() {
    this.currentSiteID = this._globals.getCurrentUserSiteId();
    this.default = this._globals.isSystemAdminLoggedIn();
    this.client_id = this._globals.getCurrentUserClientId();
    this.depMode = this._globals.deploymentMode;
    this.endPointUrl = this._globals.deploymentModeAPI;
    this.allowAccessComponent('');
    this.getTagGroupsOrBatchDetails();
    this.getBatchEntry('');
    // this.title = "Create Batch Entry"

    // this.tagGroupDropdownSettings = {
    //   singleSelection: true,
    //   idField: 'tag_group_id',
    //   textField: 'tag_group_name',
    //   allowSearchFilter: true,
    //   maxHeight: 200,
    //   searchPlaceholderText: 'Search Tag Group',
    //   noDataAvailablePlaceholderText: 'No Tag Groups Added',
    //   closeDropDownOnSelection: true,
    // };

    //raj edited
    this.tagGroupDropdownSettings = {
      singleSelection: true,
      text: 'Select Tag Group',
      selectAllText: 'Select All',
      unSelectAllText: 'UnSelect All',
      enableSearchFilter: true,
      classes: 'myclass custom-class',
      labelKey: 'tag_group_name',
      primaryKey: 'tag_group_id',
      enableFilterSelectAll: true,
      filterSelectAllText: 'Select the Filtered  Tag Group',
      filterUnSelectAllText: 'Un-select the Filtered  Tag Group'
    };
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
    // this.accessLevel.edit = false;
    // return val;
  }

  addNewBatchForm(form: NgForm) {
    // this.title = "Create Batch Entry"
    this.getLabels();
    this.isUpdate = false;
    form.reset();
    this.encapsulatedTagValueArray = [];
    this.showTagsInTagGroup = false;
    this.showDeleteButton = false;
    this.allowAccessComponent('');
    this.getBatchEntry('');
  }

  // ** If, dataToSend == {batch_id}*/
  // ** Fetch BatchDetails, all TagGroups, all Tags corresponding to TagGroupID
  // in BatchDetails */
  // ** else, dataToSend == {} */
  // ** Fetch only TagGroups */
  getTagGroupsOrBatchDetails(dataToSend?: any) {
    if (dataToSend) {
      this._appService
        .getTagGroupsOrBatchDetails(dataToSend)
        .subscribe((data) => {
          this.showTagsInTagGroup = true;

          this.tagGroupList = data.tag_groups;

          this.tagList = data.tags;

          this.selectedBatch = data.data;
          this.batchEntry.batch_id = this.selectedBatch[0].batch_id;
          this.batchEntry.batchName = this.selectedBatch[0].batchName;
          this.batchEntry.batchDescription = this.selectedBatch[0].batchDescription;
          this.tag_group_id = this.selectedBatch[0].tag_group_id;
          for (let i = 0; i < this.tagGroupList.length; i++) {
            if (this.tag_group_id == this.tagGroupList[i].tag_group_id) {
              this.selectedTagGroup = [
                {
                  tag_group_id: this.tagGroupList[i].tag_group_id,
                  tag_group_name: this.tagGroupList[i].tag_group_name
                }
              ];
            }
          }
          this.encapsulatedTagValueArray = this.selectedBatch[0].tagValuesForTagGroup;
        });
    } else {
      const dataToSend = {};
      this._appService
        .getTagGroupsOrBatchDetails(dataToSend)
        .subscribe((data) => {
          this.tagGroupList = data.tag_groups;
        });
    }
  }

  ontagGroupSelect(event: any) {
    this.selectedTagGroup = event;
    this.tag_group_id = event.tag_group_id;
    this.tagGroup = event.tag_group_name;
    this.selectedTagGroup = [
      {
        tag_group_id: this.tag_group_id,
        tag_group_name: this.tagGroup
      }
    ];
    this.getTagsBasedOnTagGroupId(this.tag_group_id, 'select');
  }

  getTagsBasedOnTagGroupId(tagGroupId: string, action: string) {
    const dataToSend = {
      tag_group_id: tagGroupId
    };
    this._appService
      .getTagsForBatchEntry(dataToSend)
      .subscribe((tagsInTagGroupDB) => {
        this.tagsInTagGroup = tagsInTagGroupDB.data;
        this.encapsulatedTagValueArray = [];
        this.encapsulatedTagValueArray = this.tagsInTagGroup;
        this.showTagsInTagGroup = true;
      });
  }

  getBatchEntry(batch_id: any) {
    this.isPageLoad = false;
    if (this.batch_id == '') {
      // const dataToSend = {};
      //for site id
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

      this._appService.getBatchEntry(dataToSend).subscribe((batchList) => {
        if (batchList.status === 'success') {
          this.batchList = batchList.data;
          this.getBatchEntryMenuBar();
        } else {
          this._toastLoad.toast('error', 'Error', batchList.message, true);
        }
      });
    } else {
      const dataToSend = {
        batch_id: batch_id
      };
      this._appService
        .getBatchEntry(dataToSend)
        .subscribe((selectedBatchEntry) => {
          // this.isPageLoad = false;
          if (selectedBatchEntry.status === 'success') {
            this.selectedBatchEntry = selectedBatchEntry.data;
            this.getBatchEntryMenuBar();
          } else {
            this._toastLoad.toast(
              'error',
              'Error',
              selectedBatchEntry.message,
              true
            );
          }
        });
    }
  }

  getBatchEntryMenuBar() {
    this.sideMenus['menuheading'] = 'Batch Entry';
    this.sideMenus['placeholder'] = 'Search Batch';
    this.sideMenus['buttonlabel'] = 'Create  New Batch';
    this.sideMenus['data'] = this.batchList;
    this.isPageLoad = true;
  }

  addBatchEntry(form: NgForm) {
    this.disableBtn = true;
    this.formName = form;
    this.batch_id =
      typeof this.batchEntry.batch_id === 'undefined'
        ? ''
        : this.batchEntry.batch_id;
    this.batchName = this.batchEntry.batchName;
    this.batchDescription = this.batchEntry.batchDescription;
    this.tagsInTagGroup = this.encapsulatedTagValueArray;

    for (let i = 0; i < this.tagsInTagGroup.length; i++) {
      if (new String(this.tagsInTagGroup[i].tagValue) != '') {
        delete this.tagsInTagGroup[i].tag_name;
        this.tagValueArray.push(this.tagsInTagGroup[i]);
      } else if (new String(this.tagsInTagGroup[i].tagValue) == '') {
        this.tagsInTagGroup.splice(i, 1);
        i--;
      } else {
        this.tagValueArray = this.tagsInTagGroup;
      }
    }
    this.saveBatchEntry(this.formName);
  }

  editBatch(event: any) {
    this.title = 'Edit ' + event.batchName;
    this.deleteBatch = event.batchName;
    if (this.accessLevel.edit) {
      this.accessLevel.create = true;
    } else {
      this.accessLevel.create = false;
    }
    this.isUpdate = true;
    const dataToSend = {
      batch_id: event.batch_id
    };
    this.getTagGroupsOrBatchDetails(dataToSend);
    this.showDeleteButton = true;
  }

  saveBatchEntry(form: NgForm) {
    this.formName = form;
    if (this.batch_id == '' || this.batch_id == undefined) {
      let dataToSend;
      if (this.depMode === 'EL') {
        dataToSend = {
          batch_id: '',
          batchName: this.batchName,
          tag_group_id: this.tag_group_id,
          batchDescription: this.batchDescription,
          tagValuesForTagGroup: this.tagValueArray,
          site_id: this.currentSiteID,
          client_id: this.client_id,
          default: this.default
        };
      } else {
        dataToSend = {
          batch_id: '',
          batchName: this.batchName,
          tag_group_id: this.tag_group_id,
          batchDescription: this.batchDescription,
          tagValuesForTagGroup: this.tagValueArray,
          // site_id: this.currentSiteID,
          client_id: this.client_id,
          default: this.default
        };
      }
      this._appService.saveBatchEntry(dataToSend).subscribe((data) => {
        if (data.status == 'success') {
          this._toastLoad.toast(
            'success',
            'Success',
            'Batch Saved Successfully',
            true
          );
          this.batch_id = '';
          // this.getBatchEntry('');
          this.tagValueArray = [];
          this.addNewBatchForm(this.formName);
          this.disableBtn = false;
        } else {
          this._toastLoad.toast(
            'error',
            'Error',
            'Error While Creating Batch',
            true
          );
        }
      });
    } else {
      const dataToSend = {
        batch_id: this.batch_id,
        batchName: this.batchName,
        tag_group_id: this.tag_group_id,
        batchDescription: this.batchDescription,
        tagValuesForTagGroup: this.tagValueArray,
        site_id: this.currentSiteID,
        client_id: this.client_id,
        default: this.default
      };
      this._appService.saveBatchEntry(dataToSend).subscribe((data) => {
        if (data.status == 'success') {
          this._toastLoad.toast(
            'success',
            'Success',
            'Batch Updated Successfully',
            true
          );
          this.batch_id = '';
          // this.getBatchEntry('');
          this.tagValueArray = [];
          this.addNewBatchForm(this.formName);
          this.showDeleteButton = false;
        } else {
          this._toastLoad.toast(
            'error',
            'Error',
            'Error While Updating Batch',
            true
          );
        }
        this.disableBtn = false;
      });
    }
  }

  deleteBatchEntry(batch_id: string, form: NgForm) {
    this.formName = form;
    const dataToSend = {
      batch_id: batch_id
    };
    this._appService.deleteBatchEntry(dataToSend).subscribe((data) => {
      if (data.status == 'success') {
        this._toastLoad.toast(
          'success',
          'Success',
          'Batch Deleted Successfully',
          true
        );
        this.batch_id = '';
        // this.getBatchEntry('');

        this.addNewBatchForm(this.formName);
      } else {
        this._toastLoad.toast(
          'error',
          'Error',
          'Error While Deleting Batch',
          true
        );
        this.batch_id = '';
        // this.getBatchEntry('');
      }
    });
  }
  ontagGroupDeSelect(event) {
    this.selectedTagGroup = event;
    this.encapsulatedTagValueArray = [];
    this.showTagsInTagGroup = false;
  }
  onTagGroupSingleDeSelect(event) {
    this.encapsulatedTagValueArray = [];
    this.showTagsInTagGroup = false;
  }
}
