import type {Dispatch, SetStateAction} from 'react';
import React, {useEffect, useRef, useState} from 'react';
import ProForm, {
  ProFormDependency,
  ProFormList,
  ProFormRadio,
  ProFormText,
} from '@ant-design/pro-form';
import type {CustomerTagGroupItem} from '@/pages/StaffAdmin/CustomerTag/data';
import {Disable, False, True} from '../../../../../config/constant';
import type {FormInstance, ModalProps} from 'antd';
import {Badge, Button, Modal, Row, Space, Tooltip} from 'antd';
import {
  CloseCircleOutlined,
  CopyOutlined,
  DeleteOutlined,
  DownCircleOutlined,
  FolderFilled,
  PlusOutlined,
  UpCircleOutlined,
} from '@ant-design/icons';
import type {FormListFieldData, FormListOperation} from 'antd/lib/form/FormList';
import type {DepartmentOption} from '@/pages/StaffAdmin/Components/Modals/DepartmentSelectionModal';
import DepartmentSelectionModal from '@/pages/StaffAdmin/Components/Modals/DepartmentSelectionModal';
import _ from 'lodash';

export type CreateModalFormProps = Omit<ModalProps, 'onFinish' | 'visible' | 'initialValues'> & {
  type: 'create' | 'edit';
  minOrder?: number;
  maxOrder?: number;
  visible: boolean;
  setVisible: Dispatch<SetStateAction<boolean>>;
  onFinish: (params: any) => void;
  allDepartments: DepartmentOption[];
  initialValues?: CustomerTagGroupItem;
};


const CreateModalForm: React.FC<CreateModalFormProps> = (props) => {
  const {allDepartments, initialValues} = props;
  const departmentMap = _.keyBy<DepartmentOption>(allDepartments, "ext_id");
  const [departmentSelectionVisible, setDepartmentSelectionVisible] = useState(false);
  const [selectedDepartments, setSelectedDepartments] = useState<DepartmentOption[]>([]);
  const [deletedTagExtIDs, setDeletedTagExtIDs] = useState<string[]>([]);
  const formRef = useRef<FormInstance>();
  const minOrder = props.minOrder ? props.minOrder : 10000;
  const maxOrder = props.maxOrder ? props.maxOrder : 100000;
  const itemDataToFormData = (values: CustomerTagGroupItem) => {
    const params: any = {...values}
    params.is_global = (values.department_list === undefined || values.department_list === [] || values.department_list?.includes(0)) ? True : False;
    return params;
  }

  useEffect(() => {
    if (initialValues?.department_list?.includes(0)) {
      setSelectedDepartments([])
    } else {
      setSelectedDepartments(initialValues?.department_list?.map((ext_id) => departmentMap[ext_id]) || [])
    }
    formRef?.current?.setFieldsValue(itemDataToFormData(initialValues || {}));
  }, [initialValues])

  return (
    <>
      <Modal
        {...props}
        width={568}
        className={'dialog from-item-label-100w'}
        visible={props.visible}
        onOk={() => {
          formRef.current?.submit();
        }}
        onCancel={() => {
          props.setVisible(false);
        }}
      >
        <ProForm
          submitter={{
            render: false,
          }}
          initialValues={itemDataToFormData(initialValues || {})}
          formRef={formRef}
          layout={'horizontal'}
          onFinish={async (values) => {
            const params: CustomerTagGroupItem = {
              ...props.initialValues,
              ...values,
              department_list: selectedDepartments.map((item) => item.ext_id),
            };

            if (values.is_global === True) {
              params.department_list = [0];
            }

            if (props.type === 'create') {
              if (values.order_type === 'max') {
                params.order = maxOrder + 1;
              }

              if (values.order_type === 'min') {
                params.order = minOrder - 1 >= 0 ? minOrder - 1 : 0;
              }
            }

            if (props.type === 'edit' && deletedTagExtIDs.length > 0) {
              params.remove_ext_tag_ids = deletedTagExtIDs;
            }

            await props.onFinish(params);
            setDeletedTagExtIDs([]);
          }}
        >
          <h3 className="dialog-title" style={{fontSize: 18}}>
            {' '}
            {props.type === 'edit' ? '修改标签组' : '新建标签组'}{' '}
          </h3>
          <ProFormText
            name="name"
            label="标签组名称"
            width={'md'}
            placeholder="请输入标签组名称"
            rules={[
              {
                required: true,
                message: '标签组名称必填',
              },
            ]}
          />

          <ProFormRadio.Group
            name="is_global"
            label="可见范围"
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
                            return <div key={index}></div>
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

              // 全局可用
              return <></>;
            }}
          </ProFormDependency>

          {props.type === 'create' && (
            <ProFormRadio.Group
              name="order_type"
              label="默认排序"
              initialValue={'max'}
              options={[
                {
                  label: '排最前面',
                  value: 'max',
                },
                {
                  label: '排最后面',
                  value: 'min',
                },
              ]}
            />
          )}

          <ProFormList
            label={'标签名称'}
            name="tags"
            actionRender={(field: FormListFieldData, action: FormListOperation) => {
              const currentKey = field.name;
              const lastKey = formRef.current?.getFieldValue('tags').length - 1;
              return [
                <Tooltip key={'moveUp'} title="上移">
                  <UpCircleOutlined
                    className={'ant-pro-form-list-action-icon'}
                    onClick={() => {
                      if (currentKey - 1 >= 0) {
                        action.move(currentKey, currentKey - 1);
                      } else {
                        action.move(currentKey, lastKey);
                      }
                    }}
                  />
                </Tooltip>,
                <Tooltip key={'moveDown'} title="下移">
                  <DownCircleOutlined
                    className={'ant-pro-form-list-action-icon'}
                    onClick={() => {
                      if (currentKey + 1 <= lastKey) {
                        action.move(currentKey, currentKey + 1);
                      } else {
                        action.move(currentKey, 0);
                      }
                    }}
                  />
                </Tooltip>,
                <Tooltip key={'copy'} title="复制">
                  <CopyOutlined
                    className={'ant-pro-form-list-action-icon'}
                    onClick={() => {
                      action.add(formRef.current?.getFieldValue('tags')[currentKey]);
                    }}
                  />
                </Tooltip>,
                <Tooltip key={'remove'} title="删除">
                  <DeleteOutlined
                    className={'ant-pro-form-list-action-icon'}
                    onClick={() => {
                      if (formRef.current?.getFieldValue('tags')[currentKey]?.ext_id) {
                        setDeletedTagExtIDs([
                          ...deletedTagExtIDs,
                          formRef.current?.getFieldValue('tags')[currentKey].ext_id,
                        ]);
                      }
                      action.remove(currentKey);
                    }}
                  />
                </Tooltip>,
              ];
            }}
            creatorButtonProps={{
              type: 'default',
              style: {width: '128px'},
              position: 'bottom',
              creatorButtonText: '添加标签',
            }}
            creatorRecord={{
              name: '',
            }}
            rules={[
              {
                // @ts-ignore
                required: true,
                message: '标签名称必填',
              },
            ]}
          >
            <ProFormText
              name="name"
              width={'sm'}
              fieldProps={{
                allowClear: false,
                style: {
                  // width: '230px',
                },
              }}
              placeholder="请输入标签名称"
              rules={[
                {
                  required: true,
                  message: '标签名称必填',
                },
              ]}
            />
          </ProFormList>
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
  );
};

export default CreateModalForm;
