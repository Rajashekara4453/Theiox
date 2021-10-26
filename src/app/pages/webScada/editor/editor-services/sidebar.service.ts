import { Injectable } from '@angular/core';
import { UtilityFunctions } from '../../../../../../src/app/utilities/utility-func';
import { AppService } from '../../../../../../src/app/services/app.service';
import { globals } from '../../../../../../src/app/utilities/globals';
import { EditorUiService } from './editor-ui.service';
import { ToastrService } from '../../../../../../src/app/components/toastr/toastr.service';

@Injectable({
  providedIn: 'root'
})
export class SidebarService {

  constructor(private _app: AppService,
              private _global: globals,
              private _toastLoad: ToastrService,
              private _editorUi:EditorUiService,
              private _util: UtilityFunctions) { }

  public defaultImages = [];
  public uploadedImages = [];
  public imgLibraryPallete;
  public Scada;

  public default_images = [];
  public uploaded_images = [];
  public default_images_key_access = {}

  fixSidebar(_scada, _settings): void {
    var _service = this;
    this.Scada = _scada;
    const STENCIL = '/assets/library/scada/resources/stencils';
    
    _scada.Sidebar.prototype.createVertexTemplate = function (style, width, height, value, title, showLabel, showTitle, allowCellsInserted) {
      var cells = [new _scada.mxCell((value != null) ? value : '', new _scada.mxGeometry(0, 0, width, height), style)];
      cells[0].vertex = true;

      if (style.includes('shape=image;')) cells[0].version = '1';
      
      return this.createVertexTemplateFromCells(cells, width, height, title, showLabel, showTitle, allowCellsInserted);
    };

    _scada.Sidebar.prototype.init = function() {
      this.addSearchPalette(true);
      this.addGeneralPalette(false);
      this.loadDefaultImages(false);
    };

    _scada.Sidebar.prototype.addGeneralPalette = function(expand) {
      var lineTags = 'line lines connector connectors connection connections arrow arrows ';
      this.setCurrentSearchEntryLibrary('general', 'general');

        var fns = [
          this.createVertexTemplateEntry('rounded=0;whiteSpace=wrap;html=1;', 120, 60, '', 'Rectangle', null, null, 'rect rectangle box'),
          this.createVertexTemplateEntry('rounded=1;whiteSpace=wrap;html=1;', 120, 60, '', 'Rounded Rectangle', null, null, 'rounded rect rectangle box'),
          this.createVertexTemplateEntry('text;html=1;strokeColor=none;fillColor=none;align=center;verticalAlign=middle;whiteSpace=wrap;rounded=0;',
            40, 20, 'Text', 'Text', null, null, 'text textbox textarea label'),
          this.createVertexTemplateEntry('text;html=1;strokeColor=none;fillColor=none;spacing=5;spacingTop=-20;whiteSpace=wrap;overflow=hidden;rounded=0;', 190, 120,
            '<h1>Heading</h1><p>Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.</p>',
            'Textbox', null, null, 'text textbox textarea'),
          this.createVertexTemplateEntry('ellipse;whiteSpace=wrap;html=1;', 120, 80, '', 'Ellipse', null, null, 'oval ellipse state'),
          this.createVertexTemplateEntry('whiteSpace=wrap;html=1;aspect=fixed;', 80, 80, '', 'Square', null, null, 'square'),
          this.createVertexTemplateEntry('ellipse;whiteSpace=wrap;html=1;aspect=fixed;', 80, 80, '', 'Circle', null, null, 'circle'),
          this.createVertexTemplateEntry('shape=process;whiteSpace=wrap;html=1;backgroundOutline=1;', 120, 60, '', 'Process', null, null, 'process task'),
          this.createVertexTemplateEntry('rhombus;whiteSpace=wrap;html=1;', 80, 80, '', 'Diamond', null, null, 'diamond rhombus if condition decision conditional question test'),
          this.createVertexTemplateEntry('shape=parallelogram;perimeter=parallelogramPerimeter;whiteSpace=wrap;html=1;fixedSize=1;', 120, 60, '', 'Parallelogram'),
          this.createVertexTemplateEntry('shape=hexagon;perimeter=hexagonPerimeter2;whiteSpace=wrap;html=1;fixedSize=1;', 120, 80, '', 'Hexagon', null, null, 'hexagon preparation'),
          this.createVertexTemplateEntry('triangle;whiteSpace=wrap;html=1;', 60, 80, '', 'Triangle', null, null, 'triangle logic inverter buffer'),
          this.createVertexTemplateEntry('shape=cylinder3;whiteSpace=wrap;html=1;boundedLbl=1;backgroundOutline=1;', 60, 80, '', 'Cylinder', null, null, 'cylinder data database'),
          this.createVertexTemplateEntry('ellipse;shape=cloud;whiteSpace=wrap;html=1;', 120, 80, '', 'Cloud', null, null, 'cloud network'),
          this.createVertexTemplateEntry('shape=document;whiteSpace=wrap;html=1;boundedLbl=1;', 120, 80, '', 'Document'),
          this.createVertexTemplateEntry('shape=internalStorage;whiteSpace=wrap;html=1;backgroundOutline=1;', 80, 80, '', 'Internal Storage'),
          this.createVertexTemplateEntry('shape=cube;whiteSpace=wrap;html=1;boundedLbl=1;backgroundOutline=1;darkOpacity=0.05;darkOpacity2=0.1;', 120, 80, '', 'Cube'),
          this.createVertexTemplateEntry('shape=step;perimeter=stepPerimeter;whiteSpace=wrap;html=1;fixedSize=1;', 120, 80, '', 'Step'),
          this.createVertexTemplateEntry('shape=trapezoid;perimeter=trapezoidPerimeter;whiteSpace=wrap;html=1;fixedSize=1;', 120, 60, '', 'Trapezoid'),
          this.createVertexTemplateEntry('shape=tape;whiteSpace=wrap;html=1;', 120, 100, '', 'Tape'),
          this.createVertexTemplateEntry('shape=note;whiteSpace=wrap;html=1;backgroundOutline=1;darkOpacity=0.05;', 80, 100, '', 'Note'),
          this.createVertexTemplateEntry('shape=card;whiteSpace=wrap;html=1;', 80, 100, '', 'Card'),
          this.createVertexTemplateEntry('shape=callout;whiteSpace=wrap;html=1;perimeter=calloutPerimeter;', 120, 80, '', 'Callout', null, null, 'bubble chat thought speech message'),
          this.createVertexTemplateEntry('shape=umlActor;verticalLabelPosition=bottom;verticalAlign=top;html=1;outlineConnect=0;', 30, 60, 'Actor', 'Actor', false, null, 'user person human stickman'),
          this.createVertexTemplateEntry('shape=xor;whiteSpace=wrap;html=1;', 60, 80, '', 'Or', null, null, 'logic or'),
          this.createVertexTemplateEntry('shape=or;whiteSpace=wrap;html=1;', 60, 80, '', 'And', null, null, 'logic and'),
          this.createVertexTemplateEntry('shape=dataStorage;whiteSpace=wrap;html=1;fixedSize=1;', 100, 80, '', 'Data Storage'),
          this.addEntry('curve', _scada.mxUtils.bind(this, function() {
            var cell = new _scada.mxCell('', new _scada.mxGeometry(0, 0, 50, 50), 'curved=1;endArrow=classic;html=1;');
            cell.geometry.setTerminalPoint(new _scada.mxPoint(0, 50), true);
            cell.geometry.setTerminalPoint(new _scada.mxPoint(50, 0), false);
            cell.geometry.points = [new _scada.mxPoint(50, 50), new _scada.mxPoint(0, 0)];
            cell.geometry.relative = true;
            cell.edge = true;
            return this.createEdgeTemplateFromCells([cell], cell.geometry.width, cell.geometry.height, 'Curve');
          })),
          this.createEdgeTemplateEntry('shape=flexArrow;endArrow=classic;startArrow=classic;html=1;', 100, 100, '', 'Bidirectional Arrow', null, lineTags + 'bidirectional'),
          this.createEdgeTemplateEntry('shape=flexArrow;endArrow=classic;html=1;', 50, 50, '', 'Arrow', null, lineTags + 'directional directed'),
          this.createEdgeTemplateEntry('endArrow=none;dashed=1;html=1;', 50, 50, '', 'Dashed Line', null, lineTags + 'dashed undirected no'),
          this.createEdgeTemplateEntry('endArrow=none;dashed=1;html=1;dashPattern=1 3;strokeWidth=2;', 50, 50, '', 'Dotted Line', null, lineTags + 'dotted undirected no'),
          this.createEdgeTemplateEntry('endArrow=none;html=1;', 50, 50, '', 'Line', null, lineTags + 'simple undirected plain blank no'),
          this.createEdgeTemplateEntry('endArrow=classic;startArrow=classic;html=1;', 50, 50, '', 'Bidirectional Connector', null, lineTags + 'bidirectional'),
          this.createEdgeTemplateEntry('endArrow=classic;html=1;', 50, 50, '', 'Directional Connector', null, lineTags + 'directional directed'),
          this.createEdgeTemplateEntry('shape=link;html=1;', 100, 0, '', 'Link', null, lineTags + 'link'),
          this.createVertexTemplateEntry('shape=partialRectangle;whiteSpace=wrap;html=1;top=0;bottom=0;fillColor=none;', 120, 60, '', 'Partial Rectangle'),
          this.createVertexTemplateEntry('shape=partialRectangle;whiteSpace=wrap;html=1;right=0;top=0;bottom=0;fillColor=none;routingCenterX=-0.5;', 120, 60, '', 'Partial Rectangle'),
          this.createVertexTemplateEntry('shape=partialRectangle;whiteSpace=wrap;html=1;bottom=0;right=0;fillColor=none;', 120, 60, '', 'Partial Rectangle'),
          this.createVertexTemplateEntry('shape=partialRectangle;whiteSpace=wrap;html=1;top=0;left=0;fillColor=none;', 120, 60, '', 'Partial Rectangle')
        ];

        var stencilFile = STENCIL + "/flowchart.xml"
        var style = ';whiteSpace=wrap;html=1;fillColor=#ffffff;strokeColor=#000000;strokeWidth=2';
        var ignore = null;
        var tags = null;
        var customFns = [];
        var scale = 1;

        for (var i = 0; i < customFns.length; i++) {
            fns.push(customFns[i]);
        }

        _scada.mxStencilRegistry.loadStencilSet(stencilFile, _scada.mxUtils.bind(this, function (packageName, stencilName, displayName, w, h) {
            if (ignore == null || _scada.mxUtils.indexOf(ignore, stencilName) < 0) {
                var tmp = this.getTagsForStencil(packageName, stencilName);
                var tmpTags = (tags != null) ? tags[stencilName] : null;
                if (tmpTags != null) {
                    tmp.push(tmpTags);
                }
                fns.push(this.createVertexTemplateEntry('shape=' + packageName + stencilName.toLowerCase() + style,
                    Math.round(w * scale), Math.round(h * scale), '', stencilName.replace(/_/g, ' '), null, null,
                    this.filterTags(tmp.join(' '))));
            }
        }), true, true);
        
        this.addPaletteFunctions('general', _scada.mxResources.get('shapes'), (expand != null) ? expand : true, fns);
        this.setCurrentSearchEntryLibrary();
    };
    
    _scada.Sidebar.prototype.loadDefaultImages = function(expand) {
      _service.default_images = [];
      _service._app.getAllImagesInfo({}).subscribe((resp) => {
        if (resp['status'] == 'success') {
            var assetsArr = resp['data'].images_info;
            _service.defaultImages = [];
            for (let images of assetsArr) {
              _service.defaultImages.push(images.name + "^" + images.url + "^" + images.keywords);
              let splitURL = images.url.split('/');
              _service.default_images_key_access[splitURL[splitURL.length - 1]] = images.url;
              _service.default_images.push({
                label: images.name,
                image: _service.getHostIp(_service._util.appMode) + images.url,
                value: images.url
              })
            }
            this.loadImages(false, "gallery", "Gallery", _service.defaultImages);
        } else {
          _service._toastLoad.toast('error', 'Error', 'Failed to load default images', true);
        }
          this.loadImageLibrary(false);
      }, (err) => {
        this.loadImageLibrary(false);
        _service._toastLoad.toast('error', 'Error', 'Failed to load default images', true);
      })
    }

    _scada.Sidebar.prototype.loadImageLibrary = function(expand?) {
      _service.uploaded_images = [];
      var refreshIcon = document.getElementById('imgLibraryRefresh');
      (refreshIcon) ? refreshIcon.classList.add('fa-spin') : null;
      _service._app.getUploadedImages({}).subscribe((resp)=>{
        if(resp['status'] == 'success'){
            var assetsArr = resp['data'].images_info;
            _service.uploadedImages = [];
            for (let images of assetsArr) {
              _service.uploadedImages.push(images.name + "^" + images.url + "^" + images.keywords);
              _service.uploaded_images.push({
                label: images.name,
                image: _service.getHostIp(_service._util.appMode) + images.url,
                value: images.url
              })
            }
            this.loadImages(expand, "ImageLibrary", "Uploads", _service.uploadedImages);
            var noData = document.createElement('span');
            noData.classList.add('uploadNFound');
            noData.innerHTML = "Uploads not found<br><span class='clickToUpload'> Click <i class='fa fa-upload c-pointer' title='Upload'></i> to upload</span>";
            var uploads = document.getElementById('Uploads');
            if(_service.uploadedImages.length == 0 && uploads){
                uploads.appendChild(noData);
                uploads.classList.add('noDataFound');
            } else if(uploads){
                uploads.classList.remove('noDataFound');
                if(uploads.querySelector('span')){
                    uploads.removeChild(noData);
                }
            }

        } else {
          _service._toastLoad.toast('error', 'Error', 'Failed to load default images', true);
        }
        (refreshIcon) ? refreshIcon.classList.remove('fa-spin') : null;
      }, (err) => {
        (refreshIcon) ? refreshIcon.classList.remove('fa-spin') : null;
        _service._toastLoad.toast('error', 'Error', 'Failed to load default images', true);
      })
    }

    _scada.Sidebar.prototype.loadImages = function (
      increment,
      id,
      title,
      imgData,
      titles,
      tags
      ) {
          var fns = [];
  
          for (var i = 0; i < imgData.length; i++) {
            var imgDataArray = imgData[i].split('^');
            _scada.mxUtils.bind(this, function (item, title, tmpTags) {
                if (tmpTags == null) {
                    tmpTags = imgDataArray[2] + "," + (imgDataArray[0].split(".")[0]);
                }
                fns.push(
                    this.createVertexTemplateEntry(
                        "shape=image;html=1;labelBackgroundColor=#ffffff;image=" + _service.getHostIp(_service._util.appMode) + imgDataArray[1],
                        this.defaultImageWidth,
                        this.defaultImageHeight,
                        "",
                        imgDataArray[0],
                        null,
                        null,
                        this.filterTags(tmpTags)
                    )
                );
            })(
                imgDataArray[0],
                titles != null ? titles[i] : null,
                tags != null ? tags[imgDataArray[0]] : null
            );
          }
          this.addPaletteFunctions(id, title, increment, fns);
        };

        _scada.Sidebar.prototype.addPalette = function(id, title, expanded, onInit) {
          var elt = this.createTitle(title);
          elt.id = id;
          if (id == 'ImageLibrary') {
            if (!document.getElementById('imgLibrary') && !document.getElementById('imgLibraryRefresh')) {
                var division = document.createElement('div');
                division.className = "image-library-container";
                var btn = document.createElement('button');
                btn.className = "fa fa-refresh images-library images-library-refresh";
                btn.id = "imgLibraryRefresh";
                btn.title = "Refresh"
                division.appendChild(btn);
                btn.addEventListener('click', () => {
                    this.loadImageLibrary(true);
                })

                var btn = document.createElement('button');
                btn.title = "Upload"
                btn.className = "fa fa-upload images-library images-library-refresh";
                btn.id = "imgLibrary"
                division.appendChild(btn);
                btn.addEventListener('click', () => {
                    _service._editorUi.openUploadModal();
                });

                this.container.appendChild(division);
            }
          }
          if (document.getElementById(id)) {
            this.container.replaceChild(elt, document.getElementById(id));
          } else {
            this.container.appendChild(elt);
          }
    
          if (document.getElementById(title)) {
            var div = document.getElementById(title)
            div.innerHTML = "";
          } else {
            div = document.createElement('div');
            div.className = 'geSidebar';
            div.id = title;
    
            var outer = document.createElement('div');
            outer.appendChild(div);
            this.container.appendChild(outer);
          }

          if (_scada.mxClient.IS_POINTER) {
            div.style.touchAction = 'none';
          }
          if (expanded) {
            onInit(div);
            onInit = null;
          } else {
            div.style.display = 'none';
          }
          this.addFoldingHandler(elt, div, onInit);
          if (!this.palettes) {
            if (id != null) {
                _service.imgLibraryPallete[id] = [elt, outer];
            }
          } else if (this.palettes) {
              _service.imgLibraryPallete = this.palettes;
              if (id != null) {
                  this.palettes[id] = [elt, outer];
              }
          }
            return div;
        };
        this.fixToolTipPosition(_scada);
    }

    getHostIp(appMode) {
      switch (appMode) {
        case 'server':
          const serverModeInfo = JSON.parse(this._util.decryptCryptoAES(localStorage.getItem('SERVER_INFO'), 'thisissecret'));
          const getIpBasedOnMode = serverModeInfo.ip;
          const transferProtocol = serverModeInfo.protocol;
          return `${transferProtocol}://${getIpBasedOnMode}`;
        case 'cloud':
          let Protocol;
          if (this._global._appConfigurations['MQTT']['useSSL']) {
            Protocol = 'https';
          } else {
            Protocol = 'http';
          }
          return `${Protocol}://${this._global._appConfigurations['MQTT']['ip']}`;
        default:
          return `${window.location.origin}`;
      }
    }
    fixToolTipPosition(_scada){
      _scada.Sidebar.prototype.showTooltip = function(elt, cells, w, h, title, showLabel) {
        if (this.enableTooltips && this.showTooltips) {
          if (this.currentElt != elt) {
            if (this.thread != null) {
              window.clearTimeout(this.thread);
              this.thread = null;
            }
            
            var show = _scada.mxUtils.bind(this, function() {
              if (this.tooltip == null) {
                this.tooltip = document.createElement('div');
                this.tooltip.className = 'geSidebarTooltip';
                this.tooltip.style.zIndex = _scada.mxPopupMenu.prototype.zIndex - 1;
                document.body.appendChild(this.tooltip);
                
                this.graph2 = new _scada.Graph(this.tooltip, null, null, this.editorUi.editor.graph.getStylesheet());
                this.graph2.resetViewOnRootChange = false;
                this.graph2.foldingEnabled = false;
                this.graph2.gridEnabled = false;
                this.graph2.autoScroll = false;
                this.graph2.setTooltips(false);
                this.graph2.setConnectable(false);
                this.graph2.setEnabled(false);
              }
              
              this.graph2.model.clear();
              this.graph2.view.setTranslate(this.tooltipBorder, this.tooltipBorder);
      
              if (w > this.maxTooltipWidth || h > this.maxTooltipHeight) {
                this.graph2.view.scale = Math.round(Math.min(this.maxTooltipWidth / w, this.maxTooltipHeight / h) * 100) / 100;
              } else {
                this.graph2.view.scale = 1;
              }
              
              this.tooltip.style.display = 'block';
              this.graph2.labelsVisible = (showLabel == null || showLabel);
              var fo = _scada.mxClient.NO_FO;
              _scada.mxClient.NO_FO = _scada.Editor.prototype.originalNoForeignObject;
              
              var temp = this.graph2.cloneCells(cells);
              this.editorUi.insertHandler(temp, null, this.graph2.model);
              this.graph2.addCells(temp);
              
              _scada.mxClient.NO_FO = fo;
              
              var bounds = this.graph2.getGraphBounds();
              var width = bounds.width + 2 * this.tooltipBorder + 4;
              var height = bounds.height + 2 * this.tooltipBorder;
              
              this.tooltip.style.overflow = 'visible';
              this.tooltip.style.width = width + 'px';
              var w2 = width;
              
              if (this.tooltipTitles && title != null && title.length > 0) {
                if (this.tooltipTitle == null) {
                  this.tooltipTitle = document.createElement('div');
                  this.tooltipTitle.style.borderTop = '1px solid gray';
                  this.tooltipTitle.style.textAlign = 'center';
                  this.tooltipTitle.style.width = '100%';
                  this.tooltipTitle.style.overflow = 'hidden';
                  this.tooltipTitle.style.position = 'absolute';
                  this.tooltipTitle.style.paddingTop = '6px';
                  this.tooltipTitle.style.bottom = '6px';
      
                  this.tooltip.appendChild(this.tooltipTitle);
                } else {
                  this.tooltipTitle.innerHTML = '';
                }
                
                this.tooltipTitle.style.display = '';
                _scada.mxUtils.write(this.tooltipTitle, title);
                
                w2 = Math.min(this.maxTooltipWidth, Math.max(width, this.tooltipTitle.scrollWidth + 4));
                var ddy = this.tooltipTitle.offsetHeight + 10;
                height += ddy;
                
                if (_scada.mxClient.IS_SVG) {
                  this.tooltipTitle.style.marginTop = (2 - ddy) + 'px';
                } else {
                  height -= 6;
                  this.tooltipTitle.style.top = (height - ddy) + 'px';	
                }
              } else if (this.tooltipTitle != null && this.tooltipTitle.parentNode != null) {
                this.tooltipTitle.style.display = 'none';
              }
      
              if (w2 > width) {
                this.tooltip.style.width = w2 + 'px';
              }
              
              this.tooltip.style.height = height + 'px';
              var x0 = -Math.round(bounds.x - this.tooltipBorder) +
                ((w2 > width) ? (w2 - width) / 2 : 0);
              var y0 = -Math.round(bounds.y - this.tooltipBorder);
              var off = this.getTooltipOffset(elt, bounds);
              var left = off.x;
              var top = off.y;

              if (x0 != 0 || y0 != 0) {
                this.graph2.view.canvas.setAttribute('transform', 'translate(' + x0 + ',' + y0 + ')');
              } else {
                this.graph2.view.canvas.removeAttribute('transform');
              }
              
              left += 0;
              top += 50;
              this.tooltip.style.position = 'absolute';
              this.tooltip.style.left = left + 'px';
              this.tooltip.style.top = top + 'px';
              _scada.mxUtils.fit(this.tooltip);
            });
            if (this.tooltip != null && this.tooltip.style.display != 'none') {
              show();
            } else {
              this.thread = window.setTimeout(show, this.tooltipDelay);
            }
            this.currentElt = elt;
          }
        }
      };
    }
}
