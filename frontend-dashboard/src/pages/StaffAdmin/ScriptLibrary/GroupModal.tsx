import React, {forwardRef, useImperativeHandle, useState} from 'react';
import type {DepartmentOption} from '@/pages/StaffAdmin/Components/Modals/DepartmentSelectionModal';
import DepartmentSelectionModal from '@/pages/StaffAdmin/Components/Modals/DepartmentSelectionModal';
import {
  CloseCircleOutlined,
  FolderFilled,
  PlusOutlined,
} from '@ant-design/icons';
import ProForm, {ProFormDependency, ProFormRadio, ProFormText} from '@ant-design/pro-form';
import type {FormInstance, ModalProps} from 'antd';
import {Badge, Button, message, Modal, Row, Space} from 'antd';
import type {Dispatch, SetStateAction} from 'react';
import {Disable, False, True} from '../../../../config/constant';
import _ from 'lodash';

export type GroupModalProps = Omit<ModalProps, 'onFinish' | 'visible' | 'initialValues'> & {
  type?: 'create' | 'edit';
  onFinish: (params: any, action: string) => void;
  initialValues?: Partial<ScriptGroup.Item>;
  onCancel?: () => void;
  setVisible: Dispatch<SetStateAction<boolean>>;
  visible: boolean;
  allDepartments: DepartmentOption[];
};

const GroupModal = (props: GroupModalProps, ref: any) => {
  const {initialValues, visible, setVisible, allDepartments} = props
  const [selectedDepartments, setSelectedDepartments] = useState<DepartmentOption[]>([]);
  const [departmentSelectionVisible, setDepartmentSelectionVisible] = useState(false);
  const formRef = React.useRef<FormInstance>();
  const departmentMap = _.keyBy<DepartmentOption>(allDepartments, "ext_id");
  const itemDataToFormData = (values: ScriptGroup.Item) => {
    const params: any = {...values}
    params.is_global = values.departments?.includes(0) ? True : False;
    return params;
  }

  useImperativeHandle(ref, () => {
    return {
      open: (item?: ScriptGroup.Item) => {
        setTimeout(() => {
          formRef.current?.setFieldsValue(itemDataToFormData(item as ScriptGroup.Item))
          if (item?.departments?.includes(0)) {
            setSelectedDepartments([])
          } else {
            setSelectedDepartments(item?.departments?.map((ext_id) => departmentMap[ext_id]) || [])
          }
        }, 100)
        setVisible(true)
      },
      close: () => {
        formRef.current?.resetFields()
        setSelectedDepartments([])
        setVisible(false)
      }
    }
  })
  return (
    <>
      <Modal
        {...props}
        width={568}
        className={'dialog'}
        visible={visible}
        onOk={() => {
          if(formRef.current?.getFieldValue('is_global')===True){
            formRef.current?.submit();
          }
          if(formRef.current?.getFieldValue('is_global')===False){
            if(selectedDepartments?.length>0){
              formRef.current?.submit();
            }else{
              message.warning('请选择部门')
            }
          }
        }}
        onCancel={() => {
          setVisible(false)
          formRef.current?.resetFields()
        }}
      >
        <ProForm
          submitter={{
            render: false,
          }}
          formRef={formRef}
          // initialValues={initialValues}
          layout={'horizontal'}
          onFinish={async (values) => {
            const params: any = {
              ...initialValues,
              ...values,
              departments: selectedDepartments.map((item) => item.ext_id),
            };
            if (values.is_global === True) {
              params.departments = [0];
            }

            await props.onFinish(params, params.id ? 'update' : 'create');
          }}
        >
          <h3 className="dialog-title" style={{fontSize: 18}}>
            {initialValues?.id ? '修改分组' : '添加分组'}
          </h3>
          <ProFormText
            name="name"
            label="分组名称"
            width={'md'}
            placeholder="请输入分组名称"
            rules={[
              {
                required: true,
                message: '分组名称必填',
              },
            ]}
          />

          <ProFormRadio.Group
            name="is_global"
            label="可见范围"
            initialValue={True}
            options={[
              {
                label: '全部员工',
                value: True,
              },
              {
                label: '部门可用',
                value: False,
              },
            ]}
          />

          <ProFormDependency name={['is_global']}>
            {({is_global}) => {
              // 部门可用
              if (is_global === Disable) {
                return (
                  <>
                    <Row>
                      <ProForm.Item label={'选择可用部门'}>
                        <Button
                          icon={<PlusOutlined/>}
                          onClick={() => setDepartmentSelectionVisible(true)}
                        >
                          添加部门
                        </Button>
                      </ProForm.Item>
                    </Row>

                    <Row>
                      <Space direction={'horizontal'} wrap={true} style={{marginBottom: 6}}>
                        {selectedDepartments?.length > 0 && selectedDepartments.map((item, index) => {
                          if (!item?.id) {
                            return <div key={index}/>
                          }
                          return (
                            <div key={item.id} className={'department-item'}>
                              <Badge
                                count={
                                  <CloseCircleOutlined
                                    onClick={() => {
                                      setSelectedDepartments(
                                        selectedDepartments.filter(
                                          (department) => department.id !== item.id,
                                        ),
                                      );
                                    }}
                                    style={{color: 'rgb(199,199,199)'}}
                                  />
                                }
                              >
                                  <span className={'container'}>
                                      <FolderFilled
                                        style={{
                                          color: '#47a7ff',
                                          fontSize: 20,
                                          marginRight: 6,
                                          verticalAlign: -6,
                                        }}
                                      />
                                    {item.name}
                                  </span>
                              </Badge>
                            </div>
                          )
                        })}
                      </Space>
                    </Row>
                  </>
                );
              }
              return <></>;
            }}
          </ProFormDependency>


        </ProForm>
      </Modal>
      <DepartmentSelectionModal
        visible={departmentSelectionVisible}
        setVisible={setDepartmentSelectionVisible}
        defaultCheckedDepartments={selectedDepartments}
        onFinish={(values) => {
          setSelectedDepartments(values);
        }}
        allDepartments={props.allDepartments}
      />
    </>

  )
}

export default forwardRef(GroupModal)
