import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'kl-unauthorized',
  templateUrl: './unauthorized.component.html',
  styleUrls: ['./unauthorized.component.scss']
})
export class UnauthorizedComponent implements OnInit {

  constructor(public _router: Router) { }

  ngOnInit() {
  }
  goToHome() {
    this._router.navigate(['/dashboard']);
  }
}
