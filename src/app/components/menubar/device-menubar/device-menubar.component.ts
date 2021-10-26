import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { Router } from '@angular/router';
@Component({
  selector: 'kl-device-menubar',
  templateUrl: './device-menubar.component.html',
  styleUrls: ['./device-menubar.component.scss']
})
export class DeviceMenubarComponent implements OnInit {
  @Input('menus') menus: any;
  @Input('displayProperty') displayProperty: any;
  @Input('valueProperty') valueProperty: any;
  @Input('secondDisplyProperty') secondDisplyProperty: any;
  public options = {};
  public router: any;
  public activeTab: Number = null;
  @Output() gateway: EventEmitter<any>;
  @Output() clickStatus: EventEmitter<any>;
  @Output() addnew: EventEmitter<any>;
  @Output() draggedElement: EventEmitter<any>;
  public queryString: String = '';

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

  hideSubsideBar(event) {
    if (document.body.classList.contains('hide-sub-sidebar')) {
      document.body.classList.remove('hide-sub-sidebar');
    } else {
      document.body.classList.add('hide-sub-sidebar');
    }
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
