import { Component, OnInit } from "@angular/core";
import { AppService } from "../../services/app.service";
import { ActivatedRoute, Router } from "@angular/router";
import { ToastrService } from "../../components/toastr/toastr.service";
import { Subject } from "rxjs";
import { globals } from "../../../app/utilities/globals";
import { Config } from "../../config/config";
import { UtilityFunctions } from "../../utilities/utility-func";
import { DomSanitizer, SafeResourceUrl } from "@angular/platform-browser";
@Component({
  selector: "kl-scada",
  templateUrl: "./scada.component.html",
  styleUrls: ["./scada.component.scss"],
})
export class ScadaComponent implements OnInit {
  public dev_data: {};
  public showDashboardFilter: Boolean = false;
  public showResize: boolean = false;
  public widgetData: Object = {};
  public widgetLoading: Boolean = false;
  public sideMenus: any;
  public dashboardId: String;
  public dashboardData: any = {
    dashboardName: "",
  };
  public dashboardInfo: any = {};
  public dashBoardsaveData: any = {
    name: "",
    description: "",
  };
  public deleteDashBoard;
  public folderData: any = {
    name: "",
  };
  public pageType: any;
  public resizeWidgetSubject: Subject<any> = new Subject<any>();
  public addWidgetSubject: Subject<any> = new Subject<any>();
  public preview_url: SafeResourceUrl = "";
  constructor(
    private _router: Router,
    private _activeRoute: ActivatedRoute,
    private appservice: AppService,
    private _toastLoad: ToastrService,
    private global: globals,
    private _utility: UtilityFunctions,
    private sanitizer: DomSanitizer
  ) {
    this._activeRoute.params.subscribe((params) => {
      this._activeRoute.url.subscribe((activeUrl) => {
        this.pageType = activeUrl[0].path; // for getting the dashboard id from the url
      });
      this.dashboardId = params["id"];
      if (this.dashboardId) {
        this.loadWidgets();
      } else {
        return;
      }
    });
  }

  ngOnInit() {
    if (this.dashboardId) {
      this.loadWidgets();
    } else {
      return;
    }
  }
  /**
   * Method for getting widget list
   */
  loadWidgets() {
    try {
      this.widgetLoading = false;
      if (!this.dashboardId) {
        this.widgetLoading = false;
        return;
      }
      const input = {
        dashboard_id: this.dashboardId,
      };
      this.appservice.getDashboardData(input).subscribe((data) => {
        if (data && data.status === "success") {
          this.dev_data = {
            id: this.dashboardId,
            cookie: {
              client_id: this.global.getCurrentUserClientId(),
              user_id: this.global.userId,
              site_id: this.global.getCurrentUserSiteId(),
            },
            //"xml":data['data']['description'],
            // xml:
            // "PG14R3JhcGhNb2RlbCBkeD0iNzgyIiBkeT0iNDc5IiBncmlkPSIxIiBncmlkU2l6ZT0iMTAiIGd1aWRlcz0iMSIgdG9vbHRpcHM9IjEiIGNvbm5lY3Q9IjEiIGFycm93cz0iMSIgZm9sZD0iMSIgcGFnZT0iMSIgcGFnZVNjYWxlPSIxIiBwYWdlV2lkdGg9Ijg1MCIgcGFnZUhlaWdodD0iMTEwMCI+CiAgPHJvb3Q+CiAgICA8bXhDZWxsIGlkPSIwIiAvPgogICAgPG14Q2VsbCBpZD0iMSIgcGFyZW50PSIwIiAvPgogICAgPG14Q2VsbCBpZD0iMiIgdmFsdWU9IiIgc3R5bGU9InNoYXBlPWVsbGlwc2U7d2hpdGVTcGFjZT13cmFwO2h0bWw9MTthc3BlY3Q9Zml4ZWQ7O2ZpbGxDb2xvcj0jZmZmZmZmO3N0cm9rZUNvbG9yPSMwMDAwMDA7IiBwYXJlbnQ9IjEiIHZlcnRleD0iMSIgZGV2aWNlcz0iZGV2aWNlX2luc3RhbmNlXzE4OCIgdGFncz0idGFnXzI2NDp1bml0XzEwMSIgdG9waWNzPSIiIHVuaXRzPSIiIGRlY2ltYWw9IjIiIGNvbnZlcnRlcj0idW5pdF8xMDEiIGZhY3Rvcj0iIj4KICAgICAgPG14R2VvbWV0cnkgeD0iMjIwIiB5PSIyMDAiIHdpZHRoPSI4MCIgaGVpZ2h0PSI4MCIgYXM9Imdlb21ldHJ5IiAvPgogICAgICA8T2JqZWN0IGFzPSJjb25maWd1cmUiPgogICAgICAgIDxBcnJheSBhcz0iZGV2aWNlIj4KICAgICAgICAgIDxPYmplY3QgZGV2aWNlX2lkPSJkZXZpY2VfaW5zdGFuY2VfMTg4IiAvPgogICAgICAgIDwvQXJyYXk+CiAgICAgICAgPEFycmF5IGFzPSJ0YWciPgogICAgICAgICAgPE9iamVjdCB0YWdfaWQ9InRhZ18yNjQiIC8+CiAgICAgICAgPC9BcnJheT4KICAgICAgICA8QXJyYXkgYXM9ImNvbmRpdGlvbnMiIC8+CiAgICAgIDwvT2JqZWN0PgogICAgPC9teENlbGw+CiAgICA8bXhDZWxsIGlkPSIzIiB2YWx1ZT0iIiBzdHlsZT0ic2hhcGU9ZWxsaXBzZTt3aGl0ZVNwYWNlPXdyYXA7aHRtbD0xO2FzcGVjdD1maXhlZDs7ZmlsbENvbG9yPSNmZmZmZmY7c3Ryb2tlQ29sb3I9IzAwMDAwMDsiIHBhcmVudD0iMSIgdmVydGV4PSIxIiBkZXZpY2VzPSJkZXZpY2VfaW5zdGFuY2VfMTg4IiB0YWdzPSJ0YWdfMjY0OnVuaXRfMTAxIiB0b3BpY3M9IiIgdW5pdHM9IiIgZGVjaW1hbD0iNSIgY29udmVydGVyPSJ1bml0XzMzNyIgZmFjdG9yPSIiPgogICAgICA8bXhHZW9tZXRyeSB4PSI0MDAiIHk9IjIwMCIgd2lkdGg9IjgwIiBoZWlnaHQ9IjgwIiBhcz0iZ2VvbWV0cnkiIC8+CiAgICAgIDxPYmplY3QgYXM9ImNvbmZpZ3VyZSI+CiAgICAgICAgPEFycmF5IGFzPSJkZXZpY2UiPgogICAgICAgICAgPE9iamVjdCBkZXZpY2VfaWQ9ImRldmljZV9pbnN0YW5jZV8xODgiIC8+CiAgICAgICAgPC9BcnJheT4KICAgICAgICA8QXJyYXkgYXM9InRhZyI+CiAgICAgICAgICA8T2JqZWN0IHRhZ19pZD0idGFnXzI2NCIgLz4KICAgICAgICA8L0FycmF5PgogICAgICAgIDxBcnJheSBhcz0iY29uZGl0aW9ucyIgLz4KICAgICAgPC9PYmplY3Q+CiAgICA8L214Q2VsbD4KICAgIDxteENlbGwgaWQ9IjQiIHZhbHVlPSJHIFdhdHRzIiBzdHlsZT0ic2hhcGU9dGV4dDtodG1sPTE7c3Ryb2tlQ29sb3I9bm9uZTtmaWxsQ29sb3I9bm9uZTthbGlnbj1jZW50ZXI7dmVydGljYWxBbGlnbj1taWRkbGU7d2hpdGVTcGFjZT13cmFwO3JvdW5kZWQ9MDsiIHZlcnRleD0iMSIgZGV2aWNlcz0iIiB0YWdzPSIiIHRvcGljcz0iIiB1bml0cz0iIiBkZWNpbWFsPSIiIGNvbnZlcnRlcj0iIiBmYWN0b3I9IiIgcGFyZW50PSIxIj4KICAgICAgPG14R2VvbWV0cnkgeD0iNDEwIiB5PSIxNTAiIHdpZHRoPSI0MCIgaGVpZ2h0PSIyMCIgYXM9Imdlb21ldHJ5IiAvPgogICAgICA8T2JqZWN0IGFzPSJjb25maWd1cmUiPgogICAgICAgIDxBcnJheSBhcz0iZGV2aWNlIj4KICAgICAgICAgIDxPYmplY3QgZGV2aWNlX2lkPSJkZXZpY2VfaW5zdGFuY2VfMTg4IiAvPgogICAgICAgIDwvQXJyYXk+CiAgICAgICAgPEFycmF5IGFzPSJ0YWciPgogICAgICAgICAgPE9iamVjdCB0YWdfaWQ9InRhZ18yNjQiIC8+CiAgICAgICAgPC9BcnJheT4KICAgICAgICA8QXJyYXkgYXM9ImNvbmRpdGlvbnMiIC8+CiAgICAgIDwvT2JqZWN0PgogICAgPC9teENlbGw+CiAgICA8bXhDZWxsIGlkPSI1IiB2YWx1ZT0iV2F0dHMiIHN0eWxlPSJzaGFwZT10ZXh0O2h0bWw9MTtzdHJva2VDb2xvcj1ub25lO2ZpbGxDb2xvcj1ub25lO2FsaWduPWNlbnRlcjt2ZXJ0aWNhbEFsaWduPW1pZGRsZTt3aGl0ZVNwYWNlPXdyYXA7cm91bmRlZD0wOyIgdmVydGV4PSIxIiBkZXZpY2VzPSIiIHRhZ3M9IiIgdG9waWNzPSIiIHVuaXRzPSIiIGRlY2ltYWw9IiIgY29udmVydGVyPSIiIGZhY3Rvcj0iIiBwYXJlbnQ9IjEiPgogICAgICA8bXhHZW9tZXRyeSB4PSIyNDAiIHk9IjE2MCIgd2lkdGg9IjQwIiBoZWlnaHQ9IjIwIiBhcz0iZ2VvbWV0cnkiIC8+CiAgICAgIDxPYmplY3QgYXM9ImNvbmZpZ3VyZSI+CiAgICAgICAgPEFycmF5IGFzPSJkZXZpY2UiPgogICAgICAgICAgPE9iamVjdCBkZXZpY2VfaWQ9ImRldmljZV9pbnN0YW5jZV8xODgiIC8+CiAgICAgICAgPC9BcnJheT4KICAgICAgICA8QXJyYXkgYXM9InRhZyI+CiAgICAgICAgICA8T2JqZWN0IHRhZ19pZD0idGFnXzI2NCIgLz4KICAgICAgICA8L0FycmF5PgogICAgICAgIDxBcnJheSBhcz0iY29uZGl0aW9ucyIgLz4KICAgICAgPC9PYmplY3Q+CiAgICA8L214Q2VsbD4KICA8L3Jvb3Q+CjwvbXhHcmFwaE1vZGVsPgo=",
          };
          let database64 = btoa(JSON.stringify(this.dev_data));
          let url =
            window.location.href.split("#")[0] +
            "assets/library/scada/elmeasure/preview.html?data=" +
            database64;
          this.preview_url = this.sanitizer.bypassSecurityTrustResourceUrl(url);
          this.widgetData = data["data"]["widget"];
          this.widgetData["wcData"].forEach((element) => {
            element.cData.chartData = {};
          });
          this.dashboardData = data["data"];
          this.dashboardData["pageType"] = this.pageType;
          this.dashboardData["isReset"] = false;
          this.dashboardData["isOwner"] = data["data"]["isOwner"];
          this.dashboardData["ownerId"] = data["data"]["ownerId"];
          this.dashboardData["ownerName"] = data["data"]["ownerName"];
          this.dashboardInfo = {
            dashboardName: this.dashboardData["dashboardName"],
            dashboardId: this.dashboardData["dashboardId"],
            pageType: this.pageType,
            isOwner: data["data"]["isOwner"],
          };
          this.widgetLoading = true;
        } else {
          let url =
            window.location.href.split("#")[0] +
            "assets/library/scada/elmeasure/unauthorized.html";
          this.preview_url = this.sanitizer.bypassSecurityTrustResourceUrl(url);
          // this.widgetData = data["data"]["widget"];
          // this._toastLoad.toast('error', 'Error', data.message, true);
        }
      });
    } catch (error) {
      //console.log(error);
    }
  }
  /**
   * Method for opening widget configuration page.
   * This will emit into the children component and there the widget configuration will start
   * @param event
   */
  createWidget(event) {
    try {
      this.addWidgetSubject.next("createNewWidget");
    } catch (error) {
      //console.log(error)
    }
  }
}
