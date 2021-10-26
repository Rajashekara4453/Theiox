import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { ToastrService } from '../../../components/toastr/toastr.service';
import { AppService } from '../../../services/app.service';
import { TreeComponent, IActionMapping } from 'angular-tree-component';
import { AuthGuard } from '../../auth/auth.guard';
import { globals } from '../../../utilities/globals';
import { NgForm } from '@angular/forms';
import { finalize } from 'rxjs/operators';

@Component({
  selector: 'kl-manual-entry',
  templateUrl: './manual-entry.component.html',
  styleUrls: ['./manual-entry.component.scss']
})
export class ManualEntryComponent implements OnInit {
  constructor(
    private appservice: AppService,
    private _toastLoad: ToastrService,
    private _http: HttpClient,
    private _auth: AuthGuard,
    private _globals: globals
  ) {}
  // Page level variables
  public editpageSettings: Boolean = true;
  public addNewConfig: Boolean = true;
  public savingConfig: Boolean = false;
  public editLoaded: Boolean = false;
  public entryPageId: String = 'new';
  public loadedData: any = {};
  public newRecordTemplete: any = {
    manual_entry_config: {
      date: '',
      dateDisp: '',
      device_selection: '',
      selected_devices: {
        device_group: [],
        devices: [],
        site: []
      },
      selected_tags: {
        tag_group: [],
        tags: []
      },
      selected_time: {
        shift: [],
        time: ''
      },
      tag_selection: '',
      time_selection: ''
    },
    manual_entry_description: '',
    manual_entry_id: '',
    manual_entry_name: ''
  };
  currentDate = new Date();
  selectedRecordData: any = {
    date: this.currentDate.toISOString().split('T')[0],
    dateDisp: this.currentDate,
    manual_entry_config: {
      date: '',
      device_selection: '',
      selected_devices: {
        device_group: [],
        devices: [],
        site: []
      },
      selected_tags: {
        tag_group: [],
        tags: []
      },
      selected_time: {
        shift: [],
        time: ''
      },
      tag_selection: '',
      time_selection: ''
    },
    manual_entry_description: '',
    manual_entry_id: '',
    manual_entry_name: ''
  };
  // Edit mode Variables: Obj
  public pageDetails: Object = {
    manual_entry_name: '',
    manual_entry_description: ''
  };
  public saveFromConfig: Object = {
    device_selection: '',
    selected_devices: {
      site: [],
      device_group: [],
      devices: []
    },
    tag_selection: '',
    selected_tags: {
      tag_group: [],
      tags: []
    },
    dateDisp: this.currentDate,
    date: this.currentDate,
    time_selection: '',
    selected_time: {
      shift: [],
      time: ''
    },
    metadata_default: []
  };

  isShowAddMetaData: boolean = false;

  // From Backend Need to get
  /**
   * 1) Shifts
   * 2) Devices metadata
   * 3) tags meta data
   * 4) site Metadata
   */
  public metaDataStorage: Object = {
    device_selection_list: [
      {
        label: 'Organisation Hierarchy',
        value: 'site'
      },
      {
        label: 'Asset Group',
        value: 'device_group'
      },
      {
        label: 'Organisation Hierarchy and Asset Group',
        value: 'site_device_group'
      },
      {
        label: 'Assets',
        value: 'devices'
      }
    ],
    tag_selection_list: [
      {
        label: 'Tag group',
        value: 'tag_group'
      },
      {
        label: 'Tags',
        value: 'tags'
      }
    ],
    time_selection_list: [
      {
        label: 'Shift',
        value: 'shift'
      },
      {
        label: 'Time',
        value: 'time'
      }
    ],
    shift: [],
    site: [],
    device_group: [],
    devices: [],
    tag_group: [],
    tags: []
  };

  batchSelected: any;
  selectedBatchList: any = [];
  sampleTagData: any;

  public SingleSelectsettings: Object = {
    text: 'Select',
    singleSelection: true,
    labelKey: 'label',
    primaryKey: 'value',
    selectAllText: 'Select All',
    unSelectAllText: 'UnSelect All',
    classes: 'myclass custom-class',
    lazyLoading: false,
    fullObject: false,
    enableSearchFilter: true,
    enableFilterSelectAll: true,
    filterSelectAllText: 'Select All filtered results'
  };
  public MultiSelectsettingsShift: Object = {
    text: 'Select',
    singleSelection: false,
    labelKey: 'label',
    primaryKey: 'value',
    selectAllText: 'Select All',
    unSelectAllText: 'UnSelect All',
    classes: 'myclass custom-class',
    lazyLoading: false,
    fullObject: false,
    enableSearchFilter: true,
    enableFilterSelectAll: true,
    filterSelectAllText: 'Select All filtered results'
  };
  public SingleSelectsettingsShift: Object = {
    text: 'Select Shift',
    singleSelection: true,
    labelKey: 'label',
    primaryKey: 'value',
    selectAllText: 'Select All',
    unSelectAllText: 'UnSelect All',
    classes: 'myclass custom-class',
    lazyLoading: false,
    fullObject: false,
    enableSearchFilter: true,
    enableFilterSelectAll: true,
    filterSelectAllText: 'Select All filtered results'
  };
  public multiSelectSettings: Object = {
    text: 'Select',
    selectAllText: 'Select All',
    unSelectAllText: 'UnSelect All',
    classes: 'myclass custom-class',
    labelKey: 'label',
    primaryKey: 'value',
    lazyLoading: false,
    fullObject: false,
    enableSearchFilter: true,
    enableFilterSelectAll: true,
    filterSelectAllText: 'Select All filtered results'
  };
  public datePickerSettings: any = {
    bigBanner: true,
    timePicker: false,
    format: 'yyyy-MM-dd',
    defaultOpen: false,
    closeOnSelect: true
  };

  @ViewChild(TreeComponent) treeMultiselect;
  actionMapping: IActionMapping = {};
  private siteTreeExpand: Boolean = false;

  // fill Mode variables

  public buttonName = 'Show';
  public sideMenus: any = {};
  public isPageLoad = false;
  singleSelectBatchDropdownSettings = {
    text: 'Select Batch',
    singleSelection: true,
    labelKey: 'label',
    primaryKey: 'value',
    selectAllText: 'Select All',
    unSelectAllText: 'UnSelect All',
    classes: 'myclass custom-class',
    lazyLoading: false
    // fullObject: false,
  };

  // ---------------- Grid Variables ----------------------------
  public shift_selection: any = [];
  public gridStyling: any = {
    responsiveNess: true,
    theme: '',
    tableClass: 'table-sm table-bordered',
    theadClass: '',
    tbodyClass: ''
  };
  public gridSettings: any = {
    overallSearch: true,
    columnLevelSearch: false,
    scrollTop: true,
    showLoading: true,
    selectRecords: true,
    disableRecords: true
  };
  public gridColumns: any;
  public gridData: any = [];
  public batchList: any = [];
  public showData: any = [];
  public batch: any[] = [];
  public gridActions: any = {
    isShowActions: true,
    actionColumn: 'device_instance_id',
    actions: [
      {
        btnLabel: 'Fetch Latest',
        key: 'fetchLatest',
        enable: true,
        icon: 'elm-downloading-updates'
      },
      {
        btnLabel: 'Show History',
        key: 'showHistory',
        enable: true,
        icon: 'elm-time-machine'
      }
    ]
  };

  // Variable for Multi-tenant model
  site_id: string = '';
  client_id: string = '';
  default: boolean = false;
  deploymentMode = 'EL';
  endPointExt: any;

  // Variable to trigger modal from TS - Show Device History
  @ViewChild('deviceHistory') deviceHistory: ElementRef;

  dataToSend: any = {};

  /**
   * Will get side bar data of manual entry page
   */
  accessPermission: any;
  addOrEditManualEntry: boolean = false;

  allowDeleteManualEntry: boolean = false;
  disableDelete: boolean = true;
  disableSave: boolean = true;
  allowAddOrEditManualEntry: boolean = false;
  isValid: boolean;

  // MetaData Variables
  metaDataDropdownSettings_key: any = {};
  metaDataDropdownSettings_value: any = {};
  metaDataForm: any = {};
  metaPairObject: any = {
    key: '',
    metaValues: []
  };

  metaDataArray: Array<any> = [];
  metaData: any = [];
  metaKeys: any = [];
  metaPairArray: any = [];

  metaValues: any = [];
  metaDataDefault: any = [];

  currentMetaKeyId: any;
  defaultMetaValue: any;
  currentKeyIndex: number;
  keyValPairArray: any = [];

  deviceHistoryData: any = [];
  isShowHistory = false;
  isHistoryNotFound: boolean = false;
  gridDataToSend = {
    site_id: this.site_id,
    data: {},
    date_time: this.selectedRecordData['date'],
    metadata_default: {
      metadata_overridden: []
    }
  };
  manualEntryLoaded = true;
  title: string;
  ngOnInit() {
    this.allowAccess();
    // Multi-tenant model
    this.default = this._globals.isSystemAdminLoggedIn();
    this.client_id = this._globals.getCurrentUserClientId();
    this.site_id = this._globals.getCurrentUserSiteId();

    //  Endpoint extensions && Deployment Mode
    this.deploymentMode = this._globals.deploymentMode;
    this.endPointExt = this._globals.deploymentModeAPI;
    // console.log(this.deploymentMode);
    // console.log(this.endPointExt);
    this.title = 'Create Manual Entry';
    this.checkDeploymentMode();
    this.getmenus();
    this.getBatchList();
    this.showMetaDataPage();
  }

  checkDeploymentMode() {
    switch (this.deploymentMode) {
      case 'EL':
        this.dataToSend['filter'] = [{ site_id: this.site_id }];
        break;

      case 'KL':
        this.dataToSend = {};
        break;

      default:
        console.log('Deployment Mode not Found!..');
        break;
    }
  }

  allowAccess() {
    // calling allowAccess() to check user permissions
    this.accessPermission = this._auth.allowAccess('');
    this.checkAccessPermission('create');
  }

  checkAccessPermission(accessTo: string) {
    switch (accessTo) {
      case 'create':
        if (this.accessPermission.create) {
          this.disableSave = false;
          this.addOrEditManualEntry = true;
          this.allowAddOrEditManualEntry = true;
          break;
        } else {
          this.disableSave = true;
          this.addOrEditManualEntry = false;
          this.allowAddOrEditManualEntry = false;
          break;
        }

      case 'edit':
        if (this.accessPermission.edit) {
          this.disableSave = false;
          this.addOrEditManualEntry = true;
          this.allowAddOrEditManualEntry = true;
          this.checkAccessPermission('delete');
          break;
        } else {
          this.disableSave = true;
          this.addOrEditManualEntry = false;
          this.allowAddOrEditManualEntry = false;
          this.checkAccessPermission('delete');
          break;
        }

      case 'delete':
        if (this.accessPermission.delete) {
          this.disableDelete = false;
          this.allowDeleteManualEntry = true;
          break;
        } else {
          this.disableDelete = true;
          this.allowDeleteManualEntry = false;
          break;
        }
    }
  }

  getmenus() {
    this.isPageLoad = false;
    // const datatoPost = {
    //   page_name:"manual_entrypage",
    //   filter: [{ site_id: this.site_id }]
    // };
    this.checkDeploymentMode();
    this.dataToSend['page_name'] = 'manual_entrypage';

    this.appservice.getManualentrymenus(this.dataToSend).subscribe((data) => {
      if (data.status === 'success') {
        this.sideMenus['menuheading'] = 'Manual Entry';
        this.sideMenus['placeholder'] = 'Search';
        this.sideMenus['data'] = data.data;
        this.isPageLoad = true;
      } else {
        this._toastLoad.toast(
          'error',
          'Error',
          'Error while loading  manual entry menus',
          true
        );
      }
    });
  }

  /**
   * method to get batch and respective tags list
   */
  getBatchList() {
    try {
      // const dataToSend = {filter: [{ site_id: this.site_id }]};
      this.checkDeploymentMode();
      this.appservice.getBatchList(this.dataToSend).subscribe((data) => {
        if (data.status === 'success') {
          this.batchList = data['data']['batch'];
        }
      });
    } catch (error) {
      console.log(error);
    }
  }

  /**
   * Add a new manual entry page
   * @param event add new entry page event
   */
  addNewManualentry(event) {
    this.editpageSettings = false;
    this.savingConfig = false;
    this.addNewConfig = true;
    this.entryPageId = 'new';
    this.title = 'Create Manual Entry';
    this.refreshData();
  }

  /**
   * GEt the id of the Manual entry page and Load the data accrding to that
   * @param event event from side bar
   */
  loadManualEntryPage(RecordId) {
    this.checkAccessPermission('edit');
    this.refreshData();
    this.editpageSettings = false;
    this.addNewConfig = false;
    this.entryPageId = RecordId;
    this.selectedRecordData.dateDisp = this.currentDate;
    // const inputData = {
    //   filter: [{ site_id: this.site_id }],
    //   manual_entry_id: this.entryPageId,
    //
    // };
    // date_time: this.currentDate.toISOString().split('T')[0]
    this.checkDeploymentMode();
    this.dataToSend['manual_entry_id'] = this.entryPageId;

    this.editLoaded = false;
    this.loadedData = {};
    this.appservice.getManualEntryTableData(this.dataToSend).subscribe(
      (data) => {
        if (data.status === 'success') {
          this.metaDataArray = [];
          if (data.time_selection === 'time' && data.time[0] !== '') {
            const splittedTime = data.time[0].split(':');
            const setDate = new Date();
            const currentDate = new Date(
              setDate.getFullYear(),
              setDate.getMonth(),
              setDate.getDate(),
              splittedTime[0],
              splittedTime[1],
              setDate.getSeconds(),
              setDate.getMilliseconds()
            );
            data.timeDisp = currentDate.toISOString();
            data.time = [
              currentDate.getHours() + ':' + currentDate.getMinutes()
            ];
          } else if (data.time_selection === 'shift' && data.time[0] !== '') {
            // const dataToSend = {
            //   filter: [{ site_id: this.site_id }],
            //   fetch_meta_data_by: 'shift',
            // };
            this.checkDeploymentMode();
            this.dataToSend['fetch_meta_data_by'] = 'shift';
            this.loadedData['time'] = data['time'];

            //End-point Extension based on deployment mode
            let extensionValue = '';
            if (this.deploymentMode === 'KL') {
              extensionValue = '/shift';
            }

            this.appservice
              .getManualEntryMetaData(this.dataToSend, '/shift')
              .subscribe((shift_data) => {
                if (shift_data.status === 'success') {
                  this.shift_selection = shift_data.data.shift;
                } else {
                  this._toastLoad.toast(
                    'error',
                    'Error',
                    'Error while loading manual entry data',
                    true
                  );
                }
              });
            // data.time = data.time;
          }
          this.loadedData = data;
          this.showData = data['display_data'];
          this.gridData = data['data']['bodyContent'];

          if (
            data.hasOwnProperty('metadata_default') &&
            data['metadata_default'].hasOwnProperty('metadata_overridden')
          ) {
            this.metaDataArray =
              data['metadata_default']['metadata_overridden'];
          }
          if (this.metaDataArray.length === 0) {
            this.getMetaDataOnSettingsPage();
          } else {
            this.getMetaKeyValuePairs();
          }
          let newheaderData = '';
          newheaderData = data['data']['headerContent'];
          if (newheaderData['columnData']['batch_group_id']) {
            newheaderData['columnData']['batch_group_id']['cell'][
              'cellData'
            ] = this.batchList;
          }
          this.gridColumns = newheaderData;
          this.editLoaded = true;
        } else {
          this.editLoaded = true;
          this._toastLoad.toast(
            'error',
            'Error',
            'Error while loading site list',
            true
          );
        }
      },
      (error) => {
        this._toastLoad.toast('error', 'Error', 'Service Not available', true);
        console.log(error);
      }
    );
  }

  selectShiftforFetch(selectedData) {
    this.loadedData['time'] = selectedData;
  }

  /**
   * Will Allow to edit the page settings
   */
  editPageSettingsFunc() {
    this.title = 'Edit ' + this.loadedData.manual_entry_records_name;
    this.editpageSettings = false;
    this.editLoaded = false;
    this.addNewConfig = false;
    // const inputData = {
    //   filter: [{ site_id: this.site_id }],
    //   manual_entry_id: this.entryPageId,
    // };
    this.dataToSend = {};
    this.checkDeploymentMode();
    this.dataToSend['manual_entry_id'] = this.entryPageId;
    this.appservice.getManualEntryRecord(this.dataToSend).subscribe((data) => {
      if (data.status === 'success') {
        this.showMetaDataPage();
        this.selectedRecordData = data.data;
        this.pageDetails = {
          manual_entry_name: this.selectedRecordData.manual_entry_name,
          manual_entry_description: this.selectedRecordData
            .manual_entry_description
        };
        this.entryPageId = this.selectedRecordData.manual_entry_id;
        this.selectDeviceBasedOn(
          [this.selectedRecordData['manual_entry_config']['device_selection']],
          'device_selection'
        );
        this.selectTagsBasedOn(
          [this.selectedRecordData['manual_entry_config']['tag_selection']],
          'tag_selection'
        );
        this.selectTimeBasedOn([
          this.selectedRecordData['manual_entry_config']['time_selection']
        ]);
        this.saveFromConfig = this.selectedRecordData.manual_entry_config;
        // console.log(data.data);
        setTimeout(() => {
          this.editLoaded = true;
          this.editpageSettings = true;
          this.addNewConfig = false;
        }, 4000);
      } else {
        this._toastLoad.toast(
          'error',
          'Error',
          'Error fetching manual entry record',
          true
        );
      }
    });
  }

  /**
   * Back to manual entry page with same Page ID
   */
  backToManualEntry() {
    this.editpageSettings = false;
    this.addNewConfig = false;
  }

  // ==================================================== Change Dropdowns functions ========================================
  /**
   * Functions Related to select device criteria
   * @param changeDeviceBasedon Select device based on Criteria (site, device_group, devices, site_device_group)
   */
  selectDeviceBasedOn(changeDeviceBasedon, key) {
    const selectedValue = changeDeviceBasedon[0];
    (this.saveFromConfig['selected_devices'] = {
      site: [],
      device_group: [],
      devices: []
    }),
      (this.saveFromConfig[key] = selectedValue);
    if (selectedValue === 'site') {
      this.refreshMetaData(selectedValue);
    } else if (selectedValue === 'device_group') {
      this.refreshMetaData(selectedValue);
    } else if (selectedValue === 'devices') {
      this.refreshMetaData(selectedValue);
    } else if (selectedValue === 'site_device_group') {
      this.refreshMetaData('site');
      this.refreshMetaData('device_group');
    }
  }
  /**
   * Function for Selected Devices
   * @param selectedData Selected Devices
   */
  selectDevices(selectedData) {
    this.saveFromConfig['selected_devices'].devices = selectedData;
  }
  /**
   * Function for Selected Device group
   * @param selectedDeviceGroup Selected Devices Groups
   */
  selectDevicesGroup(selectedDeviceGroup) {
    this.saveFromConfig['selected_devices'].device_group = selectedDeviceGroup;
  }

  /**
   * Function for Select device group uising Site
   * @param node Selected Node Data
   * @param checked Status of Checked
   * @param key Data to store key
   */
  public checkTreeMultiSelect(node, checked) {
    if (checked) {
      this.saveFromConfig['selected_devices'].site.push({
        parent_id: this.returnParentId(node),
        node_id: node.data.node_id
      });
    } else {
      for (
        let ind = 0;
        ind < this.saveFromConfig['selected_devices'].site.length;
        ind++
      ) {
        if (
          this.saveFromConfig['selected_devices'].site[ind].node_id ===
          node.data.node_id
        ) {
          this.saveFromConfig['selected_devices'].site.splice(ind, 1);
        }
      }
    }
    node.data['isChecked'] = checked;
  }

  /**
   * ParentId to return the data
   * @param node Node data that needs to return its parent data
   */
  returnParentId(node) {
    let new_node = node;
    while (!new_node.data.parent_id) {
      new_node = new_node.parent;
    }
    return new_node.data.parent_id;
  }

  /**
   * Functions Related to Tags
   * @param changeTagsbasedon Select tags based on Criteria (tag_group, tags)
   */
  selectTagsBasedOn(changeTagsbasedon, key) {
    const selectedValue = changeTagsbasedon[0];
    this.saveFromConfig['selected_tags'] = {
      tag_group: [],
      tags: []
    };
    this.saveFromConfig[key] = selectedValue;
    if (selectedValue === 'tag_group') {
      this.refreshMetaData(selectedValue);
    } else if (selectedValue === 'tags') {
      this.refreshMetaData(selectedValue);
    }
  }
  selectedTagandGroups(selectedTags, key) {
    if (key === 'tag_group') {
      this.saveFromConfig['selected_tags'].tag_group = selectedTags;
    } else if (key === 'tags') {
      this.saveFromConfig['selected_tags'].tags = selectedTags;
    }
  }

  /**
   * Time based on Shift or Time picker
   * @param changeTimeBasedOn Select time based on Criteria (Shift, Time)
   */
  selectTimeBasedOn(changeTimeBasedOn) {
    const selectedValue = changeTimeBasedOn[0];
    this.saveFromConfig['selected_time'] = {
      shift: [],
      time: ''
    };
    this.saveFromConfig['time_selection'] = selectedValue;
    if (selectedValue === 'shift') {
      this.refreshMetaData(selectedValue);
    }
  }

  /**
   * Selection happened based on shift
   * @param selectedData Shift Id
   */
  selectedShift(selectedData) {
    this.saveFromConfig['selected_time'].shift = selectedData;
  }

  onDateSelect(date) {
    this.selectedRecordData.date = date.toISOString().split('T')[0];
    this.currentDate = date;
  }
  onTimeChange(time) {
    this.saveFromConfig['selected_time'].time =
      time.value.getHours() + ':' + time.value.getMinutes();
    this.loadedData['time'] = [
      time.value.getHours() + ':' + time.value.getMinutes()
    ];
  }

  /**
   * Refresh meta data by giving metadata key to service
   * @param changeDeviceBasedon Key to fetch Meta data
   */
  refreshMetaData(changeDeviceBasedon) {
    this.manualEntryLoaded = false;
    // const dataToSend = {
    //   filter: [{ site_id: this.site_id }],
    //   fetch_meta_data_by: changeDeviceBasedon,
    // };
    this.checkDeploymentMode();
    this.dataToSend['fetch_meta_data_by'] = changeDeviceBasedon;

    //End-point Extension based on deployment mode

    let extensionValue = '';
    if (this.deploymentMode === 'KL') {
      extensionValue = '/' + changeDeviceBasedon;
    }

    this.appservice
      .getManualEntryMetaData(this.dataToSend, extensionValue)
      .subscribe((data) => {
        if (data.status === 'success') {
          this.manualEntryLoaded = true;
          this.metaDataStorage[changeDeviceBasedon] =
            data.data[changeDeviceBasedon];
          if (changeDeviceBasedon === 'site') {
            if (
              this.entryPageId !== 'new' &&
              this.saveFromConfig['selected_devices']['site']
            ) {
              this.updateTree(
                data['data']['site'],
                this.saveFromConfig['selected_devices']['site']
              );
              // this.saveFromConfig['selected_devices']['site'].forEach(responseEle => {
              //   data['data']['site'].forEach(element => {
              //     if(responseEle['node_id'] ===  element['node_id']){
              //       element['isChecked'] = true;
              //     }
              //   });
              // });
              // this.metaDataStorage[changeDeviceBasedon] = data.data[changeDeviceBasedon];
            }
          }
        } else {
          this._toastLoad.toast(
            'error',
            'Error',
            'Error fetching manual entry data',
            true
          );
        }
      });
  }

  updateTree(node, selectedNodes) {
    try {
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
          this.updateTree(node[ind].children, selectedNodes);
        }
      }
      this.metaDataStorage['site'] = node;
    } catch (error) {
      console.log(error);
    }
  }
  /**
   * Saving Manual entry page Configuration
   */
  saveManualEntryConfig() {
    this.isValid = this.validateManualEntry();
    try {
      if (this.isValid && !this.savingConfig) {
        const inputData = {
          client_id: this.client_id,
          default: this.default,
          site_id: this.site_id,
          manual_entry_id: this.entryPageId,
          manual_entry_config: this.saveFromConfig,
          manual_entry_name: this.pageDetails['manual_entry_name'],
          manual_entry_description: this.pageDetails['manual_entry_description']
        };
        this.savingConfig = true;
        this.appservice.saveConfigManualEntry(inputData).subscribe((data) => {
          if (data.status === 'success') {
            const postData = {};
            postData['manual_entry_id'] = data['manual_entry_id'];
            this.appservice
              .saveMetaDataServ(postData)
              .pipe(
                finalize(() => {
                  this.savingConfig = false;
                })
              )
              .subscribe((data) => {
                this.savingConfig = false;
                this.refreshData();
                this.getmenus();
                // metadata reset
                this.resetToDefaults();
                this._toastLoad.toast(
                  'success',
                  'Success',
                  'Successfully saved manual entry settings',
                  true
                );
              });
            // this.saveMetaData(data['manual_entry_id']);
          } else {
            this.savingConfig = false;
            this._toastLoad.toast('error', 'Error', data.message, true);
          }
        });
      }
    } catch (error) {
      console.log(error);
      this.savingConfig = false;
    }
  }

  validateManualEntry() {
    const deviceSelected = this.saveFromConfig['device_selection'];
    const tagSelected = this.saveFromConfig['tag_selection'];
    const timeSelected = this.saveFromConfig['time_selection'];
    if (deviceSelected === '' || tagSelected === '' || timeSelected === '') {
      this._toastLoad.toast(
        'warning',
        'Warning',
        'Select values from all required drop-downs',
        true
      );
      return false;
    }
    const selectedDeviceObject = this.saveFromConfig['selected_devices'];
    const selectedTagsObject = this.saveFromConfig['selected_tags'];
    const selectedTimeObject = this.saveFromConfig['selected_time'];
    let isValidObject: boolean;

    // optimised code

    if (selectedDeviceObject || selectedDeviceObject || selectedDeviceObject) {
      isValidObject = this.validateSelectionsInObject(
        selectedDeviceObject,
        deviceSelected
      );
      if (isValidObject) {
        isValidObject = this.validateSelectionsInObject(
          selectedTagsObject,
          tagSelected
        );
        if (isValidObject) {
          isValidObject = this.validateSelectionsInObject(
            selectedTimeObject,
            timeSelected
          );
        }
      }
      if (!isValidObject) {
        return false;
      }
      return true;
    }
  }

  validateSelectionsInObject(selected_Object: any, selected_key: any) {
    for (const key in selected_Object) {
      if (selected_Object.hasOwnProperty(key)) {
        if (selected_key === key) {
          const value = selected_Object[key];
          if (value.length === 0) {
            this._toastLoad.toast(
              'warning',
              'Warning',
              'Select values from all required drop-downs',
              true
            );
            return false;
          }
        }
      }
    }
    return true;
  }

  /**
   *
   * save meta data after manual entry create
   */
  saveMetaData(manual_entry_id) {
    try {
      const postData = {};
      postData['manual_entry_id'] = manual_entry_id;
    } catch (error) {
      //
    }
  }

  submitManualEntry(event) {
    // let inputData = {
    //   site_id: this.site_id,
    //   data: {},
    //   date_time: this.selectedRecordData['date']
    // }

    this.gridDataToSend['data'] = {};
    this.gridDataToSend['site_id'] = this.site_id;
    this.gridDataToSend['date_time'] = this.selectedRecordData['date'];
    this.gridDataToSend['display_data'] = this.showData;
    this.gridDataToSend['data']['bodyContent'] = event['bodyContent'];
    this.gridDataToSend['data']['headerContent'] = event['headerContent'];
    this.gridDataToSend['manual_entry_id'] = this.entryPageId;
    if (this.gridDataToSend['date_time'] === undefined) {
      this.gridDataToSend['date_time'] = this.currentDate
        .toISOString()
        .split('T')[0];
    }
    this.gridDataToSend['time'] = this.loadedData['time'];
    this.gridDataToSend['time_selection'] = this.loadedData['time_selection'];
    this.appservice.saveManualEntry(this.gridDataToSend).subscribe((data) => {
      if (data.status === 'success') {
        this.refreshData();
        this.getmenus();
        // metadata reset
        this.resetToDefaults();
        this._toastLoad.toast(
          'success',
          'Success',
          'Successfully submitted manual entry data',
          true
        );
      }
    });
  }

  // data1={};

  fetchDate() {
    try {
      this.checkDeploymentMode();

      this.dataToSend['manual_entry_id'] = this.entryPageId;
      this.dataToSend['date_time'] = this.selectedRecordData['date'];

      if (this.loadedData['time'].length > 0) {
        this.dataToSend['time'] = this.loadedData['time'];
        this.dataToSend['date_time'] = this.currentDate
          .toISOString()
          .split('T')[0];
      }
      this.appservice
        .getManualEntryTableData(this.dataToSend)
        .subscribe((data) => {
          if (data.status === 'success') {
            if (data.time_selection === 'time' && data.time[0] !== '') {
              const splittedTime = data.time[0].split(':');
              const setDate = new Date();
              const currentDate = new Date(
                setDate.getFullYear(),
                setDate.getMonth(),
                setDate.getDate(),
                splittedTime[0],
                splittedTime[1],
                setDate.getSeconds(),
                setDate.getMilliseconds()
              );
              data.timeDisp = currentDate.toISOString();
              data['time'] = this.loadedData['time'];
            } else if (data.time_selection === 'shift' && data.time[0] !== '') {
              this.checkDeploymentMode();
              this.dataToSend['fetch_meta_data_by'] = 'shift';
              data['time'] = this.loadedData['time'];

              // End-point Extension based on deployment mode
              let extensionValue = '';
              if (this.deploymentMode === 'KL') {
                extensionValue = '/shift';
              }

              this.appservice
                .getManualEntryMetaData(this.dataToSend, '/shift')
                .subscribe((shift_data) => {
                  if (shift_data.status === 'success') {
                    this.shift_selection = shift_data.data.shift;
                  } else {
                    this._toastLoad.toast(
                      'error',
                      'Error',
                      'Error while loading Manual entry data',
                      true
                    );
                  }
                });
            }
            this.checkAccessPermission('edit');
            this.loadedData = data;
            this.showData = data['display_data'];
            this.gridData = data['data']['bodyContent'];
            let newheaderData = '';
            newheaderData = data['data']['headerContent'];
            if (newheaderData['columnData']['batch_group_id']) {
              newheaderData['columnData']['batch_group_id']['cell'][
                'cellData'
              ] = this.batchList;
            }
            this.gridColumns = newheaderData;

            // To get metaData Array for respective date and table data
            if (
              data.hasOwnProperty('metadata_default') &&
              data['metadata_default'].hasOwnProperty('metadata_overridden')
            ) {
              // this.metaDataArray = [];
              this.metaDataArray =
                data['metadata_default']['metadata_overridden'];
            }
            if (this.metaDataArray.length === 0) {
              this.getMetaDataOnSettingsPage();
            } else {
              this.getMetaKeyValuePairs();
            }
            this.editLoaded = true;
          }
        });
    } catch (error) {
      console.log(error);
    }
  }

  refreshData() {
    this.manualEntryLoaded = false;
    this.saveFromConfig = {
      device_selection: [],
      selected_devices: {
        site: [],
        device_group: [],
        devices: []
      },
      tag_selection: [],
      selected_tags: {
        tag_group: [],
        tags: []
      },
      date: this.currentDate.toISOString().split('T')[0],
      dateDisp: this.currentDate,
      time_selection: [],
      selected_time: {
        shift: [],
        time: ''
      }
    };
    this.metaDataStorage = {
      device_selection_list: [
        {
          label: 'Organisation Hierarchy',
          value: 'site'
        },
        {
          label: 'Asset Group',
          value: 'device_group'
        },
        {
          label: 'Organisation Hierarchy and Asset Group',
          value: 'site_device_group'
        },
        {
          label: 'Assets',
          value: 'devices'
        }
      ],
      tag_selection_list: [
        {
          label: 'Tag group',
          value: 'tag_group'
        },
        {
          label: 'Tags',
          value: 'tags'
        }
      ],
      time_selection_list: [
        {
          label: 'Shift',
          value: 'shift'
        },
        {
          label: 'Time',
          value: 'time'
        }
      ],
      shift: [],
      site: [],
      device_group: [],
      devices: [],
      tag_group: [],
      tags: []
    };
    this.editpageSettings = true;
    this.addNewConfig = true;
    this.entryPageId = 'new';
    this.pageDetails = {
      manual_entry_name: '',
      manual_entry_description: ''
    };
    this.metaDataArray = [];
    this.savingConfig = false;
    setTimeout(() => {
      this.manualEntryLoaded = true;
    }, 3000);
    this.getmenus();
  }

  // META DATA
  showMetaDataPage() {
    this.resetToDefaults();
    this.isShowAddMetaData = true;
    this.getMetaDataOnSettingsPage();
    this.getMetaKeyValuePairs();
  }

  resetToDefaults() {
    this.metaDataArray = [];
    this.metaPairArray = [];
    this.metaKeys = [];
    this.metaValues = [];
    this.keyValPairArray = [];
  }

  // Gets Keys and their respective Values from data-content
  getMetaKeyValuePairs() {
    const dataToSend = {
      filter: [{ site_id: this.site_id }]
    };
    let keyValuePair: any = [];
    this.appservice.getMetaKeyValuePairs(dataToSend).subscribe((data) => {
      //  if (data[0].status === 'success') - data-content structure
      if (data.status === 'success' && data.data.length > 0) {
        keyValuePair = data.data[0].data;
        this.metaKeys = [];
        this.metaValues = [];
        if (keyValuePair.length > 0) {
          keyValuePair.forEach((element) => {
            this.metaKeys.push(element['key']);
            this.metaValues.push(element['value']);
          });
        }
        this.metaDataDropdownSettings_key = this.dropDownSettingsMetaData(
          true,
          'Label',
          'key_name',
          'key_id'
        );
        this.metaDataDropdownSettings_value = this.dropDownSettingsMetaData(
          true,
          'Value',
          'value_name',
          'value_id'
        );
        this.metaPairArray = keyValuePair;
      } else {
        this.metaDataDropdownSettings_key = this.dropDownSettingsMetaData(
          true,
          'Label',
          'key_name',
          'key_id'
        );
        this.metaDataDropdownSettings_value = this.dropDownSettingsMetaData(
          true,
          'Value',
          'value_name',
          'value_id'
        );
      }
      // console.log(this.metaPairArray);
    });
  }

  dropDownSettingsMetaData(singleSelection, text, labelKey, primaryKey) {
    // Keys Dropdown settings
    return {
      singleSelection: singleSelection,
      text: 'Select ' + text,
      selectAllText: 'Select All',
      unSelectAllText: 'UnSelect All',
      enableSearchFilter: true,
      // classes: 'singleSelect',
      labelKey: labelKey,
      primaryKey: primaryKey,
      searchPlaceholderText: 'Search ' + text,
      // lazyLoading: true,
      enableFilterSelectAll: true,
      filterSelectAllText: 'Select the Filtered ' + text,
      filterUnSelectAllText: 'Un-select the Filtered ' + text,
      addNewItemOnFilter: true,
      addNewButtonText: 'Create  New ' + text
    };
  }

  addRow() {
    const metaDataRow = {
      key: [],
      value: []
    };
    this.metaDataArray.unshift(metaDataRow);
  }

  trackByFn(index) {
    return index;
  }

  // Delete Row
  deleteMetaData(index) {
    this.metaDataArray.splice(index, 1);
    this.saveFromConfig['metadata_default'] = this.metaDataArray;
  }

  resetForm(metaDataForm: NgForm) {
    metaDataForm.reset();
    this.metaDataArray = [];
  }

  makeSlugKey(data) {
    return data.replace(/[^a-zA-Z0-9]/g, '_');
  }

  // Method to save key and their respective value pairs
  saveMetaKeyValuePairs(keyValuePairArray) {
    for (let i = 0; i < keyValuePairArray.length; i++) {
      const element = keyValuePairArray[i];
      if (element.hasOwnProperty('key') && element['key'] === undefined) {
        keyValuePairArray.splice(i, 1);
      }
    }
    const dataToSend = {
      site_id: this.site_id,
      data: keyValuePairArray
    };
    this.appservice.addMetaKeys(dataToSend).subscribe((data) => {
      if (data.status === 'success') {
        this.getMetaKeyValuePairs();
      }
    });
  }

  // On Add Meta Keys from with-in dropdown
  onAddMetaKey(data: string, keyIndex: number) {
    const metaKey: any = {};
    const keyId = this.makeSlugKey(data);
    metaKey['key_id'] = keyId;
    metaKey['key_name'] = data;
    this.metaKeys.push(metaKey);
    const metaKeyValueObject = this.prepareMetaKeyValueJSON(metaKey);
    this.metaPairArray.push(metaKeyValueObject);
    this.setKeyAfterAdd(keyIndex, metaKey);
    this.saveMetaKeyValuePairs(this.metaPairArray);
  }

  // method to add new keys to JSON
  prepareMetaKeyValueJSON(metaKey) {
    return {
      key: metaKey,
      value: []
    };
  }

  // On Add Meta Values for a key from with-in dropdown
  onAddMetaValue(data: string, valueIndex: number) {
    const currentKeyElement = document.getElementById(
      'metaData_key_' + valueIndex
    );
    const currentKeyName = currentKeyElement.innerText;
    if (currentKeyName === this.metaDataDropdownSettings_key['text']) {
      this.metaValues = [];
      this._toastLoad.toast(
        'warning',
        'Warning',
        'Select the key to add a value.',
        true
      );
    }

    const metaValues: any = {};
    const valueId = this.makeSlugKey(data);
    metaValues['value_id'] = valueId;
    metaValues['value_name'] = data;

    for (let i = 0; i < this.metaKeys.length; i++) {
      const element = this.metaKeys[i];

      if (currentKeyName === element['key_name']) {
        const keyId = element['key_id'];
        this.metaPairArray.forEach((object) => {
          if (object.hasOwnProperty('key')) {
            if (object['key']['key_id'] === keyId) {
              if (object.hasOwnProperty('value')) {
                object['value'].push(metaValues);
                this.setValueAfterAdd(valueIndex, metaValues);
              }
            }
          }
        });
      }
    }
    this.saveMetaKeyValuePairs(this.metaPairArray);
  }

  // Populate key in drop-down after adding new value from DD
  setKeyAfterAdd(keyIndex, metaKey) {
    for (let i = 0; i < this.metaDataArray.length; i++) {
      if (i === keyIndex) {
        this.metaDataArray[i].key = [metaKey];
        this.saveFromConfig['metadata_default'] = this.metaDataArray;
      }
    }
  }

  // Populate value in drop-down after adding new value from DD
  setValueAfterAdd(valueIndex, metaValues) {
    for (let i = 0; i < this.metaDataArray.length; i++) {
      if (i === valueIndex) {
        this.metaDataArray[i].value = [metaValues];
        this.saveFromConfig['metadata_default'] = this.metaDataArray;
      }
    }
  }

  // On Master Settings Page & Settings Page
  onMetaKeySelect(keySelected, index) {
    this.metaValues = [];
    this.currentMetaKeyId = keySelected['key_id'];
    this.getMetaValuesOnKeySelect(this.currentMetaKeyId);
    for (let i = 0; i < this.metaDataArray.length; i++) {
      if (i === index) {
        this.metaDataArray[i].value = [];
      }
    }
  }

  // On Master Settings Page & Settings Page
  onMetaValueSelect(
    ValueSelected,
    valueIndex: number,
    settingsPageType: string
  ) {
    if (settingsPageType === 'masterSettingsPage') {
      this.validateRows(this.metaDataArray);
      this.saveFromConfig['metadata_default'] = this.metaDataArray;
    } else if (settingsPageType === 'settingsPage') {
      this.validateRows(this.metaDataArray);
      this.gridDataToSend['metadata_default'][
        'metadata_overridden'
      ] = this.metaDataArray;
    }
  }

  validateRows(metaDataArray) {
    this.metaData = [];
    let warning = 0;
    for (let i = 0; i < metaDataArray.length; i++) {
      if (
        metaDataArray[i]['key'].length === 0 ||
        metaDataArray[i]['value'] === ''
      ) {
        warning++;
        this._toastLoad.toast(
          'warning',
          'Warning',
          'Metadata: Enter data in all the row(s) (or) Delete the extra row(s).',
          true
        );
        return;
      }
    }
  }

  getMetaValuesOnKeySelect(keyId) {
    this.metaPairArray.forEach((element) => {
      if (element.hasOwnProperty('key')) {
        if (element['key']['key_id'] === keyId) {
          this.metaValues = element['value'];
        }
      }
    });
  }

  // Fetch the Values for the selected Key on clicking Values DD
  getMetaValuesOnClickValueDD(valueIndex) {
    this.metaDataDropdownSettings_value = this.dropDownSettingsMetaData(
      true,
      'Value',
      'value_name',
      'value_id'
    );
    const currentKeyElement = document.getElementById(
      'metaData_key_' + valueIndex
    );
    const currentKeyName = currentKeyElement.innerText;

    if (currentKeyName === this.metaDataDropdownSettings_key['text']) {
      this.metaValues = [];
      this._toastLoad.toast(
        'warning',
        'Warning',
        'Select the key to select a value.',
        true
      );
    }

    for (let i = 0; i < this.metaKeys.length; i++) {
      const element = this.metaKeys[i];
      if (currentKeyName === element['key_name']) {
        const keyId = element['key_id'];
        this.metaPairArray.forEach((object) => {
          if (object.hasOwnProperty('key')) {
            if (object['key']['key_id'] === keyId) {
              if (object.hasOwnProperty('value')) {
                this.metaValues = object['value'];
              }
            }
          }
        });
      }
    }
  }

  // Get the MetaData on Settings Page
  getMetaDataOnSettingsPage() {
    this.resetToDefaults();
    this.getMetaDataDefaults();
  }

  // Get Default Values manual_entry_metadata collection
  // Master Settings & Settings Page
  getMetaDataDefaults() {
    this.metaDataArray = [];
    this.dataToSend['manual_entry_id'] = this.entryPageId;
    // this.dataToSend['manual_entry_id'] = this.entryPageId;
    if (this.dataToSend['manual_entry_id'] === 'new') {
      return;
    } else {
      this.appservice
        .getManualEntryRecord(this.dataToSend)
        .subscribe((data) => {
          if (data.status === 'success') {
            this.getMetaKeyValuePairs();
            if (
              data['data']['manual_entry_config'].hasOwnProperty(
                'metadata_default'
              )
            ) {
              const metaDataDefaults =
                data['data']['manual_entry_config']['metadata_default'];
              if (metaDataDefaults.length > 0) {
                this.metaDataArray = metaDataDefaults;
                // set values to be saved in settings page if there is no change in values
                this.gridDataToSend['metadata_default'][
                  'metadata_overridden'
                ] = this.metaDataArray;
              } else {
                this.metaDataArray = [];
              }
            } else if (data === null) {
              this.metaDataArray = [];
              return;
            } else {
              return;
            }
          } else {
            return;
          }
        });
    }
  }

  // Method to switch function based on actionkey
  getAction(event) {
    switch (event['actionKey']) {
      case 'fetchLatest':
        this.fetchDeviceLatestData(event['deviceId']);
        break;

      case 'showHistory':
        this.fetchDeviceHistory(event['deviceId']);
        break;
    }
  }

  // Method to fetch Latest Data entered for the device in a row.
  fetchDeviceLatestData(deviceId) {
    try {
      const requestPayload = {
        filter: [{ site_id: this.site_id }],
        manual_entry_id: this.entryPageId,
        device_instance_id: deviceId
      };

      this.appservice
        .fetchDeviceLatestData(requestPayload)
        .subscribe((data) => {
          if (data) {
            const latestData: any = data;
            if (Object.keys(latestData).length > 0) {
              this.gridData.forEach((element) => {
                if (
                  element['device_instance_id'] ===
                  latestData['device_instance_id']
                ) {
                  Object.assign(element, latestData);
                }
              });
            } else {
              this._toastLoad.toast(
                'error',
                'Error',
                'No latest data available.',
                true
              );
            }
          } else {
            this._toastLoad.toast(
              'error',
              'Error',
              'Error Fetching Latest Data.',
              true
            );
          }
        });
    } catch (error) {
      console.log(error);
    }
  }

  // Method to fetch History Data for the device in a row.
  fetchDeviceHistory(deviceId) {
    try {
      const requestPayload = {
        filter: [{ site_id: this.site_id }],
        manual_entry_id: this.entryPageId,
        device_instance_id: deviceId,
        historyOrderBy: 'descending',
        dateTimeFormat: 'dd-mm-yyyy hh:mm:ss',
        hourFormat: '12'
      };

      this.appservice
        .fetchDeviceHistory(requestPayload)
        .subscribe((data: any) => {
          this.deviceHistory.nativeElement.click();
          this.deviceHistoryData = data;
          this.isShowHistory = true;
          if (data.status === 'success') {
            if (Object.keys(data['data']).length !== 0) {
              this.isHistoryNotFound = false;
            } else {
              this.isHistoryNotFound = true;
            }
          } else {
            this._toastLoad.toast(
              'error',
              'Error',
              'Error Fetching History Data.',
              true
            );
          }
        });
    } catch (error) {
      console.log(error);
    }
  }
  onClearFiled(event, value) {
    if (value === 'asset') {
      this.saveFromConfig['device_selection'] = '';
    }
    if (value === 'tags') {
      this.saveFromConfig['tag_selection'] = '';
    }
    if (value === 'time') {
      this.saveFromConfig['time_selection'] = '';
    }
  }
}
