import type {Dispatch, SetStateAction} from 'react';
import React, { useState} from 'react';
import {Select} from 'antd';
import _ from 'lodash';
import type {SelectProps} from 'antd/lib/select';
import GroupChatTagSelectionModal from '../../Modals/GroupChatTagSelectionModal';
import type {GroupChatTagGroupItem} from '@/pages/StaffAdmin/GroupChatTag/data';
import styles from './index.less';
import {CloseOutlined, TagOutlined} from '@ant-design/icons';

export type GroupChatTagSelectProps = {
  allTagGroups: GroupChatTagGroupItem[];
  onChange?: (value: any[]) => void; // 设置受控属性
  value?: any[]; // 受控属性，组件选中值
  isEditable?: boolean;
  withLogicalCondition?: boolean; // 是否开启逻辑条件选择
  logicalCondition?: 'and' | 'or' | 'none';
  setLogicalCondition?: Dispatch<SetStateAction<'and' | 'or' | 'none'>>;
} & SelectProps<any>;

const GroupChatTagSelect: React.FC<GroupChatTagSelectProps> = (props) => {
  const {
    value,
    onChange,
    allTagGroups,
    isEditable,
    withLogicalCondition,
    logicalCondition,
    setLogicalCondition,
    ...rest
  } = props;

  const [TagSelectionVisible, setTagSelectionVisible] = useState(false);

  const allTags: GroupChatTagGroupItem[] = [];
  allTagGroups.forEach((tagGroup) => {
    tagGroup?.tags?.forEach((tag) => {
      allTags.push(tag)
    })
  })
  // @ts-ignore
  const allTagMap = _.keyBy<GroupChatTag>(allTags, 'id');

  return (
    <>
      <Select
        {...rest}
        mode="multiple"
        placeholder={rest.placeholder || '请选择群标签'}
        allowClear={true}
        value={value}
        open={false}
        onClear={() => {
          // @ts-ignore
          onChange([]);
        }}
        onClick={() => {
          setTagSelectionVisible(!TagSelectionVisible);
        }}
        tagRender={(tagProps) => {
          // @ts-ignore
          const selectedTag: GroupChatTag = allTagMap[tagProps.value];
          if (selectedTag) {
            return (
              <span className={'ant-select-selection-item'}>
              <span className={styles.selectedItem}>
                <div className={styles.avatar}>
                  <TagOutlined style={{ color: 'rgba(0,0,0,0.65)' }}  />
                </div>
                <div className='flex-col align-left'>
                  <span>{selectedTag?.name}</span>
                </div>
              </span>
              <span
                className="ant-select-selection-item-remove"
                style={{marginLeft: 3}}
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  // @ts-ignore
                  onChange(value.filter((extID: string) => extID !== selectedTag?.id));
                }}
              >
                <CloseOutlined/>
              </span>
            </span>
            );
          }

          return (<></>);
        }}
      />

      <GroupChatTagSelectionModal
        isEditable={isEditable || false}
        withLogicalCondition={withLogicalCondition || false}
        logicalCondition={logicalCondition}
        setLogicalCondition={setLogicalCondition}
        width={'630px'}
        visible={TagSelectionVisible}
        setVisible={setTagSelectionVisible}
        defaultCheckedTags={_.filter(value?.map((extTagID: string) => allTagMap[extTagID]))}
        onFinish={(values) => {
          // @ts-ignore
          onChange(values.map((Tag) => Tag.id));
        }}
        allTagGroups={allTagGroups}
      />
    </>
  );
};

export default GroupChatTagSelect;
