import { Component, OnInit } from '@angular/core';
import { AppService } from '../../services/app.service';

@Component({
  selector: 'kl-version',
  templateUrl: './version.component.html',
  styleUrls: ['./version.component.scss']
})
export class VersionComponent implements OnInit {
  constructor(private _appService: AppService) {}
  display_table: any = {};
  product_version = '';
  isPageLoading: boolean;
  product_name = '';
  show_content = false;
  ngOnInit() {
    this.getVersion();
  }
  q;
  getVersion() {
    this.isPageLoading = true;
    this._appService.getVersionInfo({}).subscribe(
      (data) => {
        if ((data.status = 'success')) {
          if (data.bodyContent.length != 0) {
            this.show_content = true;
            this.product_name = data.bodyContent[0].service.toUpperCase();

            this.product_version = data.bodyContent[0].version;
            this.display_table.bodyContent = data.bodyContent.slice(1);
            this.display_table.headerContent = data.headerContent;
            this.isPageLoading = false;
          } else {
            this.isPageLoading = false;
          }
        } else {
          this.isPageLoading = false;
        }
      },
      (err) => {
        this.isPageLoading = false;
      }
    );
  }
}
