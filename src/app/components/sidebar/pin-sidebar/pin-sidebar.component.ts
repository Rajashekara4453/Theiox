import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'kl-pin-sidebar',
  templateUrl: './pin-sidebar.component.html',
  styleUrls: ['./pin-sidebar.component.scss']
})
export class PinSidebarComponent implements OnInit {
  isCollapsed: boolean = true;
  constructor() {}

  ngOnInit() {}

  pinSideBar() {
    this.isCollapsed = !this.isCollapsed;
    if (document.body.classList.contains('pin-sidebar')) {
      document.body.classList.remove('pin-sidebar');
      document.body.classList.remove('overlay-sidebar');
    } else {
      document.body.classList.remove('overlay-sidebar');
      document.body.classList.add('pin-sidebar');
    }
  }
}
