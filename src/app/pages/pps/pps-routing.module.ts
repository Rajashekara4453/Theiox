import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { ConfiguratorComponent } from './configurator/configurator.component';
import { AuthGuard } from '../auth/auth.guard';
import { ListviewComponent } from './listview/listview.component';
import { DynamicPagesComponent } from './dynamic-pages/dynamic-pages.component';
import { DynamicFiltersComponent } from '../../components/dynamic-filters/dynamic-filters.component';

const routes: Routes = [
  {
    path: 'configurator',
    component: ConfiguratorComponent,
    canActivate: [AuthGuard]
  },
  {
    path: 'meterforms/:page',
    component: DynamicPagesComponent,
    canActivate: [AuthGuard]
  },
  {
    path: 'dform/:module/:page',
    component: DynamicPagesComponent,
    canActivate: [AuthGuard]
  },
  {
    path: 'meterlists/:page',
    component: ListviewComponent,
    canActivate: [AuthGuard]
  },
  {
    path: 'filterPages/:pageType',
    component: DynamicFiltersComponent,
    canActivate: [AuthGuard]
  }
];

@NgModule({
  declarations: [],
  imports: [CommonModule, RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class PpsRoutingModule {}
