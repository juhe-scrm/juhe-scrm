import React, {useState} from 'react';
import {Select} from 'antd';
import _ from 'lodash';
import {CloseOutlined, FolderFilled} from '@ant-design/icons';
import type {SelectProps} from 'antd/lib/select';
import type {DepartmentOption} from '@/pages/StaffAdmin/Components/Modals/DepartmentSelectionModal';
import DepartmentSelectionModal from '@/pages/StaffAdmin/Components/Modals/DepartmentSelectionModal';

export type DepartmentTreeSelectProps = {
  options: DepartmentOption[];
  onChange?: (value: any[]) => void; // 设置受控属性
  value?: any[]; // 受控属性，组件选中值
} & SelectProps<any>;

const DepartmentTreeSelect: React.FC<DepartmentTreeSelectProps> = (props) => {
  const {value, onChange, options: allDepartments, ...rest} = props;
  const [departmentSelectionVisible, setDepartmentSelectionVisible] = useState(false);
  const allDepartmentMap = _.keyBy<DepartmentOption>(allDepartments, 'ext_id');
  return (
    <>
      <Select
        {...rest}
        mode="multiple"
        placeholder="请选择部门"
        allowClear={true}
        value={value}
        open={false}
        maxTagCount={rest.maxTagCount || 2}
        tagRender={(tagProps) => {
          // @ts-ignore
          const department: DepartmentOption = allDepartmentMap[tagProps.value];
          if (!department) {
            return <></>
          }

          return (
            <span className={'ant-select-selection-item'}>
              <div className="flex-col align-left">
                <FolderFilled
                  style={{
                    color: '#47a7ff',
                    fontSize: 20,
                    marginRight: 6,
                    verticalAlign: -6,
                  }}
                />
                {department?.name}
              </div>
              <span
                className="ant-select-selection-item-remove"
                style={{marginLeft: 3}}
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  // @ts-ignore
                  onChange(
                    value.filter(
                      // @ts-ignore
                      (extDepartmentID: string) => extDepartmentID !== department?.ext_id,
                    ),
                  );
                }}
              >
                <CloseOutlined/>
              </span>
            </span>
          );
        }}
        onClear={() => {
          // @ts-ignore
          onChange([]);
        }}
        onClick={() => {
          setDepartmentSelectionVisible(!departmentSelectionVisible);
        }}
      />

      <DepartmentSelectionModal
        visible={departmentSelectionVisible}
        setVisible={setDepartmentSelectionVisible}
        defaultCheckedDepartments={value?.map((id: string) => allDepartmentMap[id])}
        onFinish={(values) => {
          // @ts-ignore
          onChange(values.map((item) => item.ext_id));
        }}
        allDepartments={allDepartments}
      />
    </>
  );
};

export default DepartmentTreeSelect;
