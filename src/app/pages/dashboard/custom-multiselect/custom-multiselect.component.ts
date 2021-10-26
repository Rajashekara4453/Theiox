import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { DataSharingService } from '../../../services/data-sharing.service';

@Component({
  selector: 'kl-custom-multiselect',
  templateUrl: './custom-multiselect.component.html',
  styleUrls: ['./custom-multiselect.component.scss']
})
export class CustomMultiselectComponent implements OnInit {
  @Input() inputData;
  @Input() isCheckBox;
  @Input() selectedData;
  @Output() emitData: EventEmitter<any> = new EventEmitter<any>();
  filteredData: Array<any> = [];
  isFilteredDataSelected: boolean = false;
  @Output() emitIsFilteredDataSelected: EventEmitter<boolean> = new EventEmitter<boolean>();
  constructor(private dataSharingService: DataSharingService) { }

  ngOnInit() {
    this.updateOptions();
    this.getIsFilteredDataSelected();
  }
  
  ngOnChanges() {
    this.updateOptions();
  }

  updateOptions() {
    let tempArray =[];
    if(this.selectedData && this.selectedData.length > 0){
      this.selectedData.forEach(element => {
        tempArray.push(element.value);
      });
      this.inputData.list.forEach(element => {
        if(tempArray.indexOf(element.value) > -1){
          element["checked"] = true;
        }
      });
    }
  }
  selectAllList(item) {
    if (!item.list)
      return;

    item.list.forEach(ele => {
      ele.checked = true;
    });
    this.modelChange('','');
  }

  deselectAllList(item) {
    if (!item.list)
      return;

    item.list.forEach(ele => {
      ele.checked = false;
    });
    this.modelChange('','');
  }
  modelChange(event,selected) {
    if(this.isCheckBox === true){
      this.inputData.list.forEach((element,indexIn) => {
        if(element.value === selected.value){
          element['checked'] = selected['checked'];
        } else{
          element['checked'] = false;
        }
      });
    }
    let emitList = [];
    let tempList = this.inputData['list'];
    for (const el of tempList) {
      if (el.checked) {
        emitList.push(el);
      }
    }
    this.emitData.emit(emitList);
  }

  selectDeselectAllFilteredList(isSelected: boolean){
    this.inputData['isFilteredDataSelected'] = isSelected;
    this.dataSharingService.isFilteredDataSelectedChange(isSelected);
    this.inputData.list.forEach(element => {
      this.filteredData.forEach(filteredElement =>{
        if(element.value == filteredElement.value) element.checked = isSelected;
      });
    });
    this.modelChange('','');
  }

  getIsFilteredDataSelected(){
    this.dataSharingService.isCustomMultiSelectFilteredDataSelected.subscribe(data => {
      this.isFilteredDataSelected = data;
    });
    this.inputData.searchVal = '';
  }

  track(index) {
    return index;
  }

}
