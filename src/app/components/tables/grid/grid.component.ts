import {
  Component,
  OnInit,
  Input,
  Output,
  EventEmitter,
  ViewChild,
  AfterViewInit,
  ElementRef
} from '@angular/core';
import { NgSelectComponent } from '@ng-select/ng-select';

@Component({
  selector: 'kl-grid',
  templateUrl: './grid.component.html',
  styleUrls: ['./grid.component.scss']
})
export class GridComponent implements OnInit, AfterViewInit {
  @Input() styling: any;
  @Input() settings: any;
  @Input() columns: any;
  @Input() data: any;
  @Input() batchList: any;
  @Input() disableSaveOnEdit: any;
  @Input() allowSaveOnEdit: any;
  @Input() gridActions: any;
  @Output() saveEmitter: EventEmitter<any> = new EventEmitter<any>();
  @Output() cancelEmitter: EventEmitter<any> = new EventEmitter<any>();
  @Output() actionEmitter: EventEmitter<any> = new EventEmitter<any>();
  public isGridSelectAll: Boolean = false;
  selectedBatchId: any = [];
  ddColKey: any;
  ddRow: any;
  cellData: any = [];
  @ViewChild('ngSelectBatch') ngSelectBatch: NgSelectComponent;
  @ViewChild('closeBatchModal') closeBatchModal: ElementRef;
  constructor() {}

  ngOnInit() {
    this.mapBatchNames();
    this.checkSelectUnselectRows();
  }

  ngAfterViewInit() {
    // this has to be set programmatically because the [virtualScroll] attribute is provided by
    // more than one component
    this.ngSelectBatch.virtualScroll = true;
  }

  // ================================================== Select and Un select records All records =================================
  selectUnnselectAllRecords($event, ischecked) {
    this.isGridSelectAll = !this.isGridSelectAll;
    if (this.isGridSelectAll) {
      for (let ind = 0; ind < this.data.length; ind++) {
        this.data[ind]['isChecked'] = true;
      }
    } else {
      for (let ind = 0; ind < this.data.length; ind++) {
        this.data[ind]['isChecked'] = false;
      }
    }
  }
  checkSelectUnselectRows() {
    for (let ind = 0; ind < this.data.length; ind++) {
      if (this.data[ind]['isChecked']) {
        this.isGridSelectAll = true;
      } else {
        this.isGridSelectAll = false;
        break;
      }
    }
  }
  selectUnselectRecord(isChecked, index) {
    if (isChecked) {
      this.data[index]['isChecked'] = false;
    } else {
      this.data[index]['isChecked'] = true;
    }
    this.mapBatchNames();
    this.checkSelectUnselectRows();
  }
  dropDownChange(event, key, row) {
    try {
      if (key === 'batch_group_id') {
        Object.keys(row).forEach((element) => {
          if (element.indexOf('tag_') > -1) {
            row[element] = '';
          }
        });
        this.batchList.forEach((element) => {
          if (element['value'] === event.target.value) {
            element['tagValuesForTagGroup'].forEach((tagElement) => {
              if (row[tagElement['tag_id']] !== undefined) {
                row[tagElement['tag_id']] = tagElement['tagValue'];
              }
            });
          }
        });
        return row;
      }
    } catch (error) {
      console.log(error);
    }
  }

  // Method to get col and row of DD to update selected value.
  getDropdownValue(keyCol, row) {
    try {
      // this.ngSelectBatch.filterInput.nativeElement.focus();
      this.ddColKey = keyCol;
      this.ddRow = row;
      this.selectedBatchId = row['batch_group_id'];
    } catch (error) {
      console.log(error);
    }
  }

  // Method to update selected value on button.
  assignBatch() {
    try {
      this.closeBatchModal.nativeElement.click();
      this.ddRow[this.ddColKey] = this.selectedBatchId;
      for (let i = 0; i < this.batchList.length; i++) {
        const element = this.batchList[i];
        if (this.selectedBatchId === element['value']) {
          this.ddRow['batch_name'] = this.columns.columnData[
            this.ddColKey
          ].cell.cellData[i]['label'];
          if (this.ddColKey === 'batch_group_id') {
            Object.keys(this.ddRow).forEach((element) => {
              if (element.indexOf('tag_') > -1) {
                this.ddRow[element] = '';
              }
            });
            this.batchList.forEach((element) => {
              if (element['value'] === this.selectedBatchId) {
                element['tagValuesForTagGroup'].forEach((tagElement) => {
                  if (this.ddRow[tagElement['tag_id']] !== undefined) {
                    this.ddRow[tagElement['tag_id']] = tagElement['tagValue'];
                  }
                });
              }
            });
          }
        }
      }
    } catch (error) {
      console.log(error);
    }
  }

  // Method to populate already selected batch, if any in the table.
  mapBatchNames() {
    try {
      for (let i = 0; i < this.data.length; i++) {
        for (let j = 0; j < this.batchList.length; j++) {
          const batchElement = this.batchList[j];
          if (this.data[i]['batch_group_id'] === batchElement['value']) {
            this.data[i]['batch_name'] = batchElement['label'];
            break;
          } else {
            this.data[i]['batch_name'] = '';
          }
        }
      }
    } catch (error) {
      console.log(error);
    }
  }

  saveGrid() {
    const emitData = {};
    emitData['bodyContent'] = this.data;
    emitData['headerContent'] = this.columns;
    this.saveEmitter.emit(emitData);
  }

  cancelGrid() {
    this.cancelEmitter.emit();
  }

  // Method to emit the actions, fetch device data and device history
  emitAction(index, key) {
    try {
      const actionData = {
        deviceId: this.data[index]['device_instance_id'],
        actionKey: key
      };
      this.actionEmitter.emit(actionData);
    } catch (error) {
      console.log(error);
    }
  }

  // ======================================================= Column Level Search Functions ==============================================
}
