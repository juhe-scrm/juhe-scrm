import React, { useRef, useState } from 'react';
import { FooterToolbar, PageContainer } from '@ant-design/pro-layout';
import { Button, Divider, Modal } from 'antd';
import { DeleteOutlined, PlusOutlined } from '@ant-design/icons';
import type { CustomerWelcomeMsgItem, WelcomeMsg } from '@/pages/StaffAdmin/CustomerWelcomeMsg/data';
import { Delete, Query } from '@/pages/StaffAdmin/CustomerWelcomeMsg/service';
import type { ProColumns } from '@ant-design/pro-table/es';
import { history } from '@@/core/history';
import type { ActionType } from '@ant-design/pro-table';
import ProTable from '@ant-design/pro-table';
import { HandleRequest, ProTableRequestAdapter } from '@/utils/utils';
import moment from 'moment';
import CollapsedStaffs from '@/pages/StaffAdmin/Components/Columns/CollapsedStaffs';
import AutoReplyPreviewModal from '@/pages/StaffAdmin/Components/Modals/AutoReplyPreviewModal';

const CustomerWelcomeMsgList: React.FC = () => {
  const actionRef = useRef<ActionType>();
  const [selectedItems, setSelectedItems] = useState<CustomerWelcomeMsgItem[]>([]);
  const [welcomeMsg, setWelcomeMsg] = useState<WelcomeMsg>();
  const [previewModalVisible, setPreviewModalVisible] = useState<boolean>(false);

  const columns: ProColumns<CustomerWelcomeMsgItem>[] = [
    {
      title: 'ID',
      dataIndex: 'id',
      valueType: 'text',
      hideInTable: true,
      hideInSearch: true,
    },
    {
      title: '欢迎语名称',
      dataIndex: 'name',
      valueType: 'text',
      hideInSearch: true,
      fixed: 'left',
    },
    {
      title: '消息内容',
      dataIndex: 'welcome_msg',
      valueType: 'text',
      hideInSearch: true,
      width: 310,
      render: (_, item) => {
        return (
          <>
            <p>{item?.welcome_msg?.text}</p>
            {item?.welcome_msg?.attachments && item?.welcome_msg?.attachments?.length > 0 && (
              <>
                <p style={{
                  color: 'rgb(255,133,0)',
                  fontSize: 13,
                }}> [{item?.welcome_msg?.attachments?.length || 0}个附件] </p>
                <a onClick={() => {
                  setWelcomeMsg(item?.welcome_msg)
                  setPreviewModalVisible(true);
                }}>查看内容</a>
              </>
            )}
          </>
        );
      },
    },
    {
      title: '使用成员',
      dataIndex: 'staffs',
      valueType: 'text',
      hideInSearch: true,
      width: 210,
      render: (_, item) => {
        return <CollapsedStaffs limit={3} staffs={item.staffs} />;
      },
    },
    {
      title: '创建时间',
      dataIndex: 'created_at',
      valueType: 'dateRange',
      hideInSearch: true,
      sorter: true,
      render: (dom, item) => {
        return (
          <div
            dangerouslySetInnerHTML={{
              __html: moment(item.created_at).format('YYYY-MM-DD HH:mm').split(' ').join('<br />'),
            }}
          />
        );
      },
    },
    {
      title: '修改时间',
      dataIndex: 'updated_at',
      valueType: 'dateRange',
      hideInSearch: true,
      sorter: true,
      render: (dom, item) => {
        return (
          <div
            dangerouslySetInnerHTML={{
              __html: moment(item.updated_at).format('YYYY-MM-DD HH:mm').split(' ').join('<br />'),
            }}
          />
        );
      },
    },
    {
      title: '操作',
      width: 180,
      valueType: 'option',
      render: (_, item) => [
        <a
          key='edit'
          onClick={() => {
            history.push(`/staff-admin/customer-conversion/customer-welcome-msg/edit?id=${item.id}`);
          }}
        >
          修改
        </a>,
        <a
          key='delete'
          onClick={() => {
            Modal.confirm({
              title: `删除欢迎语`,
              content: `是否确认删除「${item.name}」欢迎语？`,
              okText: '删除',
              okType: 'danger',
              cancelText: '取消',
              onOk() {
                return HandleRequest({ ids: [item.id] }, Delete, () => {
                  actionRef.current?.reloadAndRest?.();
                  setSelectedItems([]);
                });
              },
            });
          }}
        >
          删除
        </a>,
      ],
    },
  ];


  return (
    <PageContainer
      fixedHeader
      extra={[
        <Button
          key='create'
          type='primary'
          icon={<PlusOutlined style={{ fontSize: 16, verticalAlign: '-3px' }} />}
          onClick={() => {
            history.push('/staff-admin/customer-conversion/customer-welcome-msg/create');
          }}
        >
          添加欢迎语
        </Button>,
      ]}
    >

      <ProTable<CustomerWelcomeMsgItem>
        actionRef={actionRef}
        className={'table'}
        columns={columns}
        scroll={{x: 'max-content'}}
        rowKey='id'
        pagination={{
          pageSizeOptions: ['5', '10', '20', '50', '100'],
          pageSize: 5,
        }}
        toolBarRender={false}
        bordered={false}
        tableAlertRender={false}
        request={async (params, sort, filter) => {
          return ProTableRequestAdapter(params, sort, filter, Query);
        }}
        dateFormatter='string'
        search={false}
        rowSelection={{
          onChange: (_, items) => {
            setSelectedItems(items);
          },
        }}
      />

      {selectedItems?.length > 0 && (
        // 底部选中条目菜单栏
        <FooterToolbar>
          <span>
            已选择 <a style={{ fontWeight: 600 }}>{selectedItems.length}</a> 项 &nbsp;&nbsp;
            <span></span>
          </span>
          <Divider type='vertical' />
          <Button
            type='link'
            onClick={() => {
              actionRef.current?.clearSelected?.();
            }}
          >
            取消选择
          </Button>
          <Button
            icon={<DeleteOutlined />}
            onClick={async () => {
              Modal.confirm({
                title: `删除欢迎语`,
                content: `是否批量删除所选「${selectedItems.length}」个欢迎语？`,
                okText: '删除',
                okType: 'danger',
                cancelText: '取消',
                onOk() {
                  return HandleRequest(
                    { ids: selectedItems.map((item) => item.id) },
                    Delete,
                    () => {
                      actionRef.current?.clearSelected?.();
                      actionRef.current?.reload?.();
                    },
                  );
                },
              });
            }}
            danger={true}
          >
            批量删除
          </Button>
        </FooterToolbar>
      )}

      <AutoReplyPreviewModal visible={previewModalVisible} setVisible={setPreviewModalVisible} autoReply={welcomeMsg} />
    </PageContainer>
  );
};

export default CustomerWelcomeMsgList;
