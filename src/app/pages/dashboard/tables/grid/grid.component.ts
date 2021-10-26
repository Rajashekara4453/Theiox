import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'kl-grid',
  templateUrl: './grid.component.html',
  styleUrls: ['./grid.component.scss']
})
export class GridComponent implements OnInit {
  @Input() styling: any;
  @Input() settings: any;
  @Input() columns: any;
  @Input() data: any;
  @Input() batchList: any;
  @Output() saveEmitter: EventEmitter<any> = new EventEmitter<any>();
  @Output() cancelEmitter: EventEmitter<any> = new EventEmitter<any>();
  public isGridSelectAll: Boolean = false;

  constructor() { }

  ngOnInit() {
    // console.log('styling Config', this.styling);
    // console.log('configuration of grid', this.settings);
    // console.log('grid Cloumns', this.columns);
    // console.log('gridData', this.data);
  }

  // ================================================== Select and Un select records All records =================================
  selectUnnselectAllRecords($event, ischecked) {
    // console.log($event);
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
    // console.log(this.data);
  }

  selectUnselectRecord(isChecked, index) {
    if (isChecked) {
      this.data[index]['isChecked'] = false;
    } else {
      this.data[index]['isChecked'] = true;
    }
  }

  dropDownChange(event, key, row) {
    try {
      if (key === 'batch_group_id') {
        Object.keys(row).forEach(element => {
          if (element.indexOf('tag_') > -1) {
            row[element] = '';
          }
        });
        this.batchList.forEach(element => {
          if (element['value'] === event.target.value) {
            element['tagValuesForTagGroup'].forEach(tagElement => {
              if (row[tagElement['tag_id']] !== undefined) {
                row[tagElement['tag_id']] = tagElement['tagValue']
              }
            });
          }
        });
        return row
      }
    } catch (error) {
      console.log(error)
    }
  }

  saveGrid() {
    let emitData = {};
    emitData['bodyContent'] = this.data;
    emitData['headerContent'] = this.columns;
    this.saveEmitter.emit(emitData);
  }

  cancelGrid() {
    this.cancelEmitter.emit();
  }

  // ======================================================= Column Level Search Functions ==============================================

}
