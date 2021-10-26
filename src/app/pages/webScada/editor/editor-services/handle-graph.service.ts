import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class HandleGraphService {

  	public graph;
  	constructor() { }

	public operators = [
		{ value:'==', label:'= (Equals)' },
		{ value:'!=', label:'!= (Not equals)' },
		{ value:'&ge;', label:'>= (Greater or equal to)' },
		{ value:'&le;', label:'<= (Less or equal to)' },
		{ value:'&gt;', label:'> (Greater than)' },
		{ value:'&lt;', label:'< (Less than)' },
	];

	public isCell = [
		{ value:'fillColor', label:'Fill Color'},
		{ value:'display', label:'Visibility'},
		{ value:'rotation', label:'Rotation'},
		{ value:'gradientColor', label:'Gradient Color'},
		{ value:'fontColor', label:'Font Color'},
		{ value:'fontSize', label:'Font Size'},
		{ value:'text', label:'Show content with value'},
		{ value:'progress', label:'Progress'},
	];

	public isEdge = [
		{ value:'strokeColor', label:'Fill Color'},
		{ value:'display', label:'Visibility'},
		{ value:'fontColor', label:'Font Color'},
		{ value:'fontSize', label:'Font Size'},
		{ value:'labelBackgroundColor', label:'Text Background'},
		{ value:'text', label:'Show content with value'},
		{ value:'progress', label:'Progress'},
	];

	public isImage = [
		{ value:'imageBackground', label:'Fill Color'},
		{ value:'display', label:'Visibility'},
		{ value:'rotation', label:'Rotation'},
		{ value:'image', label:'Image'},
		{ value:'fontColor', label:'Font Color'},
		{ value:'fontSize', label:'Font Size'},
		{ value:'text', label:'Show content with value'},
	];

  	public scadaInformation;

	//--------set the graph object----------//
	setGraphObject(graph): void {
		this.graph = graph;
	}

	//--------return graph object---------//
	getGraphObject(): any {
		return this.graph;
	}

	overridesForEditorConditions(_scada, _settings){
		_scada.mxShape.prototype.createSvgCanvas = function() {
			_scada.mxSvgCanvas2D.prototype.cellState = this.state;
			var canvas = new _scada.mxSvgCanvas2D(this.node, false, this.state);
			canvas.strokeTolerance = (this.pointerEvents) ? this.svgStrokeTolerance : 0;
			canvas.pointerEventsValue = this.svgPointerEvents;
			var off = this.getSvgScreenOffset();
		
			if (off != 0) {
				this.node.setAttribute('transform', 'translate(' + off + ',' + off + ')');
			} else {
				this.node.removeAttribute('transform');
			}
			canvas.minStrokeWidth = this.minSvgStrokeWidth;
			if (!this.antiAlias) {
				canvas.format = function(value) {
					return Math.round(parseFloat(value));
				};
			}
			return canvas;
		};
		
		_scada.mxSvgCanvas2D.prototype.addNode = function(filled, stroked) {
			var node = this.node;
			var s = this.state;
			if (node != null) {
				if (node.nodeName == 'path') {
					if (this.path != null && this.path.length > 0){
						node.setAttribute('d', this.path.join(' '));
					} else {
						return;
					}
				}
				if (filled && s.fillColor != null) {
					this.updateFill();
				}
				else if (!this.styleEnabled) {
					if (node.nodeName == 'ellipse' && _scada.mxClient.IS_FF) {
						node.setAttribute('fill', 'transparent');
					} else {
						node.setAttribute('fill', 'none');
					}
					filled = false;
				}
				
				if (stroked && s.strokeColor != null) {
					this.updateStroke();
				} else if (!this.styleEnabled) {
					node.setAttribute('stroke', 'none');
				}
				
				if (s.transform != null && s.transform.length > 0) {
					node.setAttribute('transform', s.transform);
				}
				
				if (s.shadow) {
					this.root.appendChild(this.createShadow(node));
				}
			
				if (this.strokeTolerance > 0 && !filled) {
					this.root.appendChild(this.createTolerance(node));
				}
		
				if (this.pointerEvents) {
					node.setAttribute('pointer-events', this.pointerEventsValue);
				} else if (!this.pointerEvents && this.originalRoot == null) {
					node.setAttribute('pointer-events', 'none');
				}
				
				if ((node.nodeName != 'rect' && node.nodeName != 'path' && node.nodeName != 'ellipse') ||
					(node.getAttribute('fill') != 'none' && node.getAttribute('fill') != 'transparent') ||
					node.getAttribute('stroke') != 'none' || node.getAttribute('pointer-events') != 'none') {
					this.root.appendChild(node);
				}
				if(this.cellState && this.cellState.x > 3 && this.cellState.y > 2 && this.cellState.cell.cellName){
					var title = document.createElementNS('http://www.w3.org/2000/svg', 'title');
					title.innerHTML = this.cellState.cell.cellName;
					this.root.appendChild(title);
				} else if (this.cellState && this.cellState.x > 3 && this.cellState.y > 2) {
					var title = document.createElementNS('http://www.w3.org/2000/svg', 'title');
					title.innerHTML = "el_" + this.cellState.cell.id;
					this.root.appendChild(title);
				}
				this.node = null;
			}
		};
		
		_scada.mxSvgCanvas2D.prototype.image = function(x, y, w, h, src, aspect, flipH, flipV) {
			src = this.converter.convert(src);
			
			aspect = (aspect != null) ? aspect : true;
			flipH = (flipH != null) ? flipH : false;
			flipV = (flipV != null) ? flipV : false;
			var s = this.state;
			x += s.dx;
			y += s.dy;
			
			var node = this.createElement('image');
			node.setAttribute('x', this.format(x * s.scale) + this.imageOffset);
			node.setAttribute('y', this.format(y * s.scale) + this.imageOffset);
			node.setAttribute('width', this.format(w * s.scale));
			node.setAttribute('height', this.format(h * s.scale));
			
			if (node.setAttributeNS == null) {
				node.setAttribute('xlink:href', src);
			} else {
				node.setAttributeNS(_scada.mxConstants.NS_XLINK, 'xlink:href', src);
			}
			
			if (!aspect) {
				node.setAttribute('preserveAspectRatio', 'none');
			}
		
			if (s.alpha < 1 || s.fillAlpha < 1) {
				node.setAttribute('opacity', s.alpha * s.fillAlpha);
			}
			
			var tr = this.state.transform || '';
			
			if (flipH || flipV) {
				var sx = 1;
				var sy = 1;
				var dx = 0;
				var dy = 0;
				if (flipH) {
					sx = -1;
					dx = -w - 2 * x;
				}
				
				if (flipV) {
					sy = -1;
					dy = -h - 2 * y;
				}
				tr += 'scale(' + sx + ',' + sy + ')translate(' + (dx * s.scale) + ',' + (dy * s.scale) + ')';
			}
		
			if (tr.length > 0) {
				node.setAttribute('transform', tr);
			}
			
			if (!this.pointerEvents) {
				node.setAttribute('pointer-events', 'none');
			}
		
			if(this.cellState && this.cellState.x > 3 && this.cellState.y > 2 && this.cellState.cell.cellName){
				var title = document.createElementNS('http://www.w3.org/2000/svg', 'title');
				title.innerHTML = this.cellState.cell.cellName;
				this.root.appendChild(title);
			} else if (this.cellState && this.cellState.x > 3 && this.cellState.y > 2) {
				var title = document.createElementNS('http://www.w3.org/2000/svg', 'title');
				title.innerHTML = "el_" + this.cellState.cell.id;
				this.root.appendChild(title);
			}
		
			this.root.appendChild(node);
		};
		
		_scada.mxSvgCanvas2D.prototype.createDiv = function(str) {
			var val = str;
			if (!_scada.mxUtils.isNode(val)) {
				val = '<div><div>' + this.convertHtml(val) + '</div></div>';
			}
		
			// IE uses this code for export as it cannot render foreignObjects
			if (!_scada.mxClient.IS_IE && !_scada.mxClient.IS_IE11 && document.createElementNS) {
				var div = document.createElementNS('http://www.w3.org/1999/xhtml', 'div');
				
				if (_scada.mxUtils.isNode(val)) {
					var div2 = document.createElement('div');
					var div3 = div2.cloneNode(false);
					
					if (this.root.ownerDocument != document) {
						div2.appendChild(val.cloneNode(true));
					} else {
						div2.appendChild(val);
					}
					
					div3.appendChild(div2);
					div.appendChild(div3);
				} else {
					div.innerHTML = val;
				}
				if(this.cellState && this.cellState.x > 3 && this.cellState.y > 2 && this.cellState.cell.cellName){
				div.title = this.cellState.cell.cellName;
				} else if (this.cellState && this.cellState.x > 3 && this.cellState.y > 2) {
					div.title = "el_" + this.cellState.cell.id;
				}
				return div;
			} else {
				if (_scada.mxUtils.isNode(val)) {
					val = '<div><div>' + _scada.mxUtils.getXml(val) + '</div></div>';
				}
				val = '<div xmlns="http://www.w3.org/1999/xhtml">' + val + '</div>';
				return  _scada.mxUtils.parseXml(val).documentElement;
			}
		};
	}

  overridesForPreviewConditions(_scada, _settings){

		_scada.mxShape.prototype.createSvgCanvas = function() {
			_scada.mxSvgCanvas2D.prototype.cellState = this.state;

			var canvas = new _scada.mxSvgCanvas2D(this.node, false, this.state);
			canvas.strokeTolerance = (this.pointerEvents) ? this.svgStrokeTolerance : 0;
			canvas.pointerEventsValue = this.svgPointerEvents;
			var off = this.getSvgScreenOffset();

			if (off != 0) {
				this.node.setAttribute('transform', 'translate(' + off + ',' + off + ')');
			} else {
				this.node.removeAttribute('transform');
			}

			canvas.minStrokeWidth = this.minSvgStrokeWidth;
			
			if (!this.antiAlias) {
				canvas.format = function(value) {
					return Math.round(parseFloat(value));
				};
			}
			return canvas;
		};

		_scada.mxSvgCanvas2D.prototype.addNode = function(filled, stroked){
			var node = this.node;
			var s = this.state;
			this.node.style.transition = '0.5s ease-out';

			if (node != null) {
					if (node.nodeName == 'path'){
						if (this.path != null && this.path.length > 0){
							node.setAttribute('d', this.path.join(' '));
						} else {
							return;
						}
					}
				if (filled && s.fillColor != null){ 
					if(this.cellState.hasOwnProperty('progress') && this.cellState.progress.enabled && this.cellState.progress.percentage){		
						if(this.cellState.cell.hasOwnProperty('isEdges') && !this.cellState.cell.isEdges || this.cellState.cell.defaultStyle.shape == 'flexArrow'){
							this.updatePreviewFill(true, false);
						}
					} else if(filled && s.fillColor !== null){
						this.updateFill();
					}
				} else if (!this.styleEnabled){
					if (node.nodeName == 'ellipse'){
						node.setAttribute('fill', 'transparent');
					}
					else{
						node.setAttribute('fill', 'none');
					}
					// Sets the actual filled state for stroke tolerance
					filled = false;
				}

				if(this.cellState.cell.hasOwnProperty('edgeProgress')){
					var length = this.node.getTotalLength();
					if(this.root.querySelectorAll('title').length == 0){
						this.node.setAttribute('stroke-dasharray', length)
						this.node.setAttribute('stroke-dashoffset', length - (this.cellState.progress.percentage * length) / 100);
					} else {
						this.node.style.display = this.cellState.cell.edgeProgress.display;
					}
				}

				if (stroked && s.strokeColor != null) {
						this.updateStroke();
				} else if (!this.styleEnabled) {
					node.setAttribute('stroke', 'none');
				}
				
				if (s.transform != null && s.transform.length > 0){
					node.setAttribute('transform', s.transform);
				}
				
				if (s.shadow) {
					this.root.appendChild(this.createShadow(node));
				}
				if (this.strokeTolerance > 0 && !filled) {
					this.root.appendChild(this.createTolerance(node));
				}
				if (this.pointerEvents){
					node.setAttribute('pointer-events', this.pointerEventsValue);
				} else if (!this.pointerEvents && this.originalRoot == null){
					node.setAttribute('pointer-events', 'none');
				}
				// Removes invisible nodes from output if they don't handle events
				if ((node.nodeName != 'rect' && node.nodeName != 'path' && node.nodeName != 'ellipse') ||
					(node.getAttribute('fill') != 'none' && node.getAttribute('fill') != 'transparent') ||
					node.getAttribute('stroke') != 'none' || node.getAttribute('pointer-events') != 'none')
				{
					// LATER: Update existing DOM for performance		
					this.root.appendChild(node);
				}
				if (this.cellState && this.cellState.cell.cellName){
					var title = document.createElementNS('http://www.w3.org/2000/svg', 'title');
					title.innerHTML = this.cellState.cell.cellName;
					this.root.appendChild(title);
				} else if (this.cellState) {
					var title = document.createElementNS('http://www.w3.org/2000/svg', 'title');
					title.innerHTML = "el_" + this.cellState.cell.id;
					this.root.appendChild(title);
				}
				if(this.cellState){
					this.root.setAttribute('id', this.cellState.cell.id);
				}
				this.node = null;
			}
		};

		_scada.mxSvgCanvas2D.prototype.image = function(x, y, w, h, src, aspect, flipH, flipV){
			src = this.converter.convert(src);
			aspect = (aspect != null) ? aspect : true;
			flipH = (flipH != null) ? flipH : false;
			flipV = (flipV != null) ? flipV : false;
			
			var s = this.state;
			x += s.dx;
			y += s.dy;
		
			var node = this.createElement('image');
			node.setAttribute('x', this.format(x * s.scale) + this.imageOffset);
			node.setAttribute('y', this.format(y * s.scale) + this.imageOffset);
			node.setAttribute('width', this.format(w * s.scale));
			node.setAttribute('height', this.format(h * s.scale));
		
			if (node.setAttributeNS == null) {
				node.setAttribute('xlink:href', src);
			} else {
				node.setAttributeNS(_scada.mxConstants.NS_XLINK, 'xlink:href', src);
			}
			if (!aspect) {
				node.setAttribute('preserveAspectRatio', 'none');
			}
			if (s.alpha < 1 || s.fillAlpha < 1) {
				node.setAttribute('opacity', s.alpha * s.fillAlpha);
			}
		
			var tr = this.state.transform || '';
		
			if (flipH || flipV){
				var sx = 1;
				var sy = 1;
				var dx = 0;
				var dy = 0;
				
				if (flipH){
					sx = -1;
					dx = -w - 2 * x;
				}
				
				if (flipV){
					sy = -1;
					dy = -h - 2 * y;
				}
				// Adds image tansformation to existing transform
				tr += 'scale(' + sx + ',' + sy + ')translate(' + (dx * s.scale) + ',' + (dy * s.scale) + ')';
			}
			if (tr.length > 0){
				node.setAttribute('transform', tr);
			}
			
			if (!this.pointerEvents){
				node.setAttribute('pointer-events', 'none');
			}

			if(this.cellState){
				if (this.cellState.cell.cellName){
					var title = document.createElementNS('http://www.w3.org/2000/svg', 'title');
					title.innerHTML = this.cellState.cell.cellName;
					this.root.appendChild(title);
				} else {
					var title = document.createElementNS('http://www.w3.org/2000/svg', 'title');
					title.innerHTML = "el_" + this.cellState.cell.id;
					this.root.appendChild(title);
				}
				this.root.setAttribute('id', this.cellState.cell.id)
			}
			this.root.appendChild(node);
		};

		_scada.mxSvgCanvas2D.prototype.createDiv = function(str) {
			var val = str;
		
			if (!_scada.mxUtils.isNode(val)){
				val = '<div><div>' + this.convertHtml(val) + '</div></div>';
			}

			// IE uses this code for export as it cannot render foreignObjects
			if (!_scada.mxClient.IS_IE && !_scada.mxClient.IS_IE11 && document.createElementNS) {
				var div = document.createElementNS('http://www.w3.org/1999/xhtml', 'div');
			
				if (_scada.mxUtils.isNode(val)) {
				var div2 = document.createElement('div');
				var div3 = div2.cloneNode(false);

				if (this.root.ownerDocument != document) {
					div2.appendChild(val.cloneNode(true));
				} else {
					div2.appendChild(val);
				}
				
				div3.appendChild(div2);
				div.appendChild(div3);
				} else {
					div.innerHTML = val;
				}
				if(this.cellState && this.cellState.cell.cellName){
				div.title = this.cellState.cell.cellName;
				} else if(this.cellState) {
					div.title = "el_" + this.cellState.cell.id;
				}
				return div;
			} else{
				if (_scada.mxUtils.isNode(val)){
					val = '<div><div>' + _scada.mxUtils.getXml(val) + '</div></div>';
				}
				val = '<div xmlns="http://www.w3.org/1999/xhtml">' + val + '</div>';
				return  _scada.mxUtils.parseXml(val).documentElement;
			}
		};

		_scada.mxCellRenderer.prototype.doRedrawShape = function(state){
			state.shape.redraw(state, true, false);
		};

		_scada.mxSvgCanvas2D.prototype.updatePreviewFill = function(fill,stroke) {
		
			this.cellState.cell.defaultStyle.fillColor = 
				(this.cellState.cell.defaultStyle.fillColor) ?
				this.cellState.cell.defaultStyle.fillColor :
				'white';

			if (this.cellState.cell.defaultStyle.fillColor == 'none'){
				fill = 'transparent';
			} else if (this.cellState.cell.defaultStyle.fillColor){
				fill = this.cellState.cell.defaultStyle.fillColor;
			} else {
				fill = 'white';
			}
			var progress;
			if(this.cellState){
				progress = (this.cellState.shape.fill == this.cellState.cell.defaultStyle.fillColor) ?
							'#36A6DE' : 
							this.cellState.shape.fill;
				if (!progress){
					progress = (this.cellState.shape.fill) ? this.cellState.shape.fill : '#36A6DE';
				}
			}

			var id = this.getPreviewGradient(String(fill), 
												String(progress), 
												this.cellState.progress.settings.direction, 
												this.cellState.progress.percentage);

			if (!_scada.mxClient.IS_CHROMEAPP && !_scada.mxClient.IS_IE && !_scada.mxClient.IS_IE11 &&
				!_scada.mxClient.IS_EDGE && this.root.ownerDocument == document){
				var base = this.getBaseUrl().replace(/([\(\)])/g, '\\$1');
				this.node.setAttribute('fill', 'url(' + base + '#' + id + ')');
			} else {
				this.node.setAttribute('fill', 'url(#' + id + ')');
			}
		
		};

		_scada.mxSvgCanvas2D.prototype.getPreviewGradient = function(start, end, direction, percentage) {

			var id = this.createPreviewGradientId();
			var gradient = this.gradients[id];
			if (gradient == null){
				var svg = this.root.ownerSVGElement;
				var tmpId = id;
				if (svg != null) {
					while (gradient != null && gradient.ownerSVGElement != svg) {
						gradient = this.createPreviewGradient(start, end, direction, percentage, tmpId);
					}
				} else {
					tmpId = 'id' + (++this.refCount);
				}
				if (gradient == null) {
					gradient = this.createPreviewGradient(start, end, direction, percentage, tmpId);
					gradient.setAttribute('id', tmpId);
					if (this.defs != null){
						this.defs.appendChild(gradient);
					} else {
						svg.appendChild(gradient);
					}
				}
				this.gradients[id] = gradient;
			}
			return gradient.getAttribute('id');
		};

		_scada.mxSvgCanvas2D.prototype.createPreviewGradientId = function(){
			return 'elm-gradient-' + this.cellState.cell.id;
		};

		_scada.mxSvgCanvas2D.prototype.createPreviewGradient = function(start, end, direction, percentage,tmpId){
			if (end == '#ffffff') {
				end = '#36A6DE';
			}
			var svg = this.root.ownerSVGElement;
			var SVGavailable = svg.ownerDocument.getElementById(tmpId);
			if (SVGavailable) {
				var stops = SVGavailable.querySelectorAll('stop');
				stops[0].setAttribute('offset', (percentage) + "%")
				stops[0].setAttribute('style', 'stop-color:' + end  + ';stop-opacity:1;');
				stops[1].setAttribute('offset', (percentage) + "%")
				stops[1].setAttribute('style', 'stop-color:' + start + ';stop-opacity:1;');
				return SVGavailable;
			} else {
				var gradient = this.createElement('linearGradient');
				gradient.setAttribute('spreadMethod','pad')
				gradient.setAttribute('x1', '0%');
				gradient.setAttribute('y1', '0%');
				gradient.setAttribute('x2', '0%');
				gradient.setAttribute('y2', '0%');
				
				if (direction == null || direction == _scada.mxConstants.DIRECTION_SOUTH){
					gradient.setAttribute('y2', '100%');
				}
				else if (direction == _scada.mxConstants.DIRECTION_EAST){
					gradient.setAttribute('x2', '100%');
				}
				else if (direction == _scada.mxConstants.DIRECTION_NORTH){
					gradient.setAttribute('y1', '100%');
				}
				else if (direction == _scada.mxConstants.DIRECTION_WEST){
					gradient.setAttribute('x1', '100%');
				}
				var stop = this.createElement('stop');
				stop.setAttribute('offset', (percentage) + '%');
				stop.setAttribute('style', 'stop-color:' + end  + ';stop-opacity:1;');
				gradient.appendChild(stop);
			
				var stop = this.createElement('stop');
				stop.setAttribute('offset', percentage + '%');
				stop.setAttribute('style', 'stop-color:' + start + ';stop-opacity:1;');
				gradient.appendChild(stop);

				stop = this.createElement('stop');
				stop.setAttribute('offset', '100%');
				stop.setAttribute('style', 'stop-color:' + start  + ';stop-opacity:1;');
				gradient.appendChild(stop);
				return gradient;
			} 
		}
	}

}
