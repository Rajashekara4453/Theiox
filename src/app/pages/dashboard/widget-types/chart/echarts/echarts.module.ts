import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import * as echarts from 'echarts';
// import { graphic, registerMap } from 'echarts';
import { NgxEchartsModule } from 'ngx-echarts';

import { EchartsComponent } from './echarts.component';

import { EchartUtilityFunctions } from './utilityfunctions';

import { ELineComponent } from './e-line/e-line.component';
import { EBarComponent } from './e-bar/e-bar.component';
import { EPieComponent } from './e-pie/e-pie.component';
import { EScatterComponent } from './e-scatter/e-scatter.component';
import { EGaugeComponent } from './e-gauge/e-gauge.component';
import { ECustomComponent } from './e-custom/e-custom.component';
import { EAreaComponent } from './e-area/e-area.component';
import { EMarkerLineComponent } from './e-marker-line/e-marker-line.component';
import { ETreemapComponent } from './e-treemap/e-treemap.component';
import { EMarkerPointerComponent } from './e-marker-pointer/e-marker-pointer.component';
import { StackBarComponent } from './stack-bar/stack-bar.component';
import { BarTagComponent } from './bar-tag/bar-tag.component';
import { EPfComponent } from './e-pf/e-pf.component';

@NgModule({
  declarations: [
    EchartsComponent,
    ELineComponent,
    EBarComponent,
    EPieComponent,
    EScatterComponent,
    ETreemapComponent,
    EGaugeComponent,
    ECustomComponent,
    EAreaComponent,
    EMarkerLineComponent,
    EMarkerPointerComponent,
    StackBarComponent,
    BarTagComponent,
    EPfComponent
  ],
  imports: [
    CommonModule,
    NgxEchartsModule,
  ],
  exports: [
    EchartsComponent,
    ELineComponent,
    EBarComponent,
    EPieComponent,
    EScatterComponent,
    ETreemapComponent,
    EGaugeComponent,
    ECustomComponent,
    EAreaComponent,
    EMarkerLineComponent,
    EMarkerPointerComponent, 
    StackBarComponent
  ],
  providers: [
    EchartUtilityFunctions,
  ],
})
export class EchartsModule { }
