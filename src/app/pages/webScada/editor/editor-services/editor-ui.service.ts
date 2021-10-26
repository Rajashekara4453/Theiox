import { Injectable } from '@angular/core';
import { HandleGraphService } from './handle-graph.service';

@Injectable({
  providedIn: 'root'
})
export class EditorUiService {

  constructor(private _handleGraph:HandleGraphService) { }
  public liveData;
  public assetControl;

  loaderToggleOn(): void{
    var loader = document.getElementById('scada-loader');
    if(loader) {
      loader.classList.remove('d-none');
      loader.classList.add('d-block');
    }
  }
  
  loaderToggleOff(): void{
    var loader = document.getElementById('scada-loader');
    if(loader) {
      loader.classList.remove('d-block');
      loader.classList.add('d-none');
    }
  }

  openImportModal():void{
    document.getElementById('scada_import_modal').click();
  }
  
  openExportModal():void{
    document.getElementById('scada_export_modal').click();
  }

  openUploadModal():void{
    document.getElementById('scada_upload_modal').click();
  }

  openliveDataModal():void{
    this.toggleLiveData();
    document.getElementById('scada_liveData_modal').click();
  }

  openAssetControlModal():void{
    this.toggleassetControlData();
    document.getElementById('scada_assetControl_modal').click();
  }

  toggleLiveData():void{
    this.liveData = Math.random();
  }

  disableMenu(){
    let menu = document.getElementsByClassName('geMenubarContainer')[0];
    if(menu) menu.classList.add('pointer-events-none');
  }

  enableMenu(){
    let menu = document.getElementsByClassName('geMenubarContainer')[0];
    if(menu) menu.classList.remove('pointer-events-none');
  }
  toggleassetControlData():void{
    this.assetControl = Math.random();
  }

  uiSettings(_scada, _settings){
    var service = this;
    _scada.EditorUi.prototype.createUi = function () {
      _scada['_editorUi'] = this; 
      this.menubar = (this.editor.chromeless) ? null : this.menus.createMenubar(this.createDiv('geMenubar'));
      this.menubarContainer.appendChild(this.menubar.container);

      if (this.menubar != null) {
        this.container.appendChild(this.menubarContainer);
      }
    
      this.toolbar = (this.editor.chromeless) ? null : this.createToolbar(this.createDiv('geToolbar'));
    
      if (this.toolbar != null) {
        this.toolbarContainer.appendChild(this.toolbar.container);
        this.container.appendChild(this.toolbarContainer);
      }

      this.sidebar = (this.editor.chromeless) ? null : this.createSidebar(this.sidebarContainer);
    
      if (this.sidebar != null) {
        this.sidebarContainer.classList.add('scada-sidebar');
        this.container.appendChild(this.sidebarContainer);
      }

      this.format = (this.editor.chromeless || !this.formatEnabled) ? null : this.createFormat(this.formatContainer);
    
      if (this.format != null) {
        this.formatContainer.classList.add('scada-format');
        this.container.appendChild(this.formatContainer);
      }
    
      if (this.sidebar != null && this.sidebarFooterContainer) {
        this.container.appendChild(this.sidebarFooterContainer);
      }
      var footer = (this.editor.chromeless) ? null : this.createFooter();

      if (footer != null) {
        this.footerContainer.appendChild(footer);
        this.container.appendChild(this.footerContainer);
      }

      this.container.appendChild(this.diagramContainer);
    
      if (this.container != null && this.tabContainer != null) {
        this.container.appendChild(this.tabContainer);
      }
    
      if (this.sidebar != null) {
        this.hsplit.classList.add('icon');
        this.container.appendChild(this.hsplit);
    
        this.addSplitHandler(this.hsplit, true, 0, _scada.mxUtils.bind(this, function (value) {
          this.hsplitPosition = value;
          this.refresh();
        }));
      }
    };    

    _scada.EditorUi.prototype.initCanvas = function() {  
      var resize = null;
    	var ui = this;    
	    var graph = service._handleGraph.graph;
	    graph.timerAutoScroll = true;

      graph.getPagePadding = function() {
        return new _scada.mxPoint(Math.max(0, Math.round((graph.container.offsetWidth - 34) / graph.view.scale)),
          Math.max(0, Math.round((graph.container.offsetHeight - 34) / graph.view.scale)));
      };

      graph.view.getBackgroundPageBounds = function() { 
        var layout = this.graph.getPageLayout();
        var page = this.graph.getPageSize();
        
        return new _scada.mxRectangle(this.scale * (this.translate.x + layout.x * page.width),
          this.scale * (this.translate.y + layout.y * page.height),
          this.scale * layout.width * page.width,
          this.scale * layout.height * page.height);
      };

      graph.getPreferredPageSize = function(bounds, width, height) {
        var pages = this.getPageLayout();
        var size = this.getPageSize();
        
        return new _scada.mxRectangle(0, 0, pages.width * size.width, pages.height * size.height);
      };

		  var graphViewValidate = graph.view.validate;
      graph.view.validate = function() {
        if (this.graph.container != null && _scada.mxUtils.hasScrollbars(this.graph.container)) {
          var pad = this.graph.getPagePadding();
          var size = this.graph.getPageSize();
          
          var tx = this.translate.x;
          var ty = this.translate.y;
          this.translate.x = pad.x - (this.x0 || 0) * size.width;
          this.translate.y = pad.y - (this.y0 || 0) * size.height;
        }
        graphViewValidate.apply(this, arguments);
      };
		
      if (!graph.isViewer()) {
        var graphSizeDidChange = graph.sizeDidChange;
        graph.sizeDidChange = function() {
          if (this.container != null && _scada.mxUtils.hasScrollbars(this.container)) {
            var pages = this.getPageLayout();
            var pad = this.getPagePadding();
            var size = this.getPageSize();
            
            var minw = Math.ceil(2 * pad.x + pages.width * size.width);
            var minh = Math.ceil(2 * pad.y + pages.height * size.height);
            var min = graph.minimumGraphSize;
            
            if (min == null || min.width != minw || min.height != minh) {
              graph.minimumGraphSize = new _scada.mxRectangle(0, 0, minw, minh);
            }
            
            var dx = pad.x - pages.x * size.width;
            var dy = pad.y - pages.y * size.height;
            if (!this.autoTranslate && (this.view.translate.x != dx || this.view.translate.y != dy)) {
              this.autoTranslate = true;
              this.view.x0 = pages.x;
              this.view.y0 = pages.y;
              var tx = graph.view.translate.x;
              var ty = graph.view.translate.y;
              graph.view.setTranslate(dx, dy);
              
              graph.container.scrollLeft += Math.round((dx - tx) * graph.view.scale);
              graph.container.scrollTop += Math.round((dy - ty) * graph.view.scale);
              this.autoTranslate = false;
              return;
            }
            graphSizeDidChange.apply(this, arguments);
          } else {
            this.fireEvent(new _scada.mxEventObject(_scada.mxEvent.SIZE, 'bounds', this.getGraphBounds()));
          }
        };
      }
	
      var bgGroup = graph.view.getBackgroundPane();
      var mainGroup = graph.view.getDrawPane();
      graph.cumulativeZoomFactor = 1;
      var updateZoomTimeout = null;
      var cursorPosition = null;
      var scrollPosition = null;
      var forcedZoom = null;
      var filter = null;
	
      var scheduleZoom = function(delay) {
        if (updateZoomTimeout != null) {
          window.clearTimeout(updateZoomTimeout);
        }

        window.setTimeout(function() {
          if (!graph.isMouseDown || forcedZoom) {
            updateZoomTimeout = window.setTimeout(_scada.mxUtils.bind(this, function() {
                if (graph.isFastZoomEnabled()) {

                  if (graph.view.backgroundPageShape != null && graph.view.backgroundPageShape.node != null) {
                    _scada.mxUtils.setPrefixedStyle(graph.view.backgroundPageShape.node.style, 'transform-origin', null);
                    _scada.mxUtils.setPrefixedStyle(graph.view.backgroundPageShape.node.style, 'transform', null);
                  }
                  
                  mainGroup.style.transformOrigin = '';
                  bgGroup.style.transformOrigin = '';
                  if (_scada.mxClient.IS_SF) {
                    mainGroup.style.transform = 'scale(1)';
                    bgGroup.style.transform = 'scale(1)';
                    
                    window.setTimeout(function() {
                      mainGroup.style.transform = '';
                      bgGroup.style.transform = '';
                    }, 0)
                  } else {
                    mainGroup.style.transform = '';
                    bgGroup.style.transform = '';
                  }
                  graph.view.getDecoratorPane().style.opacity = '';
                  graph.view.getOverlayPane().style.opacity = '';
                }
                  
                var sp = new _scada.mxPoint(graph.container.scrollLeft, graph.container.scrollTop);
                var offset = _scada.mxUtils.getOffset(graph.container);
                var prev = graph.view.scale;
                var dx = 0;
                var dy = 0;

                if (cursorPosition != null) {
                  dx = graph.container.offsetWidth / 2 - cursorPosition.x + offset.x;
                  dy = graph.container.offsetHeight / 2 - cursorPosition.y + offset.y;
                }
                graph.zoom(graph.cumulativeZoomFactor);
                var s = graph.view.scale;
                if (s != prev) {
                  if (scrollPosition != null) {
                    dx += sp.x - scrollPosition.x;
                    dy += sp.y - scrollPosition.y;
                  }
                    if (resize != null) {
                      ui.chromelessResize(false, null, dx * (graph.cumulativeZoomFactor - 1),
                      dy * (graph.cumulativeZoomFactor - 1));
                    }
                    if (_scada.mxUtils.hasScrollbars(graph.container) && (dx != 0 || dy != 0)) {
                      graph.container.scrollLeft -= dx * (graph.cumulativeZoomFactor - 1);
                      graph.container.scrollTop -= dy * (graph.cumulativeZoomFactor - 1);
                    }
                }
                    
              if (filter != null) {
                mainGroup.setAttribute('filter', filter);
              }
              graph.cumulativeZoomFactor = 1;
              updateZoomTimeout = null;
              scrollPosition = null;
              cursorPosition = null;
              forcedZoom = null;
              filter = null;
            }), (delay != null) ? delay : ((graph.isFastZoomEnabled()) ? ui.wheelZoomDelay : ui.lazyZoomDelay));
          }
        }, 0);
      };
	
	    var lastZoomEvent = Date.now();

	    graph.lazyZoom = function(zoomIn, ignoreCursorPosition, delay) {
		    ignoreCursorPosition = ignoreCursorPosition || !graph.scrollbars;
        if (ignoreCursorPosition) {
          cursorPosition = new _scada.mxPoint(
            graph.container.offsetLeft + graph.container.clientWidth / 2,
            graph.container.offsetTop + graph.container.clientHeight / 2);
        }
        if (Date.now() - lastZoomEvent < 15) {
          return;
        }
		
		    lastZoomEvent = Date.now();
        if (zoomIn) {
          if (this.view.scale * this.cumulativeZoomFactor <= 0.15) {
            this.cumulativeZoomFactor *= (this.view.scale + 0.05) / this.view.scale;
          } else {
            this.cumulativeZoomFactor *= this.zoomFactor;
            this.cumulativeZoomFactor = Math.round(this.view.scale * this.cumulativeZoomFactor * 20) / 20 / this.view.scale;
          }
        } else {
          if (this.view.scale * this.cumulativeZoomFactor <= 0.15) {
            this.cumulativeZoomFactor *= (this.view.scale - 0.05) / this.view.scale;
          } else {
            this.cumulativeZoomFactor /= this.zoomFactor;
            this.cumulativeZoomFactor = Math.round(this.view.scale * this.cumulativeZoomFactor * 20) / 20 / this.view.scale;
          }
        }

		    this.cumulativeZoomFactor = Math.max(0.05, Math.min(this.view.scale * this.cumulativeZoomFactor, 160)) / this.view.scale;
        if (graph.isFastZoomEnabled()) {
          if (filter == null && mainGroup.getAttribute('filter') != '') {
            filter = mainGroup.getAttribute('filter');
            mainGroup.removeAttribute('filter');
          }
          scrollPosition = new _scada.mxPoint(service._handleGraph.graph.container.scrollLeft + 12, service._handleGraph.graph.container.scrollTop + 50);
          var cx = (ignoreCursorPosition) ? service._handleGraph.graph.container.scrollLeft + service._handleGraph.graph.container.clientWidth / 2 :
          (cursorPosition.x + service._handleGraph.graph.container.scrollLeft - service._handleGraph.graph.container.offsetLeft);
          var cy = (ignoreCursorPosition) ? graph.container.scrollTop + service._handleGraph.graph.container.clientHeight / 2 :
          (cursorPosition.y + service._handleGraph.graph.container.scrollTop - service._handleGraph.graph.container.offsetTop);
          mainGroup.style.transformOrigin = cx + 'px ' + cy + 'px';
          mainGroup.style.transform = 'scale(' + this.cumulativeZoomFactor + ')';
          bgGroup.style.transformOrigin = cx + 'px ' + cy + 'px';
          bgGroup.style.transform = 'scale(' + this.cumulativeZoomFactor + ')';
    
          if (service._handleGraph.graph.view.backgroundPageShape != null && service._handleGraph.graph.view.backgroundPageShape.node != null) {
            var page = service._handleGraph.graph.view.backgroundPageShape.node;
    
            _scada.mxUtils.setPrefixedStyle(page.style, 'transform-origin',
              ((ignoreCursorPosition) ? 
              ((service._handleGraph.graph.container.clientWidth / 2 + service._handleGraph.graph.container.scrollLeft - page.offsetLeft) + 'px') :
              ((cursorPosition.x + service._handleGraph.graph.container.scrollLeft - page.offsetLeft - service._handleGraph.graph.container.offsetLeft) + 'px')) + ' ' +

              ((ignoreCursorPosition) ? ((service._handleGraph.graph.container.clientHeight / 2 + service._handleGraph.graph.container.scrollTop - page.offsetTop) + 'px') : 
              ((cursorPosition.y + service._handleGraph.graph.container.scrollTop - page.offsetTop - service._handleGraph.graph.container.offsetTop) + 'px')));

            _scada.mxUtils.setPrefixedStyle(page.style, 'transform', 'scale(' + this.cumulativeZoomFactor + ')');
          }
          graph.view.getDecoratorPane().style.opacity = '0';
          graph.view.getOverlayPane().style.opacity = '0';
          
          if (ui.hoverIcons != null) {
            ui.hoverIcons.reset();
          }
        }
		    scheduleZoom(delay);
	    };
	
      _scada.mxEvent.addGestureListeners(graph.container, function(evt) {
        if (updateZoomTimeout != null) {
          window.clearTimeout(updateZoomTimeout);
        }
      }, null, function(evt) {
        if (graph.cumulativeZoomFactor != 1) {
          scheduleZoom(0);
        }
      });
	
      _scada.mxEvent.addListener(graph.container, 'scroll', function(evt) {
        if (updateZoomTimeout != null && !graph.isMouseDown && graph.cumulativeZoomFactor != 1) {
          scheduleZoom(0);
        }
      });
	
      _scada.mxEvent.addMouseWheelListener(_scada.mxUtils.bind(this, function(evt, up, force, cx, cy) {
        if (this.dialogs == null || this.dialogs.length == 0) {
          if (!graph.scrollbars && !force && graph.isScrollWheelEvent(evt)) {
              var t = graph.view.getTranslate();
              var step = 40 / graph.view.scale;
              if (!_scada.mxEvent.isShiftDown(evt)) {
                  graph.view.setTranslate(t.x, t.y + ((up) ? step : -step));
              } else {
                  graph.view.setTranslate(t.x + ((up) ? -step : step), t.y);
              }
          } else if (force || graph.isZoomWheelEvent(evt)){
            var source = _scada.mxEvent.getSource(evt);
            
            while (source != null) {
              if (source == graph.container) {
                graph.tooltipHandler.hideTooltip();
                cursorPosition = (cx != null && cy!= null) ? new _scada.mxPoint(cx, cy) :
                  new _scada.mxPoint(_scada.mxEvent.getClientX(evt), _scada.mxEvent.getClientY(evt));
                graph.lazyZoom(up);
                _scada.mxEvent.consume(evt);
                return false;
              }
              source = source.parentNode;
            }
          }
        }
      }), graph.container);
	
      graph.panningHandler.zoomGraph = function(evt) {
        graph.cumulativeZoomFactor = evt.scale;
        graph.lazyZoom(evt.scale > 0, true);
        _scada.mxEvent.consume(evt);
      };
    };

    _scada.mxGraphView.prototype.validateBackgroundPage = function() {
      var graph = this.graph;
      if (graph.container != null && !graph.transparentBackground) {
        if (graph.pageVisible) {
          var bounds = this.getBackgroundPageBounds();
          
          if (this.backgroundPageShape == null) {
            var firstChild = graph.container.firstChild;
            
            while (firstChild != null && firstChild.nodeType != _scada.mxConstants.NODETYPE_ELEMENT) {
              firstChild = firstChild.nextSibling;
            }
            
            if (firstChild != null) {
              this.backgroundPageShape = this.createBackgroundPageShape(bounds);
              this.backgroundPageShape.scale = 1;
              
              this.backgroundPageShape.isShadow = true;
              this.backgroundPageShape.dialect = _scada.mxConstants.DIALECT_STRICTHTML;
              this.backgroundPageShape.init(graph.container);
    
              firstChild.style.position = 'absolute';
              graph.container.insertBefore(this.backgroundPageShape.node, firstChild);
              this.backgroundPageShape.redraw();
              this.backgroundPageShape.node.className = 'geBackgroundPage';
              _scada.mxEvent.addListener(this.backgroundPageShape.node, 'dblclick',
                _scada.mxUtils.bind(this, function(evt)
                {
                  graph.dblClick(evt);
                })
              );
              
              _scada.mxEvent.addGestureListeners(this.backgroundPageShape.node,
                _scada.mxUtils.bind(this, function(evt) {
                  graph.fireMouseEvent(_scada.mxEvent.MOUSE_DOWN, new _scada.mxMouseEvent(evt));
                }),
                _scada.mxUtils.bind(this, function(evt) {
                  if (graph.tooltipHandler != null && graph.tooltipHandler.isHideOnHover()){
                    graph.tooltipHandler.hide();
                  }
                  
                  if (graph.isMouseDown && !_scada.mxEvent.isConsumed(evt)) {
                    graph.fireMouseEvent(_scada.mxEvent.MOUSE_MOVE, new _scada.mxMouseEvent(evt));
                  }
                }),
                _scada.mxUtils.bind(this, function(evt) {
                  graph.fireMouseEvent(_scada.mxEvent.MOUSE_UP, new _scada.mxMouseEvent(evt));
                })
              );
            }
          } else {
            this.backgroundPageShape.scale = 1;
            this.backgroundPageShape.bounds = bounds;
            this.backgroundPageShape.redraw();
          }
        } else if (this.backgroundPageShape != null) {
          this.backgroundPageShape.destroy();
          this.backgroundPageShape = null;
        }
        this.validateBackgroundStyles();
      }
    };

    // Updates the CSS of the background to draw the grid
    _scada.mxGraphView.prototype.validateBackgroundStyles = function() {
      var graph = this.graph;
      var color = (graph.background == null || graph.background == _scada.mxConstants.NONE) ? graph.defaultPageBackgroundColor : graph.background;
      var gridColor = (color != null && this.gridColor != color.toLowerCase()) ? this.gridColor : '#ffffff';
      var image = 'none';
      var position = '';
      
      if (graph.isGridEnabled() || graph.gridVisible) {
        var phase = 10;
        
        if (_scada.mxClient.IS_SVG) {
          // Generates the SVG required for drawing the dynamic grid
          image = unescape(encodeURIComponent(this.createSvgGrid(gridColor)));
          image = btoa(image);
          image = 'url(' + 'data:image/svg+xml;base64,' + image + ')'
          phase = graph.gridSize * this.scale * this.gridSteps;
        } else {
          image = 'url(' + this.gridImage + ')';
        }
        var x0 = 0;
        var y0 = 0;
        
        if (graph.view.backgroundPageShape != null) {
          var bds = this.getBackgroundPageBounds();
          x0 = 1 + bds.x;
          y0 = 1 + bds.y;
        }

        position = -Math.round(phase - _scada.mxUtils.mod(this.translate.x * this.scale - x0, phase)) + 'px ' +
          -Math.round(phase - _scada.mxUtils.mod(this.translate.y * this.scale - y0, phase)) + 'px';
      }
      
      var canvas = graph.view.canvas;
      
      if (canvas.ownerSVGElement != null) {
        canvas = canvas.ownerSVGElement;
      }
      
      if (graph.view.backgroundPageShape != null) {
        graph.view.backgroundPageShape.node.style.backgroundPosition = position;
        graph.view.backgroundPageShape.node.style.backgroundImage = image;
        graph.view.backgroundPageShape.node.style.backgroundColor = color;
        graph.view.backgroundPageShape.node.style.borderColor = graph.defaultPageBorderColor;
        graph.container.className = 'geDiagramContainer geDiagramBackdrop';
        canvas.style.backgroundImage = 'none';
        canvas.style.backgroundColor = '';
      } else {
        graph.container.className = 'geDiagramContainer';
        canvas.style.backgroundPosition = position;
        canvas.style.backgroundColor = color;
        canvas.style.backgroundImage = image;
      }
    };
    
    // Returns the SVG required for painting the background grid.
    _scada.mxGraphView.prototype.createSvgGrid = function(color) {
      var tmp = this.graph.gridSize * this.scale;
      while (tmp < this.minGridSize) {
        tmp *= 2;
      }      
      var tmp2 = this.gridSteps * tmp;
      var d = [];
      
      for (var i = 1; i < this.gridSteps; i++) {
        var tmp3 = i * tmp;
        d.push('M 0 ' + tmp3 + ' L ' + tmp2 + ' ' + tmp3 + ' M ' + tmp3 + ' 0 L ' + tmp3 + ' ' + tmp2);
      }
      var size = tmp2;
      var svg =  '<svg width="' + size + '" height="' + size + '" xmlns="' + _scada.mxConstants.NS_SVG + '">' +
          '<defs><pattern id="grid" width="' + tmp2 + '" height="' + tmp2 + '" patternUnits="userSpaceOnUse">' +
          '<path d="' + d.join(' ') + '" fill="none" stroke="' + color + '" opacity="0.2" stroke-width="1"/>' +
          '<path d="M ' + tmp2 + ' 0 L 0 0 0 ' + tmp2 + '" fill="none" stroke="' + color + '" stroke-width="1"/>' +
          '</pattern></defs><rect width="100%" height="100%" fill="url(#grid)"/></svg>';

      return svg;
    };

    // Adds panning for the grid with no page view and disabled scrollbars
    var mxGraphPanGraph = _scada.mxGraph.prototype.panGraph;
    _scada.mxGraph.prototype.panGraph = function(dx, dy) {
      mxGraphPanGraph.apply(this, arguments);
      
      if (this.shiftPreview1 != null) {
        var canvas = this.view.canvas;
        if (canvas.ownerSVGElement != null) {
          canvas = canvas.ownerSVGElement;
        }
        var phase = this.gridSize * this.view.scale * this.view.gridSteps;
        var position = -Math.round(phase - _scada.mxUtils.mod(this.view.translate.x * this.view.scale + dx, phase)) + 'px ' +
          -Math.round(phase - _scada.mxUtils.mod(this.view.translate.y * this.view.scale + dy, phase)) + 'px';
        canvas.style.backgroundPosition = position;
      }
    };
    
    // Draws page breaks only within the page
    _scada.mxGraph.prototype.updatePageBreaks = function(visible, width, height) {
      var scale = this.view.scale;
      var tr = this.view.translate;
      var fmt = this.pageFormat;
      var ps = scale * this.pageScale;

      var bounds2 = this.view.getBackgroundPageBounds();
      width = bounds2.width;
      height = bounds2.height;
      var bounds = new _scada.mxRectangle(scale * tr.x, scale * tr.y, fmt.width * ps, fmt.height * ps);
      // Does not show page breaks if the scale is too small
      visible = visible && Math.min(bounds.width, bounds.height) > this.minPageBreakDist;

      var horizontalCount = (visible) ? Math.ceil(height / bounds.height) - 1 : 0;
      var verticalCount = (visible) ? Math.ceil(width / bounds.width) - 1 : 0;
      var right = bounds2.x + width;
      var bottom = bounds2.y + height;

      if (this.horizontalPageBreaks == null && horizontalCount > 0) {
        this.horizontalPageBreaks = [];
      }
      if (this.verticalPageBreaks == null && verticalCount > 0) {
        this.verticalPageBreaks = [];
      }
      var drawPageBreaks = _scada.mxUtils.bind(this, function(breaks) {
        if (breaks != null) {
          var count = (breaks == this.horizontalPageBreaks) ? horizontalCount : verticalCount; 
          
          for (var i = 0; i <= count; i++) {
            var pts = (breaks == this.horizontalPageBreaks) ?
              [new _scada.mxPoint(Math.round(bounds2.x), Math.round(bounds2.y + (i + 1) * bounds.height)),
              new _scada.mxPoint(Math.round(right), Math.round(bounds2.y + (i + 1) * bounds.height))] :
              [new _scada.mxPoint(Math.round(bounds2.x + (i + 1) * bounds.width), Math.round(bounds2.y)),
              new _scada.mxPoint(Math.round(bounds2.x + (i + 1) * bounds.width), Math.round(bottom))];
            
            if (breaks[i] != null) {
              breaks[i].points = pts;
              breaks[i].redraw();
            } else {
              var pageBreak = new _scada.mxPolyline(pts, this.pageBreakColor);
              pageBreak.dialect = this.dialect;
              pageBreak.isDashed = this.pageBreakDashed;
              pageBreak.pointerEvents = false;
              pageBreak.init(this.view.backgroundPane);
              pageBreak.redraw();
              breaks[i] = pageBreak;
            }
          }
          
          for (var i = count; i < breaks.length; i++) {
            breaks[i].destroy();
          }
          breaks.splice(count, breaks.length - count);
        }
      });
        
      drawPageBreaks(this.horizontalPageBreaks);
      drawPageBreaks(this.verticalPageBreaks);
    };
    
    // Disables removing relative children and table rows and cells from parents
    var mxGraphHandlerShouldRemoveCellsFromParent = _scada.mxGraphHandler.prototype.shouldRemoveCellsFromParent;
    _scada.mxGraphHandler.prototype.shouldRemoveCellsFromParent = function(parent, cells, evt) {
      for (var i = 0; i < cells.length; i++) {
        if (this.graph.isTableCell(cells[i]) || this.graph.isTableRow(cells[i])) {
          return false;
        } else if (this.graph.getModel().isVertex(cells[i])) {
          var geo = this.graph.getCellGeometry(cells[i]);
          
          if (geo != null && geo.relative) {
            return false;
          }
        }
      }
      return mxGraphHandlerShouldRemoveCellsFromParent.apply(this, arguments);
    };

    // Overrides to ignore hotspot only for target terminal
    var mxConnectionHandlerCreateMarker = _scada.mxConnectionHandler.prototype.createMarker;
    _scada.mxConnectionHandler.prototype.createMarker = function() {
      var marker = mxConnectionHandlerCreateMarker.apply(this, arguments);
      
      marker.intersects = _scada.mxUtils.bind(this, function(state, evt) {
        if (this.isConnecting()) {
          return true;
        }
        return _scada.mxCellMarker.prototype.intersects.apply(marker, arguments);
      });
      return marker;
    };

    // Creates background page shape
    _scada.mxGraphView.prototype.createBackgroundPageShape = function(bounds) {
      return new _scada.mxRectangleShape(bounds, '#ffffff', this.graph.defaultPageBorderColor);
    };

    // Fits the number of background pages to the graph
    _scada.mxGraphView.prototype.getBackgroundPageBounds = function() {
      var gb = this.getGraphBounds();
      
      // Computes unscaled, untranslated graph bounds
      var x = (gb.width > 0) ? gb.x / this.scale - this.translate.x : 0;
      var y = (gb.height > 0) ? gb.y / this.scale - this.translate.y : 0;
      var w = gb.width / this.scale;
      var h = gb.height / this.scale;
      
      var fmt = this.graph.pageFormat;
      var ps = this.graph.pageScale;
      var pw = fmt.width * ps;
      var ph = fmt.height * ps;

      var x0 = Math.floor(Math.min(0, x) / pw);
      var y0 = Math.floor(Math.min(0, y) / ph);
      var xe = Math.ceil(Math.max(1, x + w) / pw);
      var ye = Math.ceil(Math.max(1, y + h) / ph);
      
      var rows = xe - x0;
      var cols = ye - y0;

      var bounds = new _scada.mxRectangle(this.scale * (this.translate.x + x0 * pw), this.scale *
          (this.translate.y + y0 * ph), this.scale * rows * pw, this.scale * cols * ph);
      return bounds;
    };
    
    // Add panning for background page in VML
    var graphPanGraph = _scada.mxGraph.prototype.panGraph;
    _scada.mxGraph.prototype.panGraph = function(dx, dy) {
      graphPanGraph.apply(this, arguments);
      
      if ((this.dialect != _scada.mxConstants.DIALECT_SVG && this.view.backgroundPageShape != null) &&
        (!this.useScrollbarsForPanning || !_scada.mxUtils.hasScrollbars(this.container))) {
        this.view.backgroundPageShape.node.style.marginLeft = dx + 'px';
        this.view.backgroundPageShape.node.style.marginTop = dy + 'px';
      }
    };

    /**
     * Consumes click events for disabled menu items.
     */
    var mxPopupMenuAddItem = _scada.mxPopupMenu.prototype.addItem;
    _scada.mxPopupMenu.prototype.addItem = function(title, image, funct, parent, iconCls, enabled) {
      var result = mxPopupMenuAddItem.apply(this, arguments);
      
      if (enabled != null && !enabled) {
        _scada.mxEvent.addListener(result, 'mousedown', function(evt) {
          _scada.mxEvent.consume(evt);
        });
      }
      
      return result;
    };
    
    /**
     * Selects tables before cells and rows.
     */
    var mxGraphHandlerIsPropagateSelectionCell = _scada.mxGraphHandler.prototype.isPropagateSelectionCell;
    _scada.mxGraphHandler.prototype.isPropagateSelectionCell = function(cell, immediate, me) {
      var result = false;
      var parent = this.graph.model.getParent(cell)
      
      if (immediate) {
        var geo = (this.graph.model.isEdge(cell)) ? null :
          this.graph.getCellGeometry(cell);
        
        result = !this.graph.model.isEdge(parent) &&
          !this.graph.isSiblingSelected(cell) &&
          ((geo != null && geo.relative) ||
          !this.graph.isContainer(parent) ||
          this.graph.isPart(cell));
      } else {
        result = mxGraphHandlerIsPropagateSelectionCell.apply(this, arguments);
        if (this.graph.isTableCell(cell) || this.graph.isTableRow(cell)) {
          var table = parent;
          
          if (!this.graph.isTable(table)) {
            table = this.graph.model.getParent(table);
          }
          result = !this.graph.selectionCellsHandler.isHandled(table) ||
            (this.graph.isCellSelected(table) && this.graph.isToggleEvent(me.getEvent())) ||
            (this.graph.isCellSelected(cell) && !this.graph.isToggleEvent(me.getEvent())) ||
            (this.graph.isTableCell(cell) && this.graph.isCellSelected(parent));
        }
      }
      return result;
    };

    _scada.mxPopupMenuHandler.prototype.getCellForPopupEvent = function(me) {
      var cell = me.getCell();
      var model = this.graph.getModel();
      var parent = model.getParent(cell);
      var state = this.graph.view.getState(parent);
      var selected = this.graph.isCellSelected(cell);
      
      while (state != null && (model.isVertex(parent) || model.isEdge(parent))) {
        var temp = this.graph.isCellSelected(parent);
        selected = selected || temp;
        if (temp || (!selected && (this.graph.isTableCell(cell) ||
          this.graph.isTableRow(cell)))) {
          cell = parent;
        }
        parent = model.getParent(parent);
      }
      return cell;
    };
  }
  
  previewUiSettings(_scada, _settings){

    _scada.EditorUi.prototype.createUi = function () {
      _scada['_editorUi'] = this;
      this.footerHeight = 0;
      this.container.appendChild(this.diagramContainer);
    };    
    _scada.EditorUi.prototype.initCanvas = function() {
	    var graph = this.editor.graph;
	    graph.timerAutoScroll = true;
      graph.isEnabled = function() {
        return false;
      };
      graph.getPagePadding = function() {
        return new _scada.mxPoint(0,0);
      };
      graph.view.getBackgroundPageBounds = function() {
        var layout = this.graph.getPageLayout();
        var page = this.graph.getPageSize();
        return new _scada.mxRectangle(this.scale * (this.translate.x + layout.x * page.width),
            this.scale * (this.translate.y + layout.y * page.height),
            this.scale * layout.width * page.width,
            this.scale * layout.height * page.height);
      };
      graph.getPreferredPageSize = function(bounds, width, height) {
        var pages = this.getPageLayout();
        var size = this.getPageSize();
        return new _scada.mxRectangle(0, 0, pages.width * size.width, pages.height * size.height);
      };
      var resize = null;
      var ui = this;
     if (this.editor.extendCanvas) {
	  	var graphViewValidate = graph.view.validate;
		  graph.view.validate = function() {
        if (this.graph.container != null && _scada.mxUtils.hasScrollbars(this.graph.container)) {
          var pad = this.graph.getPagePadding();
          var size = this.graph.getPageSize();
          var tx = this.translate.x;
          var ty = this.translate.y;
          this.translate.x = pad.x - (this.x0 || 0) * size.width;
          this.translate.y = pad.y - (this.y0 || 0) * size.height;
        }
			  graphViewValidate.apply(this, arguments);
		  };
		
        if (!graph.isViewer()) {
          var graphSizeDidChange = graph.sizeDidChange;
          graph.sizeDidChange = function() {
            if (this.container != null && _scada.mxUtils.hasScrollbars(this.container))
            {
              var pages = this.getPageLayout();
              var pad = this.getPagePadding();
              var size = this.getPageSize();
              
              var minw = Math.ceil(2 * pad.x + pages.width * size.width);
              var minh = Math.ceil(2 * pad.y + pages.height * size.height);
              
              var min = graph.minimumGraphSize;            
              if (min == null || min.width != minw || min.height != minh) {
                graph.minimumGraphSize = new _scada.mxRectangle(0, 0, minw, minh);
              }
              
              var dx = pad.x - pages.x * size.width;
              var dy = pad.y - pages.y * size.height;
              
              if (!this.autoTranslate && (this.view.translate.x != dx || this.view.translate.y != dy)) {
                this.autoTranslate = true;
                this.view.x0 = pages.x;
                this.view.y0 = pages.y;
      
                var tx = graph.view.translate.x;
                var ty = graph.view.translate.y;
                graph.view.setTranslate(dx, dy);              
                graph.container.scrollLeft += Math.round((dx - tx) * graph.view.scale);
                graph.container.scrollTop += Math.round((dy - ty) * graph.view.scale);
                this.autoTranslate = false;
                return;
              }
              graphSizeDidChange.apply(this, arguments);
            } else {
              // Fires event but does not invoke superclass
              this.fireEvent(new _scada.mxEventObject(_scada.mxEvent.SIZE, 'bounds', this.getGraphBounds()));
            }
          };
        }
	    }
	
      var bgGroup = graph.view.getBackgroundPane();
      var mainGroup = graph.view.getDrawPane();
      graph.cumulativeZoomFactor = 1;
      var updateZoomTimeout = null;
      var cursorPosition = null;
      var scrollPosition = null;
      var forcedZoom = null;
      var filter = null;
	
      var scheduleZoom = function(delay) {
        if (updateZoomTimeout != null) {
          window.clearTimeout(updateZoomTimeout);
        }
        window.setTimeout(function() {
          if (!graph.isMouseDown || forcedZoom) {
            updateZoomTimeout = window.setTimeout(_scada.mxUtils.bind(this, function() {
              if (graph.isFastZoomEnabled()) {
                if (graph.view.backgroundPageShape != null && graph.view.backgroundPageShape.node != null) {
                  _scada.mxUtils.setPrefixedStyle(graph.view.backgroundPageShape.node.style, 'transform-origin', null);
                  _scada.mxUtils.setPrefixedStyle(graph.view.backgroundPageShape.node.style, 'transform', null);
                }
                
                mainGroup.style.transformOrigin = '';
                bgGroup.style.transformOrigin = '';

                if ((	/iP(hone|od|ad)/.test(navigator.platform))) {
                  mainGroup.style.transform = 'scale(1)';
                  bgGroup.style.transform = 'scale(1)';
                  
                  window.setTimeout(function() {
                    mainGroup.style.transform = '';
                    bgGroup.style.transform = '';
                  }, 0)
                } else {
                  mainGroup.style.transform = '';
                  bgGroup.style.transform = '';
                }
                graph.view.getDecoratorPane().style.opacity = '';
                graph.view.getOverlayPane().style.opacity = '';
              }
                  
              var sp = new _scada.mxPoint(graph.container.scrollLeft, graph.container.scrollTop);
              var offset = _scada.mxUtils.getOffset(graph.container);
              var prev = graph.view.scale;
              var dx = 0;
              var dy = 0;
                    
              if (cursorPosition != null) {
                  dx = graph.container.offsetWidth / 2 - cursorPosition.x + offset.x;
                  dy = graph.container.offsetHeight / 2 - cursorPosition.y + offset.y;
              }
      
              graph.zoom(graph.cumulativeZoomFactor);
              var s = graph.view.scale;
                    
              if (s != prev) {
                if (scrollPosition != null) {
                  dx += sp.x - scrollPosition.x;
                  dy += sp.y - scrollPosition.y;
                }
                  if (resize != null) {
                    ui.chromelessResize(false, null, dx * (graph.cumulativeZoomFactor - 1),
                      dy * (graph.cumulativeZoomFactor - 1));
                  }
                  if (_scada.mxUtils.hasScrollbars(graph.container) && (dx != 0 || dy != 0)) {
                      graph.container.scrollLeft -= dx * (graph.cumulativeZoomFactor - 1);
                      graph.container.scrollTop -= dy * (graph.cumulativeZoomFactor - 1);
                  }
              }
                    
              if (filter != null) {
                mainGroup.setAttribute('filter', filter);
              }
              
                graph.cumulativeZoomFactor = 1;
                updateZoomTimeout = null;
                scrollPosition = null;
                cursorPosition = null;
                forcedZoom = null;
                filter = null;
              }), (delay != null) ? delay : ((graph.isFastZoomEnabled()) ? ui.wheelZoomDelay : ui.lazyZoomDelay));
            }
        }, 0);
      };
	
	    var lastZoomEvent = Date.now();

      graph.lazyZoom = function(zoomIn, ignoreCursorPosition, delay) {
        ignoreCursorPosition = ignoreCursorPosition || !graph.scrollbars;
        ignoreCursorPosition = false;  
        if (ignoreCursorPosition) {
          cursorPosition = new _scada.mxPoint(
            graph.container.offsetLeft + graph.container.clientWidth / 2,
            graph.container.offsetTop + graph.container.clientHeight / 2);
        }
        
        if (Date.now() - lastZoomEvent < 15) {
          return;
        }
        lastZoomEvent = Date.now();

        if (zoomIn) {
          if (this.view.scale * this.cumulativeZoomFactor <= 0.15) {
            this.cumulativeZoomFactor *= (this.view.scale + 0.05) / this.view.scale;
          } else {
            this.cumulativeZoomFactor *= this.zoomFactor;
            this.cumulativeZoomFactor = Math.round(this.view.scale * this.cumulativeZoomFactor * 20) / 20 / this.view.scale;
          }
        } else {
          if (this.view.scale * this.cumulativeZoomFactor <= 0.15) {
            this.cumulativeZoomFactor *= (this.view.scale - 0.05) / this.view.scale;
          } else {
            this.cumulativeZoomFactor /= this.zoomFactor;
            this.cumulativeZoomFactor = Math.round(this.view.scale * this.cumulativeZoomFactor * 20) / 20 / this.view.scale;
          }
        }

        this.cumulativeZoomFactor = Math.max(0.05, Math.min(this.view.scale * this.cumulativeZoomFactor, 160)) / this.view.scale;
        if (graph.isFastZoomEnabled()) {
          if (filter == null && mainGroup.getAttribute('filter') != '') {
            filter = mainGroup.getAttribute('filter');
            mainGroup.removeAttribute('filter');
          }

          scrollPosition = new _scada.mxPoint(graph.container.scrollLeft, graph.container.scrollTop);
          var setLeft = document.body.classList.contains('pin-sidebar');
    
          var cx = ((ignoreCursorPosition) ? graph.container.scrollLeft + graph.container.clientWidth / 2 :
            cursorPosition.x + graph.container.scrollLeft - graph.container.offsetLeft) - ((setLeft) ? 272 : 72);
          var cy = ((ignoreCursorPosition) ? graph.container.scrollTop + graph.container.clientHeight / 2 :
            cursorPosition.y + graph.container.scrollTop - graph.container.offsetTop ) - 50;
          mainGroup.style.transformOrigin = cx + 'px ' + cy + 'px';
          mainGroup.style.transform = 'scale(' + this.cumulativeZoomFactor + ')';
          bgGroup.style.transformOrigin = cx + 'px ' + cy + 'px';
          bgGroup.style.transform = 'scale(' + this.cumulativeZoomFactor + ')';
    
          if (graph.view.backgroundPageShape != null && graph.view.backgroundPageShape.node != null) {
            var page = graph.view.backgroundPageShape.node;
    
            _scada.mxUtils.setPrefixedStyle(page.style, 'transform-origin',
              ((ignoreCursorPosition) ? ((graph.container.clientWidth / 2 + graph.container.scrollLeft -
                page.offsetLeft) + 'px') : ((cursorPosition.x + graph.container.scrollLeft -
                page.offsetLeft - graph.container.offsetLeft) + 'px')) + ' ' +
              ((ignoreCursorPosition) ? ((graph.container.clientHeight / 2 + graph.container.scrollTop -
                page.offsetTop) + 'px') : ((cursorPosition.y + graph.container.scrollTop -
                page.offsetTop - graph.container.offsetTop) + 'px')));
            _scada.mxUtils.setPrefixedStyle(page.style, 'transform',
              'scale(' + this.cumulativeZoomFactor + ')');
          }

          graph.view.getDecoratorPane().style.opacity = '0';
          graph.view.getOverlayPane().style.opacity = '0';
          
          if (ui.hoverIcons != null) {
            ui.hoverIcons.reset();
          }
        }
        scheduleZoom(delay);
      };
	
      _scada.mxEvent.addGestureListeners(graph.container, function(evt) {
        if (updateZoomTimeout != null) {
          window.clearTimeout(updateZoomTimeout);
        }
      }, null, function(evt) {
        if (graph.cumulativeZoomFactor != 1) {
          scheduleZoom(0);
        }
      });
	
      _scada.mxEvent.addListener(graph.container, 'scroll', function(evt) {
        if(graph.hasOwnProperty('zoomEnabled') && graph.zoomEnabledś){
          if (updateZoomTimeout != null && !graph.isMouseDown && graph.cumulativeZoomFactor != 1) {
            scheduleZoom(0);
          }
        }
      });
	
      _scada.mxEvent.addMouseWheelListener(_scada.mxUtils.bind(this, function(evt, up, force, cx, cy) {
        if(graph.hasOwnProperty('zoomEnabled') && graph.zoomEnabled){
          if (this.dialogs == null || this.dialogs.length == 0) {
            if (!graph.scrollbars && !force && graph.isScrollWheelEvent(evt)) {
              var t = graph.view.getTranslate();
              var step = 40 / graph.view.scale;
              
              if (!_scada.mxEvent.isShiftDown(evt)){
                  graph.view.setTranslate(t.x, t.y + ((up) ? step : -step));
              } else {
                  graph.view.setTranslate(t.x + ((up) ? -step : step), t.y);
              }
            } else if (force || graph.isZoomWheelEvent(evt)) {
              var source = _scada.mxEvent.getSource(evt);
              graph.getPagePadding = function () {          
                return new _scada.mxPoint(Math.max(0, Math.round((graph.container.offsetWidth) / graph.view.scale)),
                  Math.max(0, Math.round((graph.container.offsetHeight) / graph.view.scale)));
              };
              while (source != null){
                if (source == graph.container) {
                  graph.tooltipHandler.hideTooltip();
                  cursorPosition = (cx != null && cy!= null) ? new _scada.mxPoint(cx, cy) :
                  new _scada.mxPoint(_scada.mxEvent.getClientX(evt), _scada.mxEvent.getClientY(evt));
                  graph.lazyZoom(up);
                  _scada.mxEvent.consume(evt);
              
                  return false;
                }
                source = source.parentNode;
              }
            }
          }
        }
      }), graph.container);
      // Uses fast zoom for pinch gestures on iOS
      graph.panningHandler.zoomGraph = function(evt)
      {
        graph.cumulativeZoomFactor = evt.scale;
        graph.lazyZoom(evt.scale > 0, true);
        _scada.mxEvent.consume(evt);
      };
    };


    // Uses HTML for background pages (to support grid background image)
    _scada.mxGraphView.prototype.validateBackgroundPage = function() {
      var graph = this.graph;
  
      if (graph.container != null && !graph.transparentBackground){
        if (graph.pageVisible){
          var bounds = this.getBackgroundPageBounds();

          if (this.backgroundPageShape == null){
            // Finds first element in graph container
            var firstChild = graph.container.firstChild;
            
            while (firstChild != null && firstChild.nodeType != _scada.mxConstants.NODETYPE_ELEMENT){
              firstChild = firstChild.nextSibling;
            }
            
            if (firstChild != null){
              this.backgroundPageShape = this.createBackgroundPageShape(bounds);

              this.backgroundPageShape.scale = 1;
              firstChild.style.position = 'inherit';
            }
          }
        }
        this.validateBackgroundStyles();
      }
    };

    _scada.mxGraphView.prototype.validateBackgroundStyles = function(){
      var graph = this.graph;
      var color = (graph.background == null || graph.background == 'none') ? graph.defaultPageBackgroundColor : graph.background;
      var gridColor = (color != null && this.gridColor != color.toLowerCase()) ? this.gridColor : '#ffffff';
      var image = 'none';
      var position = '';
      
      if (graph.isGridEnabled()){
        var phase = 10;
        
        image = unescape(encodeURIComponent(this.createSvgGrid(gridColor)));
        image = btoa(image);
        image = 'url(' + 'data:image/svg+xml;base64,' + image + ')'
        phase = graph.gridSize * this.scale * this.gridSteps;
        
        var x0 = 0;
        var y0 = 0;

        if (graph.view.backgroundPageShape != null) {
          var bds = this.getBackgroundPageBounds();
          x0 =  bds.x;
          y0 = bds.y;
        }
      }
      var canvas = graph.view.canvas;
      if (canvas.ownerSVGElement != null ){
        canvas = canvas.ownerSVGElement;
      }
      // graph.pageVisible = false;
      if (graph.view.backgroundPageShape != null) {
        // graph.view.backgroundPageShape.node.style.backgroundPosition = "0px 0px";
        graph.container.className = 'geDiagramContainer geDiagramBackdrop';
        canvas.style.backgroundImage = image;
        if (!canvas.style.backgroundColor) {
          canvas.style.backgroundColor = 'white';	
        }
      }
      else
      {
        graph.container.className = 'geDiagramContainer';
        canvas.style.backgroundPosition = position;
        canvas.style.backgroundImage = image;
        if (!canvas.style.backgroundColor) {
          canvas.style.backgroundColor = 'white';	
        }
      }
    };
	
    _scada.mxGraphView.prototype.createSvgGrid = function(color) {
      var tmp = this.graph.gridSize * this.scale;
  
      while (tmp < this.minGridSize) {
        tmp *= 2;
      }
      var tmp2 = this.gridSteps * tmp;
      var d = [];
      for (var i = 1; i < this.gridSteps; i++){
        var tmp3 = i * tmp;
        d.push('M 0 ' + tmp3 + ' L ' + tmp2 + ' ' + tmp3 + ' M ' + tmp3 + ' 0 L ' + tmp3 + ' ' + tmp2);
      }
      var size = tmp2;
      var svg =  '<svg width="' + size + '" height="' + size + '" xmlns="http://www.w3.org/2000/svg">' +
          '<defs><pattern id="grid" width="' + tmp2 + '" height="' + tmp2 + '" patternUnits="userSpaceOnUse">' +
          '<path d="' + d.join(' ') + '" fill="none" stroke="' + color + '" opacity="0.2" stroke-width="1"/>' +
          '<path d="M ' + tmp2 + ' 0 L 0 0 0 ' + tmp2 + '" fill="none" stroke="' + color + '" stroke-width="1"/>' +
          '</pattern></defs><rect width="100%" height="100%" fill="url(#grid)"/></svg>';
      return svg;
    };

    var mxGraphPanGraph = _scada.mxGraph.prototype.panGraph;
    _scada.mxGraph.prototype.panGraph = function(dx, dy)
    {
      mxGraphPanGraph.apply(this, arguments);

      if (this.shiftPreview1 != null){
        var canvas = this.view.canvas;
        
        if (canvas.ownerSVGElement != null){
          canvas = canvas.ownerSVGElement;
        }
        var phase = this.gridSize * this.view.scale * this.view.gridSteps;
        var position = -Math.round(phase - _scada.mxUtils.mod(this.view.translate.x * this.view.scale + dx, phase)) + 'px ' +
          -Math.round(phase - _scada.mxUtils.mod(this.view.translate.y * this.view.scale + dy, phase)) + 'px';
        canvas.style.backgroundPosition = position;
        canvas.style.minHeight = "1000px"
      }
    };
	
    _scada.mxGraph.prototype.updatePageBreaks = function(visible, width, height){
      var scale = this.view.scale;
      var tr = this.view.translate;
      var fmt = this.pageFormat;
      var ps = scale * this.pageScale;

      var bounds2 = this.view.getBackgroundPageBounds();

      width = bounds2.width;
      height = bounds2.height;
      var bounds = new _scada.mxRectangle(scale * tr.x, scale * tr.y, fmt.width * ps, fmt.height * ps);

      visible = visible && Math.min(bounds.width, bounds.height) > this.minPageBreakDist;
      visible = false;
      var horizontalCount = (visible) ? Math.ceil(height / bounds.height) : 0;
      var verticalCount = (visible) ? Math.ceil(width / bounds.width) : 0;
      var right = bounds2.x + width;
      var bottom = bounds2.y + height;

      if (this.horizontalPageBreaks == null && horizontalCount > 0) {
        this.horizontalPageBreaks = [];
      }
      if (this.verticalPageBreaks == null && verticalCount > 0) {
        this.verticalPageBreaks = [];
      }
        
      var drawPageBreaks = _scada.mxUtils.bind(this, function(breaks) {
        if (breaks != null) {
          var count = (breaks == this.horizontalPageBreaks) ? horizontalCount : verticalCount; 
          
          for (var i = 0; i <= count; i++) {
            var pts = (breaks == this.horizontalPageBreaks) ?
              [new _scada.mxPoint(Math.round(bounds2.x), Math.round(bounds2.y + (i + 1) * bounds.height)),
              new _scada.mxPoint(Math.round(right), Math.round(bounds2.y + (i + 1) * bounds.height))] :
              [new _scada.mxPoint(Math.round(bounds2.x + (i + 1) * bounds.width), Math.round(bounds2.y)),
              new _scada.mxPoint(Math.round(bounds2.x + (i + 1) * bounds.width), Math.round(bottom))];
            
            if (breaks[i] != null) {
              breaks[i].points = pts;
              breaks[i].redraw();
            } else {
              var pageBreak = new _scada.mxPolyline(pts, this.pageBreakColor);
              pageBreak.dialect = this.dialect;
              pageBreak.isDashed = this.pageBreakDashed;
              pageBreak.pointerEvents = false;
              pageBreak.init(this.view.backgroundPane);
              pageBreak.redraw();
              breaks[i] = pageBreak;
            }
          }
          
          for (var i = count; i < breaks.length; i++) {
            breaks[i].destroy();
          }
          breaks.splice(count, breaks.length - count);
        }
      });
      drawPageBreaks(this.horizontalPageBreaks);
      drawPageBreaks(this.verticalPageBreaks);
    };

    _scada.mxGraphView.prototype.createBackgroundPageShape = function(bounds) {
      return new _scada.mxRectangleShape(bounds, '#ffffff', this.graph.defaultPageBorderColor);
    };

    _scada.mxGraphView.prototype.getBackgroundPageBounds = function() {
      var gb = this.getGraphBounds();

      // Computes unscaled, untranslated graph bounds
      var x = (gb.width > 0) ? gb.x / this.translate.x : 0;
      var y = (gb.height > 0) ? gb.y /  this.translate.y : 0;
      var w = gb.width / this.scale;
      var h = gb.height / this.scale;
      
      var fmt = this.graph.pageFormat;
      var ps = this.graph.pageScale;
      var pw = fmt.width * ps;
      var ph = fmt.height * ps;

      var x0 = Math.floor(Math.min(0, x) / pw);
      var y0 = Math.floor(Math.min(0, y) / ph);
      var xe = Math.ceil(Math.max(1, x + w) / pw);
      var ye = Math.ceil(Math.max(1, y + h) / ph);
      
      var rows = xe - x0;
      var cols = ye - y0;

      var bounds = new _scada.mxRectangle(this.scale * (this.translate.x + x0 * pw), this.scale *
          (this.translate.y + y0 * ph), this.scale * rows * pw, this.scale * cols * ph);
      return bounds;
    };
	
    var graphPanGraph = _scada.mxGraph.prototype.panGraph;
    _scada.mxGraph.prototype.panGraph = function(dx, dy) {
      graphPanGraph.apply(this, arguments);
      if ((this.dialect != 'svg' && this.view.backgroundPageShape != null) &&
        (!this.useScrollbarsForPanning || !_scada.mxUtils.hasScrollbars(this.container))) {
        this.view.backgroundPageShape.node.style.marginLeft = dx + 'px';
        this.view.backgroundPageShape.node.style.marginTop = dy + 'px';
      }
    };

    var mxPopupMenuAddItem = _scada.mxPopupMenu.prototype.addItem;
    _scada.mxPopupMenu.prototype.addItem = function(title, image, funct, parent, iconCls, enabled)
    {
      var result = mxPopupMenuAddItem.apply(this, arguments);
      
      if (enabled != null && !enabled) {
        _scada.mxEvent.addListener(result, 'mousedown', function(evt) {
          _scada.mxEvent.consume(evt);
        });
      }
      
      return result;
    };

    var graphHandlerGetInitialCellForEvent = _scada.mxGraphHandler.prototype.getInitialCellForEvent;
    _scada.mxGraphHandler.prototype.getInitialCellForEvent = function(me) {
      var model = this.graph.getModel();
      var psel = model.getParent(this.graph.getSelectionCell());
      var cell = graphHandlerGetInitialCellForEvent.apply(this, arguments);
      var parent = model.getParent(cell);
      
      if (psel == null || (psel != cell && psel != parent)) {
        while (!this.graph.isCellSelected(cell) && !this.graph.isCellSelected(parent) &&
          model.isVertex(parent) && !this.graph.isContainer(parent)) {
          cell = parent;
          parent = this.graph.getModel().getParent(cell);
        }
      }
      return cell;
    };
	
    var graphHandlerIsDelayedSelection = _scada.mxGraphHandler.prototype.isDelayedSelection;
    _scada.mxGraphHandler.prototype.isDelayedSelection = function(cell, me) {
      var result = graphHandlerIsDelayedSelection.apply(this, arguments);
      
      if (!result) {
        var model = this.graph.getModel();
        var parent = model.getParent(cell);
        
        while (parent != null) {
          if (this.graph.isCellSelected(parent) && model.isVertex(parent)) {
            result = true;
            break;
          }
          parent = model.getParent(parent);
        }
      }
      return result;
    };
    
    _scada.mxGraphHandler.prototype.selectDelayed = function(me) {
      if (!this.graph.popupMenuHandler.isPopupTrigger(me)) {
        var cell = me.getCell();
        if (cell == null) {
          cell = this.cell;
        }
        var state = this.graph.view.getState(cell)
        if (state != null && me.isSource(state.control)) {
          this.graph.selectCellForEvent(cell, me.getEvent());
        } else {
          var model = this.graph.getModel();
          var parent = model.getParent(cell);
          
          while (!this.graph.isCellSelected(parent) && model.isVertex(parent)) {
            cell = parent;
            parent = model.getParent(cell);
          }
          
          this.graph.selectCellForEvent(cell, me.getEvent());
        }
      }
    };

    _scada.mxPopupMenuHandler.prototype.getCellForPopupEvent = function(me) {
      var cell = me.getCell();
      var model = this.graph.getModel();
      var parent = model.getParent(cell);
      
      while (model.isVertex(parent) && !this.graph.isContainer(parent)) {
        if (this.graph.isCellSelected(parent)){
          cell = parent;
        }
        parent = model.getParent(parent);
      }
      return cell;
    };
  }

  editorGraphSettings(_scada, _settings){
    _scada.Editor.prototype.readGraphState = function(node) {
      var grid = node.getAttribute('grid');
	
      if (grid == null || grid == '') {
        grid = this.graph.defaultGridEnabled ? '1' : '0';
      }
      
      this.graph.gridEnabled = grid != '0';
      this.graph.gridSize = parseFloat(node.getAttribute('gridSize')) || mxGraph.prototype.gridSize;
      this.graph.graphHandler.guidesEnabled = node.getAttribute('guides') != '0';
      this.graph.setTooltips(node.getAttribute('tooltips') != '0');
      this.graph.setConnectable(node.getAttribute('connect') != '0');
      this.graph.connectionArrowsEnabled = node.getAttribute('arrows') != '0';
      this.graph.foldingEnabled = node.getAttribute('fold') != '0';
      
      var ps = parseFloat(node.getAttribute('pageScale'));
      if (!isNaN(ps) && ps > 0) {
        this.graph.pageScale = ps;
      } else {
        this.graph.pageScale = _scada.mxGraph.prototype.pageScale;
      }
    
      if (!this.graph.isLightboxView() && !this.graph.isViewer()) {
        var pv = node.getAttribute('page');
        if (pv != null) {
          this.graph.pageVisible = (pv != '0');
        } else {
          this.graph.pageVisible = this.graph.defaultPageVisible;
        }
      } else {
        this.graph.pageVisible = false;
      }
      
      this.graph.pageBreaksVisible = this.graph.pageVisible; 
      this.graph.preferPageSize = this.graph.pageBreaksVisible;
      var pw = parseFloat(node.getAttribute('pageWidth'));
      var ph = parseFloat(node.getAttribute('pageHeight'));
      
      if (!isNaN(pw) && !isNaN(ph)) {
        this.graph.pageFormat = new _scada.mxRectangle(0, 0, pw, ph);
      }
      var bg = node.getAttribute('background');
      if (bg != null && bg.length > 0) {
        this.graph.background = bg;
      } else {
        this.graph.background = null;
      }
      var svg = this.graph.container.querySelector('svg');

      var isChildNodesAvailable = setInterval(()=>{
        if (svg.childNodes[0].childNodes[1].childNodes[0] && this.graph.minimumGraphSize && (this.graph.container.clientWidth > 0)) {
          clearInterval(isChildNodesAvailable);

          if (!this.graph.pageVisible) {
              this.get('pageView').funct();
          }
          var fmt = this.graph.pageFormat;
          var ps = this.graph.pageScale;
          var cw = this.graph.container.clientWidth - 10;
          var ch = this.graph.container.clientHeight - 10;
          var scale = Math.floor(20 * Math.min(cw / fmt.width / ps, ch / fmt.height / ps)) / 20;
          this.graph.zoomTo(scale);
          
          if (_scada.mxUtils.hasScrollbars(this.graph.container)) {
            var pad = this.graph.getPagePadding();
            this.graph.container.scrollTop = pad.y * this.graph.view.scale - 1;
            this.graph.container.scrollLeft = Math.min(pad.x * this.graph.view.scale, (this.graph.container.scrollWidth - this.graph.container.clientWidth) / 2) - 1;
          }
        }
      },100)
    };
    
  }

  previewGraphSettings(_scada, _settings){
    _scada.Editor.prototype.readGraphState = function(node) {
      this.graph.gridEnabled = node.getAttribute('grid') != '0' && (!this.isChromelessView());
      this.graph.gridSize = parseFloat(node.getAttribute('gridSize')) || _scada.mxGraph.prototype.gridSize;
      this.graph.graphHandler.guidesEnabled = node.getAttribute('guides') != '0';
      this.graph.setTooltips(node.getAttribute('tooltips') != '0');
      this.graph.setConnectable(node.getAttribute('connect') != '0');
      this.graph.connectionArrowsEnabled = node.getAttribute('arrows') != '0';
      this.graph.foldingEnabled = node.getAttribute('fold') != '0';
      this.graph.fitToScreen = (node.getAttribute('fitToScreen') === 'true' || null) ? true : false;
      this.graph.fitHorizontal = (node.getAttribute('fitHorizontal') === 'true') ? true : false;
      this.graph.fitVertical = (node.getAttribute('fitVertical') === 'true') ? true : false;
      this.graph.zoomEnabled = (node.getAttribute('zoomEnabled') === 'true' || node.getAttribute('zoomEnabled') === null) ? true : false;
      this.graph.hoverEnabled = (node.getAttribute('hoverEnabled') === 'true') ? true : false;

      var pw = parseFloat(node.getAttribute('pageWidth'));
      var ph = parseFloat(node.getAttribute('pageHeight'));
      this.graph['pw'] = pw;
      this.graph['ph'] = ph;
      this.graph['scaleToTranslate'] = 1;
      const saveToPreview = node.getAttribute('saveToPreview');
      const canvas = this.graph.view.canvas;
      if (canvas.ownerSVGElement != null) {
        this.graph.view.canvas = this.graph.view.canvas.ownerSVGElement;
      }

      this.graph.view.canvas.style.backgroundColor =
      (node.getAttribute('background') === 'none') ? 'white' : node.getAttribute('background');
      if (saveToPreview === 'true') {
        this.graph.gridEnabled = (node.getAttribute('gridEnabled') === 'true' || null) ? true : false;
        this.graph.view.gridColor = node.getAttribute('gridColor');
        this.graph.gridSize = node.getAttribute('gridSize');
      } else {
        this.graph.gridEnabled = (node.getAttribute('gridEnabled') === 'true' || null) ? true : false;
      }
	    if (this.graph.fitToScreen || this.graph.fitHorizontal || this.graph.fitVertical) {
        var isGraphSizeAvailable = setInterval(() => {
        if(this.graph.minimumGraphSize && (this.graph.container.clientWidth > 0)){
          clearInterval(isGraphSizeAvailable)
          let minGraphHeight = this.graph.minimumGraphSize.height;
          let minGraphWidth = this.graph.minimumGraphSize.width;
          var zoomRatio = 1;
          var pageSize;
          var fitWhat = 'none';
            if (this.graph.fitHorizontal) {
              zoomRatio =this.graph.container.clientWidth;
              pageSize = pw;
              fitWhat = 'horizontal';
              this.graph['scaleToTranslate'] = ((zoomRatio) / (pageSize));
              this.graph.view.scaleAndTranslate(this.graph.scaleToTranslate);
            }
            if (this.graph.fitToScreen) {
              zoomRatio = Math.min(this.graph.container.clientHeight / minGraphHeight,this.graph.container.clientWidth/ minGraphWidth)
              this.graph['scaleToTranslate'] =  ((zoomRatio));;
              this.graph.view.scaleAndTranslate(this.graph.scaleToTranslate);
            }
            if (this.graph.fitVertical){
              zoomRatio = this.graph.container.clientHeight;
              pageSize = ph;
              fitWhat = 'vertical';
              this.graph['scaleToTranslate'] = ((zoomRatio) / (pageSize));;
              this.graph.view.scaleAndTranslate(this.graph.scaleToTranslate);
            }
            this.graph['fitWhat'] = fitWhat;
            switch(fitWhat){
              case 'horizontal':
                var isSizeDifferent;
                (this.graph.container.clientWidth > this.graph.container.getBoundingClientRect().width) ?
                isSizeDifferent = this.graph.container.clientWidth - this.graph.container.getBoundingClientRect().width:
                isSizeDifferent = this.graph.container.getBoundingClientRect().width - this.graph.container.clientWidth;
                if(isSizeDifferent !== 0){
                  zoomRatio =this.graph.container.clientWidth - ((this.graph.container.getBoundingClientRect().width - this.graph.container.clientWidth)/3);
                  this.graph['scaleToTranslate'] = ((zoomRatio) / (pageSize));
                  this.graph.view.scaleAndTranslate(this.graph.scaleToTranslate);
                  break;
                }
              case 'vertical':
                var isSizeDifferent;
                (this.graph.container.clientHeight > this.graph.container.getBoundingClientRect().height) ?
                isSizeDifferent = this.graph.container.clientHeight - this.graph.container.getBoundingClientRect().height:
                isSizeDifferent = this.graph.container.getBoundingClientRect().height - this.graph.container.clientHeight;
                zoomRatio = this.graph.container.getBoundingClientRect().height;
                ((zoomRatio % 1) > 0.5) ?
                zoomRatio = this.graph.container.getBoundingClientRect().height - isSizeDifferent - 2:
                zoomRatio = this.graph.container.getBoundingClientRect().height - isSizeDifferent;
                this.graph['scaleToTranslate'] = ((zoomRatio) / (pageSize));
                this.graph.view.scaleAndTranslate(this.graph.scaleToTranslate);
                break;
          }
        }
        },50)
	    }

      if (this.isChromelessView() && this.graph.foldingEnabled) {
        this.graph.foldingEnabled = false;
        this.graph.cellRenderer.forceControlClickHandler = this.graph.foldingEnabled;
      }
	    var ps = parseFloat(node.getAttribute('pageScale'));
      if (!isNaN(ps) && ps > 0) {
        this.graph.pageScale = ps;
      } else {
        this.graph.pageScale = _scada.mxGraph.prototype.pageScale;
      }

      if (!this.graph.isLightboxView() && !this.graph.isViewer()) {
        var pv = node.getAttribute('page');
      
        if (pv != null) {
          this.graph.pageVisible = (pv != '0');
        } else {
          this.graph.pageVisible = this.graph.defaultPageVisible;
        }
      } else {
        this.graph.pageVisible = false;
      }
	
	    this.graph.pageBreaksVisible = this.graph.pageVisible; 
	    this.graph.preferPageSize = this.graph.pageBreaksVisible;
      if (!isNaN(pw) && !isNaN(ph) && this.graph.fitToScreen) {
        this.graph.pageFormat = new _scada.mxRectangle(0, 0, 1, 1);
      } else {
        this.graph.pageFormat = new _scada.mxRectangle(0, 0, pw, ph);
      }

    	var bg = node.getAttribute('background');
      if (bg != null && bg.length > 0) {
        this.graph.background = bg;
      } else {
        this.graph.background = null;
      }
    };
  }


  /**
 * On context menu if the drop down for other actions or create are open - CLOSE THEM. :-|
 */
    removeOpenDropDowns(): void{
    const dropdown_elements: any = document.getElementsByClassName(
      'dropdown-menu-right'
    )
    for (const each_element of dropdown_elements) {
      if (each_element.classList.contains('show')) {
        each_element.classList.remove('show')             
      }
    }
  }
    

}