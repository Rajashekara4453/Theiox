import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'kl-multidivmenubar',
  templateUrl: './multidivmenubar.component.html',
  styleUrls: ['./multidivmenubar.component.scss']
})
export class MultiDivMenubarComponent implements OnInit {
  @Input('menus') menus: any;
  @Input('displayProperty') displayProperty: any;
  @Input('secondDisplyProperty') secondDisplyProperty: any;

  @Input('valueProperty') valueProperty: any;
  public options = {};
  public router: any;
  public activeTab: Number = null;
  @Output() gateway: EventEmitter<any>;
  @Output() clickStatus: EventEmitter<any>;
  @Output() addnew: EventEmitter<any>;
  @Output() draggedElement: EventEmitter<any>;

  constructor(private _router: Router) {
    this.clickStatus = new EventEmitter<any>();
    this.addnew = new EventEmitter<any>();
    this.draggedElement = new EventEmitter<any>();
  }

  ngOnInit() {
    this.options = {
      allowDrag: true,
      allowDrop: true
    };
  }
  onSelectElement(item, index) {
    this.clickStatus.emit(item);
    this.activeTab = index;
  }
  onadd() {
    this.activeTab = null;
    this.addnew.emit({ event: 'addnew' });
  }
  onDragStart(ev: any, data: any) {
    this.draggedElement.emit({
      event: ev,
      data: data
    });
  }
}
