import React, { useState } from 'react';
import { Select } from 'antd';
import type { StaffOption } from '@/pages/StaffAdmin/Components/Modals/StaffTreeSelectionModal';
import StaffTreeSelectionModal from '@/pages/StaffAdmin/Components/Modals/StaffTreeSelectionModal';
import _ from 'lodash';
import { CloseOutlined } from '@ant-design/icons';
import styles from '@/pages/StaffAdmin/Components/Modals/StaffTreeSelectionModal/index.less';
import type { SelectProps } from 'antd/lib/select';

export type StaffTreeSelectProps = {
  options: StaffOption[];
  onChange?: (value: any[]) => void; // 设置受控属性
  value?: any[]; // 受控属性，组件选中值
} & SelectProps<any>;

const StaffTreeSelect: React.FC<StaffTreeSelectProps> = (props) => {
  const { value, onChange, options: allStaffs, ...rest } = props;
  const [staffSelectionVisible, setStaffSelectionVisible] = useState(false);
  const allStaffMap = _.keyBy<StaffOption>(allStaffs, 'ext_id');

  return (
    <>
      <Select
        {...rest}
        mode='multiple'
        placeholder='请选择员工'
        allowClear={true}
        value={value || []}
        open={false}
        maxTagCount={rest?.maxTagCount || 2}
        tagRender={(tagProps) => {
          // @ts-ignore
          const staff: StaffOption = allStaffMap[tagProps.value];
          return (
            <span className={'ant-select-selection-item'}>
              <span className={styles.avatarAndName}>
                <img
                  src={staff?.avatar_url}
                  className={styles.avatar}
                  style={{ width: 20, height: 20, marginRight: 3 }}
                />
                <div className='flex-col align-left'>
                  <span>{staff?.name}</span>
                </div>
              </span>
              <span
                className='ant-select-selection-item-remove'
                style={{ marginLeft: 3 }}
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  // @ts-ignore
                  onChange(value.filter((extStaffID: string) => extStaffID !== staff?.ext_id));
                }}
              >
                <CloseOutlined />
              </span>
            </span>
          );
        }}
        onClear={() => {
          // @ts-ignore
          onChange([]);
        }}
        onClick={() => {
          setStaffSelectionVisible(!staffSelectionVisible);
        }}
      />

      <StaffTreeSelectionModal
        visible={staffSelectionVisible}
        setVisible={setStaffSelectionVisible}
        defaultCheckedStaffs={value?.map((extStaffID: string) => allStaffMap[extStaffID])}
        onFinish={(values) => {
          // @ts-ignore
          onChange(values.map((staff) => staff.ext_id));
        }}
        allStaffs={allStaffs}
      />
    </>
  );
};

export default StaffTreeSelect;
