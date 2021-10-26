import { Pipe, PipeTransform } from '@angular/core';
@Pipe({
  name: 'GatewaysearchComponent'
})
export class GatewaysearchComponent implements PipeTransform {
  transform(value: any, input: string, condition: boolean) {
    if (!input) {
      return value;
    } else {
      const filteredValues: any = [];
      //this is to serarch only gateways when it is in list view mode
      if (condition) {
        for (let i = 0; i < value.length; i++) {
          if (
            value[i].gatewayname.toLowerCase().includes(input.toLowerCase())
          ) {
            filteredValues.push(value[i]);
            // break;
          }
        }
      } else {
        //this is to serarch All when it is in silo view mode
        for (let i = 0; i < value.length; i++) {
          if (
            value[i].gatewayname.toLowerCase().includes(input.toLowerCase())
          ) {
            filteredValues.push(value[i]);
            // break;
          }
          for (let j = 0; j < value[i].devices.length; j++) {
            if (
              value[i].gatewayname
                .toLowerCase()
                .includes(input.toLowerCase()) !==
              value[i].devices[j].device_name
                .toLowerCase()
                .includes(input.toLowerCase())
            ) {
              if (
                value[i].devices[j].device_name
                  .toLowerCase()
                  .includes(input.toLowerCase())
              ) {
                filteredValues.push(value[i]);
                break;
              }
            }
          }
        }
      }
      return filteredValues;
    }
  }
}
