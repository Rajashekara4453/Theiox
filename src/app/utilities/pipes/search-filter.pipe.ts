import { Pipe, PipeTransform } from '@angular/core';
import { isRegExp } from 'util';
@Pipe({
  name: 'elmfilter'
})
export class ElmeasureFilterPipe implements PipeTransform {
  /*
  (p1) items : array to be searched in.
  (p2) searchText: the text to be searched in the array.
  (p3) inKeysTobeSearched: Array of property names of an object in string format; To search in Array of objects.
  (p4) isArrayOfObjects: make it false if you are passing array of strings.
  (p5) minLength: waits for minimum number of characters as input; default = 3
  */
  transform(
    items: any[],
    searchText: any,
    inKeysTobeSearched: any,
    isArrayOfObjects: boolean,
    minLength: number
  ): any[] {
    if (!items) {
      return [];
    }
    if (!searchText || searchText.length < (minLength ? minLength : 3)) {
      return items;
    }
    let searchFor = searchText;
    searchFor = searchText.toLowerCase();
    return items.filter((item) => {
      if (isArrayOfObjects) {
        if (inKeysTobeSearched == null || inKeysTobeSearched.length == 0) {
          console.log(
            'elmfilter: Key has to be specified when value for isArrayOfObjects is true.'
          );
        }
        let trueOrFalse: boolean = false;
        for (let index = 0; index < inKeysTobeSearched.length; index++) {
          const element = inKeysTobeSearched[index];
          if (
            (item[element] ? item[element] : '')
              .toLowerCase()
              .includes(searchFor)
          ) {
            trueOrFalse = true;
            break;
          } else {
            continue;
          }
        }
        return trueOrFalse;
      } else {
        return item.toLowerCase().includes(searchText);
      }
    });
  }
}
