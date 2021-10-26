import {
  Component,
  OnInit,
  Input,
  Output,
  EventEmitter,
  OnDestroy,
  OnChanges,
  SimpleChanges
} from '@angular/core';
import { DataSharingService } from '../../../services/data-sharing.service';
import { globals } from '../../../utilities/globals';
import { AppService } from '../../../services/app.service';
import { AuthGuard } from '../../../../app/pages/auth/auth.guard';
import { Title } from '@angular/platform-browser';
import { ActivatedRoute, Router } from '@angular/router';
import { Subscription } from 'rxjs';

@Component({
  selector: 'kl-config-breadcrumb',
  templateUrl: './config-breadcrumb.component.html',
  styleUrls: ['./config-breadcrumb.component.scss']
})
export class ConfigBreadcrumbComponent implements OnChanges, OnInit, OnDestroy {
  @Input() breadcrumbTitle: any;
  @Input() breadcrumbIcon: any;
  @Input() isBusy: boolean;
  @Output() alarmFilterConfiguration = new EventEmitter();
  breadCrumbTitleName: string = 'Configurations';
  breadCrumbTitlePath: string = '';
  currentURL: string;
  sideMenus: any;
  // Variable for Multi-tenant model
  deploymentMode: string = 'EL';
  endPointExt: any;
  breadCrumbLabel: string;
  breadCrumbIcon: string;
  pageType: string;
  isFilterApplied: boolean = false;
  currentClickedItem;
  isPriorityOpen: boolean = false;
  alarmConfiguration = {
    alarmTypes: [
      {
        label: 'Alarm',
        value: 'Alarm'
      },
      {
        label: 'Event',
        value: 'Event'
      },
      {
        label: 'Status',
        value: 'Status'
      }
    ],
    status: 'Active',
    acknowledgement: false,
    type: 'Alarm',
    priorityList: [],
    alarmCount: [
      {
        label: '5',
        value: 5
      },
      {
        label: '10',
        value: 10
      },
      {
        label: '25',
        value: 25
      },
      {
        label: '50',
        value: 50
      }
    ],
    alarmStatus: [
      {
        label: 'Active',
        value: 'Active',
        isActive: true,
        isNotAllowed: true
      },
      {
        label: 'Inactive',
        value: 'Inactive',
        isActive: false,
        isNotAllowed: false
      }
    ],
    alarmAcknowledgement: [
      {
        label: 'Un-ACK',
        value: false,
        isActive: true,
        isNotAllowed: true,
        isClicked: false
      },
      {
        label: 'ACK',
        value: true,
        isActive: false,
        isNotAllowed: false,
        isClicked: false
      }
    ],
    alarmPriorityList: []
  };
  routeSubscription: Subscription;
  priorityListSettings = {};
  isPriorityFilterApplied: boolean = false;
  holdAlarmPriorityFilter;

  constructor(
    private dataSharing: DataSharingService,
    private _globals: globals,
    private _appservice: AppService,
    private _auth: AuthGuard,
    private _router: Router,
    private activatedRoute: ActivatedRoute
  ) {
    // this._auth.getMenuLabel().subscribe((data) => {
    //   this.breadCrumbLabel = data;
    // });
    const menuObject = _auth.getMenuObject;
    this.pageType = menuObject['ticket'];

    this._auth.getMenuIconAndLabel().subscribe((data) => {
      this.breadCrumbIcon = data['icon'];
      this.breadCrumbLabel = data['label'];
    });
  }

  ngOnChanges(simpleChange: SimpleChanges) {
    if (this.pageType === 'alarmEvents') {
      if (!simpleChange.isBusy.currentValue) {
        this.currentClickedItem = '';
      }
    }
  }

  ngOnInit() {
    if (this.pageType === 'alarmEvents') {
      this.routeSubscription = this.activatedRoute.params.subscribe(
        (params) => {
          if (params !== undefined) {
            let isParams = false;
            const type = params['type'];
            if (type === 'alarm') {
              this.alarmConfiguration.type = 'Alarm';
              isParams = true;
            } else if (type === 'event') {
              this.alarmConfiguration.type = 'Event';
              isParams = true;
            } else if (type === 'status') {
              this.alarmConfiguration.type = 'Status';
              isParams = true;
            } else {
              this._router.navigate(['page-notfound']);
            }
            if (isParams && this.pageType === 'alarmEvents')
              this.sendAlarmFilterInfo();
          }
        }
      );

      // get priority list
      const objGet = {
        id: 'new',
        filter: [{ site_id: this._globals.getCurrentUserSiteId() }]
      };
      this._appservice
        .getAlarmConf(
          this._globals.deploymentModeAPI.ALARM_CONFIGURATION_GET,
          objGet
        )
        .subscribe((data) => {
          if (data.hasOwnProperty('data') && data.data.status == 'success') {
            this.alarmConfiguration.alarmPriorityList =
              data.data.headerContent['alarmPriorityTypes'];
          }
        });

      // priority settings
      this.priorityListSettings = {
        singleSelection: false,
        text: 'Select priority',
        enableSearchFilter: true,
        classes: 'myclass custom-class',
        labelKey: 'label',
        primaryKey: 'value',
        enableFilterSelectAll: false,
        lazyLoading: true,
        enableCheckAll: false,
        badgeShowLimit: 1
      };
    }
  }

  ngOnDestroy() {
    if (this.routeSubscription) {
      this.routeSubscription.unsubscribe();
    }
  }

  onAlarmFiltersChange(filterType: string, data: any) {
    this.currentClickedItem = data.label;
    switch (filterType) {
      case 'type':
        this._router.navigate(['alarm-events', data.label.toLowerCase()]);
        this.alarmConfiguration.type = data.label;
        this.isPriorityOpen = false;
        if (
          (this.alarmConfiguration.type === 'Event' ||
            this.alarmConfiguration.type === 'Status') &&
          this.isPriorityFilterApplied
        ) {
          this.holdAlarmPriorityFilter = JSON.parse(
            JSON.stringify(this.alarmConfiguration.priorityList)
          );
          this.alarmConfiguration.priorityList = [];
        }
        if (this.alarmConfiguration.type === 'Alarm') {
          if (this.holdAlarmPriorityFilter === undefined) {
            this.alarmConfiguration.priorityList = [];
          } else {
            this.alarmConfiguration.priorityList = JSON.parse(
              JSON.stringify(this.holdAlarmPriorityFilter)
            );
          }
        }
        break;
      case 'status':
        if (
          !this.alarmConfiguration.alarmStatus[0].isActive &&
          !this.alarmConfiguration.alarmStatus[1].isActive
        ) {
          if (data.value === 'Active') {
            this.alarmConfiguration.alarmStatus[0].isActive = true;
          } else {
            this.alarmConfiguration.alarmStatus[1].isActive = true;
          }
        }

        if (
          this.alarmConfiguration.alarmStatus[0].isActive &&
          this.alarmConfiguration.alarmStatus[1].isActive
        ) {
          this.alarmConfiguration.status = null;
        } else if (
          this.alarmConfiguration.alarmStatus[0].isActive ||
          this.alarmConfiguration.alarmStatus[1].isActive
        ) {
          if (this.alarmConfiguration.alarmStatus[0].isActive) {
            this.alarmConfiguration.status = this.alarmConfiguration.alarmStatus[0].value;
          } else if (this.alarmConfiguration.alarmStatus[1].isActive) {
            this.alarmConfiguration.status = this.alarmConfiguration.alarmStatus[1].value;
          }
        }
        break;
      case 'acknowledgement':
        if (
          !this.alarmConfiguration.alarmAcknowledgement[0].isActive &&
          !this.alarmConfiguration.alarmAcknowledgement[1].isActive
        ) {
          if (data.label === 'Un-ACK') {
            this.alarmConfiguration.alarmAcknowledgement[0].isActive = true;
          } else {
            this.alarmConfiguration.alarmAcknowledgement[1].isActive = true;
          }
        }

        if (
          this.alarmConfiguration.alarmAcknowledgement[0].isActive &&
          this.alarmConfiguration.alarmAcknowledgement[1].isActive
        ) {
          this.alarmConfiguration.acknowledgement = null;
        } else if (
          this.alarmConfiguration.alarmAcknowledgement[0].isActive ||
          this.alarmConfiguration.alarmAcknowledgement[1].isActive
        ) {
          if (this.alarmConfiguration.alarmAcknowledgement[0].isActive) {
            this.alarmConfiguration.acknowledgement = this.alarmConfiguration.alarmAcknowledgement[0].value;
          } else if (this.alarmConfiguration.alarmAcknowledgement[1].isActive) {
            this.alarmConfiguration.acknowledgement = this.alarmConfiguration.alarmAcknowledgement[1].value;
          }
        }
        break;
      case 'priority':
        this.isPriorityFilterApplied = true;
    }
    if (filterType !== 'type' && !data['isNotAllowed']) {
      this.sendAlarmFilterInfo();
    }
  }

  sendAlarmFilterInfo() {
    const filters = {
      alarmStatus: this.alarmConfiguration.status,
      type: this.alarmConfiguration.type,
      acknowledged: this.alarmConfiguration.acknowledgement,
      priority: []
    };
    this.isPriorityFilterApplied
      ? (filters.priority = this.alarmConfiguration.priorityList)
      : (filters.priority = []);
    if (filters) {
      this.alarmFilterConfiguration.emit(JSON.parse(JSON.stringify(filters)));
    }
  }

  onMouseOverFilters(filterType, hovereditem: any) {
    switch (filterType) {
      case 'status':
        if (
          !this.alarmConfiguration.alarmStatus[0].isActive &&
          !this.alarmConfiguration.alarmStatus[1].isActive
        ) {
          if (hovereditem.value === 'Active') {
            this.alarmConfiguration.alarmStatus[0].isNotAllowed = true;
          } else {
            this.alarmConfiguration.alarmStatus[1].isNotAllowed = true;
          }
        }

        if (
          this.alarmConfiguration.alarmStatus[0].isActive &&
          this.alarmConfiguration.alarmStatus[1].isActive
        ) {
          this.alarmConfiguration.alarmStatus[0].isNotAllowed = false;
          this.alarmConfiguration.alarmStatus[1].isNotAllowed = false;
        } else if (
          this.alarmConfiguration.alarmStatus[0].isActive ||
          this.alarmConfiguration.alarmStatus[1].isActive
        ) {
          if (this.alarmConfiguration.alarmStatus[0].isActive) {
            this.alarmConfiguration.alarmStatus[0].isNotAllowed = true;
          } else if (this.alarmConfiguration.alarmStatus[1].isActive) {
            this.alarmConfiguration.alarmStatus[1].isNotAllowed = true;
          }
        }
        break;

      case 'acknowledgement':
        if (
          !this.alarmConfiguration.alarmAcknowledgement[0].isActive &&
          !this.alarmConfiguration.alarmAcknowledgement[1].isActive
        ) {
          if (hovereditem.label === 'Unacknowledged') {
            this.alarmConfiguration.alarmAcknowledgement[0].isNotAllowed = true;
          } else {
            this.alarmConfiguration.alarmAcknowledgement[1].isNotAllowed = true;
          }
        }

        if (
          this.alarmConfiguration.alarmAcknowledgement[0].isActive &&
          this.alarmConfiguration.alarmAcknowledgement[1].isActive
        ) {
          this.alarmConfiguration.alarmAcknowledgement[0].isNotAllowed = false;
          this.alarmConfiguration.alarmAcknowledgement[1].isNotAllowed = false;
        } else if (
          this.alarmConfiguration.alarmAcknowledgement[0].isActive ||
          this.alarmConfiguration.alarmAcknowledgement[1].isActive
        ) {
          if (this.alarmConfiguration.alarmAcknowledgement[0].isActive) {
            this.alarmConfiguration.alarmAcknowledgement[0].isNotAllowed = true;
          } else if (this.alarmConfiguration.alarmAcknowledgement[1].isActive) {
            this.alarmConfiguration.alarmAcknowledgement[1].isNotAllowed = true;
          }
        }
    }
  }

  onPriorityOpen() {
    this.isPriorityOpen = true;
    this.priorityListSettings = {
      singleSelection: false,
      text: 'Select priority',
      enableSearchFilter: true,
      classes: 'bottom-button',
      labelKey: 'label',
      primaryKey: 'value',
      enableFilterSelectAll: false,
      lazyLoading: false,
      enableCheckAll: false,
      badgeShowLimit: 1
    };
  }

  onPriorityClose() {
    this.isPriorityOpen = false;
    this.priorityListSettings = {
      singleSelection: false,
      text: 'Select priority',
      enableSearchFilter: true,
      classes: 'myClass custom-class',
      labelKey: 'label',
      primaryKey: 'value',
      enableFilterSelectAll: false,
      lazyLoading: true,
      enableCheckAll: false,
      badgeShowLimit: 1
    };
  }

  onClearPriorities(data) {
    this.alarmConfiguration.priorityList = [];
    this.holdAlarmPriorityFilter = []; //TBD if deselect and forgot to apply and revisit to alarm show prev filters
    this.isPriorityFilterApplied = false;
    this.sendAlarmFilterInfo();
  }

  onDeselectEachPriority(data) {
    this.isPriorityFilterApplied = false;
    if (this.alarmConfiguration.priorityList.length === 0) {
      this.sendAlarmFilterInfo();
    }
  }
}
