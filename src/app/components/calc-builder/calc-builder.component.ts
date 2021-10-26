import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { Observable } from 'rxjs';

@Component({
  selector: 'kl-calc-builder',
  templateUrl: './calc-builder.component.html',
  styleUrls: ['./calc-builder.component.scss']
})
export class CalcBuilderComponent implements OnInit {
  @Input('suggestions') suggestions = [];
  @Input() calcResults: any;
  @Input('colorSettings') colorSettings = {
    tokenizer: []
  };
  @Input() setEditorPropertyFlag = false;
  @Input('formulaInfo') formulaInfo: any = {
    code: ''
  };
  @Output('formulaData') formulaData = new EventEmitter();

  public editorSuggestInstance = undefined;
  public suggestionList = [];
  public code: String = '';
  public editorOptions = undefined;
  public editorMonarchTokensProvider = undefined;

  constructor() {}

  ngOnInit() {
    try {
      this.editorOptions = {
        ariaLabel: "jobin's edior",
        selectOnLineNumbers: false,
        lineNumbers: 'on',
        lineNumbersMinChars: 3,
        accessibilitySupport: 'off',
        cursorBlinking: 'smooth',
        // automaticLayout: true,
        smoothScrolling: true,
        suggestSelection: 'first',
        // revealHorizontalRightPadding: 20,
        // overviewRulerBorder: false,
        theme: 'myCoolTheme',
        language: 'newlang', // 'javascript',
        autoIndent: false,
        folding: false,
        iconsInSuggestions: false,
        wordWrap: 'on', // 'wordWrapColumn',
        // wrappingIndent: 'same',
        minimap: {
          enabled: false
        },
        wordBasedSuggestions: false,
        suggestFontSize: 10,
        autoClosingQuotes: 'always',
        acceptSuggestionOnCommitCharacter: false,
        scrollbar: {
          verticalScrollbarSize: 6
        },
        contextmenu: false,
        // formatOnType: true,
        dragAndDrop: false,
        // roundedSelection: false,
        scrollBeyondLastLine: false
        // readOnly: false,
      };
    } catch (error) {
      console.log(error);
    }
  }
  ngOnChanges() {}

  /**
   * Method for setup all the configurations or plugin into the editor once the editor is initialised
   * @param editor
   */
  onInitMonaco(editor) {
    const line = editor.getPosition();
    const monaco = window['monaco'];
    try {
      if (this.setEditorPropertyFlag) {
        this.editorMonarchTokensProvider = monaco.languages.setMonarchTokensProvider(
          'newlang',
          {
            // setup the coloring configurations of attributes in the editor
            tokenizer: {
              root: this.colorSettings.tokenizer
            },
            ignoreCase: false,
            tokenPostfix: '.newlang'
          }
        );
      }
    } catch (error) {}

    try {
      if (this.setEditorPropertyFlag) {
        this.editorSuggestInstance = monaco.languages.registerCompletionItemProvider(
          'newlang',
          this.getSuggestions()
        );
      }
    } catch (error) {
      console.log('editorSuggestInstance', error);
    }
  }

  /**
   * Method for returning custom suggestions
   */
  getSuggestions() {
    const _refObj = this;
    return {
      provideCompletionItems: function (model, position) {
        return _refObj.suggestions;
      }
    };
  }

  /**
   * Event for getting the script form editor whenever there is a change.
   */
  codeChangeAction() {
    try {
      this.formulaData.emit(this.getCopy(this.formulaInfo));
    } catch (error) {
      console.log(error);
    }
  }

  /**
   * Method for returning a deep copy of json passed
   * @param obj json object to take a deep copy
   */
  getCopy(obj) {
    return obj ? JSON.parse(JSON.stringify(obj)) : undefined;
  }

  ngOnDestroy() {
    if (this.editorSuggestInstance) {
      this.editorSuggestInstance.dispose();
    }

    if (this.editorMonarchTokensProvider) {
      this.editorMonarchTokensProvider.dispose();
    }
  }
}
