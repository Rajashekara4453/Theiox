import { VersionComponent } from './version/version.component';
import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { PagesComponent } from './pages.component';
import { LoginComponent } from './login/login.component';
import { ConfigurationsComponent } from './configurations/configurations.component';
// Auth guard
// import { AuthGuard } from '../pages/auth/auth.guard';
import { DeviceModelsComponent } from './master-configuration/device-models/device-models.component';
// Channel Configuration
import { GatewayInstanceComponent } from './channel-configuration/gateway-instance/gateway-instance.component';
import { DeviceInstanceComponent } from './channel-configuration/device-instance/device-instance.component';
import { GatewayModelComponent } from './master-configuration/gateway-model/gateway-model.component';
import { ChannelConfigurationComponent } from './channel-configuration/channel-configuration.component';
import { VirtualdeviceComponent } from './configurations/virtualdevice/virtualdevice.component';
import { VirtualdevicemanultagComponent } from './configurations/virtualdevicemanultag/virtualdevicemanultag.component';
import { UnitConverterComponent } from './master-configuration/unit-converter/unit-converter.component';
import { ShiftManagementComponent } from './configurations/time-slot/shift-management/shift-management.component';
import { TimeSlotGroupComponent } from './configurations/time-slot/time-slot-group/time-slot-group.component';
import { BatchEntryComponent } from './configurations/batch-entry/batch-entry.component';
import { LookupConfigurationComponent } from './configurations/lookup-configuration/lookup-configuration.component';
import { AddeditComponent } from './configurations/lookup-configuration/addedit/addedit.component';
import { ShiftEditComponent } from './configurations/time-slot/shift-edit/shift-edit.component';
import { MasterFormComponent } from './master-configuration/master-form/master-form.component';
import { AuthGuard } from './auth/auth.guard';
import { LookupTablesComponent } from './configurations/lookup-configuration/lookup-tables/lookup-tables.component';
import { SitesComponent } from './configurations/sites/sites.component';
import { DeviceGroupComponent } from './configurations/business-groups/device-group/device-group.component';
import { TagGroupComponent } from './configurations/business-groups/tag-group/tag-group.component';
import { EmailGatewayComponent } from './master-configuration/email-gateway/email-gateway.component';
import { AddeditemailgatewayComponent } from './master-configuration/email-gateway/addeditemailgateway/addeditemailgateway.component';
import { SmsGatewayComponent } from './master-configuration/sms-gateway/sms-gateway.component';
import { AddeditsmsgatewayComponent } from './master-configuration/sms-gateway/addeditsmsgateway/addeditsmsgateway.component';
import { LicenseManagementComponent } from './license-management/license-management.component';
import { UserListComponent } from './configurations/user-management/user-list/user-list.component';
import { WorkGroupComponent } from './configurations/user-management/work-group/work-group.component';
import { AccessLevelsComponent } from './configurations/user-management/access-levels/access-levels.component';
import { UserProfileComponent } from './configurations/user-management/user-profile/user-profile.component';
import { ManualEntryComponent } from './configurations/manual-entry/manual-entry.component';
import { NotFoundComponent } from './maintenance/not-found/not-found.component';
import { UnauthorizedComponent } from './maintenance/unauthorized/unauthorized.component';
import { UnderConstructionComponent } from './maintenance/under-construction/under-construction.component';
import { AlarmPriorityTypesComponent } from './configurations/alarm-configurations/alarm-priority-types/alarm-priority-types.component';
import { AlarmConfigurationComponent } from './configurations/alarm-configurations/alarm-configuration/alarm-configuration.component';
import { ThresholdConfigComponent } from './configurations/alarm-configurations/threshold-config/threshold-config.component';
import { DashboardComponent } from './dashboard/dashboard.component';
import { RuleEngineComponent } from './configurations/rule-engine/rule-engine.component';
import { AlarmsComponent } from './configurations/alarm-configurations/alarms/alarms.component';
import { AlarmEventsComponent } from '../components/alarm-events/alarm-events.component';
// import { VersionsInfoComponent } from './versions-info/versions-info.component';
import { ClientManagementComponent } from './configurations/client-management/client-management.component';
import { BusinessRuleComponent } from './configurations/business-rule/business-rule.component';
import { ScadaComponent } from './scada/scada.component';
import { ImagePickerComponent } from '../components/image-picker/image-picker.component';
import { AssestControlListComponent } from './assest-control-list/assest-control-list.component';
import { AssetControlComponent } from './assest-control-list/asset-control/asset-control.component';
import { ActivitylogComponent } from './activitylog/activitylog.component';
import { PpsComponent } from './pps/pps.component';
import { DynamicFiltersComponent } from '../components/dynamic-filters/dynamic-filters.component';

const routes: Routes = [
  { path: '', redirectTo: 'login' },
  { path: 'login', component: LoginComponent },
  {
    path: '',
    component: PagesComponent,
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      {
        path: 'configurations/gatewayDevices/gatewaylist',
        component: ChannelConfigurationComponent,
        canActivate: [AuthGuard]
      },
      {
        path: 'configurations/gatewayDevices/gatewaylist/:id',
        component: DeviceInstanceComponent,
        canActivate: [AuthGuard]
      },
      {
        path: 'configurations/gatewayDevices/gatewaylist/:id/:id1',
        component: DeviceInstanceComponent,
        canActivate: [AuthGuard]
      },
      // { path: 'masterConfig/gatewaymodel', component: GatewayModelComponent, canActivate: [AuthGuard] },
      // { path: 'masterConfig/devicemodels', component: DeviceModelsComponent, canActivate: [AuthGuard] },
      // // { path: 'masterConfig/parameters', component: ParametersComponent },
      // { path: 'masterConfig/unitconverter', component: UnitConverterComponent, canActivate: [AuthGuard] },
      // { path: 'masterConfig/parameters', component: MasterFormComponent, canActivate: [AuthGuard] },
      // { path: 'masterConfig/deviceTypes', component: MasterFormComponent, canActivate: [AuthGuard] },
      // { path: 'masterConfig/gatewayTypes', component: MasterFormComponent, canActivate: [AuthGuard] },
      // { path: 'masterConfig/unit-master', component: MasterFormComponent, canActivate: [AuthGuard] },
      // { path: 'masterConfig/function-code', component: MasterFormComponent, canActivate: [AuthGuard] },
      // { path: 'masterConfig/aggregation-type', component: MasterFormComponent, canActivate: [AuthGuard] },
      // { path: 'masterConfig/frequency-list', component: MasterFormComponent, canActivate: [AuthGuard] },
      // { path: 'masterConfig/data-type', component: MasterFormComponent, canActivate: [AuthGuard] },
      // { path: 'masterConfig/protocol-list', component: MasterFormComponent, canActivate: [AuthGuard] },
      // { path: 'masterConfig/protocol-category', component: MasterFormComponent, canActivate: [AuthGuard] },
      // { path: 'masterConfig/multiplicationFactors', component: MasterFormComponent, canActivate: [AuthGuard] },
      // { path: 'emailGateway', component: EmailGatewayComponent, canActivate: [AuthGuard] },
      // { path: 'emailGateway/addemailGateway', component: AddeditemailgatewayComponent, canActivate: [AuthGuard] },
      // { path: 'emailGateway/editemailGateway/:id', component: AddeditemailgatewayComponent, canActivate: [AuthGuard] },
      // { path: 'smsgateway', component: SmsGatewayComponent, canActivate: [AuthGuard] },
      // { path: 'smsgateway/addsmsgateway', component: AddeditsmsgatewayComponent, canActivate: [AuthGuard] },
      // { path: 'smsgateway/editsmsgateway/:id', component: AddeditsmsgatewayComponent, canActivate: [AuthGuard] },
      { path: 'un-authorized', component: UnauthorizedComponent },
      {
        path: 'reports',
        component: DashboardComponent,
        canActivate: [AuthGuard]
      },
      {
        path: 'reports/:id',
        component: DashboardComponent,
        canActivate: [AuthGuard]
      },
      {
        path: 'trends',
        component: DashboardComponent,
        canActivate: [AuthGuard]
      },
      {
        path: 'trends/:id',
        component: DashboardComponent,
        canActivate: [AuthGuard]
      },
      { path: 'license-management', component: LicenseManagementComponent },
      { path: 'un-authorized', component: UnauthorizedComponent },
      { path: 'page-notfound', component: NotFoundComponent },
      { path: 'scada', redirectTo: 'scada/' },
      {
        path: 'scada/:id',
        loadChildren: './webScada/webscada.module#WebscadaModule'
      },
      {
        path: 'asset-control',
        component: AssestControlListComponent,
        canActivate: [AuthGuard]
      },
      {
        path: 'asset-control/:action',
        component: AssetControlComponent,
        canActivate: [AuthGuard]
      },
      {
        path: 'asset-control/:action/:id',
        component: AssetControlComponent,
        canActivate: [AuthGuard]
      },
      {
        path: 'product/version',
        component: VersionComponent,
        canActivate: [AuthGuard]
      },
      {
        path: 'activity-log',
        component: ActivitylogComponent,
        canActivate: [AuthGuard]
      },
      // { path: 'versions-info', component: VersionsInfoComponent },
      {
        path: 'configurations',
        component: ConfigurationsComponent,
        children: [
          {
            path: '',
            redirectTo: 'sites',
            pathMatch: 'full',
            canActivate: [AuthGuard]
          },
          {
            path: 'userManagement/userList',
            component: UserListComponent,
            canActivate: [AuthGuard]
          },
          {
            path: 'userManagement/workGroup',
            component: WorkGroupComponent,
            canActivate: [AuthGuard]
          },
          {
            path: 'userManagement/accessLevel',
            component: AccessLevelsComponent,
            canActivate: [AuthGuard]
          },
          {
            path: 'userManagement/userProfile',
            component: UserProfileComponent,
            canActivate: [AuthGuard]
          },
          {
            path: 'manual-entry',
            component: ManualEntryComponent,
            canActivate: [AuthGuard]
          },
          {
            path: 'alarm/alarms',
            component: AlarmsComponent,
            canActivate: [AuthGuard]
          },
          {
            path: 'alarm/alarmPriorityTypes',
            component: AlarmPriorityTypesComponent,
            canActivate: [AuthGuard]
          },
          {
            path: 'alarm/alarms/addorupdatealarms/:id',
            component: AlarmConfigurationComponent,
            canActivate: [AuthGuard]
          },
          {
            path: 'alarm/thresholds',
            component: ThresholdConfigComponent,
            canActivate: [AuthGuard]
          },
          {
            path: 'rule-engine',
            component: RuleEngineComponent,
            canActivate: [AuthGuard]
          },
          {
            path: 'business-rule',
            component: BusinessRuleComponent,
            canActivate: [AuthGuard]
          },
          {
            path: 'siteInfo',
            component: SitesComponent,
            canActivate: [AuthGuard]
          },
          {
            path: 'siteHierarchy',
            component: SitesComponent,
            canActivate: [AuthGuard]
          },
          {
            path: 'businessGroups/deviceGroups',
            component: DeviceGroupComponent,
            canActivate: [AuthGuard]
          },
          {
            path: 'businessGroups/tagGroups',
            component: TagGroupComponent,
            canActivate: [AuthGuard]
          },
          {
            path: 'vitualdevice',
            component: VirtualdeviceComponent,
            canActivate: [AuthGuard]
          },
          {
            path: 'virtualDeviceManualTag',
            component: VirtualdevicemanultagComponent,
            canActivate: [AuthGuard]
          },
          {
            path: 'shiftmanagement',
            component: ShiftManagementComponent,
            canActivate: [AuthGuard]
          },
          // { path: 'shiftmanagement/editshift', component: ShiftEditComponent },
          // { path: 'shiftmanagement/editshift/:id', component: ShiftEditComponent},
          {
            path: 'timeslotgroup',
            component: TimeSlotGroupComponent,
            canActivate: [AuthGuard]
          },
          {
            path: 'batchentry',
            component: BatchEntryComponent,
            canActivate: [AuthGuard]
          },
          {
            path: 'lookupconfiguration',
            component: LookupConfigurationComponent,
            canActivate: [AuthGuard]
          },
          // { path: 'lookupconfiguration/add', component: AddeditComponent },
          // { path: 'lookupconfiguration/edit/:id', component: AddeditComponent},
          // { path: 'lookup_tables/:id', component: LookupTablesComponent},
          {
            path: 'client-management',
            component: ClientManagementComponent,
            canActivate: [AuthGuard]
          },
          {
            path: 'masterConfig/gatewaymodel',
            component: GatewayModelComponent,
            canActivate: [AuthGuard]
          },
          {
            path: 'masterConfig/devicemodels',
            component: DeviceModelsComponent,
            canActivate: [AuthGuard]
          },
          // { path: 'masterConfig/parameters', component: ParametersComponent },
          {
            path: 'masterConfig/unitconverter',
            component: UnitConverterComponent,
            canActivate: [AuthGuard]
          },
          {
            path: 'masterConfig/parameters',
            component: MasterFormComponent,
            canActivate: [AuthGuard]
          },
          {
            path: 'masterConfig/deviceTypes',
            component: MasterFormComponent,
            canActivate: [AuthGuard]
          },
          {
            path: 'masterConfig/gatewayTypes',
            component: MasterFormComponent,
            canActivate: [AuthGuard]
          },
          {
            path: 'masterConfig/unit-master',
            component: MasterFormComponent,
            canActivate: [AuthGuard]
          },
          {
            path: 'masterConfig/function-code',
            component: MasterFormComponent,
            canActivate: [AuthGuard]
          },
          {
            path: 'masterConfig/aggregation-type',
            component: MasterFormComponent,
            canActivate: [AuthGuard]
          },
          {
            path: 'masterConfig/frequency-list',
            component: MasterFormComponent,
            canActivate: [AuthGuard]
          },
          {
            path: 'masterConfig/data-type',
            component: MasterFormComponent,
            canActivate: [AuthGuard]
          },
          {
            path: 'masterConfig/protocol-list',
            component: MasterFormComponent,
            canActivate: [AuthGuard]
          },
          {
            path: 'masterConfig/protocol-category',
            component: MasterFormComponent,
            canActivate: [AuthGuard]
          },
          {
            path: 'masterConfig/multiplicationFactors',
            component: MasterFormComponent,
            canActivate: [AuthGuard]
          },
          {
            path: 'masterConfig/emailGateway',
            component: EmailGatewayComponent,
            canActivate: [AuthGuard]
          },
          // { path: 'masterConfig/emailGateway/addemailGateway', component: AddeditemailgatewayComponent },
          // { path: 'masterConfig/emailGateway/editemailGateway/:id', component: AddeditemailgatewayComponent },
          {
            path: 'masterConfig/smsgateway',
            component: SmsGatewayComponent,
            canActivate: [AuthGuard]
          }
          // { path: 'masterConfig/smsgateway/addsmsgateway', component: AddeditsmsgatewayComponent,  canActivate: [AuthGuard]  },
          // { path: 'masterConfig/smsgateway/editsmsgateway/:id', component: AddeditsmsgatewayComponent,  canActivate: [AuthGuard]  },
        ]
      },
      {
        path: 'dashboard',
        component: DashboardComponent,
        canActivate: [AuthGuard]
      },
      {
        path: 'dashboard/:id',
        component: DashboardComponent,
        canActivate: [AuthGuard]
      },
      { path: 'license-management', component: LicenseManagementComponent },
      {
        path: 'configurations',
        component: ConfigurationsComponent,
        canActivate: [AuthGuard],
        children: [{ path: '', redirectTo: 'alarm/alarms' }]
      },
      { path: 'alarm-events', redirectTo: 'alarm-events/alarm' },
      {
        path: 'alarm-events/:type',
        component: AlarmEventsComponent,
        canActivate: [AuthGuard]
      },
      { path: 'image-library', component: ImagePickerComponent },
      // Backward compatibility of recharge page
      {
        path: 'pps',
        loadChildren: './pps/pps.module#PpsModule'
      },
      {
        path: 'dpage',
        loadChildren: './pps/pps.module#PpsModule'
      }
    ]
  },

  // Maintainence Pages Routers
  { path: '**', redirectTo: 'page-notfound', pathMatch: 'full' },
  { path: 'page-notfound', component: NotFoundComponent },
  { path: 'un-authorized', component: UnauthorizedComponent },
  { path: 'under-Construction', component: UnderConstructionComponent },
  { path: 'home', redirectTo: 'dashobard' }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class PagesRoutingModule {}
