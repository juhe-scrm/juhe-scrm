import type {Dispatch, SetStateAction} from 'react';
import React, {useRef, useState} from 'react';
import type {ModalFormProps} from '@ant-design/pro-form';
import ProForm, {ProFormList, ProFormText,} from '@ant-design/pro-form';
import type {GroupChatTagGroupItem} from '@/pages/StaffAdmin/GroupChatTag/data';
import type {FormInstance} from 'antd';
import {Modal, Tooltip} from 'antd';

import {CopyOutlined, DeleteOutlined, DownCircleOutlined, UpCircleOutlined,} from '@ant-design/icons';
import type {FormListFieldData, FormListOperation} from 'antd/lib/form/FormList';
import type {DepartmentOption,} from '@/pages/StaffAdmin/Components/Modals/DepartmentSelectionModal';
import DepartmentSelectionModal from '@/pages/StaffAdmin/Components/Modals/DepartmentSelectionModal';

export type CreateModalFormProps = Omit<ModalFormProps,
  'onFinish' | 'visible' | 'initialValues'> & {
  type: 'create' | 'edit';
  minOrder?: number;
  maxOrder?: number;
  visible: boolean;
  setVisible: Dispatch<SetStateAction<boolean>>;
  onFinish: (params: any) => void;
  allDepartments: DepartmentOption[];
  initialValues?: GroupChatTagGroupItem;
};

const CreateModalForm: React.FC<CreateModalFormProps> = (props) => {
  const [departmentSelectionVisible, setDepartmentSelectionVisible] = useState(false);
  const [selectedDepartments, setSelectedDepartments] = useState<DepartmentOption[]>([]);
  const [deletedTagIDs, setDeletedTagIDs] = useState<string[]>([]);
  const formRef = useRef<FormInstance>();

  return (
    <>
      <Modal
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
          // 创建标签组modal
          initialValues={props.initialValues}
          formRef={formRef}
          layout={'horizontal'}
          onFinish={async (values) => {
            const params: GroupChatTagGroupItem = {
              ...props.initialValues,
              ...values,
            };

            if (props.type === 'edit' && deletedTagIDs.length > 0) {
              params.delete_tag_ids = deletedTagIDs;
            }
            await props.onFinish(params);
          }}
        >
          <h2 className="dialog-title"> {props.type==='create'?'新建客户群标签':'修改客户群标签'} </h2>
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

          <ProFormList
            label={'标签名称'}
            name="tags"
            actionRender={(
              field: FormListFieldData,
              action: FormListOperation,
            ) => {
              const currentKey = field.name;
              const lastKey = formRef.current?.getFieldValue('tags').length - 1;
              return [
                <Tooltip key={'moveUp'} title="上移">
                  <UpCircleOutlined
                    className={'ant-pro-form-list-action-icon'}
                    onClick={() => {
                      console.log(field, currentKey);
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
                      console.log(field, currentKey);
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
                      if (formRef.current?.getFieldValue('tags')[currentKey]?.id) {
                        setDeletedTagIDs([
                          ...deletedTagIDs,
                          formRef.current?.getFieldValue('tags')[currentKey].id,
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
