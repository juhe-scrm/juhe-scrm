import React, {useEffect, useRef, useState} from 'react';
import {FooterToolbar, PageContainer} from '@ant-design/pro-layout';
import {Button, Divider} from 'antd';
import type {ActionType, ProColumns} from '@ant-design/pro-table';
import ProTable from '@ant-design/pro-table';
import {ExportCustomer, QueryCustomer, UpdateCustomerTags} from '@/pages/StaffAdmin/Customer/service';
import {HandleRequest, ProTableRequestAdapter} from '@/utils/utils';
import styles from './index.less';
import moment from 'moment';
import type {CustomerItem} from '@/pages/StaffAdmin/Customer/data';
import {CloudDownloadOutlined, SyncOutlined, TagOutlined} from '@ant-design/icons';
import {message} from 'antd/es';
import StaffTreeSelect from '@/pages/StaffAdmin/Components/Fields/StaffTreeSelect';
import type {SimpleStaffInterface} from '@/services/staff';
import {QuerySimpleStaffs} from '@/services/staff';
import type {StaffOption} from '@/pages/StaffAdmin/Components/Modals/StaffTreeSelectionModal';
import FileSaver from 'file-saver';
import type {FormInstance} from 'antd/es/form';
import type {CommonResp} from '@/services/common';
import {Sync} from '@/pages/StaffAdmin/CustomerTag/service';
import type {CustomerTagGroupItem} from '@/pages/StaffAdmin/CustomerTag/data';
import {history} from '@@/core/history';
import {QueryCustomerTagGroups} from '@/services/customer_tag_group';
import type {Dictionary} from 'lodash';
import _ from 'lodash';
import type {StaffItem} from '@/pages/StaffAdmin/Components/Columns/CollapsedStaffs';
import CollapsedStaffs from '@/pages/StaffAdmin/Components/Columns/CollapsedStaffs';
import CustomerTagSelectionModal from '@/pages/StaffAdmin/Components/Modals/CustomerTagSelectionModal';
import CollapsedTags from '@/pages/StaffAdmin/Components/Columns/CollapsedTags';
import CustomerTagSelect from '@/pages/StaffAdmin/Components/Fields/CustomerTagSelect';

const addWayEnums = {
  // 添加此客户的来源
  0: '未知来源',
  1: '扫描二维码',
  2: '搜索手机号',
  3: '名片分享',
  4: '群聊',
  5: '手机通讯录',
  6: '微信联系人',
  7: '来自好友申请',
  8: '第三方应用客服人员',
  9: '搜索邮箱',
  201: '内部成员共享',
  202: '管理员/负责人分配',
};
export {addWayEnums};

const CustomerList: React.FC = () => {
  const [exportLoading, setExportLoading] = useState<boolean>(false);
  const [extraFilterParams] = useState<any>();// setExtraFilterParams
  const [allStaffs, setAllStaffs] = useState<StaffOption[]>([]);
  const [staffMap, setStaffMap] = useState<Dictionary<StaffOption>>({});
  const actionRef = useRef<ActionType>();
  const queryFormRef = useRef<FormInstance>();
  const [syncLoading, setSyncLoading] = useState<boolean>(false);
  const [selectedItems, setSelectedItems] = useState<CustomerItem[]>([]);
  const [allTagGroups, setAllTagGroups] = useState<CustomerTagGroupItem[]>([]);
  const [batchTagModalVisible, setBatchTagModalVisible] = useState<boolean>(false);

  const formattedParams = (originParams: any) => {
    const params = {...originParams, ...extraFilterParams};
    if (params.created_at) {
      [params.start_time, params.end_time] = params.created_at;
      delete params.created_at;
    }

    if (params.relation_create_at) {
      [params.connection_create_start, params.connection_create_end] = params.relation_create_at;
      delete params.relation_create_at;
    }

    if (params.add_way) {
      params.channel_type = params.add_way;
      delete params.add_way;
    }

    return params;
  };

  useEffect(() => {
    QueryCustomerTagGroups({page_size: 5000}).then((res) => {
      if (res.code === 0) {
        setAllTagGroups(res?.data?.items);
      } else {
        message.error(res.message);
      }
    });
  }, []);

  useEffect(() => {
    QuerySimpleStaffs({page_size: 5000}).then((res) => {
      if (res.code === 0) {
        const staffs = res?.data?.items?.map((item: SimpleStaffInterface) => {
          return {
            label: item.name,
            value: item.ext_id,
            ...item,
          };
        }) || [];
        setAllStaffs(staffs);
        setStaffMap(_.keyBy<StaffOption>(staffs, 'ext_id'));
      } else {
        message.error(res.message);
      }
    });
  }, []);

  const columns: ProColumns<CustomerItem>[] = [
    {
      fixed: 'left',
      title: '客户名',
      dataIndex: 'name',
      valueType: 'text',
      render: (dom, item) => {
        return (
          <div className={'customer-info-field'}>
            <a key='detail' onClick={() => {
              history.push(`/staff-admin/customer-management/customer/detail?ext_customer_id=${item.ext_customer_id}`);
            }}>
              <img
                src={item.avatar}
                className={'icon'}
                alt={item.name}
              />
            </a>
            <div className={'text-group'}>
              <p className={'text'}>
                {item.name}
              </p>
              {item.corp_name && (
                <p className={'text'} style={{color: '#eda150'}}>@{item.corp_name}</p>
              )}
              {item.type === 1 && (
                <p className={'text'} style={{color: '#5ec75d'}}>@微信</p>
              )}
            </div>
          </div>
        );
      },
    },
    {
      title: '添加人',
      dataIndex: 'ext_staff_ids',
      valueType: 'text',
      width: 200,
      renderFormItem: () => {
        return (
          <StaffTreeSelect options={allStaffs} maxTagCount={4}/>
        );
      },
      render: (dom, item) => {
        const staffs: StaffItem[] = [];
        item?.staff_relations?.forEach((staff_relation) => {
          // @ts-ignore
          const staff = staffMap[staff_relation.ext_staff_id];
          if (staff) {
            staffs.push(staff);
          }
        });
        return (
          <CollapsedStaffs limit={2} staffs={staffs}/>
        );
      },
    },
    {
      title: '标签',
      dataIndex: 'ext_tag_ids',
      valueType: 'text',
      hideInSearch: false,
      renderFormItem: () => {
        return (
          <CustomerTagSelect isEditable={false} allTagGroups={allTagGroups} maxTagCount={6}/>
        );
      },
      render: (dom, item) => {
        const tags: any[] = [];
        item.staff_relations?.forEach((relation) => {
          if (relation.ext_staff_id === localStorage.getItem('extStaffAdminID')) {
            relation.customer_staff_tags?.forEach((tag) => {
              tags.push(tag);
            });
          }
        });
        return <CollapsedTags limit={6} tags={tags}/>;
      },
    },

    {
      title: '添加时间',
      dataIndex: 'created_at',
      valueType: 'dateRange',
      sorter: true,
      filtered: true,
      render: (dom, item) => {
        if (item.staff_relations && item.staff_relations.length > 0) {
          const staff_relation = item.staff_relations[0];
          return (
            <div className={styles.staffTag}
                 dangerouslySetInnerHTML={{
                   __html: moment(staff_relation.createtime)
                     .format('YYYY-MM-DD HH:mm')
                     .split(' ')
                     .join('<br />'),
                 }}
            />
          );
        }
        return <></>;
      },

    },

    {
      title: '更新时间',
      dataIndex: ' updated_at',
      valueType: 'dateRange',
      // sorter: true,
      filtered: true,
      hideInSearch: true,
      render: (dom, item) => {
        return (
          <div
            dangerouslySetInnerHTML={{
              __html: moment(item.updated_at)
                .format('YYYY-MM-DD HH:mm')
                .split(' ')
                .join('<br />'),
            }}
          />
        );
      },
    },

    {
      title: '添加渠道',
      dataIndex: 'add_way',
      valueType: 'select',
      valueEnum: addWayEnums,
      // width: 220,
      render: (dom, item) => {
        return <span>{item.staff_relations?.map((para) => {
          return (`${addWayEnums[para.add_way || 0]}\n`);
        })}</span>;
      },
    },

    {
      title: '性别',
      dataIndex: 'gender',
      valueType: 'select',
      hideInTable: true,
      valueEnum: {
        1: '男',
        2: '女',
        3: '未知',
        0: '不限',
      },
    },

    {
      title: '账号类型',
      dataIndex: 'type',
      valueType: 'select',
      hideInTable: true,
      valueEnum: {
        1: '微信',
        2: '企业微信',
        0: '不限',
      },
    },

    {
      title: '流失状态',
      dataIndex: 'out_flow_status',
      valueType: 'select',
      hideInTable: true,
      hideInSearch: false,
      tooltip: '员工授权后的流失客户',
      valueEnum: {
        1: '已流失',
        2: '未流失',
      },
    },

    {
      title: '操作',
      width: 120,
      valueType: 'option',
      render: (dom, item) => [
        <a key='detail' onClick={() => {
          history.push(`/staff-admin/customer-management/customer/detail?ext_customer_id=${item.ext_customer_id}`);
        }}
        >详情</a>,
      ],
    },
  ];

  return (
    <PageContainer
      fixedHeader
      header={{
        title: '客户管理',
      }}
      extra={[
        <Button
          key={'export'}
          type='dashed'
          loading={exportLoading}
          icon={<CloudDownloadOutlined style={{fontSize: 16, verticalAlign: '-3px'}}/>}
          onClick={async () => {
            setExportLoading(true);
            try {
              const content = await ExportCustomer(
                formattedParams(queryFormRef.current?.getFieldsValue()),
              );
              const blob = new Blob([content], {
                type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
              });
              FileSaver.saveAs(blob, `客户数据列表.xlsx`);
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
          icon={<SyncOutlined style={{fontSize: 16, verticalAlign: '-3px'}}/>}
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

      <ProTable
        rowSelection={{
          onChange: (__, items) => {
            setSelectedItems(items);
          },
        }}
        formRef={queryFormRef}
        actionRef={actionRef}
        className={'table'}
        scroll={{x: 'max-content'}}
        columns={columns}
        rowKey='id'
        pagination={{
          pageSizeOptions: ['5', '10', '20', '50', '100'],
          pageSize: 5,
        }}
        toolBarRender={false}
        bordered={false}
        tableAlertRender={false}
        params={{}}
        request={async (originParams: any, sort, filter) => {
          const res = ProTableRequestAdapter(
            formattedParams(originParams),
            sort,
            filter,
            QueryCustomer,
          );
          console.log(await res);
          return await res;
        }}
        dateFormatter='string'
      />

      {selectedItems?.length > 0 && (
        // 底部选中条目菜单栏
        <FooterToolbar>
          <span>
            已选择 <a style={{fontWeight: 600}}>{selectedItems.length}</a> 项 &nbsp;&nbsp;
          </span>
          <Divider type='vertical'/>
          <Button
            icon={<TagOutlined/>}
            type={'dashed'}
            onClick={() => {
              setBatchTagModalVisible(true);
            }}
          >
            批量打标签
          </Button>

        </FooterToolbar>
      )}

      <CustomerTagSelectionModal
        width={'630px'}
        visible={batchTagModalVisible}
        setVisible={setBatchTagModalVisible}
        onFinish={async (selectedTags) => {
          const selectedExtTagIDs = selectedTags.map((selectedTag) => selectedTag.ext_id);
          const selectedExtCustomerIDs = selectedItems.map((customer) => customer.ext_customer_id);
          await HandleRequest({
            add_ext_tag_ids: selectedExtTagIDs,
            ext_customer_ids: selectedExtCustomerIDs,
          }, UpdateCustomerTags, () => {
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

export default CustomerList;
