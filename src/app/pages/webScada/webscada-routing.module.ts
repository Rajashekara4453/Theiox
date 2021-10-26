import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AuthGuard } from '../auth/auth.guard';
import { CanDeactivateGuardService } from './can-deactivate-guard.service';
import { WebScadaComponent } from './webscada.component';


const routes: Routes = [
      { path: '', component: WebScadaComponent, canActivate: [AuthGuard], canDeactivate: [CanDeactivateGuardService]}
];

@NgModule({
  declarations: [],
  imports: [
    RouterModule.forChild(routes)
  ],
  exports:[RouterModule],

})
export class WebscadaRoutingModule { }
