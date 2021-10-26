import { Component, OnInit, Input } from '@angular/core';
import { ToastrService } from '../../../../../components/toastr/toastr.service';

@Component({
  selector: 'kl-notificationlevel',
  templateUrl: './notificationlevel.component.html',
  styleUrls: ['./notificationlevel.component.scss']
})
export class NotificationlevelComponent implements OnInit {
  @Input() levels: Array<any> = [];
  // @Input() isCommandShow: boolean = false;
  @Input() isCommandShow:String = '';
  @Input() usersGroup: Array<any> = [];
  @Input() devices: Array<any> = [];
  @Input() tags: Array<any> = [];
  @Input() notificationTypes: Array<any> = [];
  @Input() alarmTriggerType: string;
  isExpanded: boolean = true;
  maxActionBlocksLimit = 4; // l that can be added
  constructor(private _toaster: ToastrService) { }

  ngOnInit() {
  }

  deleteLevel(index: number) {
    this.levels.splice(index, 1);
    if (this.levels.length == 0) this.addNewLevel();
  }

  toggleExpandCollepseImg() {
    this.isExpanded = !this.isExpanded;
  }

  addNewLevel() {
    if (this.levels.length > (this.maxActionBlocksLimit - 1)) {
      this._toaster.toast('warning', 'Warning', "Maximum actions limit reached", true)
      return;
    }
    this.levels.splice(0, 0, {
      "suppress": "00:00",
      "notificationProfiles": [
        {
          "usersOrUserGroup": "",
          "notificationProfile": "",
          "notificationTone": ""
        }
      ],
      "commands": []
    });
  }

}
