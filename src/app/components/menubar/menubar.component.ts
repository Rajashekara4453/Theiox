import {
  Component,
  OnInit,
  Input,
  Output,
  EventEmitter,
  ChangeDetectionStrategy
} from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'kl-menubar',
  templateUrl: './menubar.component.html',
  styleUrls: ['./menubar.component.scss']
  // changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MenubarComponent implements OnInit {
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
  sideMenusData: any = [];

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
    // console.log(this.menus);
    // this.sideMenus = this.menus.data;
    this.sideMenusData = this.menus.data;
  }

  hideSubsideBar(event) {
    if (document.body.classList.contains('hide-sub-sidebar')) {
      document.body.classList.remove('hide-sub-sidebar');
    } else {
      document.body.classList.add('hide-sub-sidebar');
    }
  }
  trackByIdx(i) {
    return i;
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
  trackByFn(index, item) {
    return index; // or item.id
  }
}
