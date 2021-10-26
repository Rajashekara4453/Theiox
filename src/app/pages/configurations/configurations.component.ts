import { Component, OnInit } from '@angular/core';
import { AppService } from '../../services/app.service';
import { globals } from '../../utilities/globals';

@Component({
  selector: 'kl-configurations',
  templateUrl: './configurations.component.html',
  styleUrls: ['./configurations.component.scss']
})
export class ConfigurationsComponent implements OnInit {
  public sideMenus: any;
  public heading = 'Configurations';

  // Variable for Multi-tenant model
  deploymentMode: string = 'EL';
  endPointExt: any;

  constructor(private appservice: AppService, private _globals: globals) {}

  ngOnInit() {
    this.checkDeploymentMode();
    // this.getSidebarMenus();
  }

  checkDeploymentMode() {
    //  Endpoint extensions && Deployment Mode
    this.deploymentMode = this._globals.deploymentMode;
    this.endPointExt = this._globals.deploymentModeAPI;
  }

  getSidebarMenus() {
    this.appservice
      .getLeftSideBarConfigurationsData(
        'default',
        this.deploymentMode,
        this.endPointExt
      )
      .subscribe((data) => {
        if (this.deploymentMode === 'EL') {
          this.sideMenus = data[0].data.nodes;
        } else if (this.deploymentMode === 'KL') {
          this.sideMenus = data.nodes;
        }
      });
  }

  // event: MouseEvent;
  //   clientX = 0;
  //   clientY = 0;

  //   onEvent(event: MouseEvent): void {
  //       this.event = event;
  //   }

  //   coordinates(event: MouseEvent): void {
  //
  //     this.clientX = event.clientX;
  //     this.clientY = event.clientY;
  //   }
}
