import { Component, OnInit, Input, Output, EventEmitter, ViewChild } from '@angular/core';
import { ITreeOptions, TreeNode, TreeModel, TreeComponent } from 'angular-tree-component';
import { checkNoChangesView } from '@angular/core/src/view/view';

@Component({
  selector: 'kl-custom-hierarchy',
  templateUrl: './custom-hierarchy.component.html',
  styleUrls: ['./custom-hierarchy.component.scss']
})
export class CustomHierarchyComponent implements OnInit {
  constructor() { }
  @Input() inputData;
  @Input() selectedData;
  // If isSingleMode is true different modes for tree is disabled
  @Input() isSingleMode: boolean = false;
  // singleTreeMode should have required tree mode as value
  @Input() singleTreeMode = 'leafMode';
  @ViewChild('tree') tree;
  public stateData;
  show: Boolean = false;
  // temp: String = 'leafMode';
  @Output() emitData: EventEmitter<any> = new EventEmitter<any>();
  @Output() emitTreeMode: EventEmitter<any> = new EventEmitter<any>();

  public treeOptions: ITreeOptions = {
    useCheckbox: true,
    useTriState: true,
    useVirtualScroll: false,
    nodeHeight: 22
  };

  public treeOptions1: ITreeOptions = {
    useCheckbox: true,
    useTriState: false,
    useVirtualScroll: false,
    nodeHeight: 22
  };

  id: any = [];
  copyInputData;
  selectedNodesTree: any = [];

  isTreeMode: boolean = false;

  treeModeNodes: any = [];
  leafModeNodes: any = [];
  leafModeSelectedIds: any = [];
  treeMode: string = 'leafMode'
  currentMode: string = '';

  // to show all the tree modes
  isShowModesOption: boolean = true;

  @ViewChild('tree') treeComponent: TreeComponent;
  ngOnInit() {
    this.show = true;
    // window.localStorage.setItem('treeMode', this.treeMode);
    this.checkSingleOrMultiMode();
    this.stateData = this.inputData && this.inputData.value ? this.getCopy(this.inputData.value.state) : undefined;
    if (this.inputData.value.length === 0) {
      this.getTreeModeLocalStorage();
    } else {
      this.treeMode = this.inputData.treeMode;
      window.localStorage.setItem('treeMode', this.treeMode);
    }
  }

  ngOnChanges() {
    this.stateData = this.inputData && this.inputData.value ? this.getCopy(this.inputData.value.state) : undefined;
    // this.modelChange();
    // this.getTreeModeLocalStorage();
    if (this.inputData.value.length === 0) {
      this.getTreeModeLocalStorage();
    } else {
      this.treeMode = this.inputData.treeMode;
      this.setCurrentMode(this.treeMode);
      window.localStorage.setItem('treeMode', this.treeMode);
    }
  }

  selectAll(node) {
    node.setIsSelected(true);
  }
  unselectAll(node) {
    node.setIsSelected(false);
  }

  checkSingleOrMultiMode() {
    if (this.isSingleMode) {
      this.isShowModesOption = false;
      this.treeMode = this.singleTreeMode;
      window.localStorage.setItem('treeMode', this.singleTreeMode);
    }
  }

  getTreeModeLocalStorage() {
    // By deafult LeafMode
    if (window.localStorage.getItem('treeMode') === undefined) {
      this.treeMode = 'leafMode';
      this.setCurrentMode(this.treeMode);
    } else {
      this.treeMode = window.localStorage.getItem('treeMode');
      this.setCurrentMode(this.treeMode);
      // this.setTriState(this.treeMode);
    }
    if (this.treeMode === null || this.treeMode === undefined) {
      this.treeMode = 'leafMode';
      this.setCurrentMode(this.treeMode);
    }
    // this.changeTreeModeView(this.treeMode);
  }

  setCurrentMode(mode) {
    switch (mode) {
      case 'treeMode':
        this.currentMode = 'Tree Mode';
        break;

      case 'leafMode':
        this.currentMode = 'Leaf Mode';
        break;

      case 'selectMode':
        this.currentMode = 'Select Mode';
        break;

      case 'parentMode':
        this.currentMode = 'Parent Mode';
        break;

      default:
        this.currentMode = 'Leaf Mode';
        break;
    }
  }

  // setTriState(mode) {
  //   if (mode === 'selectMode') {
  //     this.treeOptions['useTriState'] = false;
  //   } else {
  //     this.treeOptions['useTriState'] = true;
  //   }
  // }

  // reset(tree) {
  //   Object.keys(tree.selectedLeafNodeIds).forEach((x) => {
  //     const node: TreeNode = tree.getNodeById(x);
  //     if (node.isSelected) {
  //       node.isSelected = !node.isSelected;
  //     }
  //   });
  // }

  changeTreeModeView(mode, tree) {
    this.treeMode = mode;
    this.setCurrentMode(mode);
    // tree.setFocusedNode(null);
    // tree.expandedNodeIds = {};
    // tree.activeNodeIds = {};
    tree.selectedLeafNodeIds = [];
    // this.reset(tree);
    switch (mode) {
      case 'treeMode':
        this.treeModeFunction(tree);
        break;

      case 'leafMode':
        this.leafModeFunction(tree);
        break;

      case 'selectMode':
        this.selectModeFunction(tree);
        break;

      case 'parentMode':
        this.selectModeFunction(tree);
        break;

      default:
        break;
    }
  }

  switchMode(mode, tree: TreeModel) {
    window.localStorage.setItem('treeMode', mode);
    this.treeMode = mode;
    // this.setTriState(this.treeMode);

    switch (mode) {
      case 'treeMode':
        this.treeModeFunction(tree);
        break;

      case 'leafMode':
        this.leafModeFunction(tree);
        break;

      case 'selectMode':
        this.selectModeFunction(tree);
        break;

      case 'parentMode':

        break;

      default:
        break;
    }
    // if (this.treeMode === 'treeMode') {
    //   this.treeModeFunction(tree);
    // } else if (this.treeMode === 'leafMode') {
    //   this.leafModeFunction(tree);
    // } else if (this.treeMode === 'selectMode') {
    //   this.selectModeFunction(tree);
    // }
  }

  // collects and send 'only leaf node id's'.
  leafModeFunction(tree: TreeModel) {
    Object.keys(tree.selectedLeafNodeIds).forEach(x => {
      const node: TreeNode = tree.getNodeById(x);
      if (node.isSelected) {
        this.leafModeSelectedIds.push(node.data.id);
      }
      let ele;
      ele = {
        metaData: this.getCopy(this.inputData.list),
        selectedIds: [],
        type: this.inputData.type,
        state: this.getCopy(this.stateData),
      };
      ele['selectedIds'] = this.leafModeSelectedIds;
      // console.log(this.inputData);
      // console.log(this.inputData.list);
      // console.log(ele['selectedIds']);
      this.emitTreeMode.emit(this.treeMode);
      this.emitData.emit(ele);
    });
  }

  // collects and send 'immediate parent id' of leaf nodes and the 'leaf node id's'.
  treeModeFunction(tree: TreeModel) {
    let id: any = [];
    Object.keys(tree.selectedLeafNodeIds).forEach((x) => {
      const node: TreeNode = tree.getNodeById(x);
      if (node.isSelected) {
        id.push(node.data.id);

        if (id.includes(node.parent.data.id)) {
          return;
        } else {
          id.push(node.parent.data.id);
        }
      }
    });
    let ele;
    ele = {
      metaData: this.getCopy(this.inputData.list),
      selectedIds: [],
      type: this.inputData.type,
      state: this.getCopy(this.stateData),
    };
    ele['selectedIds'] = id;
    // console.log(ele['selectedIds']);
    this.emitTreeMode.emit(this.treeMode);
    this.emitData.emit(ele);
  }

  // collects and send only the selected id's
  selectModeFunction(tree: TreeModel) {
    // console.log(this.inputData.list);
    let selectedIds: any = [];
    let selectedTreeList;
    Object.keys(tree.selectedLeafNodeIds).forEach((x) => {
      const node: TreeNode = tree.getNodeById(x);
      if (node.isSelected) {
        selectedIds.push(node.data.id);
      }
    });
    // selectedTreeList = Object.entries(tree.selectedLeafNodeIds)
    //   .filter(([key, value]) => {
    //     return (value === true);
    //   });
    // console.log(selectedTreeList);

    let ele;
    ele = {
      metaData: this.getCopy(this.inputData.list),
      selectedIds: [],
      type: this.inputData.type,
      state: this.getCopy(this.stateData),
    };
    ele['selectedIds'] = selectedIds;
    // console.log(ele['selectedIds']);
    this.emitTreeMode.emit(this.treeMode);
    this.emitData.emit(ele);
  }

  parentMode(tree: TreeModel) {
    let id: any = [];
    Object.keys(tree.selectedLeafNodeIds).forEach((x) => {
      const node: TreeNode = tree.getNodeById(x);
      if (node.isSelected) {
        id.push(node.data.id);

        if (id.includes(node.parent.data.id)) {
          return;
        } else {
          id.push(node.parent.data.id);
        }
      }
    });
    let ele;
    ele = {
      metaData: this.getCopy(this.inputData.list),
      selectedIds: [],
      type: this.inputData.type,
      state: this.getCopy(this.stateData),
    };
    ele['selectedIds'] = id;
    // console.log(ele['selectedIds']);
    this.emitTreeMode.emit(this.treeMode);
    this.emitData.emit(ele);
  }

  // ngAfterViewInit() {
  //   // const treeModel:TreeModel = this.treeComponent.treeModel;
  //   this.treeComponent.treeModel.subscribeToState((state: any) => { // ITreeState does not contain selectedLeafNodeIds

  //     console.log(state);
  //     console.log(this.treeComponent.treeModel.selectedLeafNodeIds);
  //     console.log(this.stateData);
  //     // drop the unwanted prototypes
  //     const selected = Object.assign({}, this.treeComponent.treeModel.selectedLeafNodeIds);
  //     console.log(selected);
  //   });
  // }

  // Leaf Mode - currently not using
  modelChangeLeafMode() {
    if (!this.stateData) {
      return;
    }
    let ele;
    let tempList = this.getCopy(this.stateData);
    if (tempList.selectedLeafNodeIds) {
      const keyList = Object.keys(tempList.selectedLeafNodeIds);
      ele = {
        metaData: this.getCopy(this.inputData.list),
        selectedIds: [],
        type: this.inputData.type,
        state: this.getCopy(this.stateData)
      }
      for (let key of keyList) {
        if (tempList.selectedLeafNodeIds[key]) {
          ele.selectedIds.push(key)
        }
      }
    }
    // console.log(ele.selectedIds);
    this.emitData.emit(ele);
  }

  // Varsha
  // Tree Mode - currently not using
  modelChangeTreeMode(node, checked) {
    this.check(node, checked);
    let allTreeNodes = node.treeModel.nodes[0];
    this.id = [];
    this.extractUserTreeNodes(allTreeNodes);
  }


  // currently not using
  public check(node, checked) {
    // e.stopPropagation();
    // e.preventDefault();
    this.updateChildNodeCheckbox(node, checked);
    this.updateParentNodeCheckbox(node.realParent);
  }

  //  currently not using
  public updateParentNodeCheckbox(node) {
    let parentId;
    if (!node) {
      return;
    }
    if (node.data.node_id != undefined) {
      parentId = node.data.node_id;
    }
    let allChildrenChecked = true;
    let noChildChecked = true;
    for (const child of node.children) {
      if (!child.data.checked || child.data.indeterminate) {
        allChildrenChecked = false;
      }
      if (child.data.checked) {
        noChildChecked = false;
      }
    }
    if (allChildrenChecked) {
      // changed from false to true
      node.data.checked = false;
      node.data.indeterminate = false;
    } else if (noChildChecked) {
      node.data.checked = false;
      node.data.indeterminate = false;
    } else {
      node.data.checked = false;
      node.data.indeterminate = false;
    }
    this.updateParentNodeCheckbox(node.parent);
  }

  public updateChildNodeCheckbox(node, checked) {
    node.data.checked = checked;
    if (node.children) {
      node.children.forEach((child) => {
        return this.updateChildNodeCheckbox(child, checked);
      });
    }
  }

  //  currently not using
  initExtract() {
    this.extractUserTreeNodes(this.inputData.list[0]);
  }

  //   currently not using
  extractUserTreeNodes(currentNode) {
    // let id: any = [];
    if (currentNode.checked === true) {

      this.id.push(currentNode.id);
      if (currentNode.hasOwnProperty('children')) {
        for (let i = 0; i < currentNode.children.length; i++) {
          const element = currentNode.children[i];
          this.extractUserTreeNodes(element);
        }
      }
    } else if (currentNode.checked === false && currentNode.hasOwnProperty('children')) {
      for (let i = 0; i < currentNode.children.length; i++) {
        const element = currentNode.children[i];
        this.extractUserTreeNodes(element);
      }
    }
    this.emittingData(this.id);
  }

  //  currently not using
  emittingData(id) {
    let ele;
    ele = {
      metaData: this.getCopy(this.inputData.list),
      selectedIds: [],
      type: this.inputData.type,
      state: this.getCopy(this.stateData),
    }
    ele['selectedIds'] = id;
    // console.log(ele['selectedIds']);
    this.emitData.emit(ele);
  }

  getCopy(obj) {
    return obj ? JSON.parse(JSON.stringify(obj)) : undefined;
  }

  deselectAllList(item) {
    if (!item.list)
      return;

    item.list.forEach(ele => {
      ele.checked = false;
    });
    this.modelChangeLeafMode();
  }
  searchFilter(value: string, treeModel: TreeModel) {
    treeModel.filterNodes((node: TreeNode) => this.fuzzysearch(value, node.data.name));
  }
  fuzzysearch(needle: string, haystack: string) {
    const haystackLC = haystack.toLowerCase();
    const needleLC = needle.toLowerCase();
    const hlen = haystack.length;
    const nlen = needleLC.length;

    if (nlen > hlen) {
      return false;
    }
    if (nlen === hlen) {
      return needleLC === haystackLC;
    }
    outer: for (let i = 0, j = 0; i < nlen; i++) {
      const nch = needleLC.charCodeAt(i);

      while (j < hlen) {
        if (haystackLC.charCodeAt(j++) === nch) {
          continue outer;
        }
      }
      return false;
    }
    return true;
  }


}
