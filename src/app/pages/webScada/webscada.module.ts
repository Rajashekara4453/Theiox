import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PreviewComponent } from './preview/preview.component';
import { WebScadaComponent } from './webscada.component';
import { WebscadaRoutingModule } from './webscada-routing.module';

import { FormsModule } from '@angular/forms';

import { ComponentsModule } from './../../components/components.module';
import { EditorComponent } from './editor/editor.component';
import { ScadaLiveConfigurationComponent } from './editor/scada-live-configuration/scada-live-configuration.component';
import { NgSelectModule } from '@ng-select/ng-select';
import { ScadaAssetControlComponent } from './editor/scada-asset-control/scada-asset-control.component';
import { AngularMultiSelectModule } from 'angular2-multiselect-dropdown';
import { CanDeactivateGuardService } from './can-deactivate-guard.service';

@NgModule({
  declarations: [WebScadaComponent, PreviewComponent, EditorComponent, ScadaLiveConfigurationComponent, ScadaAssetControlComponent],
  imports: [
    CommonModule,
    WebscadaRoutingModule,
    ComponentsModule,
    FormsModule,
    NgSelectModule,
    AngularMultiSelectModule
  ],
  exports:[
    WebScadaComponent,
    ScadaLiveConfigurationComponent,
  ],
  providers:[CanDeactivateGuardService]
})
export class WebscadaModule { }
