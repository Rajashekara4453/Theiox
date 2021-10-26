import { Component, OnInit } from '@angular/core';
import { UtilityFunctions } from '../utilities/utility-func';

@Component({
  selector: 'kl-pages',
  templateUrl: './pages.component.html',
  styleUrls: ['./pages.component.scss']
})
export class PagesComponent implements OnInit {
  constructor(private _util: UtilityFunctions) {}

  ngOnInit() {}
  ngDoCheck() {
    // this._util.sessionTImeCheck();
  }
}
