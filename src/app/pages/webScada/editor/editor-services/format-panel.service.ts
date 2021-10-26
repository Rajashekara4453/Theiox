import { Injectable } from '@angular/core';
import { HandleGraphService } from './handle-graph.service';

@Injectable({
  providedIn: 'root'
})
export class FormatPanelService {

  constructor(private handleGraph:HandleGraphService) { }

  constructFormatPanel(_scada, _settings):void{

    _scada.DiagramFormatPanel.prototype.addView = function (div) {
      var ui = this.editorUi;
      var editor = ui.editor;
      var graph = editor.graph;

      div.appendChild(this.createTitle(_scada.mxResources.get('view')));
      this.addGridOption(div);

      div.appendChild(this.createOption(_scada.mxResources.get('saveToPreview'), function () {
          return graph.saveToPreview;
        }, function (checked) {
          graph.saveToPreview = checked;
          ui.fireEvent(new _scada.mxEventObject('savePreview'));
        },{
          install: function (apply) {
            this.listener = function () {
              apply(graph.saveToPreview)
          };
          ui.addListener('savePreview', this.listener);
          },
          destroy: function () {
            ui.removeListener(this.listener);
          }
        }
      ));


      // IF GRIDLINE IS DISABLED WAIT FOR SHOW GRID TO LOAD AND DISABLE IT
      let waitForDomElement = setInterval(() => {
        var showGrid = document.getElementById('showGridId');
          if (showGrid && !graph.gridEnabled) {
            clearInterval(waitForDomElement);
            showGrid.setAttribute('disabled', 'true')
          }
      }, 200)


      if (graph.isEnabled()) {
        var bg = this.createColorOption(_scada.mxResources.get('background'), function () {
          return graph.background;
        }, function (color) {
          var change = new _scada.ChangePageSetup(ui, color);
          change.ignoreImage = true;

          graph.model.execute(change);
        }, '#ffffff', {
          install: function (apply) {
            this.listener = function () {
              apply(graph.background);
            };

            ui.addListener('backgroundColorChanged', this.listener);
          },
          destroy: function () {
            ui.removeListener(this.listener);
          }
        });
          div.appendChild(bg);
      }


      div.appendChild(this.createOption(_scada.mxResources.get('fitToScreen'), function () {
        return graph.fitToScreen;
      }, function (checked) {
          graph.fitToScreen = checked;
                if(graph.fitHorizontal && checked){
                    graph.fitHorizontal = false;
                    ui.fireEvent(new _scada.mxEventObject('fitHorizontal'));
                }  else if(graph.fitVertical && checked){
                    graph.fitVertical = false;
                    ui.fireEvent(new _scada.mxEventObject('fitVertical'));
                }
        ui.fireEvent(new _scada.mxEventObject('fitToScreen'));
      },{
          install: function (apply) {
            this.listener = function () {
              apply(graph.fitToScreen)
            };
            ui.addListener('fitToScreen', this.listener);
          },
          destroy: function () {
            ui.removeListener(this.listener);
          }
        }
      ));


      div.appendChild(this.createOption(_scada.mxResources.get('fitHorizontal'), function () {
            return graph.fitHorizontal;
          }, function (checked) {
          graph.fitHorizontal = checked;
                if(graph.fitToScreen && checked){
                    graph.fitToScreen = false;
                    ui.fireEvent(new _scada.mxEventObject('fitToScreen'));
                } else if(graph.fitVertical && checked){
                    graph.fitVertical = false;
                    ui.fireEvent(new _scada.mxEventObject('fitVertical'));
                }
            ui.fireEvent(new _scada.mxEventObject('fitHorizontal'));
          },{
            install: function (apply) {
              this.listener = function () {
              apply(graph.fitHorizontal)
            };

            ui.addListener('fitHorizontal', this.listener);
          },
          destroy: function () {
            ui.removeListener(this.listener);
          }
        }
      ));


      div.appendChild(this.createOption(_scada.mxResources.get('fitVertical'), function () {
            return graph.fitVertical;
          }, function (checked) {
          graph.fitVertical = checked;
                if(graph.fitToScreen && checked){
                    graph.fitToScreen = false;
                    ui.fireEvent(new _scada.mxEventObject('fitToScreen'));
                } else if(graph.fitHorizontal && checked){
                    graph.fitHorizontal = false;
                    ui.fireEvent(new _scada.mxEventObject('fitHorizontal'));
                }
            ui.fireEvent(new _scada.mxEventObject('fitVertical'));
          },{
          install: function (apply) {
            this.listener = function () {
              apply(graph.fitVertical)
            };

            ui.addListener('fitVertical', this.listener);
          },
          destroy: function () {
            ui.removeListener(this.listener);
          }
        }
      ));



      div.appendChild(this.createOption(_scada.mxResources.get('zoomEnabled'), function () {
        return graph.zoomEnabled;
      }, function (checked) {
          graph.zoomEnabled = checked;
          ui.fireEvent(new _scada.mxEventObject('zoomEnabled'));
      },{
          install: function (apply) {
            this.listener = function () {
              apply(graph.zoomEnabled)
            };
            ui.addListener('zoomEnabled', this.listener);
          },
          destroy: function () {
            ui.removeListener(this.listener);
          }
        }
      ));


      div.appendChild(this.createOption(_scada.mxResources.get('hoverEnabled'), function () {
        return graph.hoverEnabled;
      }, function (checked) {
          graph.hoverEnabled = checked;
          ui.fireEvent(new _scada.mxEventObject('hoverEnabled'));
      },{
          install: function (apply) {
            this.listener = function () {
              apply(graph.hoverEnabled)
            };
            ui.addListener('hoverEnabled', this.listener);
          },
          destroy: function () {
            ui.removeListener(this.listener);
          }
        }
      ));


      return div;
    };

    _scada.BaseFormatPanel.prototype.createOption = function (label, isCheckedFn, setCheckedFn, listener) {
      var div = document.createElement('div');
      div.style.padding = '6px 0px 1px 0px';
      div.style.whiteSpace = 'nowrap';
      div.style.overflow = 'hidden';
      div.style.width = '200px';
      div.style.height = '18px';

      var cb = document.createElement('input');
      cb.setAttribute('type', 'checkbox');
      if ('Show Grid') {
        cb.id = 'showGridId'
      }
      cb.style.margin = '0px 6px 0px 0px';
      div.appendChild(cb);
      var span = document.createElement('span');
      _scada.mxUtils.write(span, label);
      div.appendChild(span);

      var applying = false;
      var value = isCheckedFn();

      var apply = function (newValue) {
        if(!cb.disabled){
          if (!applying) {
            applying = true;
            if (newValue) {
              cb.setAttribute('checked', 'checked');
              cb.defaultChecked = true;
              cb.checked = true;
            } else {
              cb.removeAttribute('checked');
              cb.defaultChecked = false;
              cb.checked = false;
            }
  
            if (value != newValue) {
              value = newValue;
              if (isCheckedFn() != value) {
                setCheckedFn(value);
              }
            }
            applying = false;
          }
        }
      };

      _scada.mxEvent.addListener(div, 'click', function (evt) {
        if(!cb.disabled){
          if (cb.getAttribute('disabled') != 'disabled') {
            var source = _scada.mxEvent.getSource(evt);
            if (source == div || source == span) {
              cb.checked = !cb.checked;
            }
            apply(cb.checked);
          }
        }
      });
      apply(value);
      if (listener != null) {
        listener.install(apply);
        this.listeners.push(listener);
      }
      return div;
    };

    _scada.DiagramFormatPanel.prototype.addStyleOps = function(div) {
    
        var btn = _scada.mxUtils.button(_scada.mxResources.get('clearDefaultStyle'), _scada.mxUtils.bind(this, function(evt) {
          this.editorUi.actions.get('clearDefaultStyle').funct();
        }));
        btn.setAttribute('title', _scada.mxResources.get('clearDefaultStyle') + ' (' + this.editorUi.actions.get('clearDefaultStyle').shortcut + ')');
        btn.setAttribute('class','btn btn-secondary');
        btn.style.width = '80%';
        btn.style.height = '1.5rem';
        div.appendChild(btn);

      return div;
    };

    _scada.DiagramFormatPanel.prototype.addGridOption = function (container) {
      var fPanel = this;
      var ui = this.editorUi;
      var graph = ui.editor.graph;

      var input = document.createElement('input');
      input.style.position = 'absolute';
      input.style.textAlign = 'right';
      input.style.width = '38px';
      input.value = this.inUnit(graph.getGridSize()) + ' ' + this.getUnit();

      var stepper = this.createStepper(input, update, this.getUnitStep(), null, null, null, this.isFloatUnit());
      input.style.display = (graph.isGridEnabled()) ? '' : 'none';
      stepper.style.display = input.style.display;

      _scada.mxEvent.addListener(input, 'keydown', function (e) {
        if (e.keyCode == 13) {
          graph.container.focus();
          _scada.mxEvent.consume(e);
        } else if (e.keyCode == 27) {
          input.value = graph.getGridSize();
          graph.container.focus();
          _scada.mxEvent.consume(e);
        }
      });
      function update(evt) {
        var value = fPanel.isFloatUnit() ? parseFloat(input.value) : parseInt(input.value);
        value = fPanel.fromUnit(Math.max(fPanel.inUnit(1), (isNaN(value)) ? fPanel.inUnit(10) : value));

        if (value != graph.getGridSize()) {
          graph.setGridSize(value)
        }

        input.value = fPanel.inUnit(value) + ' ' + fPanel.getUnit();
        _scada.mxEvent.consume(evt);
      };

      _scada.mxEvent.addListener(input, 'blur', update);
      _scada.mxEvent.addListener(input, 'change', update);

      var unitChangeListener = function (sender, evt) {
        input.value = fPanel.inUnit(graph.getGridSize()) + ' ' + fPanel.getUnit();
        fPanel.format.refresh();
      };

      graph.view.addListener('unitChanged', unitChangeListener);
      this.listeners.push({
        destroy: function () {
          graph.view.removeListener(unitChangeListener);
        }
      });

        input.style.marginTop = '-2px';
        input.style.right = '84px';
        stepper.style.marginTop = '-16px';
        stepper.style.right = '72px';

        var panel = this.createColorOption(_scada.mxResources.get('grid'), function () {
          var color = graph.view.gridColor;

          return (graph.isGridEnabled()) ? color : null;
        }, function (color) {
          var enabled = graph.isGridEnabled();
          
          if (color == 'none') {
            graph.setGridEnabled(false);
          } else {
            graph.setGridEnabled(true);
            ui.setGridColor(color);
          }

          input.style.display = (graph.isGridEnabled()) ? '' : 'none';
          stepper.style.display = input.style.display;

          if (enabled != graph.isGridEnabled()) {
            graph.saveToPreview = false;
            ui.fireEvent(new _scada.mxEventObject('savePreview'));
            ui.fireEvent(new _scada.mxEventObject('gridEnabledChanged'));
          }
          var showGrid = document.getElementById('showGridId')
          if(enabled && showGrid){
            showGrid.setAttribute('disabled','true')
          } else if(showGrid) {
            showGrid.removeAttribute('disabled')
          }
        }, graph.view.gridColor, {
          install: function (apply) {
            this.listener = function () {
              apply((graph.isGridEnabled()) ? graph.view.gridColor : null);
            };
            ui.addListener('gridColorChanged', this.listener);
            ui.addListener('gridEnabledChanged', this.listener);
          },
          destroy: function () {
            ui.removeListener(this.listener);
          }
        });
        panel.appendChild(input);
        panel.appendChild(stepper);
        container.appendChild(panel);
    };

    _scada.DiagramFormatPanel.prototype.addOptions = function (div) {
      var ui = this.editorUi;
      var editor = ui.editor;
      var graph = editor.graph;
    
      div.appendChild(this.createTitle(_scada.mxResources.get('options')));
      if (_scada.DiagramFormatPanel.showPageView) {
         div.appendChild(this.createOption(_scada.mxResources.get('pageView'), function () {
            return graph.pageVisible;
          }, function (checked) {
            ui.actions.get('pageView').funct();
          }, {
            install: function (apply) {
              this.listener = function () {
                apply(graph.pageVisible);
              };
      
              ui.addListener('pageViewChanged', this.listener);
            },
            destroy: function () {
              ui.removeListener(this.listener);
            }
          }));
      }
      
      if (graph.isEnabled()) {
        div.appendChild(this.createOption(_scada.mxResources.get('connectionArrows'), function () {
          return graph.connectionArrowsEnabled;
        }, function (checked) {
          ui.actions.get('connectionArrows').funct();
        }, {
          install: function (apply) {
            this.listener = function () {
              apply(graph.connectionArrowsEnabled);
            };
    
            ui.addListener('connectionArrowsChanged', this.listener);
          },
          destroy: function () {
            ui.removeListener(this.listener);
          }
        }));
    
        // Connection points
        div.appendChild(this.createOption(_scada.mxResources.get('connectionPoints'), function () {
          return graph.connectionHandler.isEnabled();
        }, function (checked) {
          ui.actions.get('connectionPoints').funct();
        }, {
          install: function (apply) {
            this.listener = function () {
              apply(graph.connectionHandler.isEnabled());
            };
    
            ui.addListener('connectionPointsChanged', this.listener);
          },
          destroy: function () {
            ui.removeListener(this.listener);
          }
        }));
    
        div.appendChild(this.createOption(_scada.mxResources.get('guides'), function () {
          return graph.graphHandler.guidesEnabled;
        }, function (checked) {
          ui.actions.get('guides').funct();
        }, {
          install: function (apply) {
            this.listener = function () {
              apply(graph.graphHandler.guidesEnabled);
            };
    
            ui.addListener('guidesEnabledChanged', this.listener);
          },
          destroy: function () {
            ui.removeListener(this.listener);
          }
        }));
      }
      return div;
    };
  }
}
