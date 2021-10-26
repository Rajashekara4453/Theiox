import { NgModule } from '@angular/core';
import { CommonModule, PlatformLocation, Location } from '@angular/common';
import { LeftSideBarComponent } from './sidebar/left-side-bar/left-side-bar.component';
import { PagesRoutingModule } from '../pages/pages-routing.module';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { ScrollingModule } from '@angular/cdk/scrolling';
import { MenubarComponent } from './menubar/menubar.component';
import { MultiDivMenubarComponent } from './menubar/multidivmenubar/multidivmenubar.component';
import { TreeModule } from 'angular-tree-component';
import { OwlDateTimeModule, OwlNativeDateTimeModule } from 'ng-pick-datetime';
import { HeaderComponent } from './header/header.component';
import { BreadcrumbComponent } from './breadcrumb/breadcrumb.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { DragDropModule } from '@angular/cdk/drag-drop';
// import { ToastrComponent } from './toastr/toastr.component';
import { PinHeaderComponent } from './header/pin-header/pin-header.component';
import { DeviceBlockComponent } from './device-block/device-block.component';
import { DeviceMenubarComponent } from './menubar/device-menubar/device-menubar.component';
import { DfmComponent } from './dfm/dfm.component';
import { DashboardSidebarComponent } from './sidebar/dashboard-sidebar/dashboard-sidebar.component';
import { WizardComponent } from './wizard/wizard.component';
import { AngularDateTimePickerModule } from 'angular2-datetimepicker';
import { library } from '@fortawesome/fontawesome-svg-core';
import { far } from '@fortawesome/free-regular-svg-icons';
import { fas } from '@fortawesome/free-solid-svg-icons';
import { AngularMultiSelectModule } from 'angular2-multiselect-dropdown';
import { NumbersOnlyDirective } from '../utilities/directives/numbers-only.directive';
import { EmailValidatorDirective } from '../utilities/directives/email-validator.directive';
import { GridModule } from './tables/grid/grid.module';
import { GridComponent } from './tables/grid/grid.component';
import { DashboardFiltersComponent } from './filters/dashboard-filters/dashboard-filters.component';
import { CalcBuilderComponent } from './calc-builder/calc-builder.component';
import {
  MonacoEditorModule,
  NGX_MONACO_EDITOR_CONFIG,
  NgxMonacoEditorConfig
} from 'ngx-monaco-editor';
import { Config } from '../config/config';
import { NameFieldDirectiveDirective } from '../utilities/directives/name-field-directive.directive';
library.add(fas, far);

import { DatePickerComponent } from './filters/date-picker/date-picker.component';
import { ServiceloaderComponent } from './loader/serviceloader/serviceloader.component';
import { NgSelectModule } from '@ng-select/ng-select';
import { ConfigBreadcrumbComponent } from './breadcrumb/config-breadcrumb/config-breadcrumb.component';
import { MultiselectComponent } from './multiselect/multiselect.component';
import { NgMultiSelectDropDownModule } from 'ng-multiselect-dropdown';
import { PinSidebarComponent } from './sidebar/pin-sidebar/pin-sidebar.component';
import { MiniSidebarMenuComponent } from './sidebar/mini-sidebar-menu/mini-sidebar-menu.component';
import { FilterPipe } from '../utilities/pipes/pipes.pipe';
import * as $ from 'jquery';
import { SearchPipe } from '../utilities/pipes/search.pipe';
import { PinFilterComponent } from './filters/pin-filter/pin-filter.component';
import { ProgressBarComponent } from './progress-bar/progress-bar.component';
import { SessionTimeoutComponent } from './session-timeout/session-timeout.component';
import { GridstackModule } from './gridstack/public_api';
import { LazyForDirective } from '../utilities/directives/lazy-for.directive';
import { ElmeasureFilterPipe } from '../utilities/pipes/search-filter.pipe';
// import { CustomHierarchyComponent } from './custom-hierarchy/custom-hierarchy.component';
import { VersionsInfoComponent } from './header/versions-info/versions-info.component';
import { CustomTreeComponent } from './custom-tree/custom-tree.component';
import { SidebarComponent } from './sidebar/sidebar/sidebar.component';
import { SidebarSearchPipe } from './sidebar/sidebar/sidebar-search.pipe';
import { CommonTableComponent } from './tables/common-table/common-table.component';
import { AlarmEventsComponent } from './alarm-events/alarm-events.component';
import { ChipsComponent } from './chips/chips.component';
import { ImagePickerComponent } from './image-picker/image-picker.component';
import { ImageSearchPipe } from './image-picker/image-search.pipe';
import { ImagePickerClickListenerDirective } from './image-picker/image-picker-click-listener.directive';
import { AssetControlMoreInfoComponent } from './asset-control-more-info/asset-control-more-info.component';
import { AssetControlHistoryComponent } from './asset-control-history/asset-control-history.component';
import { PasswordVisibiltyDirective } from '../utilities/directives/password-visibilty.directive';
import { ScadaModalsComponent } from './scada-modals/scada-modals.component';
import { SnmpComponent } from './snmp/snmp.component';
import { DynamicFiltersComponent } from './dynamic-filters/dynamic-filters.component';
library.add(fas, far);
@NgModule({
  declarations: [
    HeaderComponent,
    PinHeaderComponent,
    DfmComponent,
    BreadcrumbComponent,
    DashboardSidebarComponent,
    DashboardFiltersComponent,
    FilterPipe,
    LeftSideBarComponent,
    MenubarComponent,
    MultiDivMenubarComponent,
    WizardComponent,
    ServiceloaderComponent,
    DatePickerComponent,
    ServiceloaderComponent,
    // ToastrComponent,
    ConfigBreadcrumbComponent,
    MultiselectComponent,
    DeviceBlockComponent,
    DeviceMenubarComponent,
    FilterPipe,
    PinSidebarComponent,
    MiniSidebarMenuComponent,
    NumbersOnlyDirective,
    EmailValidatorDirective,
    PinFilterComponent,
    FilterPipe,
    DashboardFiltersComponent,
    PinFilterComponent,
    SearchPipe,
    DatePickerComponent,
    CalcBuilderComponent,
    NameFieldDirectiveDirective,
    EmailValidatorDirective,
    NumbersOnlyDirective,
    ProgressBarComponent,
    SessionTimeoutComponent,
    DfmComponent,
    LazyForDirective,
    ElmeasureFilterPipe,
    // CustomHierarchyComponent,
    VersionsInfoComponent,
    CustomTreeComponent,
    SidebarComponent,
    SidebarSearchPipe,
    CommonTableComponent,
    AlarmEventsComponent,
    ChipsComponent,
    ImagePickerComponent,
    ImageSearchPipe,
    ImagePickerClickListenerDirective,
    AssetControlMoreInfoComponent,
    AssetControlHistoryComponent,
    PasswordVisibiltyDirective,
    ScadaModalsComponent,
    SnmpComponent,
    DynamicFiltersComponent
  ],
  imports: [
    CommonModule,
    FontAwesomeModule,
    FormsModule,
    ReactiveFormsModule,
    DragDropModule,
    // ToasterModule,
    TreeModule.forRoot(),
    AngularDateTimePickerModule,
    // PagesRoutingModule,
    NgSelectModule,
    NgMultiSelectDropDownModule,
    AngularMultiSelectModule,
    OwlDateTimeModule,
    OwlNativeDateTimeModule,
    ScrollingModule,
    MonacoEditorModule.forRoot(),
    GridstackModule.forRoot(),
    ScrollingModule
  ],
  exports: [
    GridstackModule,
    HeaderComponent,
    BreadcrumbComponent,
    ConfigBreadcrumbComponent,
    DfmComponent,
    DashboardSidebarComponent,
    DashboardFiltersComponent,
    LeftSideBarComponent,
    MenubarComponent,
    MultiDivMenubarComponent,
    WizardComponent,
    ServiceloaderComponent,
    // ToastrComponent,
    MultiselectComponent,
    PinSidebarComponent,
    MiniSidebarMenuComponent,
    DeviceBlockComponent,
    DragDropModule,
    DeviceMenubarComponent,
    FilterPipe,
    NumbersOnlyDirective,
    EmailValidatorDirective,
    GridModule,
    CalcBuilderComponent,
    DatePickerComponent,
    NameFieldDirectiveDirective,
    SearchPipe,
    ProgressBarComponent,
    SessionTimeoutComponent,
    DfmComponent,
    LazyForDirective,
    ElmeasureFilterPipe,
    CustomTreeComponent,
    SidebarComponent,
    ScrollingModule,
    CommonTableComponent,
    AlarmEventsComponent,
    ChipsComponent,
    ImagePickerComponent,
    ImageSearchPipe,
    ImagePickerClickListenerDirective,
    AssetControlHistoryComponent,
    AssetControlMoreInfoComponent,
    PasswordVisibiltyDirective,
    ScadaModalsComponent,
    SnmpComponent,
    DynamicFiltersComponent
  ],
  providers: [
    {
      provide: NGX_MONACO_EDITOR_CONFIG,
      useFactory: getMonacoConfig,
      deps: [PlatformLocation]
    }
  ]
})
export class ComponentsModule {}
export function getMonacoConfig(
  platformLocation: PlatformLocation
): NgxMonacoEditorConfig {
  const baseHref = platformLocation.getBaseHrefFromDOM();

  return {
    baseUrl: Location.joinWithSlash(baseHref, '/assets'),
    onMonacoLoad: () => {
      monaco.languages.register({
        id: 'newlang'
      });
      const colorCodes = [
        {
          token: 'custom-keywords',
          foreground: '000000'
        }
      ];
      for (const color of Config.COLOR_LIST) {
        colorCodes.push({
          token: String(color),
          foreground: String(color)
        });
      }

      monaco.editor.defineTheme('myCoolTheme', {
        base: 'vs',
        inherit: false,
        rules: colorCodes,
        colors: {}
      });
    } // here monaco object will be available as window.monaco use this function to extend monaco editor functionality.
  };
}
