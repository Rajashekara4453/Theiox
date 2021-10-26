import { NgModule } from '@angular/core';
import { CommonModule, PlatformLocation, Location } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { OwlDateTimeModule, OwlNativeDateTimeModule } from 'ng-pick-datetime';
import { PagesRoutingModule } from './pages-routing.module';
import { LoginComponent } from './login/login.component';
import { TreeModule } from 'angular-tree-component';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { library } from '@fortawesome/fontawesome-svg-core';
import { far } from '@fortawesome/free-regular-svg-icons';
import { fas } from '@fortawesome/free-solid-svg-icons';
library.add(fas, far);

// Configurations
import { DeviceModelsComponent } from './master-configuration/device-models/device-models.component';
// channel configuraion
import { GatewayInstanceComponent } from './channel-configuration/gateway-instance/gateway-instance.component';
import { GatewayConfigurationComponent } from './channel-configuration/gateway-instance/gateway-configuration/gateway-configuration.component';
import { DeviceInstanceComponent } from './channel-configuration/device-instance/device-instance.component';
import { DeviceConfigurationComponent } from './channel-configuration/device-instance/device-configuration/device-configuration.component';
import { DeviceComponent } from './channel-configuration/device-instance/device/device.component';
// Alarm Configurations

// Master Configurations

// channel configuraion
import { ComponentsModule } from '../components/components.module';
import { AppService } from '../services/app.service';
import { AngularDateTimePickerModule } from 'angular2-datetimepicker';
import { AngularMultiSelectModule } from 'angular2-multiselect-dropdown';
import { NgSelectModule } from '@ng-select/ng-select';
import { MonacoEditorModule } from 'ngx-monaco-editor';
import { Config } from '../config/config';
import { PagesComponent } from './pages.component';
import { GatewayModelComponent } from './master-configuration/gateway-model/gateway-model.component';
import { ScrollingModule } from '@angular/cdk/scrolling';
// import { SelectModule } from 'angular2-select';
// import { OperatorModule } from 'operator';
import { DashboardModule } from './dashboard/dashboard.module';
import { ConfigurationsComponent } from './configurations/configurations.component';
import { NgMultiSelectDropDownModule } from 'ng-multiselect-dropdown';
import { from } from 'rxjs';
import { AlarmConfigurationComponent } from './configurations/alarm-configurations/alarm-configuration/alarm-configuration.component';
import { RulesetComponent } from './configurations/alarm-configurations/alarm-configuration/ruleset/ruleset.component';
import { RulesComponent } from './configurations/alarm-configurations/alarm-configuration/ruleset/rules/rules.component';
import { NotificationlevelComponent } from './configurations/alarm-configurations/alarm-configuration/notificationlevel/notificationlevel.component';
import { NotificationprofileComponent } from './configurations/alarm-configurations/alarm-configuration/notificationlevel/notificationprofile/notificationprofile.component';
import { AlarmTriggersComponent } from './configurations/alarm-configurations/alarm-configuration/notificationlevel/alarm-triggers/alarm-triggers.component';
import { AlarmPriorityTypesComponent } from './configurations/alarm-configurations/alarm-priority-types/alarm-priority-types.component';
import { ThresholdConfigComponent } from './configurations/alarm-configurations/threshold-config/threshold-config.component';
import { AlarmFilterPipe } from '../utilities/pipes/pipes';
import { MinuteSecondInputsComponent } from './configurations/alarm-configurations/minute-second-inputs/minute-second-inputs.component';
import { ColorPickerComponent } from './configurations/alarm-configurations/color-picker/color-picker.component';
import { RuleEngineComponent } from './configurations/rule-engine/rule-engine.component';
import { AlarmsComponent } from './configurations/alarm-configurations/alarms/alarms.component';
import { CalcBuilderComponent } from '../components/calc-builder/calc-builder.component';
import { DashboardComponent } from './dashboard/dashboard.component';
import { DashboardTilesComponent } from './dashboard/widget-types/tiles/dashboard-tiles/dashboard-tiles.component';
// import { AlarmEventsComponent } from '../components/alarm-events/alarm-events.component';
import { DataSharingService } from '../services/data-sharing.service';
// import { DataSharingService } from '../services/data-sharing.service';
import { ChannelConfigurationComponent } from './channel-configuration/channel-configuration.component';
import { GatewaysearchComponent } from './channel-configuration/gateway-instance/gateway-configuration/gatewaysearch/gatewaysearch.component';
import { DeviceSearchComponent } from './channel-configuration/device-instance/device-search/device-search.component';
import { VirtualdeviceComponent } from './configurations/virtualdevice/virtualdevice.component';
// import { VirtualdevicemanultagComponent } from './configurations/virtualdevicemanultag/virtualdevicemanultag.component';
import { UnitConverterComponent } from './master-configuration/unit-converter/unit-converter.component';
import { MasterConfigurationComponent } from './master-configuration/master-configuration.component';
import { ShiftManagementComponent } from './configurations/time-slot/shift-management/shift-management.component';
import { TimeSlotGroupComponent } from './configurations/time-slot/time-slot-group/time-slot-group.component';
import { BatchEntryComponent } from './configurations/batch-entry/batch-entry.component';
import { LookupConfigurationComponent } from './configurations/lookup-configuration/lookup-configuration.component';
import { AddeditComponent } from './configurations/lookup-configuration/addedit/addedit.component';
import { ShiftEditComponent } from './configurations/time-slot/shift-edit/shift-edit.component';
import { MasterFormComponent } from './master-configuration/master-form/master-form.component';
import { ElmeasureFilterPipe } from '../utilities/pipes/search-filter.pipe';
import { LicenseManagementComponent } from './license-management/license-management.component';
import { UnderConstructionComponent } from './maintenance/under-construction/under-construction.component';
import { UnauthorizedComponent } from './maintenance/unauthorized/unauthorized.component';
import { NotFoundComponent } from './maintenance/not-found/not-found.component';
import { LookupTablesComponent } from './configurations/lookup-configuration/lookup-tables/lookup-tables.component';
import { SitesComponent } from './configurations/sites/sites.component';
import { DeviceGroupComponent } from './configurations/business-groups/device-group/device-group.component';
import { TagGroupComponent } from './configurations/business-groups/tag-group/tag-group.component';
import { EmailGatewayComponent } from './master-configuration/email-gateway/email-gateway.component';
import { AddeditemailgatewayComponent } from './master-configuration/email-gateway/addeditemailgateway/addeditemailgateway.component';
import { SmsGatewayComponent } from './master-configuration/sms-gateway/sms-gateway.component';
import { AddeditsmsgatewayComponent } from './master-configuration/sms-gateway/addeditsmsgateway/addeditsmsgateway.component';
import { VirtualdevicemanultagComponent } from './configurations/virtualdevicemanultag/virtualdevicemanultag.component';
// import { EngineerModule } from 'engineer';
import { ManualEntryComponent } from './configurations/manual-entry/manual-entry.component';
import { UserListComponent } from './configurations/user-management/user-list/user-list.component';
import { WorkGroupComponent } from './configurations/user-management/work-group/work-group.component';
import { AccessLevelsComponent } from './configurations/user-management/access-levels/access-levels.component';
import { UserProfileComponent } from './configurations/user-management/user-profile/user-profile.component';

// import { SelectModule } from 'angular2-select';
import { RegisterComponent } from './register/register.component';
import { ClientManagementComponent } from './configurations/client-management/client-management.component';
import { BusinessRuleComponent } from './configurations/business-rule/business-rule.component';
import { PasswordStrengthMeterModule } from 'angular-password-strength-meter';
import { ScadaComponent } from './scada/scada.component';
import { AssestControlListComponent } from './assest-control-list/assest-control-list.component';
import { AssetControlComponent } from './assest-control-list/asset-control/asset-control.component';
import { AssetControlFilter } from './assest-control-list/asset-control-filter';
import { VersionComponent } from './version/version.component';
import { ActivitylogComponent } from './activitylog/activitylog.component';
// import { AccessMenuService } from '../services/access-menu.service';
@NgModule({
  declarations: [
    DeviceModelsComponent,
    GatewayInstanceComponent,
    GatewayConfigurationComponent,
    DeviceInstanceComponent,
    DeviceComponent,
    DeviceConfigurationComponent,
    PagesComponent,
    // Alarm Configurations

    // Master Configurations

    // Channel Configuration
    LoginComponent,
    ConfigurationsComponent,
    UserListComponent,
    WorkGroupComponent,
    AccessLevelsComponent,
    UserProfileComponent,
    ManualEntryComponent,
    LicenseManagementComponent,
    GatewayModelComponent,
    GatewaysearchComponent,
    DeviceSearchComponent,
    ChannelConfigurationComponent,
    DeviceSearchComponent,
    VirtualdeviceComponent,
    VirtualdevicemanultagComponent,
    LookupConfigurationComponent,
    AddeditComponent,
    TimeSlotGroupComponent,
    BatchEntryComponent,
    UnitConverterComponent,
    LicenseManagementComponent,
    LoginComponent,
    ConfigurationsComponent,
    MasterConfigurationComponent,
    ShiftManagementComponent,
    ShiftEditComponent,
    MasterFormComponent,
    // ElmeasureFilterPipe,
    NotFoundComponent,
    UnauthorizedComponent,
    UnderConstructionComponent,
    // Alarm Configurations
    AlarmsComponent,
    AlarmConfigurationComponent,
    RulesetComponent,
    RulesComponent,
    NotificationlevelComponent,
    NotificationprofileComponent,
    AlarmTriggersComponent,
    AlarmPriorityTypesComponent,
    ThresholdConfigComponent,
    AlarmFilterPipe,
    MinuteSecondInputsComponent,
    ColorPickerComponent,
    // Configuration
    RuleEngineComponent,
    // AlarmEventsComponent,
    LookupTablesComponent,
    SitesComponent,
    DeviceGroupComponent,
    TagGroupComponent,
    EmailGatewayComponent,
    AddeditemailgatewayComponent,
    SmsGatewayComponent,
    AddeditsmsgatewayComponent,
    NotFoundComponent,
    RegisterComponent,
    ClientManagementComponent,
    BusinessRuleComponent,
    ScadaComponent,
    AssestControlListComponent,
    AssetControlComponent,
    AssetControlFilter,
    VersionComponent,
    ActivitylogComponent
  ],
  imports: [
    CommonModule,
    HttpClientModule,
    PagesRoutingModule,
    TreeModule,
    ComponentsModule,
    FormsModule,
    ReactiveFormsModule,
    FontAwesomeModule,
    AngularDateTimePickerModule,
    OwlDateTimeModule,
    OwlNativeDateTimeModule,
    AngularMultiSelectModule,
    NgSelectModule,
    ScrollingModule,
    ScrollingModule,
    // EngineerModule, // component library for SLD
    // OperatorModule,
    DashboardModule,
    PasswordStrengthMeterModule
  ],
  providers: [AppService]
})
export class PagesModule {}
