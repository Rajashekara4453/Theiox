import { BrowserModule, Title } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { HashLocationStrategy, LocationStrategy } from '@angular/common';
import { AppComponent } from './app.component';
import { AppRoutingModule } from './app-routing.module';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { HttpRequestInterceptor } from './services/http-interceptor';

import { AuthGuard } from './pages/auth/auth.guard';
import { UtilityFunctions } from './utilities/utility-func';
import { ChannelConfigurationService } from './services/channelconfiguration.service';
import { globals } from './utilities/globals';
import { DataSharingService } from './services/data-sharing.service';

import { ToasterModule, ToasterService } from 'angular2-toaster';
import { ToastrComponent } from './components/toastr/toastr.component';
import { PasswordStrength } from './pages/login/password-strength';
import { AccessMenuService } from './services/access-menu.service';
import { JWTService } from './services/JWT.service';
import { AppTokenService } from './services/app-token.service';
import { ServiceWorkerModule } from '@angular/service-worker';
import { environment } from '../environments/environment';
import { PwaAppUpdateService } from './services/pwa-app-update.service';
@NgModule({
  declarations: [AppComponent, ToastrComponent],
  imports: [
    ReactiveFormsModule,
    BrowserModule,
    FormsModule,
    HttpClientModule,
    BrowserAnimationsModule,
    AppRoutingModule,
    ToasterModule,
    ServiceWorkerModule.register('ngsw-worker.js', {
      enabled: environment.production
    })
  ],
  exports: [ToastrComponent],
  providers: [
    ToasterService,
    {
      provide: HTTP_INTERCEPTORS,
      useClass: HttpRequestInterceptor,
      multi: true
    },
    {
      provide: LocationStrategy,
      useClass: HashLocationStrategy
    },
    AuthGuard,
    UtilityFunctions,
    globals,
    PasswordStrength,
    DataSharingService,
    AccessMenuService,
    JWTService,
    AppTokenService,
    Title,
    PwaAppUpdateService
  ],
  bootstrap: [AppComponent]
})
export class AppModule {}
