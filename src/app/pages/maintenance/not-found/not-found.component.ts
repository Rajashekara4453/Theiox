import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'kl-not-found',
  templateUrl: './not-found.component.html',
  styleUrls: ['./not-found.component.scss']
})
export class NotFoundComponent implements OnInit {

  constructor(public _router: Router) { }

  ngOnInit() {
  }
  goToHome() {
    this._router.navigate(['/dashboard']);
  }

}
