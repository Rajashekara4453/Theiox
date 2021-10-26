import {
  Component,
  OnInit,
  Input,
  Output,
  EventEmitter,
  ViewChild,
  SimpleChange,
  AfterViewInit
} from '@angular/core';
import {
  ITreeOptions,
  TreeNode,
  TreeModel,
  TreeComponent
} from 'angular-tree-component';
@Component({
  selector: 'kl-custom-tree',
  templateUrl: './custom-tree.component.html',
  styleUrls: ['./custom-tree.component.scss']
})
export class CustomTreeComponent implements OnInit, AfterViewInit {
  constructor() {}
  @Input() inputData;
  @Input() selectedData;
  // @ViewChild('tree') tree;
  @ViewChild('tree') tree;
  @ViewChild('tree') treeComponent: TreeComponent;
  public stateData;
  show: Boolean = false;
  @Output() emitData: EventEmitter<any> = new EventEmitter<any>();
  @Output() emitTreeMode: EventEmitter<any> = new EventEmitter<any>();
  userInput = '';
  public treeOptions: ITreeOptions = {
    useCheckbox: true,
    useTriState: true,
    useVirtualScroll: false,
    nodeHeight: 22,
    scrollContainer: document.documentElement
  };

  public treeOptions1: ITreeOptions = {
    useCheckbox: true,
    useTriState: false,
    useVirtualScroll: false,
    nodeHeight: 22
  };

  // isSingleMode = true; only one mode is displayed
  @Input() isSingleMode: boolean = false;
  // singleTreeMode = 'Tree Mode' - Only Tree Mode functionality is enabled
  @Input() singleTreeMode = 'treeHierarchy';
  @Input() treeID = 'default';
  @Input() defaultTreeMode: string = 'treeHierarchy';
  @ViewChild(TreeComponent) treeSelect;
  @Input() isIdsToSendObjectFormat: boolean = false;
  @Input() displayModes: any = [];

  // idsToSend  -  array of strings ['id', 'pId','node_id', 'parent_id']
  // give an i/p of any combination required
  @Input() idsToSend: any = [];

  // isShowModesOption = true; Shows all available tree modes
  isShowModesOption: boolean = true;
  id: any = [];
  selectedNodesTree: any = [];
  isTreeMode: boolean = false;
  // treeMode: string = 'leafMode';
  treeMode: string = 'treeHierarchy';
  currentMode: string = '';
  selectedIds: any = [];
  ele: any = {};
  isEnableSelectionOptions: boolean = false;
  treeModesDD: any = ['treeHierarchy', 'singleSelect', 'multiSelect'];
  isShowSliderBtn: boolean = true;
  ngOnInit() {
    this.show = true;
    this.checkSingleOrMultiMode();
    this.checkDisplayModes();
    this.stateData =
      this.inputData && this.inputData.value
        ? this.getCopy(this.inputData.value.state)
        : undefined;
    this.handleMode();
  }

  ngOnChanges(simple: SimpleChange) {
    if (simple['inputData']) {
      this.stateData =
        this.inputData && this.inputData.value
          ? this.getCopy(this.inputData.value.state)
          : undefined;
      this.handleMode();
    }
  }

  ngAfterViewInit() {
    // this.inputData['expandTree'] = true;
    if (this.inputData['expandTree']) {
      this.tree.treeModel.expandAll();
    }
    if (
      this.inputData['value'].hasOwnProperty('selectedIds') &&
      this.inputData.value['selectedIds'].length > 0
    ) {
      this.searchFilter(this.userInput, this.tree.treeModel);
    }
  }

  checkDisplayModes() {
    if (this.displayModes.length === 1 || this.treeModesDD.length === 1) {
      this.isShowSliderBtn = false;
    }

    if (this.displayModes.length > 0) {
      this.treeModesDD = this.displayModes;
    }
  }

  handleMode() {
    if (this.inputData.value.length === 0) {
      // this.treeMode = 'treeHierarchy';
      if (this.displayModes.length === 0) {
        this.treeMode = this.defaultTreeMode;
      } else if (this.displayModes.length > 0) {
        this.treeMode = this.displayModes[0];
      }
      this.setCurrentMode(this.treeMode);
    } else {
      if (
        this.inputData.treeMode === undefined ||
        this.inputData.treeMode === ''
      ) {
        if (this.displayModes.length === 0) {
          this.treeMode = this.defaultTreeMode;
        } else if (this.displayModes.length > 0) {
          this.treeMode = this.displayModes[0];
        }
      } else {
        this.treeMode = this.inputData.treeMode;
      }
      this.setCurrentMode(this.treeMode);
    }
  }

  // saveTreeModeLocalStorage() {
  //   window.localStorage.setItem('treeMode', this.treeMode);
  //   this.inputData['treeMode'] = this.treeMode;
  // }

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
      // this.saveTreeModeLocalStorage();
    }
  }

  setCurrentMode(mode) {
    this.selectedIds = [];
    this.ele['selectedIds'] = this.selectedIds;
    this.isEnableSelectionOptions = false;
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

      case 'treeHierarchy':
        this.currentMode = 'Hierarchy';
        // this.isEnableSelectionOptions = true;
        break;

      case 'singleSelect':
        this.currentMode = 'Single Select';
        break;

      case 'multiSelect':
        this.currentMode = 'Multi Select';
        break;

      default:
        this.currentMode = 'Hierarchy';
        break;
    }
  }

  switchMode(tree, currentMode, action) {
    let i = this.treeModesDD.indexOf(currentMode);
    switch (action) {
      case 'next':
        if (i === this.treeModesDD.length - 1) {
          i = -1;
          this.treeMode = this.treeModesDD[i + 1];
        } else {
          this.treeMode = this.treeModesDD[i + 1];
        }
        break;

      case 'prev':
        if (i === 0) {
          this.treeMode = this.treeModesDD[this.treeModesDD.length - 1];
        } else {
          this.treeMode = this.treeModesDD[i - 1];
        }
        break;

      default:
        break;
    }
    this.currentMode = this.treeMode;
    this.setCurrentMode(this.treeMode);
    tree.treeModel.selectedLeafNodeIds = [];
    this.selectedIds = [];
    this.emitTreeData();
    switch (this.treeMode) {
      case 'treeHierarchy':
        break;

      case 'leafMode':
      case 'selectMode':
      case 'treeMode':
      case 'multiSelect':
      case 'singleSelect':
        this.selectMode_state(this.treeMode, tree.treeModel);
        break;
    }
  }

  // leaf mode, tree mode, select mode, multi-select mode
  selectMode_state(mode, tree) {
    this.treeMode = mode;
    this.setCurrentMode(mode);
    tree.selectedLeafNodeIds = {};
    // this.selectedIds = [];
    this.callTreeFn_state(mode, tree);
  }

  // tree-heirarchy mode
  selectMode_node(mode, tree) {
    this.treeMode = mode;
    this.setCurrentMode(mode);
    tree.selectedLeafNodeIds = [];
    this.selectedIds = [];
  }

  // leaf mode, tree mode, select mode, multi-select mode, single-select mode
  callTreeFn_state(mode, tree) {
    this.treeMode = mode;
    this.selectedIds = [];
    if (this.idsToSend.length === 0 || this.idsToSend === undefined) {
      this.setDefaultIDsToSend(mode);
    }
    switch (mode) {
      case 'singleSelect':
        this.singleSelectMode(tree);
        break;

      case 'multiSelect':
        this.multiSelectMode(tree);
        break;
    }
  }

  // single-select mode, tree-heirarchy mode
  callTreeFn_node(mode, node, event) {
    this.treeMode = mode;
    if (this.idsToSend.length === 0 || this.idsToSend === undefined) {
      this.setDefaultIDsToSend(mode);
    }
    this.selectedIds = [];
    this.treeHierarchyMode(node, event);
  }

  // If no inputs are passed for idsToSend and isIdsToSendObjectFormat
  // Picks pre-defined settings
  setDefaultIDsToSend(mode) {
    switch (mode) {
      case 'treeMode':
        this.idsToSend = ['id', 'pId'];
        this.isIdsToSendObjectFormat = false;
        break;

      case 'leafMode':
        this.idsToSend = ['id'];
        this.isIdsToSendObjectFormat = false;
        break;

      case 'selectMode':
        this.idsToSend = ['id'];
        this.isIdsToSendObjectFormat = false;
        break;

      case 'multiSelect':
        this.idsToSend = ['id'];
        this.isIdsToSendObjectFormat = false;
        break;

      case 'singleSelect':
        this.idsToSend = ['id'];
        this.isIdsToSendObjectFormat = false;
        break;

      case 'treeHierarchy':
        // this.idsToSend = ['node_id', 'parent_id'];
        this.idsToSend = ['id'];
        this.isIdsToSendObjectFormat = false;
        break;

      default:
        this.idsToSend = ['id'];
        this.isIdsToSendObjectFormat = false;
        break;
    }
    // this.idsToSend = ['id', 'pId', 'node_id', 'parent_id'];
    // this.isIdsToSendObjectFormat = true;
  }

  // Emits ids based on inputs idsToSend array, isIdsToSendObjectFormat
  getSelectedNodes(node_id, parent_id, id, pId) {
    const nodeObj: any = {};

    this.idsToSend.forEach((idToSend) => {
      switch (idToSend) {
        case 'id':
          if (this.isIdsToSendObjectFormat) {
            nodeObj[idToSend] = id;
          } else if (!this.selectedIds.includes(id)) {
            this.selectedIds.push(id);
          }
          break;

        case 'pId':
          if (this.isIdsToSendObjectFormat) {
            nodeObj[idToSend] = pId;
          } else {
            if (!this.selectedIds.includes(pId)) {
              this.selectedIds.push(pId);
            }
          }
          break;

        case 'node_id':
          if (this.isIdsToSendObjectFormat) {
            nodeObj[idToSend] = node_id;
          } else {
            if (!this.selectedIds.includes(node_id)) {
              this.selectedIds.push(node_id);
            }
          }
          break;

        case 'parent_id':
          if (this.isIdsToSendObjectFormat) {
            nodeObj[idToSend] = parent_id;
          } else {
            if (!this.selectedIds.includes(parent_id)) {
              this.selectedIds.push(parent_id);
            }
          }
          break;

        default:
          break;
      }
    });
    if (this.isIdsToSendObjectFormat) {
      this.selectedIds.push(nodeObj);
    }

    // let ele;
    // ele = {
    //   treeID: this.treeID,
    //   treeData: {
    //     metaData: this.getCopy(this.inputData.list),
    //     selectedIds: [],
    //     type: this.inputData.type,
    //     state: this.getCopy(this.stateData),
    //   },
    // };
    // ele['treeData']['selectedIds'] = this.selectedIds;
    // this.emitTreeMode.emit(this.treeMode);
    // console.log("ele['treeData']['selectedIds']", ele['treeData']['selectedIds']);
    // this.emitData.emit(ele);
    return true;
  }

  emitTreeData() {
    let ele = {};
    ele = {
      treeID: this.treeID,
      treeData: {
        metaData: this.getCopy(this.inputData.list),
        selectedIds: [],
        type: this.inputData.type,
        state: this.getCopy(this.stateData)
      }
    };
    ele['treeData']['selectedIds'] = this.selectedIds;
    this.emitTreeMode.emit(this.treeMode);
    // console.log("ele['treeData']['selectedIds']", ele['treeData']['selectedIds']);
    this.emitData.emit(ele);
  }

  getCopy(obj) {
    return obj ? JSON.parse(JSON.stringify(obj)) : undefined;
  }

  // ************ Different Tree Modes Functions STARTS ************* //

  // single-select mode
  singleSelectModeOld(node, checked) {
    const id = node.data.id;
    const pId = node.parent.data.id;
    const node_id = node.data.node_id;
    const parent_id = node.parent.data.node_id;

    this.unCheckAllNodes(node.treeModel.nodes, id);
    node.data['isChecked'] = checked;
    if (checked) {
      // node.data['isChecked'] = true;
      const isSelected = this.getSelectedNodes(node_id, parent_id, id, pId);
      if (isSelected) {
        this.emitTreeData();
      }
    } else if (!checked) {
      // this.unCheckAllNodes(node.treeModel.nodes);
      this.selectedIds = [];
    }
    this.treeSelect.treeModel.update();
    this.emitTreeData();
    // const isNodeReady$: Observable<any> =
    // if (checked) {
    //   this.getSelectedNodes(node_id, parent_id, id, pId);
    // } else if (!checked) {
    //   this.selectedIds = [];
    //   this.emitTreeData();
    // }
  }

  singleSelectMode(tree: TreeModel) {
    let id;
    let pId;
    let node_id;
    let parent_id;
    Object.keys(tree.selectedLeafNodeIds).forEach((x) => {
      const lastSelectedId = Object.keys(tree.selectedLeafNodeIds)[
        Object.keys(tree.selectedLeafNodeIds).length - 1
      ];
      if (x !== lastSelectedId || !tree.selectedLeafNodeIds[x]) {
        delete tree.selectedLeafNodeIds[x];
      }
      const node: TreeNode = tree.getNodeById(x);
      id = node.data.id;
      pId = node.parent.data.id;
      node_id = node.data.node_id;
      parent_id = node.parent.data.node_id;
      const idsArr: any = [];
      idsArr.push(id, pId, node_id, parent_id);
      if (node.isSelected) {
        const isSelected = this.getSelectedNodes(node_id, parent_id, id, pId);
      }
    });
    this.treeSelect.treeModel.update();
    this.emitTreeData();
  }

  // single-select mode
  unCheckAllNodes(node, id?) {
    for (let ind = 0; ind < node.length; ind++) {
      if (node[ind].isChecked || (node[ind].checked && node.id !== id)) {
        node[ind].isChecked = false;
        node[ind].checked = false;
      }
      if (node[ind].children) {
        this.unCheckAllNodes(node[ind].children, id);
      }
    }
    // this.emitTreeData();
  }

  // leaf mode, tree mode, select mode, multi-select mode
  multiSelectMode(tree: TreeModel) {
    let id;
    let pId;
    let node_id;
    let parent_id;
    Object.keys(tree.selectedLeafNodeIds).forEach((x) => {
      const node: TreeNode = tree.getNodeById(x);
      id = node.data.id;
      pId = node.parent.data.id;
      node_id = node.data.node_id;
      parent_id = node.parent.data.node_id;
      const idsArr: any = [];
      idsArr.push(id, pId, node_id, parent_id);
      if (node.isSelected) {
        this.getSelectedNodes(node_id, parent_id, id, pId);
      }
    });
    this.treeSelect.treeModel.update();
    this.emitTreeData();
  }

  removeDeselectedNodes(idsArr, isIdsToSendObjectFormat) {
    switch (isIdsToSendObjectFormat) {
      case true:
        this.selectedIds.forEach((object) => {
          for (const key in object) {
            if (object.hasOwnProperty(key)) {
              idsArr.forEach((element) => {
                if (element === object[key]) {
                  delete object[key];
                }
              });
            }
          }
        });
        // this.emitTreeData();
        // this.selectedIds = this.selectedIds.filter(value => Object.keys(value).length !== 0);
        break;

      case false:
        idsArr.forEach((element) => {
          if (this.selectedIds.includes(element)) {
            const index = this.selectedIds.indexOf(element);
            if (index > -1) {
              this.selectedIds.splice(index, 1);
              // this.emitTreeData();
            }
          }
        });
        // this.emitTreeData();
        break;

      default:
        break;
    }
  }

  // tree-heirarchy mode
  public treeHierarchyMode(node, e) {
    e.stopPropagation();
    // e.preventDefault();
    this.updateChildNodeCheckbox(node, e.target.checked);
    this.updateParentNodeCheckbox(node.realParent);
    const selectedNodesTree = node.treeModel.nodes;
    const nodesExtracted = this.extractTreeNodes(selectedNodesTree);
    this.treeSelect.treeModel.update();
    if (nodesExtracted) {
      this.emitTreeData();
    }
  }

  updateParentNodeCheckbox(node) {
    let parent;
    if (node != null) {
      if (
        node.hasOwnProperty('data') &&
        node['data'].hasOwnProperty('children')
      ) {
        parent = node.data.children;
      } else if (node.hasOwnProperty('children')) {
        parent = node.children;
      }
    }
    let partialChildrenChecked = false;
    let allChildrenChecked = false;
    let noChildrenChecked = false;
    let numberOfChildrenChecked: number = 0;

    if (parent !== undefined) {
      parent.forEach((child) => {
        if (child.checked) {
          partialChildrenChecked = true;
          numberOfChildrenChecked = numberOfChildrenChecked + 1;
        }
      });
      if (numberOfChildrenChecked === parent.length) {
        allChildrenChecked = true;
        node.data.checked = true;
      } else if (numberOfChildrenChecked === 0) {
        noChildrenChecked = true;
        node.data.checked = false;
      }
    }
    if (node != null && node.realParent != null) {
      this.updateParentNodeCheckbox(node.realParent);
    }
  }

  // tree-heirarchy mode
  public updateChildNodeCheckbox(node, checked) {
    node.data.checked = checked;
    if (node.children) {
      node.children.forEach((child) => {
        return this.updateChildNodeCheckbox(child, checked);
      });
    }
  }

  // tree-heirarchy mode
  extractTreeNodes(allTreeNodes) {
    let parent_id: string;
    allTreeNodes.forEach((eachTreeNode) => {
      parent_id = eachTreeNode.node_id;
      const pId = eachTreeNode.id;
      this.loopNodesRecursively(eachTreeNode, 'checked', parent_id, pId);
    });
    return true;
  }

  // tree-heirarchy mode
  loopNodesRecursively(
    currentNode,
    InkeyToFind: any,
    parent_id: string,
    pId: number
  ) {
    if (currentNode[InkeyToFind] === true) {
      const node_id = currentNode.node_id;
      const id = currentNode.id;
      this.getSelectedNodes(node_id, parent_id, id, pId);
      // tslint:disable-next-line: forin
      for (const index in currentNode.children) {
        pId = currentNode.id;
        const node = currentNode.children[index];
        this.loopNodesRecursively(node, InkeyToFind, parent_id, pId);
      }
    } else {
      // tslint:disable-next-line: forin
      for (const index in currentNode.children) {
        pId = currentNode.id;
        const node = currentNode.children[index];
        this.loopNodesRecursively(node, InkeyToFind, parent_id, pId);
      }
    }
    // if (currentNode[InkeyToFind] === false) {
    //   this.emitTreeData();
    // }
    // return this.emitTreeData();
  }
  // ************ Different Tree Modes Functions ENDS ************* //

  searchFilter(value: string, treeModel: TreeModel) {
    // treeModel.filterNodes((node: TreeNode) => this.fuzzysearch(value, node.data.name));
    const foundResults: TreeNode[] = [];
    treeModel.filterNodes((node: TreeNode) => {
      const nodeName = node.data.name.toLowerCase();
      const searchValue = value.toLowerCase();
      const nodeFound = nodeName.includes(searchValue);
      if (nodeFound && node.hasChildren) {
        for (const child of node.children) {
          if (child.hasChildren) {
            foundResults.push(child);
          }
        }
        foundResults.push(node);
      }
      return nodeFound;
    });
    foundResults.forEach((item) => {
      this.showChildren(item);
    });
    // this.tree.treeModel.update();
  }

  latestStateEmit() {
    this.selectedIds = this.inputData['value']['selectedIds'];
    this.emitTreeData();
  }

  private showChildren(node) {
    if (node.children && node.children.length) {
      node.children.forEach((child) => {
        child.show();
        // child.ensureVisible();
        this.showChildren(child);
      });
    }
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
