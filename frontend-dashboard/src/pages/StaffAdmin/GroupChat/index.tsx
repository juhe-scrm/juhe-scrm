import React, { useEffect, useRef, useState } from 'react'; // useEffect,
import { FooterToolbar, PageContainer } from '@ant-design/pro-layout';
import { Button, Divider } from 'antd';
import type { ActionType, ProColumns } from '@ant-design/pro-table';
import ProTable from '@ant-design/pro-table';
import {
  ExportCustomerGroupsList,
  QueryCustomerGroupsList,
  UpdateGroupChatTags,
} from '@/pages/StaffAdmin/GroupChat/service';
import { HandleRequest, ProTableRequestAdapter } from '@/utils/utils';
import moment from 'moment';
import type { GroupChatItem } from '@/pages/StaffAdmin/GroupChat/data';
import { CloudDownloadOutlined, SyncOutlined, TagOutlined } from '@ant-design/icons';
import { message } from 'antd/es';
import FileSaver from 'file-saver';
import type { FormInstance } from 'antd/es/form';
import type { CommonResp } from '@/services/common';
import { Sync } from '@/pages/StaffAdmin/CustomerTag/service';
import GroupChatIcon from '../../../assets/group-chat.svg';
import StaffTreeSelect from '@/pages/StaffAdmin/Components/Fields/StaffTreeSelect';
import type { StaffOption } from '@/pages/StaffAdmin/Components/Modals/StaffTreeSelectionModal';
import type { SimpleStaffInterface } from '@/services/staff';
import { QuerySimpleStaffs } from '@/services/staff';
import CollapsedTags from '@/pages/StaffAdmin/Components/Columns/CollapsedTags';
import type { GroupChatTagGroupItem } from '@/pages/StaffAdmin/GroupChatTag/data';
import { Query } from '@/pages/StaffAdmin/GroupChatTag/service';
import GroupChatTagSelect from '../Components/Fields/GroupChatTagSelect';
import GroupChatTagSelectionModal from '@/pages/StaffAdmin/Components/Modals/GroupChatTagSelectionModal';


const CustomerGroupsListList: React.FC = () => {
  const [exportLoading, setExportLoading] = useState<boolean>(false);
  const [extraFilterParams, setExtraFilterParams] = useState<any>();
  const [allStaffs, setAllStaffs] = useState<StaffOption[]>([]);
  const actionRef = useRef<ActionType>();
  const queryFormRef = useRef<FormInstance>();
  const [syncLoading, setSyncLoading] = useState<boolean>(false);
  const [allTagGroups, setAllTagGroups] = useState<GroupChatTagGroupItem[]>([]);
  const [selectedItems, setSelectedItems] = useState<GroupChatItem[]>([]);
  const [batchTagModalVisible, setBatchTagModalVisible] = useState<boolean>(false);

  useEffect(() => {
    QuerySimpleStaffs({ page_size: 5000 }).then((res) => {
      if (res.code === 0) {
        const staffs = res?.data?.items?.map((item: SimpleStaffInterface) => {
          return {
            label: item.name,
            value: item.ext_id,
            ...item,
          };
        }) || [];
        setAllStaffs(staffs);
      } else {
        message.error(res.message);
      }
    });
  }, []);

  useEffect(() => {
    Query({ page_size: 5000 }).then((res) => {
      if (res.code === 0) {
        setAllTagGroups(res?.data?.items || []);
      } else {
        message.error(res.message);
      }
    });
  }, []);


  const formattedParams = (originParams: any) => {
    const params = { ...originParams, ...extraFilterParams };

    if (params.tag_list) {
      params.group_tag_ids = params.tag_list;
      delete params.tag_list;
    }

    if (params.create_time) {
      [params.create_time_start, params.create_time_end] = params.create_time;
      delete params.create_time;
    }

    return params;
  };

  const columns: ProColumns<GroupChatItem>[] = [
    {
      title: '群名称',
      dataIndex: 'name',
      valueType: 'text',
      fixed:'left',
      render: (dom, item) => {
        return (
          <div className={'tag-like-item'}>
            <img className={'icon'} src={GroupChatIcon} />
            <span className={'text'}>{item.name}</span>
          </div>
        );
      },
    },
    {
      title: '群主',
      dataIndex: 'owners',
      valueType: 'select',
      renderFormItem: () => {
        return (
          <StaffTreeSelect options={allStaffs} maxTagCount={4} />
        );
      },
      render: (__, item) => {
        return (
          <div className={'tag-like-item'}>
            <img className={'icon'} src={item.owner_avatar_url} />
            <span className={'text'}>{item.owner}</span>
          </div>
        );
      },
    },

    {
      title: '群标签',
      dataIndex: 'group_tag_ids',
      valueType: 'text',
      renderFormItem: () => {
        return (
          <GroupChatTagSelect isEditable={false} allTagGroups={allTagGroups} maxTagCount={6} />
        );
      },
      render: (dom, item) => {
        return <CollapsedTags limit={6} tags={item.tags} />;
      },
    },
    {
      title: '群聊状态',
      dataIndex: 'status',
      valueType: 'select',
      hideInTable: true,
      hideInSearch: false,
      valueEnum: {
        0: '未解散',
        1: '已解散',
      },
    },

    {
      title: '群人数',
      dataIndex: 'total',
      valueType: 'digit',
      hideInSearch: true,
      sorter: true,
      render: (dom, item) => {
        return <span>{item.total}</span>;
      },
    },
    {
      title: '当日入群',
      dataIndex: 'today_join_member_num',
      valueType: 'digit',
      hideInSearch: true,
      sorter: true,
      render: (dom, item) => {
        return <span>{item.today_join_member_num}</span>;
      },
    },
    {
      title: '当日退群',
      dataIndex: 'today_quit_member_num',
      valueType: 'digit',
      hideInSearch: true,
      sorter: true,
      render: (dom, item) => {
        return <span>{item.today_quit_member_num}</span>;
      },
    },

    {
      title: '创群时间',
      dataIndex: 'create_time',
      valueType: 'dateRange',
      hideInSearch: false,
      sorter: true,
      filtered: true,
      render: (dom, item) => {
        return (
          <div
            dangerouslySetInnerHTML={{
              __html: moment(item.create_time).format('YYYY-MM-DD HH:mm').split(' ').join('<br/>'),
            }}
          />
        );
      },
    },
    {
      title: '群ID',
      dataIndex: 'ext_chat_id',
      valueType: 'text',
      hideInSearch: true,
      render: (dom, item) => {
        return (
          <div className={'tag-like-item'}>
            <span className={'text'}>{item.ext_chat_id}</span>
          </div>
        );
      },
    },
  ];

  return (
    <PageContainer
      fixedHeader
      header={{
        title: '客户群列表',
      }}
      extra={[
        <Button
          key='export'
          type='dashed'
          loading={exportLoading}
          icon={<CloudDownloadOutlined style={{ fontSize: 16, verticalAlign: '-3px' }} />}
          onClick={async () => {
            setExportLoading(true);
            try {
              const content = await ExportCustomerGroupsList(
                formattedParams(queryFormRef.current?.getFieldsValue()),
              );
              const blob = new Blob([content], {
                type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
              });
              FileSaver.saveAs(blob, `客户群列表.xlsx`);
            } catch (e) {
              console.log(e);
              message.error('导出失败');
            }
            setExportLoading(false);
          }}
        >
          导出Excel
        </Button>,
        <Button
          key={'sync'}
          type='dashed'
          icon={<SyncOutlined style={{ fontSize: 16, verticalAlign: '-3px' }} />}
          loading={syncLoading}
          onClick={async () => {
            setSyncLoading(true);
            const res: CommonResp = await Sync();
            if (res.code === 0) {
              setSyncLoading(false);
              message.success('同步成功');
            } else {
              setSyncLoading(false);
              message.error(res.message);
            }
          }}
        >
          同步数据
        </Button>,
      ]}
    >
      <ProTable<GroupChatItem>
        formRef={queryFormRef}
        actionRef={actionRef}
        className={'table'}
        scroll={{ x: 'max-content' }}
        columns={columns}
        rowKey='id'
        pagination={{
          pageSizeOptions: ['5', '10', '20', '50', '100'],
          pageSize: 5,
        }}
        onReset={() => {
          setExtraFilterParams({});
        }}
        toolBarRender={false}
        bordered={false}
        tableAlertRender={false}
        params={{}}
        request={async (originParams: any, sort, filter) => {
          return ProTableRequestAdapter(
            formattedParams(originParams),
            sort,
            filter,
            QueryCustomerGroupsList,
          );
        }}
        dateFormatter='string'
        rowSelection={{
          onChange: (__, items) => {
            setSelectedItems(items);
          },
        }}
      />

      {selectedItems?.length > 0 && (
        // 底部选中条目菜单栏
        <FooterToolbar>
          <span>
            已选择 <a style={{ fontWeight: 600 }}>{selectedItems.length}</a> 项 &nbsp;&nbsp;
          </span>
          <Divider type='vertical' />
          <Button
            icon={<TagOutlined />}
            type={'dashed'}
            onClick={() => {
              setBatchTagModalVisible(true);
            }}
          >
            批量打标签
          </Button>

        </FooterToolbar>
      )}


      <GroupChatTagSelectionModal
        width={'630px'}
        visible={batchTagModalVisible}
        setVisible={setBatchTagModalVisible}
        onFinish={async (selectedTags) => {
          const selectedTagIDs = selectedTags.map((selectedTag) => selectedTag.id);
          const selectedGroupChatIDs = selectedItems.map((groupChat) => groupChat.id);
          await HandleRequest({
            add_tag_ids: selectedTagIDs,
            group_chat_ids: selectedGroupChatIDs,
          }, UpdateGroupChatTags, () => {
            // @ts-ignore
            actionRef?.current?.reloadAndRest();
            setSelectedItems([]);
          });
        }}
        allTagGroups={allTagGroups}
        isEditable={true}
        withLogicalCondition={false}
      />

    </PageContainer>
  );
};

export default CustomerGroupsListList;
