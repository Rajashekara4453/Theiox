import { Component, Input, OnInit, SimpleChanges, EventEmitter, Output } from '@angular/core';
import { globals } from '../../../../utilities/globals';
import { EchartUtilityFunctions } from '../chart/echarts/utilityfunctions';
@Component({
  selector: 'kl-write-mod-bus',
  templateUrl: './write-mod-bus.component.html',
  styleUrls: ['./write-mod-bus.component.scss']
})
export class WriteModBusComponent implements OnInit {
  @Input() vData;
  @Output() modebusEmitter: EventEmitter<any> = new EventEmitter<any>();
  powerIconColor: string = "#C9CECF";
  labelUnit: any;
  powerIconLabel: string = '';
  isShowLabel: boolean = false;
  constructor(private _util: EchartUtilityFunctions,
    private global:globals) { }

  ngOnInit() {
    this.setValueForPowerICon();
  }
  ngOnChanges(changes: SimpleChanges) {
    if (changes) {
      this.setValueForPowerICon();
    }
  }
  // ngDoCheck() {
  //   if (this.vData != undefined) {
  //     this.setValueForPowerICon();
  //   }
  // }
  actionsCompare(buttonData) {
    let inputJson = {
      module_id: null,
      cType: null,
      device_instance_id: null,
      module_type: null,
      write_register: []
    }
    this.powerIconLabel = buttonData['label'];
    inputJson['write_register'].push(buttonData);
    inputJson['device_instance_id'] = this.vData.chartOptions.filter.filterList[0].value[0].value;
    this.modebusEmitter.emit(inputJson);
  }
  setValueForPowerICon() {
    if(this.vData.chartOptions.hasOwnProperty('write_register') && this.vData.chartOptions.write_register.length>0) {
      this.vData.chartOptions.write_register = this._util.updateColor(this.vData.chartOptions.write_register,this.global._appConfigurations['modbusColors']);
    }
    this.labelUnit = this.vData.chartOptions.yaxis[0]['name'];
    const register = this.vData.chartOptions.write_register;
    const action = this.vData.chartData.action;
    this.powerIconLabel = '';
    for (let i = 0; i < register.length; i++) {
      if (this.vData.hasOwnProperty('chartData') && this.vData.chartData.hasOwnProperty('action')
      && this.vData.chartData.action.length > 0) {
        for (let j = 0; j < action.length; j++) {
          if (register[i].relay_operation == action[j].relay_operation) {
            this.powerIconColor = register[i].color,
            this.isShowLabel = true;
              this.powerIconLabel = register[i].label
            return;
          }
        }
      }
    }
  }
}
