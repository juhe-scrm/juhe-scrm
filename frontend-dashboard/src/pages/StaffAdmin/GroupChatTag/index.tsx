import React, {useEffect, useRef, useState} from 'react';
import {PageContainer} from '@ant-design/pro-layout';
import type {FormInstance} from 'antd';
import {Button, Col, Empty, Input, Modal, Row, Space, Spin, Tag} from 'antd';
import {HandleRequest} from '@/utils/utils';
import {DeleteOutlined, EditOutlined, PlusOutlined,} from '@ant-design/icons';
import ProCard from '@ant-design/pro-card';
import type {DepartmentOption} from '@/pages/StaffAdmin/Components/Modals/DepartmentSelectionModal';
import {message} from 'antd/es';
import type {DepartmentInterface} from '@/services/department';
import {QueryDepartment} from '@/services/department';
import {Create, CreateTags, Delete, Query, Update} from '@/pages/StaffAdmin/GroupChatTag/service';
import styles from './index.less';

import type {GroupChatTagGroupItem} from '@/pages/StaffAdmin/GroupChatTag/data';
import CreateModalForm from '@/pages/StaffAdmin/GroupChatTag/Components/createModalForm';

const CustomerGroupsTagsGroupList: React.FC = () => {
  const [currentItem, setCurrentItem] = useState<GroupChatTagGroupItem>();
  const [tagGroups, setTagGroups] = useState<GroupChatTagGroupItem[]>([]);
  const [createModalVisible, setCreateModalVisible] = useState<boolean>(false);
  const [editModalVisible, setEditModalVisible] = useState<boolean>(false);
  const [itemsTimestamp, setItemsTimestamp] = useState<any>(new Date());
  const [inputLoading, setInputLoading] = useState<boolean>(false);
  const [actionLoading, setActionLoading] = useState<boolean>(false);
  const [allDepartments, setAllDepartments] = useState<DepartmentOption[]>([]);
  const queryFilterFormRef = useRef<FormInstance>();
  const createModalFormRef = useRef<FormInstance>();
  const [currentInputTagGroupExtID, setCurrentInputTagGroupExtID] = useState<string>();

  useEffect(() => {
    QueryDepartment({page_size: 5000}).then((res) => {
      if (res.code === 0) {
        const departments =
          res?.data?.items?.map((item: DepartmentInterface) => {
            return {
              label: item.name,
              value: item.ext_id,
              ...item,
            };
          }) || [];
        setAllDepartments(departments);
      } else {
        message.error(res.message);
      }
    });
    queryFilterFormRef.current?.submit();
  }, []);

  useEffect(() => {
    setActionLoading(true);
    Query(
      {
        page_size: 5000,
        sort_field: 'id',
        sort_type: 'desc',
      }).then((res) => {
      setActionLoading(false);
      if (res.code === 0) {
        setTagGroups(res.data.items);
      } else {
        message.error('查询标签失败');
        setTagGroups([]);
      }
    });
  }, [itemsTimestamp]);

  return (
    <PageContainer
      fixedHeader
      header={{
        title: '客户群标签',
      }}
      extra={[
        <Button
          key="create"
          type="primary"
          icon={<PlusOutlined style={{fontSize: 16, verticalAlign: '-3px'}}/>}
          onClick={() => {
            setCreateModalVisible(true);
          }}
        >
          新建群标签
        </Button>,
      ]}
    >

      <ProCard style={{marginTop: 12}} bodyStyle={{paddingTop: 0}} gutter={0}>
        <Spin spinning={actionLoading}>
          <div className={styles.tagGroupList}>
            {(tagGroups === null || tagGroups?.length === 0) && <Empty style={{marginTop: 36, marginBottom: 12}} image={Empty.PRESENTED_IMAGE_SIMPLE}/>}
            {tagGroups?.map((tagGroup) => (
              <Row className={styles.tagGroupItem} key={tagGroup.id}>
                <Col md={2} className={styles.tagName}>
                  <h4>{tagGroup.name}</h4>
                </Col>
                <Col md={18} className={styles.tagList}>
                  <Row>
                    <Space direction={'horizontal'} wrap={true}>
                      <Button
                        icon={<PlusOutlined/>}
                        onClick={() => {
                          setCurrentInputTagGroupExtID(tagGroup.id);
                        }}
                      >
                        添加
                      </Button>
                      {currentInputTagGroupExtID === tagGroup.id && (
                        <Input
                          autoFocus={true}
                          disabled={inputLoading}
                          placeholder="逗号分隔，回车保存"
                          onBlur={() => setCurrentInputTagGroupExtID('')}
                          onPressEnter={async (e) => {
                            setInputLoading(true);
                            const res = await CreateTags({
                              names: e.currentTarget.value
                                .replace('，', ',')
                                .split(',')
                                .filter((val) => val),
                              group_id: tagGroup.id || '',
                            });
                            if (res.code === 0) {
                              setCurrentInputTagGroupExtID('');
                              tagGroup.tags?.unshift(...res.data);
                            } else {
                              message.error(res.message);
                            }
                            setInputLoading(false);
                          }}
                        />
                      )}

                      {tagGroup.tags?.map((tag) => (
                        <Tag className={styles.tagItem} key={tag.id}>
                          {tag.name}
                        </Tag>
                      ))}

                    </Space>
                  </Row>
                </Col>
                <Col md={4} className={styles.groupAction}>
                  <Button
                    icon={<EditOutlined/>}
                    type={'text'}
                    onClick={() => {
                      createModalFormRef.current?.setFieldsValue(tagGroup);
                      setCurrentItem(tagGroup);
                      setEditModalVisible(true);
                    }}
                  >
                    修改
                  </Button>
                  <Button
                    icon={<DeleteOutlined/>}
                    type={'text'}
                    onClick={() => {
                      Modal.confirm({
                        title: `删除标签分组`,
                        content: `是否确认删除「${tagGroup.name}」分组？`,
                        okText: '删除',
                        okType: 'danger',
                        cancelText: '取消',
                        onOk() {
                          return HandleRequest({ids: [tagGroup.id]}, Delete, () => {
                            setItemsTimestamp(new Date());
                          });
                        },
                      });
                    }}
                  >
                    删除
                  </Button>
                </Col>
              </Row>
            ))}
          </div>
        </Spin>
      </ProCard>

      <CreateModalForm
        type={'create'}
        allDepartments={allDepartments}
        setVisible={setCreateModalVisible}
        visible={createModalVisible}
        initialValues={{tags: [{name: ''}]}}
        formRef={createModalFormRef}
        onFinish={async (values) => {
          await HandleRequest(values, Create, () => {
            setItemsTimestamp(new Date());
            setCreateModalVisible(false);
          });
        }}
      />

      <CreateModalForm
        type={'edit'}
        allDepartments={allDepartments}
        setVisible={setEditModalVisible}
        visible={editModalVisible}
        initialValues={currentItem}
        formRef={createModalFormRef}
        onFinish={async (values) => {
          await HandleRequest(values, Update, () => {
            setItemsTimestamp(new Date());
            setEditModalVisible(false);
          });
        }}
      />
    </PageContainer>
  );
};

export default CustomerGroupsTagsGroupList;
