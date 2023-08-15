import React, {useRef, useState} from 'react';
import {FooterToolbar, PageContainer} from '@ant-design/pro-layout';
import {Badge, Button, Divider, Modal} from 'antd';
import {NotificationOutlined, PlusOutlined} from '@ant-design/icons';
import type {CustomerMassMsgItem} from '@/pages/StaffAdmin/CustomerMassMsg/data';
import {Delete, Notify, Query} from '@/pages/StaffAdmin/CustomerMassMsg/service';
import type {ProColumns} from '@ant-design/pro-table/es';
import {history} from '@@/core/history';
import type {ActionType} from '@ant-design/pro-table';
import ProTable from '@ant-design/pro-table';
import {HandleRequest, ProTableRequestAdapter} from '@/utils/utils';
import moment from 'moment';
import type {WelcomeMsg} from '@/pages/StaffAdmin/CustomerWelcomeMsg/data';
import AutoReplyPreviewModal from '@/pages/StaffAdmin/Components/Modals/AutoReplyPreviewModal';

export const CustomerMassMsgTypeLabels = {
  1: '立即发送',
  2: '定时发送',
};

export const CustomerMassMsgStatusLabels = {
  1: '预约发送',
  2: '发送中',
  3: '发送成功',
  4: '发送失败',
  5: '已取消',
};

const CustomerMassMsgList: React.FC = () => {
  const [selectedItems, setSelectedItems] = useState<CustomerMassMsgItem[]>([]);
  const actionRef = useRef<ActionType>();
  const [autoReply, setAutoReply] = useState<WelcomeMsg>();
  const [previewModalVisible, setPreviewModalVisible] = useState<boolean>(false);

  const columns: ProColumns<CustomerMassMsgItem>[] = [
    {
      title: 'ID',
      dataIndex: 'id',
      valueType: 'text',
      hideInTable: true,
      hideInSearch: true,
      fixed:'left',
    },
    {
      title: '群发类型',
      dataIndex: 'send_type',
      valueType: 'text',
      hideInSearch: true,
      fixed:'left',
      renderText: (value) => {
        return (
          CustomerMassMsgTypeLabels[value]
        );
      },
    },
    {
      title: '发送时间',
      dataIndex: 'created_at',
      valueType: 'dateRange',
      hideInSearch: true,
      sorter: true,
      width:120,
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
      title: '消息内容',
      dataIndex: 'welcome_msg',
      valueType: 'text',
      hideInSearch: true,
      width: 260,
      render: (_, item) => {
        return (
          <>
            <p>{item?.msg?.text}</p>
            {item?.msg?.attachments && item?.msg?.attachments?.length > 0 && (
              <>
                <p style={{
                  color: 'rgb(255,133,0)',
                  fontSize: 13,
                }}> [{item?.msg?.attachments?.length || 0}个附件] </p>
                <a onClick={() => {
                  setAutoReply(item?.msg);
                  setPreviewModalVisible(true);
                }}>查看内容</a>
              </>
            )}
          </>
        );
      },
    },
    {
      title: '已发送员工',
      dataIndex: 'delivered_num',
      valueType: 'text',
      hideInSearch: true,
    },
    {
      title: '送达客户',
      dataIndex: 'success_num',
      valueType: 'text',
      hideInSearch: true,
    },
    {
      title: '未发送员工',
      dataIndex: 'undelivered_num',
      valueType: 'text',
      hideInSearch: true,
    },
    {
      title: '未发送客户',
      dataIndex: 'failed_num',
      valueType: 'text',
      hideInSearch: true,
    },
    {
      title: '发送状态',
      dataIndex: 'mission_status',
      valueType: 'option',
      hideInSearch: true,
      render: (_, item) => {
        return (
          <>
            {item.mission_status === 1 &&
            <Badge status="processing" text={CustomerMassMsgStatusLabels[item.mission_status]}/>}
            {item.mission_status === 2 &&
            <Badge status="success" text={CustomerMassMsgStatusLabels[item.mission_status]}/>}
            {item.mission_status === 3 &&
            <Badge status="error" text={CustomerMassMsgStatusLabels[item.mission_status]}/>}
            {(item.mission_status === 4 || item.mission_status === 5) &&
            <Badge status="warning" text={CustomerMassMsgStatusLabels[item.mission_status]}/>}
          </>
        );
      },
    },
    {
      title: '操作',
      width: 120,
      valueType: 'option',
      render: (_, item) => [
        <a
          key='notify'
          onClick={() => {
            Modal.confirm({
              title: `发送提醒通知`,
              content: `确认后将会给所有未发送成员发送提醒通知，是否发送？`,
              okText: '确定',
              okType: 'default',
              cancelText: '取消',
              onOk() {
                return HandleRequest({ids: [item.id]}, Notify, () => {
                  actionRef.current?.clearSelected?.();
                  actionRef.current?.reload?.();
                });
              },
            });
          }}
        >
          提醒发送
        </a>,
        item.send_type === 1 ? <></> : <a
          key='edit'
          onClick={() => {
            history.push(`/staff-admin/customer-conversion/customer-mass-msg/edit?id=${item.id}`);
          }}
        >
          修改
        </a>,
        item.mission_status === 1 && item.send_type === 2 ? <a
          key='delete'
          onClick={() => {
            Modal.confirm({
              title: `删除欢迎语`,
              content: `是否确认删除「${item.msg.text}」群发？`,
              okText: '删除',
              okType: 'danger',
              cancelText: '取消',
              onOk() {
                return HandleRequest({ids: [item.id]}, Delete, () => {
                  actionRef.current?.clearSelected?.();
                  actionRef.current?.reload?.();
                });
              },
            });
          }}
        >
          删除
        </a> : <></>,
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
          icon={<PlusOutlined style={{fontSize: 16, verticalAlign: '-3px'}}/>}
          onClick={() => {
            history.push('/staff-admin/customer-conversion/customer-mass-msg/create');
          }}
        >
          添加群发
        </Button>,
      ]}
    >

      <ProTable<CustomerMassMsgItem>
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
            已选择 <a style={{fontWeight: 600}}>{selectedItems.length}</a> 项 &nbsp;&nbsp;
            <span></span>
          </span>
          <Divider type='vertical'/>
          <Button
            type='link'
            onClick={() => {
              actionRef.current?.clearSelected?.();
            }}
          >
            取消选择
          </Button>
          <Button
            type={'dashed'}
            icon={<NotificationOutlined/>}
            onClick={async () => {
              Modal.confirm({
                title: `发送提醒通知`,
                content: `确认后将会给所有未发送成员发送提醒通知，是否发送？`,
                okText: '确定',
                okType: 'default',
                cancelText: '取消',
                onOk() {
                  return HandleRequest(
                    {ids: selectedItems.map((item) => item.id)},
                    Notify,
                    () => {
                      actionRef.current?.clearSelected?.();
                      actionRef.current?.reload?.();
                    },
                  );
                },
              });
            }}
          >
            批量提醒发送
          </Button>
        </FooterToolbar>
      )}

      <AutoReplyPreviewModal visible={previewModalVisible} setVisible={setPreviewModalVisible} autoReply={autoReply}/>

    </PageContainer>
  );
};

export default CustomerMassMsgList;
