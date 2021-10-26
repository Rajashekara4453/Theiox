import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DashboardComponent } from './dashboard.component';
import { WdgShowComponent } from './widget-manager/wdg-show/wdg-show.component';
import { WdgCreateComponent } from './widget-manager/wdg-create/wdg-create.component';
import { WidgetManagerComponent } from './widget-manager/widget-manager.component';
import { ConfigDirective } from './widget-manager/wdg-create/directives/configPannel.directive';
import { WdgDisplayComponent } from './widget-manager/wdg-display/wdg-display.component';
import { DashboardTilesComponent } from './widget-types/tiles/dashboard-tiles/dashboard-tiles.component';
import { LiveChartConfigComponent } from './widget-manager/wdg-create/live-chart-config/live-chart-config.component';
import { CustomMultiselectComponent } from './custom-multiselect/custom-multiselect.component';
import { CustomHierarchyComponent } from './custom-hierarchy/custom-hierarchy.component';
import { ComponentsModule } from '../../components/components.module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { NgSelectModule } from '@ng-select/ng-select';
import { AngularDateTimePickerModule } from 'angular2-datetimepicker';
import { TreeModule } from 'angular-tree-component';
import { FlexiTileComponent } from './widget-types/flexi-tile/flexi-tile.component';
import { EchartsModule } from './widget-types/chart/echarts/echarts.module';
import { MapsComponent } from './widget-types/maps/maps.component';
import { AgmCoreModule } from '@agm/core';
import { AngularMultiSelectModule } from 'angular2-multiselect-dropdown';
import { FormatDate } from '../../utilities/pipes/formatDate.pipe';
import { NormalTileComponent } from './widget-types/normalTile/normal-tile/normal-tile.component';
import { PueKpiComponent } from './widget-types/PUE-kpi/pue-kpi/pue-kpi.component';
import { BasicChartConfigComponent } from './widget-manager/wdg-create/basic-chart-config/basic-chart-config.component';
import { WriteModBusComponent } from './widget-types/write-mod-bus/write-mod-bus.component';
import { HorizontalVerticalBarComponent } from './widget-types/horizontal-vertical-bar/horizontal-vertical-bar.component';
import { AssetModBusComponent } from './widget-types/asset-mod-bus/asset-mod-bus.component';
import { AgmJsMarkerClustererModule } from '@agm/js-marker-clusterer';
import { MapLiveComponent } from './widget-types/maps/live/map-live.component';

@NgModule({
    declarations: [
        // Dashboard
        DashboardComponent,
        WdgShowComponent,
        WdgCreateComponent,
        WidgetManagerComponent,
        ConfigDirective,
        WdgDisplayComponent,
        FormatDate,
        DashboardTilesComponent,
        BasicChartConfigComponent,
        LiveChartConfigComponent,
        CustomMultiselectComponent,
        CustomHierarchyComponent,
        FlexiTileComponent,
        // CommonTableComponent,
        MapsComponent,
        NormalTileComponent,
        PueKpiComponent,
        WriteModBusComponent,
        HorizontalVerticalBarComponent,
        AssetModBusComponent,
        MapLiveComponent
    ],
    imports: [
        CommonModule,
        EchartsModule,
        ComponentsModule,
        FormsModule,
        ReactiveFormsModule,
        FontAwesomeModule,
        NgSelectModule,
        AngularDateTimePickerModule,
        AngularMultiSelectModule,
        TreeModule,
        AgmJsMarkerClustererModule,
        // ScrollingModule,
        AgmCoreModule.forRoot({
            apiKey: 'AIzaSyDfU4iulAU5yenJbxUnFtTV6qdvQZmAsLs'
          })
        ]
})
export class DashboardModule { }
