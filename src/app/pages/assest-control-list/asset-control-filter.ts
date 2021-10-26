import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'AssetControlFilter'
})
export class AssetControlFilter implements PipeTransform {
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
    const searchFor = searchText.toLowerCase();
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
            !Array.isArray(item[element]) &&
            (item[element] ? item[element] : '')
              .toLowerCase()
              .includes(searchFor)
          ) {
            trueOrFalse = true;
            break;
          }
          if (Array.isArray(item[element]) && item[element].length > 0) {
            for (const each of item[element]) {
              if (each.toLowerCase().includes(searchFor)) {
                trueOrFalse = true;
                break;
              }
            }
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
