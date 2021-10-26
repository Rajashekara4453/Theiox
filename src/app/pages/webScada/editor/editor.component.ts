import { Component, ElementRef, EventEmitter, Input, OnInit, Output, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ToastrService } from '../../../../../src/app/components/toastr/toastr.service';
import { AuthGuard } from '../../auth/auth.guard';
import { WebscadaService } from '../webscada.service';
import { EditorMenuService } from './editor-services/editor-menu.service';
import { EditorUiService } from './editor-services/editor-ui.service';
import { FormatPanelService } from './editor-services/format-panel.service';
import { HandleGraphService } from './editor-services/handle-graph.service';
import { HandleXmlService } from './editor-services/handle-xml.service';
import { SidebarService } from './editor-services/sidebar.service';
import * as _scada from 'flowchart-diagram-editor/index';
import { Observable, Subscription } from 'rxjs-compat';
@Component({
  selector: 'kl-editor',
  templateUrl: './editor.component.html',
  styleUrls: ['./editor.component.scss']
})
export class EditorComponent implements OnInit {
  
  @ViewChild('graphContainer') graphContainer: ElementRef;

  @Output() refetchScada = new EventEmitter<string>();

  @Input() scadaData;
  isSubscribed: any;
  public isUpdateRequired: Subscription;

  constructor( private _toastLoad: ToastrService, 
    public _editorUI:EditorUiService, 
    private _menu:EditorMenuService, 
    private _handleXML:HandleXmlService,
    private _handleGraph:HandleGraphService,
    private _sidebar:SidebarService,
    public _auth: AuthGuard,
    public _preview:WebscadaService,
    private _formatPanel:FormatPanelService) { }

  ngOnInit() {
    this.graphContainer.nativeElement.innerHTML = ''
    this._handleGraph.graph = ''; 
    this._menu.updateMenu(_scada, null);
    this._editorUI.uiSettings(_scada, null);
    this._formatPanel.constructFormatPanel(_scada, null);
    this._sidebar.fixSidebar(_scada, null);
    this._editorUI.editorGraphSettings(_scada, null);
    this._handleGraph.overridesForEditorConditions(_scada, null);
    this.initializeGraph();
    document.body.classList.add('main-content-fullScreen')
    this._editorUI.removeOpenDropDowns();
  }

  ngOnChanges(){
    if(this.scadaData.hasOwnProperty('dashboardId') && this.scadaData.dashboardId !== ""){
      this.setUpEditor();
    }
    // USER CLICKS ON BACK > WE MUST CHECK IF THE SCADA IS MODIFIED OR NOT
    // ONLY WAY TO TRIGGER THE BACK BUTTON EVENT IS CAN DEACTIVATE
    // CAN DEACTIVATE NOT WORKING SINCE THERE ISN'T A SEPARATE ROUTE TO THIS COMPONENT
    // TO DISABLE USERS FROM CLICKING BROWSERS BACK BUTTON THE FOLLOWING CODE IS BEING USED
    history.pushState(null, null, location.href);
    window.onpopstate = function () {
        history.go(1);
    };
  }

  setUpEditor(){
    this.loadXml();
    _scada.mxKeyHandler.prototype.setEnabled(true);
  }

  canDeactivate() {
      if ( _scada['_editorUi'].editor.modified) {
        const result = window.confirm('There are unsaved changes! Are you sure?');
        return Observable.of(result);
      } else {
        return true;
      }
  }

  initializeGraph(){
    window['STENCIL_PATH'] = '/assets/library/scada/resources/stencils/';
    window['RESOURCES_PATH'] = '/assets/library/scada/resources/images/';
    window['IMAGE_PATH'] = '/assets/library/scada/resources/images/'
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
          var I = null;
          this._handleGraph.graph.panningHandler.addListener(_scada.mxEvent.PAN_START, _scada.mxUtils.bind(this, function() {
            this._handleGraph.graph.isEnabled() && (I = this._handleGraph.graph.container.style.cursor, this._handleGraph.graph.container.style.cursor = "move")
          }));
          this._handleGraph.graph.panningHandler.addListener(_scada.mxEvent.PAN_END, _scada.mxUtils.bind(this, function() {
            this._handleGraph.graph.isEnabled() && (this._handleGraph.graph.container.style.cursor = I)
          }));
          var node;
          if(this.scadaData.widget && this.scadaData.widget.wcData && (this.scadaData.widget.wcData.length == 0)){
            node = btoa(_scada.mxUtils.getPrettyXml(_scada['_editorUi'].editor.getGraphXml()));
          } else if(this.scadaData.widget && this.scadaData.widget.wcData){
            node = atob(this.scadaData.widget.wcData[0].SCADAData);
          }
          this._handleXML.formatGraphSettings(_scada.mxUtils.parseXml(node).childNodes[0]);
          this._handleGraph.graph['scadaData'] = this.scadaData;
          this._handleXML.loadXMLIntoContainer(this.scadaData, _scada);
          setTimeout(()=>{
            this._editorUI.loaderToggleOff();
          }, 200)
          this._editorUI.enableMenu();
        }
      },100)
    }
  }

  /**
   * facilitates window destruction for windows opened through editor.
   *  @param window the key provided in action if key is not present in the actions it means the window is not open
   */
  destroyEditorWindows(window) : void{
    var layers = _scada['_editorUi'].actions[window];
    (layers) ? 
      layers.destroy(): null;
  }

  ngOnDestroy(){
    this._editorUI.loaderToggleOn();
    this.destroyEditorWindows('layersWindow');
    this.destroyEditorWindows('outlineWindow');
    document.body.classList.remove('main-content-fullScreen');
    this.refetchScada.emit('refetchScada')
  }
}
