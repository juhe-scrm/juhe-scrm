import type {Dispatch, SetStateAction} from 'react';
import React, { useState} from 'react';
import {Select} from 'antd';
import _ from 'lodash';
import type {SelectProps} from 'antd/lib/select';
import type {CustomerTagGroupItem} from "@/pages/StaffAdmin/CustomerTag/data";
import styles from './index.less';
import {CloseOutlined, TagOutlined} from '@ant-design/icons';
import CustomerTagSelectionModal from "@/pages/StaffAdmin/Components/Modals/CustomerTagSelectionModal";

export type CustomerTagSelectProps = {
  allTagGroups: CustomerTagGroupItem[];
  onChange?: (value: any[]) => void; // 设置受控属性
  value?: any[]; // 受控属性，组件选中值
  isEditable?: boolean;
  withLogicalCondition?: boolean; // 是否开启逻辑条件选择
  logicalCondition?: 'and' | 'or' | 'none';
  setLogicalCondition?: Dispatch<SetStateAction<'and' | 'or' | 'none'>>;
} & SelectProps<any>;

const CustomerTagSelect: React.FC<CustomerTagSelectProps> = (props) => {
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

  const allTags: CustomerTagGroupItem[] = [];
  allTagGroups.forEach((tagGroup) => {
    tagGroup?.tags?.forEach((tag) => {
      allTags.push(tag)
    })
  })
  // @ts-ignore
  const allTagMap = _.keyBy<CustomerTag>(allTags, 'ext_id');

  return (
    <>
      <Select
        {...rest}
        mode="multiple"
        placeholder={rest.placeholder || '请选择标签'}
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
          const selectedTag: CustomerTag = allTagMap[tagProps.value];
          if (selectedTag) {
            return (
              <span className={'ant-select-selection-item'}>
              <span className={styles.selectedItem}>
                <div className={styles.avatar}>
                  <TagOutlined style={{color: 'rgba(0,0,0,0.65)'}}/>
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
                  onChange(value.filter((extID: string) => extID !== selectedTag?.ext_id));
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

      <CustomerTagSelectionModal
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
          onChange(values.map((Tag) => Tag.ext_id));
        }}
        allTagGroups={allTagGroups}
      />
    </>
  );
};

export default CustomerTagSelect;
