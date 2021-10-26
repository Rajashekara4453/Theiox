import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PpsRoutingModule } from './pps-routing.module';
import { ComponentsModule } from './../../components/components.module';
import { PpsComponent } from './pps.component';
import { ConfiguratorComponent } from './configurator/configurator.component';
import { FormsModule } from '@angular/forms';
import { AngularMultiSelectModule } from 'angular2-multiselect-dropdown';
import { ListviewComponent } from './listview/listview.component';
import { DynamicPagesComponent } from './dynamic-pages/dynamic-pages.component';

@NgModule({
  declarations: [
    PpsComponent,
    ConfiguratorComponent,
    ListviewComponent,
    DynamicPagesComponent
  ],
  imports: [
    CommonModule,
    PpsRoutingModule,
    ComponentsModule,
    FormsModule,
    AngularMultiSelectModule
  ]
})
export class PpsModule {}
