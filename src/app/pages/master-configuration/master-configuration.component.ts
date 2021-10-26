import { Component, OnInit } from '@angular/core';
import { AppService } from '../../services/app.service';
@Component({
  selector: 'kl-master-configuration',
  templateUrl: './master-configuration.component.html',
  styleUrls: ['./master-configuration.component.scss']
})
export class MasterConfigurationComponent implements OnInit {
  public sideMenus: any;
  public heading = 'Configurations';

  constructor(private appservice: AppService) {}

  ngOnInit() {
    // this.getSidebarMenus();
  }

  // getSidebarMenus() {
  //   this.appservice.getLeftSideconfigData().subscribe((data) => {
  //     this.sideMenus = data.nodes;
  //   });
  // }
}
