import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs/internal/BehaviorSubject';

@Injectable({
  providedIn: 'root'
})
export class PreviewPopUpService {
  private message = new BehaviorSubject<any>({ state: '', data: [] });
  previewBoolean = this.message.asObservable();

  constructor() {}
  previewCheck(obj) {
    this.message.next(obj);
  }

  stepBackPiePreview(isFromBackArrow, widgetInfo) {
    if (isFromBackArrow == 'back') {
      widgetInfo['pieDropdownList'].shift();
      widgetInfo.dropdownValue=widgetInfo['pieDropdownList'][0];
    } else if (isFromBackArrow == 'change') {
      const index = widgetInfo['pieDropdownList'].findIndex(
        (i) => i.id === widgetInfo['dropdownValue']['id']
      );
      widgetInfo['dropdownValue'] = widgetInfo['pieDropdownList'][index];
      widgetInfo['pieDropdownList'].splice(0, index);
    }
    widgetInfo['pieDropdownList'] = [...widgetInfo['pieDropdownList']];
    widgetInfo['isBackArrowClicked'] = '';
    if (widgetInfo['pieDropdownList'].length == 0) {
      widgetInfo.isShowToolBox = false;
    }
    return widgetInfo.pieDropdownList;
  }
}
