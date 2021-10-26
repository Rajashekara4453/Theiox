import { SidebarService } from './sidebar.service';
import { Injectable } from '@angular/core';
import { HandleGraphService } from './handle-graph.service';
import { UtilityFunctions } from '../../../../../../src/app/utilities/utility-func';
import { AppService } from '../../../../../../src/app/services/app.service';
import { ToastrService } from '../../../../../../src/app/components/toastr/toastr.service';

@Injectable({
  providedIn: 'root'
})
export class HandleXmlService {

  constructor(
    private _handleGraph:HandleGraphService,
    private _app: AppService,
    private _toastLoad: ToastrService,
    private _sidebar:SidebarService,
    private _util: UtilityFunctions
  ) { }

default_images_key_access = [];

  loadXMLIntoContainer(dashboardInfo: any, _scada:  any, isPreview ?: boolean) {
    var _service = this; 
    var _graph = this._handleGraph.getGraphObject();
    _scada.Editor.prototype.setGraphXml = function(xml) {

      this.graph = _graph;
      var node = _scada.mxUtils.parseXml(xml).documentElement;

      if (node != null) {
        var dec = new _scada.mxCodec(node.ownerDocument);
        if (node.nodeName == 'mxGraphModel') {
          this.graph.model.beginUpdate();
          try {
            this.graph.model.clear();
            this.graph.view.scale = 1;
            this.readGraphState(node);
            this.updateGraphComponents();
            dec.decode(node, this.graph.getModel());
            _service.fetchDefaultImages(node.getElementsByTagName("mxCell"), this.graph, _scada, isPreview)
          } catch(err) {
            console.log(err)
          }
          finally {
            this.graph.model.endUpdate();
          }
          this.fireEvent(new _scada.mxEventObject('resetGraphView'));
        }
        else if (node.nodeName == 'root') {
          this.resetGraph();
          var wrapper = dec.document.createElement('mxGraphModel');
          wrapper.appendChild(node);
          
          dec.decode(wrapper, this.graph.getModel());
          this.updateGraphComponents();
          this.fireEvent(new _scada.mxEventObject('resetGraphView'));
        }
        else {
          throw {
              message: _scada.mxResources.get('cannotOpenFile'),
              node: node,
              toString: function() { return this.message; }
          };
        }
      } else {
        this.resetGraph();
        this.graph.model.clear();
        this.fireEvent(new _scada.mxEventObject('resetGraphView'));
      }

      _scada._editorUi.editor.undoManager.clear();
      _scada._editorUi.editor.setModified(false);
    };
    let XML = '';
    try {
      const widgetList = dashboardInfo['widget'].wcData;
      XML = atob(widgetList[0]['SCADAData']);

      _scada.Editor.prototype.setGraphXml(XML);
      _scada._editorUi.editor.setModified(false);
    } catch (err) {
      console.log(err)
    }
  }

  /**
   * Go through nodes >> look for images >> and if they are older versions replace old URL with new ones.
   * @param nodes 
   * @param graph
   */
  updateVersionSpecificUrl(nodes: any, graph: any, scada: any, isPreview?: boolean): void{
    const model = graph.getModel();
    for (const node of nodes) {
      const cell = model.getCell(node.getAttribute('id'));
      // IF THE LOCKED LAYERS NEED CONTEXT MENU.
      if(isPreview && cell && cell.style && cell.style.includes('locked=1;')){
        graph.setCellStyles('locked', '0', [cell])
      }
      if (cell && !cell.version && cell.style && cell.style.includes('shape=image;')) {
        const stylesArray = cell.style.split(';');
        let cellStyle = '';
        cell.style = '';
        for (const style of stylesArray) {
          if (style.includes('image=')) {
            let extract_URL = style.split('=')[1];
            let extracted_Name = extract_URL.split('/');
            const searchTerm = extracted_Name[extracted_Name.length - 1]
            if (this.default_images_key_access[searchTerm]) {
              cellStyle = `${cellStyle}image=${this._sidebar.getHostIp(this._util.appMode)}${this.default_images_key_access[searchTerm]};`
            }
          } else {
            if(style !== ""){
              cellStyle = cellStyle + style + ";";
            }
          }
          if (cell.style.includes('shape=image;') && cell.style.includes('image=')) {
            var left = cell.style.split('image=')[0];
            var center = this._sidebar.getHostIp(this._util.appMode);
            var right = cell.style.split('//')[1].split('/');
            right.shift();
            cell.style = left+"image="+center+"/"+right.join('/');
          }
          graph.setCellStyle(scada.mxUtils.trim(cellStyle), [cell]);
          cell.version = 1;
        }
      }
    }
  }

  fetchDefaultImages(nodes: any, graph: any,_scada: any, isPreview?: boolean): void{
    this._app.getAllImagesInfo({}).subscribe((resp) => {
      if (resp['status'] == 'success') {
        this.default_images_key_access = [];
          var assetsArr = resp['data'].images_info;
          for (let images of assetsArr) {
            let splitURL = images.url.split('/');
            this.default_images_key_access[splitURL[splitURL.length - 1]] = images.url;
          }
          this.updateVersionSpecificUrl(nodes, graph,_scada, isPreview)
      } else {
        this._toastLoad.toast('error', 'Error', 'Failed to load default images', true);
      }
    }, (err) => {
      this._toastLoad.toast('error', 'Error', 'Failed to load default images', true);
    })
  }

  formatGraphSettings(_node): void {
    var _graph = this._handleGraph.getGraphObject();

    const fitHorizontal = _node.getAttribute('fitHorizontal');
    (fitHorizontal) ? this._handleGraph.graph.fitHorizontal = (fitHorizontal == 'true') ? true : false : null;
  
    const fitVertical = _node.getAttribute('fitVertical');
    (fitVertical) ? this._handleGraph.graph.fitVertical = (fitVertical == 'true') ? true : false : null;

    const zoomEnabled = _node.getAttribute('zoomEnabled');
    (zoomEnabled) ? this._handleGraph.graph.zoomEnabled = (zoomEnabled == 'true') ? true : false : null;

    const hoverEnabled = _node.getAttribute('hoverEnabled');
    (hoverEnabled) ? this._handleGraph.graph.hoverEnabled = (hoverEnabled == 'true') ? true : false : null;

    const fitToScreen = _node.getAttribute('fitToScreen');
    (fitToScreen) ? this._handleGraph.graph.fitToScreen = (fitToScreen == 'true') ? true : false : null;

    const canvas = _graph.view.canvas;
    (_graph.view.canvas.ownerSVGElement != null) ? this._handleGraph.graph.view.canvas = _graph.view.canvas.ownerSVGElement : null;

    const background = _node.getAttribute('background');
    this._handleGraph.graph.view.canvas.style.backgroundColor = (background == "none" ? "white" : background);


    const saveToPreview = _node.getAttribute('saveToPreview');
    if(this._handleGraph.graph.isGridEnabled()){
      this._handleGraph.graph.saveToPreview = (saveToPreview == 'true') ? true : false;
    } else {
      this._handleGraph.graph.saveToPreview = false;
    }

    if (saveToPreview == 'true') {
      this._handleGraph.graph.gridEnabled = (_node.getAttribute('saveToPreview') == 'true') ? true : false;
      this._handleGraph.graph.view.gridColor = _node.getAttribute('gridColor');
      this._handleGraph.graph.gridSize = _node.getAttribute('gridSize');
    } else {
      this._handleGraph.graph.saveToPreview = (_node.getAttribute('saveToPreview') == 'true') ? true : false;
    }
    
  }

}
