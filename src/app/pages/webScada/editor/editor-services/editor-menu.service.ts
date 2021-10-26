import { Injectable } from '@angular/core';
import { ToastrService } from '../../../../components/toastr/toastr.service';
import { AppService } from '../../../../../../src/app/services/app.service';
import { EditorUiService } from './editor-ui.service';
import { AuthService } from '../../../../../../src/app/pages/auth/auth.service';
import { HandleGraphService } from './handle-graph.service';
import { Router } from '@angular/router';
import { Subject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class EditorMenuService {

  constructor(private _editorUi:EditorUiService,
              private _appService: AppService,
              private _auth:AuthService,
              private _router:Router,
              private _graph:HandleGraphService,
              private _toaster:ToastrService) { }

  public scada_editor;
  public toggleView = "preview";
  public pageType = 'scada';
  public exitEditor = new Subject();
  public saving = false;

  updateMenu(_scada, _settings){
    let _editorUi = this._editorUi;
    let _service = this;
    _scada.Menus.prototype.defaultMenuItems = [
      'cancel',
      'saveexit',
      'file',
      'edit',
      'view',
      'arrange'
    ];

    const menuItems = _scada.Menus.prototype.init;
    const actionsItems = _scada.Actions.prototype.init;

    _scada.Menus.prototype.init = function () {
      menuItems.apply(this);
      var isGraphEnabled = _scada.mxUtils.bind(this.editorUi.editor.graph, this.editorUi.editor.graph.isEnabled);
      this.put(
        'cancel',
        new _scada.Menu(
          _scada.mxUtils.bind(this, function (menu, parent) {
            _service._editorUi.disableMenu();
            if (_scada.hasOwnProperty('_editorUi') && _scada['_editorUi'].hasOwnProperty('editor')) {
              if (_scada['_editorUi'].editor.modified) {
                var con = confirm('There are unsaved changes! Are you sure?');
                if(!con){
                  _service._editorUi.enableMenu();
                  return;
                }
              }
            }
            _service.exitEditor.next(true);
            let url = _service.pageType +"/"+ _service._graph.graph.scadaData.dashboardId;
            _service._router.navigate([url]);
          })
        )
      );

      this.put(
        'saveexit',
        new _scada.Menu(
          _scada.mxUtils.bind(this, function (menu, parent) {
            this.addMenuItems(menu, ['save', '-', 'save&exit'], parent);
          })
        )
      );

      this.put('file', new _scada.Menu(_scada.mxUtils.bind(this, function (menu, parent) {
        this.addMenuItems(menu, ['import', 'export', '-', 'pageSetup', 'print'], parent);
      })));

      this.put('edit', new _scada.Menu(_scada.mxUtils.bind(this, function (menu, parent) {
        this.addMenuItems(menu, ['undo', 'redo', '-', 'cut', 'copy', 'paste', 'delete', '-', 'duplicate', '-',
          , 'editStyle', '-', 'edit', '-',
          'selectVertices', 'selectEdges', 'selectAll', 'selectNone', '-', 'lockUnlock'
        ]);
      })));

      this.put('arrange', new _scada.Menu(_scada.mxUtils.bind(this, function (menu, parent) {
        this.addMenuItems(menu, ['toFront', 'toBack', '-'], parent);
        this.addSubmenu('direction', menu, parent);
        this.addMenuItems(menu, ['turn', '-'], parent);
        this.addSubmenu('align', menu, parent);
        this.addSubmenu('distribute', menu, parent);
        menu.addSeparator(parent);
        this.addSubmenu('navigation', menu, parent);
        this.addSubmenu('layout', menu, parent);
        this.addMenuItems(menu, ['-', 'group', 'ungroup', 'removeFromGroup', '-', 'clearWaypoints', 'autosize'], parent);
      }))).isEnabled = isGraphEnabled;

    };

    _scada.Actions.prototype.init = function () {
      actionsItems.apply(this);
      var ui = this.editorUi;
      var editor = ui.editor;
      var graph = editor.graph;
      ui.footerHeight = 0;
      ui.hsplitClickEnabled = true;
      graph['fitToScreen'] = true;
      graph['fitHorizontal'] = false;
      graph['fitVertical'] = false;
      graph['zoomEnabled'] = true;
      graph['hoverEnabled'] = false;

      var isGraphEnabled = function () {
        return _scada.Action.prototype.isEnabled.apply(this, arguments) && graph.isEnabled();
      };

      // SAVE
      this.addAction('save', () => {
        if(_service.saving){
          return;
        }
        _editorUi.loaderToggleOn();
        _service._editorUi.disableMenu();
        try{
          let newGraph;
          try{
            newGraph = btoa(_scada.mxUtils.getPrettyXml(_service.getXmlNode(ui)))
          } catch(err) {
            _service._toaster.toast('error', 'Error', "Unable to save, Invalid character found.", true);
            _editorUi.loaderToggleOff();
            return;
          }

          _service.saving = true;
          _service._appService.saveScada(
            {
              dashboard_id: graph.scadaData.dashboardId,
              "widget_data":{
                "SCADAData": newGraph,
                "cData":{"chartOptions": {"reportFormat": {} } },
                "cType":"Scada",
                "widget_id": graph.scadaData.widget.wcData[0].widget_id
              },
              "site_id":  _service._auth.getCurrentUserSiteId(),
              "widget_id": graph.scadaData.widget.wcData[0].widget_id
            }).subscribe((resp)=>{
              if(resp.status == 'success'){
                _service._toaster.toast('success', 'Success', 'Scada saved successfully', true);
                editor.setModified(false);
              } else {
                _service._toaster.toast('error', 'Error', "Failed to save, please try again later.", true);
              }
                _service.saving = false;
              _editorUi.loaderToggleOff();
              _service._editorUi.enableMenu();
          }, (err) => {
            _service.saving = false;
            _editorUi.loaderToggleOff();
            _service._editorUi.enableMenu();
            _service._toaster.toast('error', 'Error', "Unable to reach server, please try again later.", true);
          })
        } catch(err){
          console.log(err)
        }          
      }, null, null, _scada.Editor.ctrlKey + '+S').isEnabled = isGraphEnabled;

      this.addAction("saveAs...", function() {
       // DO NOTHING
      }, null, null, _scada.Editor.ctrlKey + "+Shift+S").isEnabled = isGraphEnabled;

      // SAVE AS
      this.addAction('save&exit', function () {
        if(_service.saving){
          return;
        }
        _editorUi.loaderToggleOn();
        try{
          let newGraph;
          try{
            newGraph = btoa(_scada.mxUtils.getPrettyXml(_service.getXmlNode(ui)))
          } catch(err) {
            _service._toaster.toast('error', 'Error', "Unable to save, Invalid character found.", true);
            _editorUi.loaderToggleOff();
            return;
          }

          _service._appService.saveScada(
            {
              dashboard_id: graph.scadaData.dashboardId,
              "widget_data": {
                "SCADAData": newGraph,
                "cData":{"chartOptions": {"reportFormat": {} } },
                "cType":"Scada",
                "widget_id": graph.scadaData.widget.wcData[0].widget_id
              },
              "site_id":  _service._auth.getCurrentUserSiteId(),
              "widget_id": graph.scadaData.widget.wcData[0].widget_id
            }).subscribe((resp)=>{
              if(resp.status == 'success'){
                _service._editorUi.disableMenu();
                _service._toaster.toast('success', 'Success', 'Scada saved successfully', true);
					      editor.setModified(false);

                let url = _service.pageType +"/"+ _service._graph.graph.scadaData.dashboardId;
                _service._router.navigate([url]);
              } else {
                _service._toaster.toast('error', 'Error', "Failed to save, please try again later.", true);
              }
              _service.saving = false;
              _editorUi.loaderToggleOff();
          }, (err) => {
            _service.saving = false;
            _editorUi.loaderToggleOff();
            _service._toaster.toast('error', 'Error', "Unable to reach server, please try again later.", true);
          })
        } catch(err){
          console.log(err)
        }        
        
      }, null, null).isEnabled = isGraphEnabled;

      // IMPORT
      this.addAction('import...', function(){
        _service._editorUi.openImportModal();
      }).isEnabled = isGraphEnabled;

      // EXPORT
      this.addAction('export...', function(){
        _service._editorUi.openExportModal();
      }).isEnabled = isGraphEnabled;

      // OPEN LIVE DATA CONFIGURATION POPUP
      this.addAction("liveData", function () {
        _service._graph.graph['CELL'] = graph.getSelectionCell();
        _service._graph.graph['clickSource'] = graph.firstClickSource.parentNode;

        _service._editorUi.openliveDataModal();
      });

      this.addAction("asset_control", function () {
        _service._graph.graph['CELL'] = graph.getSelectionCell();
        _service._graph.graph['clickSource'] = graph.firstClickSource.parentNode;

        _service._editorUi.openAssetControlModal();
      });
    }

    _scada.Toolbar.prototype.init = function() {
        var sw = screen.width;
        sw -= (screen.height > 740) ? 56 : 0;
        
        if (sw >= 700) {
            var formatMenu = this.addMenu('', _scada.mxResources.get('view') + ' (' + _scada.mxResources.get('panTooltip') + ')', true, 'viewPanels', null, true);
            this.addDropDownArrow(formatMenu, 'geSprite-formatpanel', 38, 50, -4, -3, 36, -8);
            this.addSeparator();
        }
        
        var viewMenu = this.addMenu('', _scada.mxResources.get('zoom') + ' (Alt+Mousewheel)', true, 'viewZoom', null, true);
        viewMenu.showDisabled = true;
        viewMenu.style.whiteSpace = 'nowrap';
        viewMenu.style.position = 'relative';
        viewMenu.style.overflow = 'hidden';
        viewMenu.style.width = '45px';
        
        if (sw >= 420) {
            this.addSeparator();
            var elts = this.addItems(['zoomIn', 'zoomOut']);
            elts[0].setAttribute('title', _scada.mxResources.get('zoomIn') + ' (' + this.editorUi.actions.get('zoomIn').shortcut + ')');
            elts[1].setAttribute('title', _scada.mxResources.get('zoomOut') + ' (' + this.editorUi.actions.get('zoomOut').shortcut + ')');
        }
        
        this.updateZoom = _scada.mxUtils.bind(this, function() {
            viewMenu.innerHTML = Math.round(this.editorUi.editor.graph.view.scale * 100) + '%' +
                this.dropdownImageHtml;
        });
    
        this.editorUi.editor.graph.view.addListener(_scada.mxEvent.EVENT_SCALE, this.updateZoom);
        this.editorUi.editor.addListener('resetGraphView', this.updateZoom);
    
        var elts = this.addItems(['-', 'undo', 'redo']);
        elts[1].setAttribute('title', _scada.mxResources.get('undo') + ' (' + this.editorUi.actions.get('undo').shortcut + ')');
        elts[2].setAttribute('title', _scada.mxResources.get('redo') + ' (' + this.editorUi.actions.get('redo').shortcut + ')');
        
        if (sw >= 320) {
            var elts = this.addItems(['-', 'delete']);
            elts[1].setAttribute('title', _scada.mxResources.get('delete') + ' (' + this.editorUi.actions.get('delete').shortcut + ')');
        }
        
        if (sw >= 550) {
            this.addItems(['-', 'toFront', 'toBack']);
        }
    
        if (sw >= 740) {
            this.addItems(['-', 'fillColor']);  
            if (sw >= 780) {
                this.addItems(['strokeColor']); 
                if (sw >= 820) {
                    this.addItems(['shadow']);
                }
            }
        }
        
        if (sw >= 400) {
            this.addSeparator();
            if (sw >= 440) {
                this.edgeShapeMenu = this.addMenuFunction('', _scada.mxResources.get('connection'), false, _scada.mxUtils.bind(this, function(menu) {
                    this.editorUi.menus.edgeStyleChange(menu, '', [_scada.mxConstants.STYLE_SHAPE, 'width'], [null, null], 'geIcon geSprite geSprite-connection', null, true).setAttribute('title', _scada.mxResources.get('line'));
                    this.editorUi.menus.edgeStyleChange(menu, '', [_scada.mxConstants.STYLE_SHAPE, 'width'], ['link', null], 'geIcon geSprite geSprite-linkedge', null, true).setAttribute('title', _scada.mxResources.get('link'));
                    this.editorUi.menus.edgeStyleChange(menu, '', [_scada.mxConstants.STYLE_SHAPE, 'width'], ['flexArrow', null], 'geIcon geSprite geSprite-arrow', null, true).setAttribute('title', _scada.mxResources.get('arrow'));
                    this.editorUi.menus.edgeStyleChange(menu, '', [_scada.mxConstants.STYLE_SHAPE, 'width'], ['arrow', null], 'geIcon geSprite geSprite-simplearrow', null, true).setAttribute('title', _scada.mxResources.get('simpleArrow'));
                }));
        
                this.addDropDownArrow(this.edgeShapeMenu, 'geSprite-connection', 44, 50, 0, 0, 22, -4);
            }
        
            this.edgeStyleMenu = this.addMenuFunction('geSprite-orthogonal', _scada.mxResources.get('waypoints'), false, _scada.mxUtils.bind(this, function(menu)
            {
                this.editorUi.menus.edgeStyleChange(menu, '', [_scada.mxConstants.STYLE_EDGE, _scada.mxConstants.STYLE_CURVED, _scada.mxConstants.STYLE_NOEDGESTYLE], [null, null, null], 'geIcon geSprite geSprite-straight', null, true).setAttribute('title', _scada.mxResources.get('straight'));
                this.editorUi.menus.edgeStyleChange(menu, '', [_scada.mxConstants.STYLE_EDGE, _scada.mxConstants.STYLE_CURVED, _scada.mxConstants.STYLE_NOEDGESTYLE], ['orthogonalEdgeStyle', null, null], 'geIcon geSprite geSprite-orthogonal', null, true).setAttribute('title', _scada.mxResources.get('orthogonal'));
                this.editorUi.menus.edgeStyleChange(menu, '', [_scada.mxConstants.STYLE_EDGE, _scada.mxConstants.STYLE_ELBOW, _scada.mxConstants.STYLE_CURVED, _scada.mxConstants.STYLE_NOEDGESTYLE], ['elbowEdgeStyle', null, null, null], 'geIcon geSprite geSprite-horizontalelbow', null, true).setAttribute('title', _scada.mxResources.get('simple'));
                this.editorUi.menus.edgeStyleChange(menu, '', [_scada.mxConstants.STYLE_EDGE, _scada.mxConstants.STYLE_ELBOW, _scada.mxConstants.STYLE_CURVED, _scada.mxConstants.STYLE_NOEDGESTYLE], ['elbowEdgeStyle', 'vertical', null, null], 'geIcon geSprite geSprite-verticalelbow', null, true).setAttribute('title', _scada.mxResources.get('simple'));
                this.editorUi.menus.edgeStyleChange(menu, '', [_scada.mxConstants.STYLE_EDGE, _scada.mxConstants.STYLE_ELBOW, _scada.mxConstants.STYLE_CURVED, _scada.mxConstants.STYLE_NOEDGESTYLE], ['isometricEdgeStyle', null, null, null], 'geIcon geSprite geSprite-horizontalisometric', null, true).setAttribute('title', _scada.mxResources.get('isometric'));
                this.editorUi.menus.edgeStyleChange(menu, '', [_scada.mxConstants.STYLE_EDGE, _scada.mxConstants.STYLE_ELBOW, _scada.mxConstants.STYLE_CURVED, _scada.mxConstants.STYLE_NOEDGESTYLE], ['isometricEdgeStyle', 'vertical', null, null], 'geIcon geSprite geSprite-verticalisometric', null, true).setAttribute('title', _scada.mxResources.get('isometric'));
                this.editorUi.menus.edgeStyleChange(menu, '', [_scada.mxConstants.STYLE_EDGE, _scada.mxConstants.STYLE_CURVED, _scada.mxConstants.STYLE_NOEDGESTYLE], ['orthogonalEdgeStyle', '1', null], 'geIcon geSprite geSprite-curved', null, true).setAttribute('title', _scada.mxResources.get('curved'));
                this.editorUi.menus.edgeStyleChange(menu, '', [_scada.mxConstants.STYLE_EDGE, _scada.mxConstants.STYLE_CURVED, _scada.mxConstants.STYLE_NOEDGESTYLE], ['entityRelationEdgeStyle', null, null], 'geIcon geSprite geSprite-entity', null, true).setAttribute('title', _scada.mxResources.get('entityRelation'));
            }));
            
            this.addDropDownArrow(this.edgeStyleMenu, 'geSprite-orthogonal', 44, 50, 0, 0, 22, -4);
        }
    };
    this.setUpContextMenu(_scada);
    this.setUpCopyAndPaste(_scada);
    this.cancelPreventDefault(_scada);
    
    this.scada_editor = _scada;
  }


  setUpContextMenu(_scada){
    _scada.Menus.prototype.addPopupTitle = function (menu, cell, evt) {
      if (this.editorUi.editor.graph.getSelectionCount() == 1 && !(this.editorUi.editor.graph.getModel().getChildCount(cell) > 0)) {
        let name = 'el_id';
        (cell.hasOwnProperty('cellName')? name = cell.cellName : name = 'el_'+cell.id);
        (name == '') ? name = 'el_' + cell.id : null;
        
        this.addMenuItem(menu, name, null, evt, null, null, true);
      }
    };

    _scada.Menus.prototype.addMenuItem = function (menu, key, parent, trigger, sprite, label, isContext) {
      var action = this.editorUi.actions.get(key);
      if(isContext){
        var item = menu.addItem(key, null, null, parent, sprite, false);
      }
      if (action != null && (menu.showDisabled || action.isEnabled()) && action.visible) {
        var item = menu.addItem(label || action.label, null, function () {
          action.funct(trigger);
        }, parent, sprite, action.isEnabled());
        if (action.toggleAction && action.isSelected()) {
          menu.addCheckmark(item, _scada.Editor.checkmarkImage);
        }
        this.addShortcut(item, action);
        return item;
      }
      return null;
    };
    _scada.Menus.prototype.addPopupMenuStyleItems = function (menu, cell, evt) {
      if (this.editorUi.editor.graph.getSelectionCount() == 1 && !(this.editorUi.editor.graph.getModel().getChildCount(cell) > 0)) {
        this.addMenuItems(menu, ['-','liveData'], null, evt);
        if(!this.editorUi.editor.graph.getModel().isEdge(cell) ){
          this.addMenuItems(menu, ['asset_control'], null, evt);
        }
      } else if (this.editorUi.editor.graph.isSelectionEmpty()) {
        this.addMenuItems(menu, ['-', 'clearDefaultStyle'], null, evt);
      }
    };

    _scada.Menus.prototype.addPopupMenuEditItems = function (menu, cell, evt) {
      if (this.editorUi.editor.graph.isSelectionEmpty()) {
        this.addMenuItems(menu, ['pasteHere'], null, evt);
      } else {
        this.addMenuItems(
          menu,
          ['-', 'setAsDefaultStyle', '-', 'cut', 'copy', 'duplicate', 'delete'],
          null,
          evt);
      }
    };

    _scada.Menus.prototype.createPopupMenu = function (menu, cell, evt) {
      menu.smartSeparators = true;
      this.addPopupTitle(menu, cell, evt);
      this.addPopupMenuStyleItems(menu, cell, evt);
      this.addPopupMenuArrangeItems(menu, cell, evt);
      this.addPopupMenuEditItems(menu, cell, evt);
      this.addPopupMenuHistoryItems(menu, cell, evt);
    };
  }

  cancelPreventDefault(_scada){
    _scada.Menubar.prototype.addMenuHandler = function (elt, funct) {
      if (funct != null) {
        var show = true;
        var clickHandler = _scada.mxUtils.bind(this, function (evt) {
          if (show && elt.enabled == null || elt.enabled) {
            this.editorUi.editor.graph.popupMenuHandler.hideMenu();
            var menu = new _scada.mxPopupMenu(funct);
            menu.div.className += ' geMenubarMenu';
            menu.smartSeparators = true;
            menu.showDisabled = true;
            menu.autoExpand = true;
    
            // DISABLES AUTOEXPAND AND DESTROYS MENU WHEN HIDDEN
            menu.hideMenu = _scada.mxUtils.bind(this, function () {
              _scada.mxPopupMenu.prototype.hideMenu.apply(menu, arguments);
              this.editorUi.resetCurrentMenu();
              menu.destroy();
            });
    
            var offset = _scada.mxUtils.getOffset(elt);
            menu.popup(offset.x, offset.y + elt.offsetHeight, null, evt);
            this.editorUi.setCurrentMenu(menu, elt);
          }
          _scada.mxEvent.consume(evt);
        });
        
        // SHOWS MENU AUTOMATICALLY WHILE IN EXPANDED STATE
        if (elt.innerHTML != 'Cancel'){
            _scada.mxEvent.addListener(elt, 'mousemove', _scada.mxUtils.bind(this, function (evt) {
              if (this.editorUi.currentMenu != null && this.editorUi.currentMenuElt != elt) {
                this.editorUi.hideCurrentMenu();
                clickHandler(evt);
              }
            }));
    
            // HIDES MENU IF ALREADY SHOWING AND PREVENTS FOCUS
            _scada.mxEvent.addListener(elt, (_scada.mxClient.IS_POINTER) ? 'pointerdown' : 'mousedown',
              _scada.mxUtils.bind(this, function (evt) {
                show = this.currentElt != elt;
                evt.preventDefault();
              }));
        }
        _scada.mxEvent.addListener(elt, 'click', _scada.mxUtils.bind(this, function (evt) {
          clickHandler(evt);
          show = true;
        }));
      }
    };
  }

  // OVERRIDE DUPLICATE AND PASTE FUNCTIONS
  setUpCopyAndPaste(_scada):void{
    _scada.mxClipboard.paste = function(graph) {
      var cells = null;
      if (!_scada.mxClipboard.isEmpty()) {
        cells = graph.getImportableCells(_scada.mxClipboard.getCells());

        var delta = _scada.mxClipboard.insertCount * _scada.mxClipboard.STEPSIZE;
        var parent = graph.getDefaultParent();

        cells = graph.importCells(cells, delta, delta, parent);
        setCellNameIfExist(cells);
        _scada.mxClipboard.insertCount++;
        graph.setSelectionCells(cells, false);
      }
      return cells;
    }

    _scada.Graph.prototype.duplicateCells = function(cells, append) {
      cells = (cells != null) ? cells : this.getSelectionCells();
      append = (append != null) ? append : true;
      cells = this.model.getTopmostCells(cells);
      var model = this.getModel();
      var s = this.gridSize;
      var select = [];
      model.beginUpdate();
      try {
        var clones = this.cloneCells(cells, false, null, true);
        for (var i = 0; i < cells.length; i++) {
          var parent = model.getParent(cells[i]);
          var child = this.moveCells([clones[i]], s, s, false)[0];
          select.push(child);
          if (append) {
            var modeled = model.add(parent, clones[i]);
            setCellNameIfExist(modeled)
          } else {
            var index = parent.getIndex(cells[i]);
            model.add(parent, clones[i], index + 1);
          }
        }
      } finally {
        model.endUpdate();
      }
      return select;
    };

    _scada.Graph.prototype.selectCellsForConnectVertex = function(cells, evt, hoverIcons) {
      if (cells.length == 2 && this.model.isVertex(cells[1])) {
        this.setSelectionCell(cells[1]);
        this.scrollCellToVisible(cells[1]);
        if (hoverIcons != null) {
          if (_scada.mxEvent.isTouchEvent(evt)) {
            hoverIcons.update(hoverIcons.getState(this.view.getState(cells[1])));
          } else {
            hoverIcons.reset();
          }
        }
      } else {
        this.setSelectionCells(cells);
      }
      setCellNameIfExist(cells);
    };

    function setCellNameIfExist(cells) {
      var pasteType;
      if (cells[0] && cells[0].hasOwnProperty('children')) {
        cells = cells[0].children;
        pasteType = 'grouped';
      }
      if (cells[0] && cells[0].hasOwnProperty('edge')) {
        pasteType = 'indiv';
      }
      if (cells && cells.hasOwnProperty('cellName')) {
        pasteType = 'duplicate';
      }
      if (cells && cells.hasOwnProperty('children')) {
        cells = cells.children;
        pasteType = 'droupedDuplicate';
      }
      switch (pasteType) {
        case 'grouped':
          case 'droupedDuplicate':
            case 'indiv':
              for (let cell of cells) {
                if (cell.hasOwnProperty('cellName') && !cell.edge) {
                  cell.cellName = cell.cellName + " - Copy (el_" + cell.id + ")";
                }
              }
              break;
        case 'duplicate':
          if(cells.hasOwnProperty('cellName')){
            cells.cellName = cells.cellName + " - Copy (el_" + cells.id + ")";
          }
      }
    }
  }

  getXmlNode(ui){
    var editor = ui.editor;
    var graph = editor.graph;
    var node = editor.getGraphXml();
    node.setAttribute('background', graph.background);
    node.setAttribute('saveToPreview', graph.saveToPreview);
    node.setAttribute('fitToScreen',graph.fitToScreen);
    node.setAttribute('fitHorizontal', graph.fitHorizontal);
    node.setAttribute('fitVertical', graph.fitVertical);
    node.setAttribute('zoomEnabled', graph.zoomEnabled);
    node.setAttribute('hoverEnabled', graph.hoverEnabled);
    if (graph.saveToPreview) {
      node.setAttribute('gridColor', graph.view.gridColor);
      node.setAttribute('gridEnabled', graph.gridEnabled);
    }
    return node;
  }

  parseXmlToDoc(xml): any{
    return this.scada_editor.mxUtils.parseXml(xml);
  }

  getXmlForDownload(): any{
    return this.scada_editor.mxUtils.getPrettyXml(this.getXmlNode(this.scada_editor._editorUi));
  }

  fetchScadaData(isCancel:boolean,_scada?:any):void {
    if(isCancel){
      if (_scada.hasOwnProperty('_editorUi') && _scada['_editorUi'].hasOwnProperty('editor') && this.toggleView == 'editor') {
        if (_scada['_editorUi'].editor.modified) {
          var con = confirm('There are unsaved changes! Are you sure?');
          if(!con){
            return;
          }
        }
      }
    }
    const input = {
      dashboard_id: this._graph.scadaInformation.dashboardId,
    };
    this._appService.getScadaData(input).subscribe((data) => {
      if (data && data.status === 'success') {
        this._graph.scadaInformation = {};
        this._graph.scadaInformation = data['data'];
        this._graph.scadaInformation['isReset'] = false;
        this._graph.scadaInformation['isOwner'] = data['data']['isOwner'];
        this._graph.scadaInformation['ownerId'] = data['data']['ownerId'];
        this._graph.scadaInformation['ownerName'] = data['data']['ownerName'];
        this.toggleView = 'preview';
      } else {
        console.log('error');
      }
    },(err)=>{
      console.log(err.error.message)
    });
  }

  getExitState() {
    return this.exitEditor.asObservable();
  }

}
