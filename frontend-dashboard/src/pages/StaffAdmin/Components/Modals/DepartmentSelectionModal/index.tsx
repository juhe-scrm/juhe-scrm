import type {Dispatch, ReactNode, SetStateAction} from 'react';
import React, {useEffect, useState} from 'react';
import {Button, Checkbox, Empty, Modal, Tree} from 'antd';
import styles from './index.less';
import Search from 'antd/es/input/Search';
import {CaretDownFilled, CloseOutlined, FolderFilled, SearchOutlined} from '@ant-design/icons';
import type {CheckboxChangeEvent} from 'antd/es/checkbox';
import _ from 'lodash';
import type {DataNode} from 'rc-tree/lib/interface';
import type {DepartmentInterface} from '@/services/department';

export interface DepartmentOption extends DepartmentInterface {
  key: any;
  label: string;
  value: string;
}

export interface TreeNode {
  title: string;
  key: string;
  parentKey: string;
  children: TreeNode[];
  checkable?: boolean;
  disableCheckbox?: boolean;
  selectable?: boolean;
  order: number;
}

export type DepartmentSelectionProps = {
  visible: boolean;
  setVisible: Dispatch<SetStateAction<boolean>>;
  onFinish?: (selectedDepartments: DepartmentOption[]) => void;
  defaultCheckedDepartments?: DepartmentOption[];
  allDepartments: DepartmentOption[];
};

const buildDepartmentTree = (
  items: DepartmentInterface[],
): { nodes: TreeNode[]; tree: TreeNode[] } => {
  let nodes: TreeNode[] = []; // 一维节点
  let tree: TreeNode[] = []; // 树形节点
  items.forEach((department) => {
    nodes.push({
      title: department.name,
      key: `${department.ext_id}`,
      parentKey: `${department.ext_parent_id}`,
      children: [],
      checkable: true,
      selectable: false,
      order: department.order,
    });
    if (department?.sub_departments) {
      department?.sub_departments.forEach((subDepartment) => {
        nodes.push({
          title: subDepartment.name,
          key: `${subDepartment.ext_id}`,
          parentKey: `${subDepartment.ext_parent_id}`,
          children: [],
          checkable: true,
          selectable: false,
          order: subDepartment.order,
        });
      });
    }
  });

  // 排序原始nodes，group在前，node在后
  nodes = nodes.sort((a, b) => {
    return a?.order - b?.order;
  });

  const nodesByKey = _.keyBy(nodes, 'key'); // 去重

  nodes = _.toArray<TreeNode>(nodesByKey); // 设置一维节点

  const groupedNodes = _.groupBy(nodesByKey, 'parentKey');
  // 组装node
  _.each(_.omit(groupedNodes, `0`), (children, parentKey) => {
    if (nodesByKey[parentKey]) {
      nodesByKey[parentKey].children = children || [];
    }
  });

  tree = _.toArray<TreeNode>(nodesByKey);

  // 清除顶层的冗余node
  tree = tree.filter((item) => {
    return item.parentKey === `0`;
  });

  return {
    nodes,
    tree,
  };
};

const DepartmentSelectionModal: React.FC<DepartmentSelectionProps> = (props) => {
  const {visible, setVisible, defaultCheckedDepartments, onFinish, allDepartments} = props;
  const [departments, setDepartments] = useState<DepartmentOption[]>([]);
  const [departmentNodes, setDepartmentNodes] = useState<TreeNode[]>([]); // 一维的节点
  const [departmentTree, setDepartmentTree] = useState<TreeNode[]>([]); // 多维的树节点
  const [selectedDepartments, setSelectedDepartments] = useState<DepartmentOption[]>(
    _.filter<DepartmentOption>(defaultCheckedDepartments) || [],
  );
  const [keyword, setKeyword] = useState<string>('');
  const [checkAll, setCheckAll] = useState<boolean>(false);
  const [expandAll, setExpandAll] = useState<boolean>(false);
  const [checkedNodeKeys, setCheckedNodeKeys] = useState<string[]>([]);
  const [expandedNodeKeys, setExpandedNodeKeys] = useState<string[]>(['1']);
  const allDepartmentMap = _.keyBy(allDepartments, 'ext_id');

  const onCheckAllChange = (e: CheckboxChangeEvent) => {
    let items: DepartmentOption[];
    if (e.target.checked) {
      items = _.uniqWith<DepartmentOption>(
        [...departments, ...selectedDepartments],
        (a, b) => a.ext_id === b.ext_id,
      );
    } else {
      items = _.differenceWith(selectedDepartments, departments, (a, b) => a.ext_id === b.ext_id);
    }
    setSelectedDepartments(items);
    setCheckAll(e.target.checked);
  };

  const onNodesCheck = (checked: { checked: string[]; halfChecked: string[] }) => {
    const checkedExtDepartmentIDs: number[] = [];
    let selectedExtDepartmentIDs = selectedDepartments.map((item) => item.ext_id);
    let checkedKeys = [...checked.checked];

    // 找出本次uncheck的key，根据这些key的ext_id去删除相关checkedKey
    const uncheckedKeys = _.difference(checkedNodeKeys, checkedKeys);
    _.forEach<string>(uncheckedKeys, (key: string) => {
      // @ts-ignore
      checkedKeys = checkedKeys.filter<string>((checkedKey) => {
        return !checkedKey.includes(key);
      });
    });

    // 记录当前所有checked的key
    checkedKeys.forEach((key) => {
      checkedExtDepartmentIDs.push(Number(key));
      selectedExtDepartmentIDs.push(Number(key));
    });

    // 计算需要删除的extDepartmentID
    // @ts-ignore
    const shouldDeleteExtDepartmentIDs = _.difference(
      _.map(departments, 'ext_id'),
      checkedExtDepartmentIDs,
    );
    selectedExtDepartmentIDs = _.difference(
      _.uniq(selectedExtDepartmentIDs),
      _.uniq(shouldDeleteExtDepartmentIDs),
    );

    const items = selectedExtDepartmentIDs.map((selectedExtDepartmentID) => {
      return allDepartmentMap[selectedExtDepartmentID];
    });

    setCheckAll(departments.length === items.length);
    setSelectedDepartments(items);
  };

  const nodeRender = (node: DataNode): ReactNode => {
    return (
      <>
        <FolderFilled
          style={{
            color: '#47a7ff',
            fontSize: 20,
            marginRight: 6,
            verticalAlign: -6,
          }}
        />
        {node.title}
      </>
    );
  };

  useEffect(() => {
    setSelectedDepartments(_.filter<DepartmentOption>(defaultCheckedDepartments) || []);
    setKeyword('');
  }, [defaultCheckedDepartments, visible]);

  // 监听选中部门变化，计算checked的树节点
  useEffect(() => {
    const allDepartmentNodeKeys = _.map(departmentNodes, 'key');
    // 计算当前选中的部门，命中的key
    const matchedKeys: string[] = [];
    allDepartmentNodeKeys.forEach((key: string) => {
      selectedDepartments.forEach((department) => {
        if (key === `${department.ext_id}`) {
          matchedKeys.push(key);
        }
      });
    });
    setCheckedNodeKeys(matchedKeys);
  }, [selectedDepartments]);

  // 关键词变化的时候
  useEffect(() => {
    let filteredDepartments: DepartmentOption[] = [];

    allDepartments.forEach((item) => {
      if (keyword.trim() === '' || item.label.includes(keyword.trim())) {
        filteredDepartments.push(item);
      }
    })

    // 把搜索结果的父级节点放进结果集，方便构造树
    const pushParentDepartment = (item: DepartmentOption) => {
      if (item.ext_parent_id === 0) {
        filteredDepartments.push(item);
        return;
      }
      const parent = allDepartmentMap[item.ext_parent_id];
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      filteredDepartments.push(parent);
      pushParentDepartment(parent);
    };

    filteredDepartments.forEach((item) => {
      pushParentDepartment(item);
    })

    filteredDepartments = _.uniq<DepartmentOption>(filteredDepartments);
    setDepartments(filteredDepartments);

    const {nodes, tree} = buildDepartmentTree(filteredDepartments);

    // 这里同步更新node节点和选中key值
    let checkedKeys: string[] = [];
    nodes.forEach((node) => {
      selectedDepartments.forEach((department) => {
        if (node.key === `${department.ext_id}`) {
          checkedKeys.push(node.key);
        }
      });
    });
    checkedKeys = _.uniq<string>(checkedKeys);
    setCheckedNodeKeys(checkedKeys);

    setCheckAll(false);
    setDepartmentNodes(nodes);
    setDepartmentTree(tree);
  }, [allDepartments, keyword]);

  // @ts-ignore
  return (
    <Modal
      width={665}
      className={'dialog from-item-label-100w'}
      visible={visible}
      zIndex={1001}
      onCancel={() => setVisible(false)}
      onOk={() => {
        if (onFinish) {
          onFinish(selectedDepartments);
        }
        setVisible(false);
      }}
    >
      <h2 className="dialog-title"> 选择部门 </h2>
      <div className={styles.addDepartmentDialogContent}>
        <div className={styles.container}>
          <div className={styles.left}>
            <p className={styles.toolTop} style={{marginBottom: 0}}>
              <Search
                className={styles.searchInput}
                enterButton={'搜索'}
                prefix={<SearchOutlined/>}
                placeholder="请输入部门名称"
                allowClear
                value={keyword}
                onChange={(e) => {
                  setKeyword(e.target.value);
                }}
              />
            </p>
            <p style={{marginBottom: 0}}>
              <Checkbox checked={checkAll} onChange={onCheckAllChange}>
                全部部门({departments.length})：
              </Checkbox>
              <Button
                type={'link'}
                onClick={() => {
                  const currentStatus = !expandAll;
                  if (currentStatus) {
                    setExpandedNodeKeys(_.map(departmentNodes, 'key'));
                  } else {
                    setExpandedNodeKeys(['0']);
                  }
                  setExpandAll(currentStatus);
                }}
                style={{marginRight: 30}}
              >
                {!expandAll ? '展开全部' : '收起全部'}
              </Button>
            </p>
            <div className={styles.allDepartment}>
              {departmentTree.length === 0 && <Empty image={Empty.PRESENTED_IMAGE_SIMPLE}/>}
              <Tree
                className={styles.departmentTree}
                autoExpandParent={false}
                checkStrictly={true}
                checkedKeys={checkedNodeKeys}
                defaultExpandedKeys={checkedNodeKeys}
                expandedKeys={expandedNodeKeys}
                // @ts-ignore
                onExpand={(expandedKeys: string[]) => {
                  setExpandedNodeKeys(expandedKeys);
                }}
                height={300}
                switcherIcon={<CaretDownFilled style={{color: '#47a7ff'}}/>}
                checkable={true}
                multiple={true}
                treeData={departmentTree}
                // @ts-ignore
                onCheck={onNodesCheck}
                titleRender={nodeRender}
              />
            </div>
          </div>
          <div className={styles.right}>
            <p>
              已选部门({selectedDepartments.length})：
              <Button
                type={'link'}
                onClick={() => {
                  setSelectedDepartments([]);
                  setCheckAll(false);
                }}
              >
                清空
              </Button>
            </p>
            <ul className={styles.allDepartmentList}>
              {selectedDepartments.map((department) => {
                if (!department) {
                  return <></>
                }

                return (
                  <li
                    key={department.ext_id}
                    onClick={() => {
                      setSelectedDepartments(
                        selectedDepartments.filter((item) => item.ext_id !== department.ext_id),
                      );
                    }}
                  >
                    <div className={styles.avatarAndName}>
                      <div className="flex-col align-left">
                        <FolderFilled
                          style={{
                            color: '#47a7ff',
                            fontSize: 20,
                            marginRight: 6,
                            verticalAlign: -6,
                          }}
                        />
                        {department.name}
                      </div>
                    </div>
                    <CloseOutlined/>
                  </li>
                );
              })}
            </ul>
          </div>
        </div>
      </div>
    </Modal>
  );
};

export default DepartmentSelectionModal;
