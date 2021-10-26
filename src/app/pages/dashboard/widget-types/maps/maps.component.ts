import { Component, OnInit, Input, ViewChild } from '@angular/core';
import { AppService } from '../../../../../app/services/app.service';
import { globals } from '../../../../.././app/utilities/globals';
import { ToastrService } from '../../../../components/toastr/toastr.service';
import { ActivatedRoute } from '@angular/router';
import { UtilityFunctions } from '../../../../utilities/utility-func';

@Component({
  selector: 'kl-maps',
  templateUrl: './maps.component.html',
  styleUrls: ['./maps.component.scss']
})
export class MapsComponent implements OnInit {
  previous;
  constructor(private appservice: AppService, private global: globals, private toast: ToastrService,
    private _activeRoute: ActivatedRoute, private _utility: UtilityFunctions) { } // google maps zoom level
  zoom: number = 15;
  @Input() tableDataMaps;
  @Input() latlong;
  @Input() dashboardInfo;
  showWindow : boolean = false;
  // initial center position for the map
  mapData: Array<any>;
  headerCols: Array<any> = new Array();
  dataColumns: Array<any> = new Array();
  dashboardId;
  markers: marker[] = [

  ]

  ngOnInit() {
    // this.setMarkers(this.latlong);
    // this.getSites(this.latlong);
    this._activeRoute.params.subscribe(params => {
      this._activeRoute.url.subscribe(activeUrl => {
        // this.pageType = activeUrl[0].path; // for getting the dashboard id from the url
        this.dashboardId = activeUrl[1].path;
      });
    });
  }
  ngOnChanges() {
    this.setMarkers(this.latlong);
    this.previous = undefined;
  }

  clickedMarker(label: string, index: number, infowindow) {
    // console.log(`clicked the marker: ${label || index}`)
    this.tableDataMaps.cData.chartData = {};
    if (this.previous && this.markers.length>1) {
      this.previous.close();
    }
    this.previous = infowindow;
    this.showWindow = false;
    this.latlong.forEach(element => {
      if (this.markers[index].lat == element.recent_lat_lon.data[element.recent_lat_lon.type +'_lat'] && 
      this.markers[index].lng == element.recent_lat_lon.data[element.recent_lat_lon.type + '_long']) {
        // this.tableDataMaps.cData.chartOptions.filter.filtersData[0].selectedIds = [];
        this.tableDataMaps.cData.chartOptions.filter.filtersData.forEach(elementOptions => {
          if(elementOptions.type == 'tree') {
            elementOptions.selectedIds = [];
            elementOptions.selectedIds.push(element.id);
          }
        });
      }
    });
    this.tableDataMaps.cData.chartOptions['dashboardId'] = this.dashboardId
    this.appservice.getPreviewChartData(this.tableDataMaps.cData.chartOptions).subscribe((data) => {
        if (data.status == "success" && data.data['chartData'] != undefined) {
          this.tableDataMaps.cData.chartData = data.data['chartData'];
          this.showWindow = true;
          // this.tableDataMaps.cData.chartData = undefined
        } else {
          this.tableDataMaps.cData.chartData = {
            series: [],
            category: []
          };
        }
      });
  }

  mapClicked($event: MouseEvent) {
  }

  markerDragEnd(m: marker, $event: MouseEvent) {
    //console.log('dragEnd', m, $event);
  }

  // ngDoCheck() {
  //   this.tableDataMaps = this.tableDataMaps;
  //   if (this.tableDataMaps.cData.chartData != null) {
  //     this.headerCols = this.tableDataMaps.cData.chartData.headerContent;
  //     this.dataColumns = this.tableDataMaps.cData.chartData;
  //   }
  // }
  setMarkers(markerData) {
    this.markers = [];
    if(markerData != undefined){
      markerData.forEach(element => {
        if (element.recent_lat_lon.data[element.recent_lat_lon.type + '_lat'] !== null && element.recent_lat_lon.data[element.recent_lat_lon.type + '_long'] !== null) {
          this.markers.push({
            lat: element.recent_lat_lon.data[element.recent_lat_lon.type + '_lat'],
            lng: element.recent_lat_lon.data[element.recent_lat_lon.type + '_long'],
            label: '',
            title:element.recent_lat_lon.name,
            draggable: false,
            openInfoWindow: true,
            popContent: "",
            image: "assets/images/finder_map-marker.png",
            anchorX: "",
            anchorY: ""
          })
          // ];
        }
      });
    }
    if (this.markers.length <= 0) {
      this.markers = [];
    }
  }

  // getSites(input) {
  //   const filterData = this.tableDataMaps.cData.chartOptions.filter.filtersData;
  //   const dataToSend = {
  //     "filter": [
  //       {
  //         site_id: this.global.getCurrentUserSiteId() != null ? this.global.getCurrentUserSiteId() : '',
  //       }
  //     ],
  //     "data": {}
  //   };
  //   if (filterData !== undefined) {
  //     filterData.forEach(element => {
  //       if (element.type == 'tree') {
  //         dataToSend.data["selectedIds"] = element.selectedIds;
  //         dataToSend.data["tree"] = element.metaData;
  //       }
  //     });
  //   }
  //   this.appservice.getSiteDataMap(dataToSend).subscribe((data) => {
  //     if (data.status === 'success') {
  //       //this.markers = data;
  //       this.mapData = data.data;
  //       this.mapData.forEach(element => {
  //         if (element.recent_lat_lon.data.building_lat !== null && element.recent_lat_lon.data.building_long !== null) {
  //           this.markers = [
  //             {
  //               lat: element.recent_lat_lon.data.building_lat,
  //               lng: element.recent_lat_lon.data.building_long,
  //               label: "",
  //               draggable: false,
  //               openInfoWindow: true,
  //               popContent: "",
  //               image: "assets/images/finder_map-marker.png",
  //               anchorX: "",
  //               anchorY: ""
  //             }
  //           ];
  //         }
  //       });
  //       //  else{
  //       //  // this.global.isMapPop = true;
  //       // }
  //     }
  //   });
  //   if (this.markers.length <= 0) {
  //     this.markers = [];
  //   }
  // }
}

// just an interface for type safety.
interface marker {
  lat: number;
  lng: number;
  label?: string;
  draggable: boolean;
  popContent: string,
  title:string,
  image: string,
  anchorX: string,
  anchorY: string,
  openInfoWindow : boolean
}





