import type { Dispatch, ReactNode, SetStateAction } from 'react';
import React, { useEffect, useState } from 'react';
import { Button, Checkbox, Empty, Modal, Tree } from 'antd';
import styles from './index.less';
import Search from 'antd/es/input/Search';
import { CaretDownFilled, CloseOutlined, FolderFilled, SearchOutlined } from '@ant-design/icons';
import { FormatWeWorkAvatar } from '@/utils/utils';
import type { CheckboxChangeEvent } from 'antd/es/checkbox';
import _ from 'lodash';
import type { StaffParam } from '@/pages/StaffAdmin/ContactWay/data';
import type { SimpleStaffInterface } from '@/services/staff';
import type { DataNode } from 'rc-tree/lib/interface';
import { RoleColorMap, RoleMap } from '../../../../../../config/constant';
import { QueryDepartment } from '@/services/department';

export interface StaffOption extends SimpleStaffInterface {
  key: any;
  label: string;
  value: string;
  avatar_url: string;
}

export interface TreeNode {
  type: 'node' | 'group';
  parentId: number;
  departmentId: number;
  title: string;
  key: string;
  parentKey: string;
  nodeKey: string;
  children: TreeNode[];
  checkable?: boolean;
  disableCheckbox?: boolean;
  selectable?: boolean;
  isLeaf: boolean; // 是否为叶子节点，可以用来区分是员工还是部门
}

export type StaffSelectionProps = {
  visible: boolean;
  setVisible: Dispatch<SetStateAction<boolean>>;
  onFinish?: (selectedStaffs: StaffOption[]) => void;
  defaultCheckedStaffs?: StaffOption[];
  allStaffs: StaffOption[];
};

const separator = ':';
const rootNode = 'group:0:1';

const buildStaffTree = (items: SimpleStaffInterface[]): { nodes: TreeNode[]; tree: TreeNode[] } => {
  let nodes: TreeNode[] = []; // 一维节点
  let tree: TreeNode[] = []; // 树形节点
  items?.forEach((staff) => {
    staff?.departments?.forEach((department) => {
      nodes.push({
        type: 'node',
        parentId: department.ext_parent_id,
        departmentId: department.ext_id,
        title: staff?.name,
        key: `node${separator}${department.ext_id}${separator}${staff?.ext_id}`,
        parentKey: `group${separator}${department.ext_id}`,
        nodeKey: `node${separator}${department.ext_id}${separator}${staff?.ext_id}`,
        children: [],
        isLeaf: true,
        checkable: true,
        selectable: false,
      });
      nodes.push({
        type: 'group',
        parentId: department.ext_parent_id,
        departmentId: department.ext_id,
        title: department.name,
        key: `group${separator}${department.ext_parent_id}${separator}${department.ext_id}`,
        parentKey: `group${separator}${department.ext_parent_id}`,
        nodeKey: `group${separator}${department.ext_id}`,
        children: [],
        isLeaf: true,
        checkable: true,
        selectable: false,
      });
    });
  });

  // 排序原始nodes，group在前，node在后
  nodes = nodes.sort((a) => {
    if (a.type === 'group') {
      return -1;
    }
    if (a.type === 'node') {
      return 1;
    }
    return 0;
  });

  const nodesByNodeKey = _.keyBy(nodes, 'nodeKey'); // 去重
  nodes = _.toArray<TreeNode>(nodesByNodeKey); // 设置一维节点
  const groupedNodes = _.groupBy(nodesByNodeKey, 'parentKey');

  // 组装node
  _.each(_.omit(groupedNodes, `group${separator}0`), async (children,parentKey) => {
    // 如果部门员工为空，但拥有下级部门，且下级部门有员工
    if (nodesByNodeKey[parentKey]===undefined) {
      if (children.length>0) {
        // 请求该部门信息
        await QueryDepartment({ext_parent_id: children[0].parentId.toString()}).then((resp: { data: { ext_parent_id: any; ext_id: any; name: any; }; })=>{
          nodesByNodeKey[parentKey] = {
            type: 'group',
            parentId: resp.data.ext_parent_id,
            departmentId: resp.data.ext_id,
            title: resp.data.name,
            key: `group${separator}${resp.data.ext_parent_id}${separator}${resp.data.ext_id}`,
            parentKey: `group${separator}${resp.data.ext_parent_id}`,
            nodeKey: `group${separator}${resp.data.ext_id}`,
            children: [],
            isLeaf: true,
            checkable: true,
            selectable: false,
          }
          nodesByNodeKey[parentKey].children = children;
          // 追加到父级部门
          nodesByNodeKey[nodesByNodeKey[parentKey].parentKey].children.push(nodesByNodeKey[parentKey]);
          nodes.push(nodesByNodeKey[parentKey]);
        });
      }
    } else {
      // 部门员工不为0
      nodesByNodeKey[parentKey].children = children;
    }

  });
  tree = _.toArray<TreeNode>(nodesByNodeKey);
  // 清除顶层的冗余node
  tree = tree.filter((item) => {
    return item.parentKey === `group${separator}0`;
  });
  return {
    nodes,
    tree,
  };
};

const StaffTreeSelectionModal: React.FC<StaffSelectionProps> = (props) => {
  const { visible, setVisible, defaultCheckedStaffs, onFinish, allStaffs } = props;
  const [staffs, setStaffs] = useState<StaffOption[]>([]);
  const [staffNodes, setStaffNodes] = useState<TreeNode[]>([]); // 一维的节点
  const [staffTree, setStaffTree] = useState<TreeNode[]>([]); // 多维的树节点
  const [selectedStaffs, setSelectedStaffs] = useState<StaffOption[]>(defaultCheckedStaffs || []);
  const [keyword, setKeyword] = useState<string>('');
  const [checkAll, setCheckAll] = useState<boolean>(false);
  const [expandAll, setExpandAll] = useState<boolean>(false);
  const [checkedNodeKeys, setCheckedNodeKeys] = useState<string[]>([]);
  const [expandedNodeKeys, setExpandedNodeKeys] = useState<string[]>([rootNode]);
  const allStaffMap = _.keyBy(allStaffs, 'ext_id');

  const onCheckAllChange = (e: CheckboxChangeEvent) => {
    let items: StaffOption[];
    if (e.target.checked) {
      items = _.uniqWith<StaffOption>(
        [...staffs, ...selectedStaffs],
        (a, b) => a.ext_id === b.ext_id,
      );
    } else {
      // @ts-ignore
      items = _.differenceWith<StaffParam>(selectedStaffs, staffs, (a, b) => a.ext_id === b.ext_id);
    }
    setSelectedStaffs(items);
    setCheckAll(e.target.checked);
  };

  const onNodesCheck = (checked: string[]) => {
    const checkedExtStaffIDs: string[] = [];
    let selectedExtStaffIDs = _.map(selectedStaffs, 'ext_id');
    let checkedKeys = [...checked];

    // 找出本次uncheck的key，根据这些key的ext_id去删除相关checkedKey
    const uncheckedKeys = _.difference(checkedNodeKeys, checkedKeys);
    _.forEach<string>(uncheckedKeys, (key: string) => {
      const [, , nodeID] = key.split(separator);
      // eslint-disable-next-line no-param-reassign
      // @ts-ignore
      checkedKeys = checkedKeys.filter<string>((checkedKey) => {
        return !checkedKey.includes(`${separator}${nodeID}`);
      });
    });

    // 记录当前所有checked的key
    checkedKeys.forEach((key) => {
      const [nodeType, , nodeID] = key.split(separator);
      if (nodeType === 'node') {
        checkedExtStaffIDs.push(nodeID);
        selectedExtStaffIDs.push(nodeID);
      }
    });

    // 计算需要删除的extStaffID
    // @ts-ignore
    const shouldDeleteExtStaffIDs = _.difference(_.map(staffs, 'ext_id'), checkedExtStaffIDs);
    selectedExtStaffIDs = _.difference(
      _.uniq(selectedExtStaffIDs),
      _.uniq(shouldDeleteExtStaffIDs),
    );

    const items = selectedExtStaffIDs.map((selectedExtStaffID) => {
      return allStaffMap[selectedExtStaffID];
    });

    setCheckAll(staffs.length === items.length);
    setSelectedStaffs(items);
  };

  const nodeRender = (node: DataNode): ReactNode => {
    const [nodeType, , extStaffID] = node.key.toString().split(separator);
    if (nodeType === 'node') {
      const staff = allStaffMap[extStaffID];
      if (staff) {
        return (
          <div className={styles.staffTitleNode}>
            <img src={FormatWeWorkAvatar(staff?.avatar_url, 60)} className={styles.avatar} />
            <div className={styles.text}>
              <span className={styles.title}>{staff?.name}</span>
              <em
                style={{
                  color: RoleColorMap[staff?.role_type],
                  borderColor: RoleColorMap[staff?.role_type],
                }}
              >
                {RoleMap[staff?.role_type] || '普通员工'}
              </em>
            </div>
          </div>
        );
      }
    }
    return (
      <>
        <FolderFilled
          style={{
            color: '#47a7ff',
            fontSize: 20,
            marginRight: 6,
            verticalAlign: -3,
          }}
        />
        {node.title}
      </>
    );
  };

  useEffect(() => {
    setSelectedStaffs(defaultCheckedStaffs || []);
    setKeyword('');
  }, [defaultCheckedStaffs, visible]);

  // 监听选中员工变化，计算checked的树节点
  useEffect(() => {
    const allStaffNodeKeys = _.map(staffNodes, 'key');
    // 计算当前选中的员工，命中的key
    const matchedKeys: string[] = [];
    allStaffNodeKeys.forEach((key: string) => {
      selectedStaffs.forEach((staff) => {
        if (key.includes(`${separator}${staff?.ext_id}`)) {
          matchedKeys.push(key);
        }
      });
    });
    setCheckedNodeKeys(matchedKeys);
  }, [selectedStaffs, staffNodes]);

  // 关键词变化的时候
  useEffect(() => {
    const filteredStaffs = allStaffs.filter((item) => {
      // 搜索部门名称
      let isDepartmentMatch = false;
      item?.departments?.forEach((department) => {
        if (department.name.includes(keyword)) {
          isDepartmentMatch = true;
        }
      });
      return keyword === '' || isDepartmentMatch || item.label.includes(keyword);
    });
    setStaffs(filteredStaffs);
    const { nodes, tree } = buildStaffTree(filteredStaffs);

    // 这里同步更新node节点和选中key值
    let checkedKeys: string[] = [];
    nodes.forEach((node) => {
      selectedStaffs.forEach((staff) => {
        if (node.nodeKey.includes(`${separator}${staff?.ext_id}`)) {
          checkedKeys.push(node.key);
        }
      });
    });
    checkedKeys = _.uniq<string>(checkedKeys);
    setCheckedNodeKeys(checkedKeys);

    setCheckAll(false);
    setStaffNodes(nodes);
    setStaffTree(tree);
  }, [allStaffs, keyword]);

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
          onFinish(selectedStaffs);
        }
        setVisible(false);
      }}
    >
      <h2 className='dialog-title'> 选择员工 </h2>
      <div className={styles.addStaffDialogContent}>
        <div className={styles.container}>
          <div className={styles.left}>
            <p className={styles.toolTop} style={{ marginBottom: 0 }}>
              <Search
                className={styles.searchInput}
                enterButton={'搜索'}
                prefix={<SearchOutlined />}
                placeholder='请输入员工昵称'
                allowClear
                value={keyword}
                onChange={(e) => {
                  setKeyword(e.target.value);
                }}
              />
            </p>
            <p style={{ marginBottom: 0 }}>
              <Checkbox checked={checkAll} onChange={onCheckAllChange}>
                全部成员({staffs.length})：
              </Checkbox>
              <Button
                type={'link'}
                onClick={() => {
                  const currentStatus = !expandAll;
                  if (currentStatus) {
                    setExpandedNodeKeys(
                      _.map(
                        staffNodes.filter((staffNode) => staffNode.type === 'group'),
                        'key',
                      ),
                    );
                  } else {
                    setExpandedNodeKeys([rootNode]);
                  }
                  setExpandAll(currentStatus);
                }}
                style={{ marginRight: 30 }}
              >
                {!expandAll ? '展开部门' : '收起部门'}
              </Button>
            </p>
            <div className={styles.allStaff}>
              {staffTree.length === 0 && <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} />}
              <Tree
                className={styles.staffTree}
                autoExpandParent={true}
                checkedKeys={checkedNodeKeys}
                defaultExpandedKeys={checkedNodeKeys}
                expandedKeys={expandedNodeKeys}
                // @ts-ignore
                onExpand={(expandedKeys: string[]) => {
                  setExpandedNodeKeys(expandedKeys);
                }}
                height={300}
                switcherIcon={<CaretDownFilled style={{ color: '#47a7ff' }} />}
                checkable={true}
                multiple={true}
                treeData={staffTree}
                // @ts-ignore
                onCheck={onNodesCheck}
                titleRender={nodeRender}
              />
            </div>
          </div>
          <div className={styles.right}>
            <p>
              已选成员({selectedStaffs.length})：
              <Button
                type={'link'}
                onClick={() => {
                  setSelectedStaffs([]);
                  setCheckAll(false);
                }}
              >
                清空
              </Button>
            </p>
            <ul className={styles.allStaffList}>
              {selectedStaffs.map((staff) => {
                if (!staff?.ext_id) {
                  return '';
                }

                return (
                  <li
                    key={staff?.ext_id}
                    onClick={() => {
                      setSelectedStaffs(
                        selectedStaffs.filter((item) => item?.ext_id !== staff?.ext_id),
                      );
                    }}
                  >
                    <div className={styles.avatarAndName}>
                      <img src={staff?.avatar_url} className={styles.avatar} />
                      <div className='flex-col align-left'>
                        <span>{staff?.name}</span>
                      </div>
                    </div>
                    <CloseOutlined />
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

export default StaffTreeSelectionModal;
