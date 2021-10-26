import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import {
  faSyncAlt,
  faCog,
  faExpandArrowsAlt,
  faCompress
} from '@fortawesome/free-solid-svg-icons';
import { AppService } from '../../../../services/app.service';
import { Paho } from '../../../../../../node_modules/ng2-mqtt/mqttws31';
import { Config } from '../../../../config/config';
import { ToastrService } from '../../../../components/toastr/toastr.service';
import { AuthGuard } from '../../../../pages/auth/auth.guard';
import { ActivatedRoute } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { WdgShowService } from './wdg-show.service';

@Component({
  selector: 'kl-wdg-show',
  templateUrl: './wdg-show.component.html',
  styleUrls: ['./wdg-show.component.scss']
})
export class WdgShowComponent implements OnInit {
  // Input and OutputVariables to the Component
  @Input() wcData: any;
  @Input() dashboardInfo: any;
  @Input() filteredData: Array<Object>;
  @Input() resizeWidgetEvent = {};
  @Output() saveResizeEmitter: EventEmitter<any> = new EventEmitter<any>();
  @Output('editWidgetEmitter') editWidgetEmitter = new EventEmitter();
  @Output() deleteWidgetEmitter: EventEmitter<any> = new EventEmitter<any>();
  public _mqttClient; // variable for storing all mqtt client instance
  public mqttData = undefined; // to store mqtt data
  // Icon Variables
  public faSyncAlt = faSyncAlt;
  public faCog = faCog;
  public faExpand = faExpandArrowsAlt;
  public faCompress = faCompress;
  public doResize: Boolean = false;
  public saveResize: Boolean = false;
  // Variables using inside the component
  public expandWidget: Number = -1;

  public autoRefreshInstances: any = {}; // variable for storing all the auto refresh instances

  public _mqttClients: any = {}; // variable for storing all mqtt client instances

  public delInfo: any; // to store widget config info for delete

  titleDenied: string = '';
  pageType: string;
  firstTimeLoad: any = true;
  gridstackOptions: Object = {
    disableResize: false,
    disableDrag: false,
    verticalMargin: 12,
    handleClass: 'card-corner'
  };
  timeRangeList: Object;
  public accessForWidget: any = {};
  public pageAccessFor: any = {
    title: {}
  };

  constructor(
    private _appService: AppService,
    private _toastLoad: ToastrService,
    private authGuard: AuthGuard,
    private _activeRoute: ActivatedRoute,
    private _wdgshow: WdgShowService,
    private http: HttpClient
  ) {
    this.pageAccessFor = this.authGuard.getMenuObject.accessLevel;
    this.accessForWidget = this.authGuard.allowAccessComponent(
      'widgets',
      'delete'
    );
  }

  ngOnInit() {
    if(this.wcData['isPreview']){
      this.setRealtimeRefresh(); // method call to start mqtt connection
    }
    this.resizeChangesDashboardLoad();
    this.resizeWidgetAction(this.resizeWidgetEvent);

    this._activeRoute.params.subscribe((params) => {
      this._activeRoute.url.subscribe((activeUrl) => {
        this.pageType = activeUrl[0].path; // for getting the dashboard id from the url and pagetype using to apply for scss classes
      });
    });
    this.resizeOptions();
    try {
      this.http
        .get('./assets/build-data/dashboard/widgets/date-list.json')
        .subscribe((data) => {
          this.timeRangeList = data;
        });
    } catch (error) {}
  }

  ngOnDestroy() {
    this.clearMqttInstance(); // method call for clear/kill the mqtt instances
  }

  ngOnChanges() {
    this.resizeWidgetAction(this.resizeWidgetEvent);
  }

  /**
   * Method for starting mqtt connection and listen each topic and update the data to widget display component
   */
  setRealtimeRefresh() {
    const _refObj = this;
    const clientId = 'mqttjs_' + Math.random().toString(17).substr(2, 8);
    if (this._mqttClient) {
      return;
    }
    this._mqttClient = Paho.MQTT.Client;
    const host = Config.CONSTANTS.MQTT.ip;
    const port = Config.CONSTANTS.MQTT.port;
    this._mqttClient = new Paho.MQTT.Client(host, Number(port), clientId);
    this._mqttClient.onMessageArrived = (message: Paho.MQTT.Message) => {
      // console.log("MQTT data arrived");
      this.mqttData = {
        topic: message.destinationName, // topic
        data: message.payloadString ? JSON.parse(message.payloadString) : {} // data
      };
    };

    this._mqttClient.onConnectionLost = (responseObject: Object) => {
      console.log('Connection Lost');
    };

    this._mqttClient.connect({
      useSSL: Config.CONSTANTS.MQTT.useSSL,
      userName: Config.CONSTANTS.MQTT.userName,
      password: Config.CONSTANTS.MQTT.password,
      onFailure: _refObj.onFailed.bind(this),
      onSuccess: _refObj.onConnected.bind(this),
      keepAliveInterval:45
    });
    // userName: 'biswajit', password: 'admin'
  }

  /**
   * Method called when mqtt connection failed
   * @param errorCode Error messages
   */
  private onFailed(errorCode) {
    console.log('Failed', errorCode);
  }

  /**
   * Method for subscribing all topic data
   */
  private onConnected(): void {
    let newData = this.getCopy(this.wcData);
    if (newData.isPreview) {
      newData = this.wcData.wcData;
    }
    console.log('Live Connected');
    for (let eachWidget of newData) {
      const chartOpt = eachWidget.cData.chartOptions;
      if (chartOpt.autoRefresh && chartOpt.autoRefreshType === 'realTime') {
        if (chartOpt.topics) {
          const topics = chartOpt.topics;
          const topicsList = Object.keys(topics);
          if (topicsList.length > 0) {
            this.subscribeTotopic(topicsList, 0);
          }
        }
      }
    }
  }

  subscribeTotopic(topicsList, topic) {
    this._mqttClient.subscribe(topicsList[topic], {
      onSuccess: (msg) => {
        // console.log(msg.grantedQos);
        topic++;
        if (topic < topicsList.length) {
          this.subscribeTotopic(topicsList, topic);
        }
      },
      onFailure: (errorMessage) => {
        // console.log(errorMessage);
        topic++;
        if (topic < topicsList.length) {
          this.subscribeTotopic(topicsList, topic);
        }
      }
    });
  }
  /**
   * Method to clone a JSON
   * @param obj JSON data to clone
   */
  getCopy(obj) {
    return obj ? JSON.parse(JSON.stringify(obj)) : obj;
  }

  /**
   * Method that clear/kill mqtt instances
   */
  clearMqttInstance() {
    if (this._mqttClient) {
      this._mqttClient = undefined;
    }
  }

  resizeOptions() {
    if (this.dashboardInfo != undefined && this.dashboardInfo.isOwner) {
      if (this.pageType === 'dashboard' && !this.pageAccessFor.resize) {
        this.gridstackOptions['disableResize'] = true;
        this.gridstackOptions['disableDrag'] = true;
      }
    } else {
      this.gridstackOptions['disableResize'] = true;
      this.gridstackOptions['disableDrag'] = true;
    }
  }

  /**
   * Method for emitting the widget config after editing it. Data is coming from wdg-display and forwarding it to widget manager
   * @param data widget data to save
   */
  editWidgetAction(data) {
    this.editWidgetEmitter.emit(data);
  }

  /**
   * Method for performing widget level actions like delete widget, which is emitted from wdg-display
   * @param _event data to perform action
   */
  doActions(_event) {
    this.delInfo = _event;
  }

  track(index) {
    return index;
  }

  /**
   * Method for performing widget delete
   */
  deleteWidget() {
    this._appService.deleteWidget(this.delInfo).subscribe((data) => {
      if (data && data.status === Config.CONSTANTS.SUCCESS) {
        this._toastLoad.toast('success', 'Success', data.message, true);
        this.deleteWidgetEmitter.emit();
      } else {
        this._toastLoad.toast('error', 'Error', data.message, true);
      }
      document.getElementById('dismissWidgetDelete').click();
    });
  }

  onChangeResize(evt: any, widget: any) {
    if (!this.firstTimeLoad) {
      for (const eventKey in evt) {
        widget.forEach((widgetKey) => {
          if (evt[eventKey].id == widgetKey.widget_id) {
            if (!widgetKey.hasOwnProperty('wResize')) {
              let wResize = {
                y: evt[eventKey].x,
                x: evt[eventKey].y,
                w: evt[eventKey].width,
                h: evt[eventKey].height
              };
              widgetKey.w = evt[eventKey].width;
              widgetKey.h = evt[eventKey].height * 80;
              widgetKey.wResize = wResize;
            } else {
              widgetKey.wResize.x = evt[eventKey].x;
              widgetKey.wResize.x = evt[eventKey].x;
              widgetKey.wResize.x = evt[eventKey].x;
              widgetKey.wResize.y = evt[eventKey].y;
              widgetKey.wResize.y = evt[eventKey].y;
              widgetKey.wResize.y = evt[eventKey].y;
              widgetKey.wResize.w = evt[eventKey].width;
              widgetKey.wResize.w = evt[eventKey].width;
              widgetKey.wResize.w = evt[eventKey].width;
              widgetKey.wResize.h = evt[eventKey].height;
              widgetKey.h = evt[eventKey].height * 80;
              widgetKey.h = evt[eventKey].height * 80;
              widgetKey.h = evt[eventKey].height * 80;
              widgetKey.w = evt[eventKey].width;
              this._wdgshow.setResize(true);
            }
          }
        });
      }
    } else if (evt.length == widget.length) {
      this._wdgshow.setResize(false);
      this.firstTimeLoad = false;
    }
  }

  resizeChangesDashboardLoad() {
    for (const resizeWidget of this.wcData) {
      if (!resizeWidget.hasOwnProperty('wResize')) {
        let wResize = {
          y: 0,
          x: 0,
          w: resizeWidget.w,
          h: Math.round(resizeWidget.h / 80)
        };
        resizeWidget.wResize = wResize;
      }
    }
  }

  resizeWidgetAction(eventResize) {
    if (
      eventResize == undefined &&
      !eventResize.action &&
      eventResize.action !== 'startResize' &&
      eventResize.action !== 'stopResize' &&
      eventResize.action !== 'saveResize'
    ) {
      return false;
    }
    switch (eventResize.action) {
      case 'startResize':
        this.doResize = true;
        break;
      case 'stopResize':
        this.doResize = false;
        this._wdgshow.setResize(false);
        break;
      case 'saveResize': {
        //  for (let index = 0; index < this.wcData.length; index++) {
        //    const element = this.wcData[index];
        //    this.saveResize = false;
        const emitData = {
          type: 'save resize',
          data: this.wcData
        };
        this.saveResizeEmitter.emit(emitData);

        //  }

        break;
      }
    }
  }

  // allowAccessMouseOver(compName: string, accessType: string) {
  //   if(this.authGuard.allowAccessComponent(compName,accessType)){
  //    // this.initateResize();
  //     this.titleDenied = '';
  //   }else{
  //     this.titleDenied = 'Access Denied'
  //   }
  // }

  // allowAccess(compName: string, accessType: string){
  //    return this.authGuard.allowAccessComponent(compName,accessType);

  // }

  getWidgetHeightWidth(widget, type, i) {
    let value = null;
    switch (type) {
      case 'min-height':
        value =
          this.wcData[i]['cType'] != 'hvbar'
            ? widget === 'KPI'
              ? 2
              :widget==='ON/OFF'
              ?4
              : widget === 'Custom KPI' || widget === 'Gauge'
              ? 4
              : 2
            : this.wcData[i]['isHorizontal']
            ? 4
            : 7;
        break;
      case 'max-height':
        value =
          this.wcData[i]['cType'] != 'hvbar'
            ? widget === 'KPI'
              ? 2:
             widget === 'ON/OFF'
              ?4
              : widget === 'Custom KPI' || widget === 'Gauge'
              ? 4
              : 10
            : this.wcData[i]['isHorizontal']
            ? 4
            : 7;
        break;

      case 'min-width':
        value =
          this.wcData[i]['cType'] != 'hvbar'
            ? widget === 'KPI'
              ? 3
              :widget==='ON/OFF'
              ? 2
              : widget === 'Custom KPI' || widget === 'Gauge'
              ? 3
              : 3
            : this.wcData[i]['isHorizontal']
            ? 5
            : 3;
        break;

      case 'max-width':
        value =
          this.wcData[i]['cType'] != 'hvbar'
            ? widget === 'KPI' 
              ? 3
              :widget==='ON/OFF'
              ?3
              : widget === 'Custom KPI' || widget === 'Gauge'
              ? 3
              : 12
            : this.wcData[i]['isHorizontal']
            ? 5
            : 3;
        break;

      case 'no-resize':
        value =
          widget === 'KPI' ||
          widget === 'Custom KPI' ||
          widget === 'Gauge' ||
          this.wcData[i]['cType'] == 'hvbar'
            ? true
            : false;
        break;
    }
    return value;
  }
}
