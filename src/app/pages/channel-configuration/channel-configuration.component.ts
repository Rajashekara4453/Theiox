import { Component, OnInit } from '@angular/core';
import { ChannelConfigurationService } from '../../services/channelconfiguration.service';
import { ActivatedRoute, Router } from '@angular/router';
@Component({
  selector: 'kl-channel-configuration',
  templateUrl: './channel-configuration.component.html',
  styleUrls: ['./channel-configuration.component.scss']
})
export class ChannelConfigurationComponent implements OnInit {
  // Variable Declarations
  Silo = false;
  deviceInstance = false;
  constructor(
    public dataService: ChannelConfigurationService,
    private _router: Router,
    private route: ActivatedRoute
  ) {}
  queryParam: string = '';
  ngOnInit() {
    this.route.queryParams.subscribe((params) => {
      if (Object.keys(params).length === 0) {
        if (this.deviceInstance) {
        } else {
          this.Silo = true;
          this.deviceInstance = false;
          this._router.navigate(['configurations/gatewayDevices/gatewaylist'], {
            queryParams: { gateway: 'All' }
          });
        }
      } else if (params.gateway) {
        this.Silo = true;
        this.deviceInstance = false;
        this._router.navigate(['configurations/gatewayDevices/gatewaylist'], {
          queryParams: { gateway: params.gateway }
        });
      } else if (params.sensor) {
        this._router.navigate(
          ['configurations/gatewayDevices/gatewaylist/gateway_instance_all'],
          { queryParams: { sensor: params.sensor } }
        );
        this.Silo = false;
        this.deviceInstance = true;
      }
    });
  }
  onEdit($event) {
    if ($event === 'gateway_instance_all') {
      this._router.navigate(
        ['configurations/gatewayDevices/gatewaylist/gateway_instance_all'],
        { queryParams: { sensor: 'All' } }
      );
    } else {
      this._router.navigate([
        'configurations/gatewayDevices/gatewaylist/' + $event
      ]);
    }
    this.Silo = false;
    this.deviceInstance = true;
  }
  onSiloView($event) {
    this.Silo = true;
    this.deviceInstance = false;
    this._router.navigate(['configurations/gatewayDevices/gatewaylist']);
  }
  routeToDeviceScreen(value) {
    this.dataService.holdFilterValueForSensor = value;
    this._router.navigate(
      ['configurations/gatewayDevices/gatewaylist/gateway_instance_all'],
      { queryParams: { sensor: value } }
    );
  }
}
