import { Component, OnInit, Input, ViewChild } from '@angular/core';
import { NgModel, NgForm } from '@angular/forms';
import { AppService } from '../../../../../../services/app.service';

@Component({
  selector: 'kl-notificationprofile',
  templateUrl: './notificationprofile.component.html',
  styleUrls: ['./notificationprofile.component.scss']
})
export class NotificationprofileComponent implements OnInit {
  @Input() notificationProfiles:Array<any> = [];
  @Input() notificationTypes:Array<any> = [];
  isExpanded:boolean = true;
  @Input() usersGroup:Array<any> = [];
  isPushNotification: boolean;
  constructor() { }
  ngOnInit() {
  }

  deleteNotificationProfile(index:number){
    this.notificationProfiles.splice(index, 1);
  }

  addNotificationProfile(){
    this.notificationProfiles.splice(0, 0, {
      "usersOrUserGroup": [],
      "notificationProfile": [],
      "notificationTone": "",
      "isNotificationToneShow": false
    });
  }

  onNotificationProfileItemSelect(e:any, index:number){
    if(e.length > 0){
      for(let i = 0; i < e.length; i++){
        this.notificationProfiles[index]["isNotificationToneShow"] = e[i].label == "Push Notification" ? true : false;
        if(e[i].label == "Push Notification")
        { 
          this.isPushNotification = true;
          break; }
      }
    }
    else{
      this.onNotificationProfileClearAll(index);
    }
  }

  onNotificationProfileClearAll(index:number){
    this.notificationProfiles[index]["isNotificationToneShow"] = false;
    this.isPushNotification= false;
  }

  toggleExpandCollepseImg() {
    this.isExpanded = !this.isExpanded;
  }

}
