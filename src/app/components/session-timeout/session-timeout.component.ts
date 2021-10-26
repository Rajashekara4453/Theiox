import { Component, OnInit } from '@angular/core';
import { UtilityFunctions } from '../../../app/utilities/utility-func';
import { globals } from '../../../app/utilities/globals';
import { AppTokenService } from '../../services/app-token.service';

@Component({
  selector: 'kl-session-timeout',
  templateUrl: './session-timeout.component.html',
  styleUrls: ['./session-timeout.component.scss']
})
export class SessionTimeoutComponent implements OnInit {
  isPopUpOpen = false;

  constructor(
    private _util: UtilityFunctions,
    private global: globals,
    private _appTokenService: AppTokenService
  ) {}

  ngOnInit() {}
  ngDoCheck() {
    // if (this._util.isSessionTimeOut && !this.isPopUpOpen) {
    //   this.global.openModal();
    //   document.getElementById('sessionModal').style.display = "block";
    //   this.isPopUpOpen = true;
    // }
    if (this._util.isSessionTimeOut) {
      //  this.global.logout();
      this._appTokenService.logout();
    }
  }

  confirmSessionTimeOut() {
    this._util.isSessionTimeOut = false;
    this.isPopUpOpen = false;
    this.global.closeModal();
    // this.global.logout();
    this._appTokenService.logout();
  }
}
