import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'DeviceSearchComponent'
})
export class DeviceSearchComponent implements PipeTransform {
  transform(value: any, input: string) {
    if (!input) {
      return value;
    } else {
      const filteredValues: any = [];
      for (let i = 0; i < value.length; i++) {
        if (value[i].device_name.toLowerCase().includes(input.toLowerCase())) {
          filteredValues.push(value[i]);
        }
      }
      return filteredValues;
    }
  }
}
