import { AgmMap,LatLngBounds } from "@agm/core";
import { google } from "@agm/core/services/google-maps-types";
import { Component, Input, OnInit, ViewChild } from "@angular/core";

@Component({
    selector:'el-map',
    templateUrl:'./map-live.component.html',
    styleUrls:['./map-live.component.scss']
})
export class MapLiveComponent implements OnInit{

    @Input() markers;
    zoom: number = 18;
    size = 0;
    ngOnInit() {
              
    }
      track(index) {
          return index;
      }

      zoomChanges(event) {
          this.size = event + 5;          
      }

}