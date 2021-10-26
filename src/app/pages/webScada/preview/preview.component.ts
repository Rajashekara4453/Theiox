import {
  Component,
  ElementRef,
  EventEmitter,
  Input,
  OnChanges,
  OnInit,
  Output,
  SimpleChanges,
  ViewChild
} from '@angular/core';
import { AuthGuard } from '../../auth/auth.guard';
import { EditorUiService } from '../editor/editor-services/editor-ui.service';
import { HandleGraphService } from '../editor/editor-services/handle-graph.service';
import { HandleXmlService } from '../editor/editor-services/handle-xml.service';
import { WebscadaService } from '../webscada.service';
import * as _scada from 'flowchart-diagram-editor/index';
import { ToastrService } from '../../../../../src/app/components/toastr/toastr.service';
import { Subscription } from 'rxjs-compat';
import { Params, Router } from '@angular/router';

@Component({
  selector: 'kl-preview',
  templateUrl: './preview.component.html',
  styleUrls: ['./preview.component.scss']
})
export class PreviewComponent implements OnInit, OnChanges {

  @ViewChild('graphContainer') graphContainer: ElementRef;
  @Input() scadaData;
  @Output() refetchOnEdit = new EventEmitter<string>();

  public contextMenuEnabled = false;
  hasGraphUpdated: Subscription;
  public isSubscribed: Boolean = false;
  public hasObservable: Subscription;
  public hasEditAccess: boolean;
  hasTriggerAccess: any;
  cellType: string;
  context_shape_name: any;
  isCellConfigured: boolean;
  highligtOut: any;
  isCellAssetRemote: boolean;
  cell_name: any;
  cell_id: any;

  public devices = {};
  public tags = {};
  public units = {};

  public cellPropertyData: any = {
    body_content: []
  };
  pageType;

  public configPopupData: any = {
    conditionsExist: false,
    device: 'Not Found',
    tag: 'Not Found',
    unit: 'Not Found',
    decimal: 'Not Found',
    live_value: 'Not Found',
    showUnits: true,
    showValue: false,
    header_content: ['Compare', 'Compare value', 'Action', 'Action value'],
    body_content: []
  };

  constructor(private _editorUI:EditorUiService, 
              private _router: Router,
              private _handleXML:HandleXmlService,
              public _handleGraph:HandleGraphService,
              public _auth: AuthGuard,
              private _toastLoad: ToastrService,
              public _preview:WebscadaService,) { }

  ngOnChanges(changes: SimpleChanges) {
    if(this.scadaData && this.scadaData.hasOwnProperty('dashboardId') && this.scadaData.dashboardId !== ''){
      this._editorUI.loaderToggleOn();
      this.contextMenuEnabled = false;
      this.initializeContainer();
      this.loadXml();
      _scada.mxKeyHandler.prototype.setEnabled(false);
    }
  }

  // v------scadaColors fetched and saved for updating---------v //
  ngOnInit() {
    this._preview.getMetaData();
    this._preview.getScadaColors();
    this.hasEditAccess = this._auth.getMenuObject.accessLevel.edit;
    let triggerAccess = this._auth.allowAccessComponent(
      'assetControl',
      'trigger'
    ); 
    this.hasTriggerAccess = triggerAccess == undefined ? true : triggerAccess;
  }

  initializeContainer(){

    this.graphContainer.nativeElement.innerHTML = ''
    this._handleGraph.graph = ''; 
    window['STENCIL_PATH'] = '/assets/library/scada/resources/stencils/';
    window['RESOURCES_PATH'] = '/assets/library/scada/resources/images/';
    window['IMAGE_PATH'] = '/assets/library/scada/resources/images/'

    this._editorUI.previewGraphSettings(_scada, null);
    this._editorUI.previewUiSettings(_scada, null);
    this._handleGraph.overridesForPreviewConditions(_scada, null);

    try {
      return _scada.mxUtils.getAll(
        [
          _scada.mxResources.getDefaultBundle('/assets/library/scada/resources/elmeasure', mxLanguage),
          '/assets/library/scada/resources/stencils/default.xml'
        ],
        (xhr) => {
          _scada.mxResources.parse(xhr[0].getText());
          const themes = new Object();
          themes['default'] = xhr[1].getDocumentElement();
          this._handleGraph.graph = new _scada.Graph(null, null, null, null, themes, null);
          this._handleGraph.graph['transparentBackground'] = false;
          const renderContainer = new _scada.EditorUi(
            new _scada.Editor(false, themes['default'], null, this._handleGraph.graph, true),
            this.graphContainer.nativeElement
          );
        },
        () => {
          this._toastLoad.toast('error', 'Error', 'Failed to load', true);
        }
      );
    } catch (err) {
      console.log(err);
    }
  }

  loadXml(){
    if (this.scadaData.hasOwnProperty('dashboardId') && this.scadaData.dashboardId !== "") {
      const graphAvailable = setInterval(() => {
        if (this._handleGraph.graph) {
          clearInterval(graphAvailable);
          var node;
          if(this.scadaData.widget && this.scadaData.widget.wcData && (this.scadaData.widget.wcData.length == 0)){
            node = btoa(_scada.mxUtils.getPrettyXml(_scada['_editorUi'].editor.getGraphXml()));
          } else if(this.scadaData.widget && this.scadaData.widget.wcData){
            node = atob(this.scadaData.widget.wcData[0].SCADAData);
          }
          this._handleXML.formatGraphSettings(_scada.mxUtils.parseXml(node).childNodes[0]);
          this._handleGraph.graph['scadaData'] = this.scadaData;
          this._handleXML.loadXMLIntoContainer(this.scadaData, _scada, true);
          setTimeout(()=>{
            this._editorUI.loaderToggleOff();
          }, 200)
          this.graphUpdateObservable(node);
          this._preview.setCellProperty(_scada, node, false);
        }
      },100)
    }
  }

  isGraphCurrentlyUpdating() {
    if (this.isSubscribed) {
      this.hasObservable.unsubscribe();
      this.hasGraphUpdated.unsubscribe();
      this.isSubscribed = false;
    }
  }

  graphUpdateObservable(XML) {
    if (!this.isSubscribed) {
      this.hasObservable = this._preview
        .getPreviewCells()
        .subscribe((data) => {
          this.isSubscribed = true;
          this.updateCellOnValue(data, XML);
        });

        this.hasGraphUpdated = this._preview
        .getGraphState()
        .subscribe((data) => {
          this.setGraphEvents();
          _scada.mxCellHighlight.prototype.keepOnTop = true;
          _scada.mxConstants.HIGHLIGHT_OPACITY = 70;
          this.highligtOut = new _scada.mxCellHighlight(
            this._handleGraph.graph,
            '#eee',
            5
          );
        });
    }
  }

  updateCellOnValue(data, XML) {
    const graph = this._handleGraph.graph;
    if (graph && data && data['cell_id']) {
      const cell = graph.model.getCell(data['cell_id'].getAttribute('id'));
      if (cell && cell.hasOwnProperty('defaultStyle')) {
        if (data['value']) {
          this._handleGraph.graph.model.setValue(cell, data['value']);
        }
        if (
          cell &&
          cell.defaultStyle &&
          data.styles &&
          data.styles.remove &&
          data.styles.remove.length > 0
        ) {
          const styleRemoval = data.styles.remove;
          for (let i = 0; i < styleRemoval.length; i++) {
            this._preview.setCellStyle(
              styleRemoval[i].split('=')[0],
              cell.defaultStyle[styleRemoval[i].split('=')[0]],
              cell,
              data['value']
            );
          }
        }
        if (
          cell &&
          cell.defaultStyle &&
          data.styles &&
          data.styles.update.length > 0
        ) {
          const styleUpdate = data.styles.update;
          for (let i = 0; i < styleUpdate.length; i++) {
            this._preview.setCellStyle(
              styleUpdate[i].split('=')[0],
              styleUpdate[i].split('=')[1],
              cell,
              data['value']
            );
          }
        }
      } else {
        this._preview.setCellProperty(_scada, XML, true);
      }
      _scada['_editorUi'].editor.setModified(false);
    }
  }
 
  setHightLightNull() {
    if(this._handleGraph.graph.hasOwnProperty('hoverEnabled') && this._handleGraph.graph.hoverEnabled){
      this.highligtOut ? this.highligtOut.highlight(null) : null;
    }
  }
  setHighLight(state) {
    if(this._handleGraph.graph.hasOwnProperty('hoverEnabled') && this._handleGraph.graph.hoverEnabled){
      this.highligtOut.highlight(state);
    }
  }

  public highlightActive = false
  setGraphEvents() {
    this._handleGraph.graph.addMouseListener({
      /**
       * on mouseDown-
       * check if the cell has the required key,
       * set the required variables
       * @default false this.assetTableBodyArray - used to render the table.
       * @default false isTableRendered - a flag set to reset the variable if the popup is opened second time onwards
       * action_id to send write request, modbusPopupTitle to popup title.
       * open the popup and fetch for data
       * modbus_action_indo
       * */
      mouseUp: (sender: Object, me: any) => {
        if (me.state) {
          if (me.state.cell) {

            this.configPopupData.conditionsExist = false;
            if (this.contextMenuEnabled) {
              this.setHightLightNull();
              this.contextMenuEnabled = false;
            } else {
              if (me.evt.button == 2) {
                this.setHightLightNull();
                this.setHighLight(me.state);
                this.highlightActive = true;
                this._editorUI.removeOpenDropDowns();
                this.isCellConfigured = this.isConfigured(me.state.cell);
                this.isCellAssetRemote = this.isAssetRemote(me.state.cell);
                me.state.cell['asset_control']
                  ? (this._preview.action_id =
                  me.state.cell['asset_control']['action_id'])
                  : null;
                me.state.cell['asset_control']
                  ? this.setActionCellName(me.state.cell)
                  : null;

                if (this.isCellConfigured) {
                  this.createConfigPopupData(me.state.cell);
                }
                if (me.state.cell.hasOwnProperty('defaultStyle')) {
                  this.createPropertyData(me.state.cell);
                }
                me.state.cell['cellName']
                  ? (this.context_shape_name = me.state.cell['cellName'])
                  : (this.context_shape_name = 'el_' + me.state.cell['id']);
                this.cell_id = me.state.cell.id;

                me.state.cell['asset_control']
                  ? (this._preview.action_id =
                      me.state.cell['asset_control']['action_id'])
                  : null;
                this._preview.setContextMenu(me.evt.pageY, me.evt.pageX);
                this.contextMenuEnabled = true;
              } else {
                if (
                  me.state.cell.hasOwnProperty('asset_control') &&
                  me.state.cell.asset_control.isEnabled == 1 &&
                  this.scadaData['isOwner'] &&
                  this.hasTriggerAccess
                ) {
                  this.setHighLight(me.state);
                  this.highlightActive = true;
                  this._preview.action_id =
                    me.state.cell['asset_control']['action_id'];
                    me.state.cell['asset_control']
                    ? this.setActionCellName(me.state.cell)
                    : null;
                  this.contextMenuEnabled = false;
                  this._preview.openTriggerPopup();
                } else {
                  this.contextMenuEnabled = false;
                  this.highlightActive = false;
                }
              }
            }
          } else {
            this.setHightLightNull();
            this.highlightActive = false;
            this.contextMenuEnabled = false;
          }
        } else {
          this.setHightLightNull();
          this.highlightActive = false;
          this.contextMenuEnabled = false;
        }
      },
      mouseMove: (graph: Object, me: any) => {
        if (me.state) {
          var state = me.state; // me.getState and me.state are not same ?
          if (state && state.cell) {
            if (!this.contextMenuEnabled) {
              this.setHighLight(me.state);
            }
            this.highlightActive = true;
            if (
              state.cell.hasOwnProperty('asset_control') &&
              state.cell.asset_control.isEnabled &&
              this.scadaData['isOwner'] &&
              this.hasTriggerAccess
            ) {
              state.setCursor('pointer');
            } else {
              state.setCursor('default');
            }
          } else {
            this.setHightLightNull();
            this.highlightActive = false;
            state.setCursor('default');
          }
        } else {
          if (this.highlightActive && !this.contextMenuEnabled) {
            this.highlightActive = false;
            this.setHightLightNull();
          }
        }
      },
      /**
       * mouseUp is used in the editor to calculate the event, if its not present it goes in as undefined
       * which throws an error on mouse up.
       */
      mouseDown: function (sender, me) {}
    });
  }

  public repaintHandler;
  isConfigured(cell) {
    if (
      cell.hasOwnProperty('configure') &&
      cell['configure'].hasOwnProperty('conditions')
    ) {
      if (
        cell.hasOwnProperty('devices') &&
        cell.devices &&
        cell.hasOwnProperty('tags') &&
        cell.tags
      ) {
        return true;
      } else {
        return false;
      }
    }
  }

  isAssetRemote(cell) {
    if (
      cell.hasOwnProperty('asset_control') &&
      cell['asset_control'].hasOwnProperty('action_id') &&
      this.hasTriggerAccess &&
      cell.asset_control.isEnabled == 1
    ) {
      return true;
    } else {
      return false;
    }
  }

  setActionCellName(cell) {
    cell.hasOwnProperty('cellName')
      ? (this._preview.cell_name = cell.cellName)
      : (this._preview.cell_name = 'el_' + cell.id);
  }

  createPropertyData(cell) {
    this.cellPropertyData.body_content = [];
    let source: String,
      shape: String,
      value: String,
      fillColor = '#FFFFFF';
    let style = cell.defaultStyle;
    if (style.shape == 'image') {
      if (cell.style.includes('/defaultImages/')) {
        source = 'Gallery';
      } else {
        source = 'Uploads';
      }
      if (style.hasOwnProperty('imageBackground')) {
        fillColor = style.imageBackground;
      }
      this.cellType = 'Image';
    } else {
      source = 'Shapes';
      this.cellType = 'Shape';
      var concurrent = cell.style.split(';');
      for (const style of concurrent) {
        if (style && style.includes('fillColor')) {
          fillColor = style.split('=')[1].toUpperCase();
        }
      }
    }
    value = cell.value;
    this.cellPropertyData.body_content.push(
      {
        key: 'Source',
        value: source
      },
      {
        key: 'Value',
        value: value
      },
      {
        key: 'Fill Color',
        value: this._preview.hexReference[fillColor]
          ? this._preview.hexReference[fillColor]
          : fillColor
      }
    );
  }

  createConfigPopupData(cell) {
    this.configPopupData.body_content = [];
    if (cell.configure.conditions.length > 0) {
      this.configPopupData.conditionsExist = true;
    }
    for (const conditions of cell.configure.conditions) {
      if (this._preview.colorPicker[conditions['action']['change_to']]) {
        conditions['action']['change_to'] = this._preview.colorPicker[
          conditions['action']['change_to']].value;
      }
      var changeValue = this._preview.hexReference[
        conditions['action']['change_to']
      ];
      var actionValue = this._preview.Action[conditions['action']['name']];
      const condition = {
        compare: `${
          this._preview.Comparison[conditions['condition']].value
        } (${this._preview.Comparison[conditions['condition']].label})`,
        c_value: conditions['value'],
        action: actionValue.label,
        a_value: changeValue ? changeValue : conditions['action']['change_to'],
        progress_labels: (actionValue.label.toLowerCase() == 'progress') ? this._preview.Action['progress'].labels[conditions['action']['direction']] : '',
        isColor: (
          changeValue || typeof conditions['action']['change_to'] !== 'number'
            ? conditions['action']['change_to'].includes('#')
            : null
        )
          ? true
          : false,
        rawColor: conditions['action']['change_to']
      };
      if (
        (condition.a_value == 'none' || condition.a_value == 'block') &&
        actionValue.hasOwnProperty('type') &&
        actionValue.type == 'value-to-hide'
      ) {
        condition.a_value == 'none'
          ? (condition.a_value = 'Hide')
          : (condition.a_value = 'Show');
      }
      this.configPopupData.body_content.push(condition);
    }
    if (
      cell.hasOwnProperty('devices') &&
      cell.devices &&
      cell.hasOwnProperty('tags') &&
      cell.tags &&
      this._preview.tags
    ) {
      const tagsNunits = cell.tags.split(':');
      this.configPopupData.device = this._preview.devices[cell.devices];
      this.configPopupData.tag = this._preview.tags[tagsNunits[0]];
      this.configPopupData.unit = this._preview.units[cell.converter];
      cell.value ? (this.configPopupData.live_value = cell.value) : null;
      this.configPopupData.decimal = cell.decimal
      
      this.configPopupData.showUnits = cell.showUnits === 1 ? true : false;
      this.configPopupData.showValue = cell.showValue === 1 ? true : false;
    }
  }

  triggerConfirm() {
    this.triggerCountDown();
    this.contextMenuEnabled = false;
    this._preview.triggerAction();
  }

  triggerCountDown() {
    this._preview.hasSubbed ? this._preview.hasSubbed.unsubscribe() : null;
    this._preview.initiateTriggerCountDown();
  }

  copyInputMessage(val) {
    val.focus();
    val.select();
    document.execCommand('copy');
  }

  editGraph() {
    setTimeout(()=>{
      let queryParams: Params = { view: 'editor' };
      let url =
      'scada/' +
      this.scadaData['dashboardId'];
      this._router.navigate([url],{
        queryParams: queryParams, 
      });
    },300)
  }

  zoomInGraph() {
    this._handleGraph.graph.zoomIn();
  }

  zoomOutGraph() {
    this._handleGraph.graph.zoomOut();
  }

  resetGraph() {
    this._handleGraph.graph.getPagePadding = () => {
      return new _scada.mxPoint(0, 0);
    };
    this._preview.setPageZoom();
  }

  ngOnDestroy(){
    this._editorUI.loaderToggleOn();
    this._preview.disconnect();
    this.isGraphCurrentlyUpdating();
    this.refetchOnEdit.emit('fetchOnEdit');
  }
}
