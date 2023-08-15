import React, {useEffect, useRef, useState} from 'react';
import {PageContainer} from '@ant-design/pro-layout';
import {Button, Space} from 'antd';
import type {ActionType, ProColumns} from '@ant-design/pro-table';
import ProTable from '@ant-design/pro-table';
import type {CustomerLossNotifyRuleInterface} from '@/pages/StaffAdmin/CustomerLoss/service';
import {
  ExportCustomerLoss,
  GetCustomerLossNotifyRule,
  QueryCustomerLoss,
  UpdateCustomerLossNotifyRule,
} from '@/pages/StaffAdmin/CustomerLoss/service';
import {HandleRequest, ProTableRequestAdapter} from '@/utils/utils';
import styles from './index.less';
import moment from 'moment';
import type {CustomerLossItem} from '@/pages/StaffAdmin/CustomerLoss/data';
import {CloudDownloadOutlined, SettingOutlined} from '@ant-design/icons';
import {message} from 'antd/es';
import {ModalForm, ProFormSwitch} from '@ant-design/pro-form';
import {False, True} from '../../../../config/constant';
import StaffTreeSelect from '@/pages/StaffAdmin/Components/Fields/StaffTreeSelect';
import NumberRangeInput from '@/pages/StaffAdmin/Components/Fields/NumberRangeInput';
import type {SimpleStaffInterface} from '@/services/staff';
import {QuerySimpleStaffs} from '@/services/staff';
import type {StaffOption} from '@/pages/StaffAdmin/Components/Modals/StaffTreeSelectionModal';
import FileSaver from 'file-saver';
import type {FormInstance} from 'antd/es/form';
import CollapsedTags from '@/pages/StaffAdmin/Components/Columns/CollapsedTags';
import {history} from "@@/core/history";

const CustomerLossList: React.FC = () => {
  // const [currentItem, setCurrentItem] = useState<CustomerLossItem>({});
  // const [selectedItems, setSelectedItems] = useState<CustomerLossItem[]>([]);
  const [settingsModalVisible, setSettingsModalVisible] = useState<boolean>(false);
  const [exportLoading, setExportLoading] = useState<boolean>(false);
  const [settings, setSettings] = useState<CustomerLossNotifyRuleInterface>();
  const [extraFilterParams, setExtraFilterParams] = useState<any>();
  const [allStaffs, setAllStaffs] = useState<StaffOption[]>([]);
  const actionRef = useRef<ActionType>();
  const queryFormRef = useRef<FormInstance>();

  const formattedParams = (originParams: any) => {
    const params = {...originParams, ...extraFilterParams};
    if (params.customer_delete_staff_at) {
      [params.loss_start, params.loss_end] = params.customer_delete_staff_at;
      delete params.customer_delete_staff_at;
    }

    if (params.relation_create_at) {
      [params.connection_create_start, params.connection_create_end] = params.relation_create_at;
      delete params.relation_create_at;
    }

    if (params.ext_staff_id) {
      params.ext_staff_ids = params.ext_staff_id;
      delete params.ext_staff_id;
    }

    if (params.in_connection_time_range) {
      [params.time_span_lower_limit,params.time_span_upper_limit]=params.in_connection_time_range;
      delete params.in_connection_time_range;
    }

    return params;
  };

  useEffect(() => {
    QuerySimpleStaffs({page_size: 5000}).then((res) => {
      if (res.code === 0) {
        setAllStaffs(
          res?.data?.items?.map((item: SimpleStaffInterface) => {
            return {
              label: item.name,
              value: item.ext_id,
              ...item,
            };
          }) || [],
        );
      } else {
        message.error(res.message);
      }
    });
  }, []);

  useEffect(() => {
    GetCustomerLossNotifyRule()
      .then((resp) => {
        if (resp && resp.data) {
          const item = resp.data as CustomerLossNotifyRuleInterface;
          setSettings(item);
        }
      })
      .catch((err) => {
        message.error(err);
      });
  }, []);

  const columns: ProColumns<CustomerLossItem>[] = [
    {
      title: '流失客户',
      dataIndex: 'ext_customer_name',
      valueType: 'text',
      hideInSearch: true,
      render: (dom, item) => {
        return (
          <div className={'customer-info-field'}>
            <img
              src={item.customer_avatar}
              className={'icon'}
              alt={item.ext_customer_name}
            />
            <div className={'text-group'}>
              <p className={'text'}>
                {item.ext_customer_name}
              </p>
              {item.customer_corp_name && (
                <p className={'text'} style={{ color: '#eda150' }}>@{item.customer_corp_name}</p>
              )}
              {item.customer_type === 1 && (
                <p className={'text'} style={{ color: '#5ec75d' }}>@微信</p>
              )}
            </div>
          </div>
        );
      },
    },
    {
      title: '所属客服',
      dataIndex: 'ext_staff_id',
      valueType: 'text',
      renderFormItem: () => {
        return <StaffTreeSelect options={allStaffs}/>;
      },
      render: (dom, item) => {
        return (
          <Space>
            <div className={styles.staffTag}>
              <img src={item.staff_avatar} className={styles.icon} alt={item.staff_name}/>
              <span className={styles.text}>{item.staff_name}</span>
            </div>
          </Space>
        );
      },
    },
    {
      title: '客户标签',
      dataIndex: 'tags',
      valueType: 'text',
      hideInSearch: true,
      render: (dom, item) => {
        return <CollapsedTags limit={3} tags={item.tags}/>;
      },
    },

    {
      title: '流失时间',
      dataIndex: 'customer_delete_staff_at',
      valueType: 'dateRange',
      sorter: true,
      filtered: true,
      render: (dom, item) => {
        return (
          <div
            dangerouslySetInnerHTML={{
              __html: moment(item.customer_delete_staff_at)
                .format('YYYY-MM-DD HH:mm')
                .split(' ')
                .join('<br />'),
            }}
          />
        );
      },
    },
    {
      title: '添加时间',
      dataIndex: 'relation_create_at',
      valueType: 'dateRange',
      sorter: true,
      filtered: true,
      render: (dom, item) => {
        return (
          <div
            dangerouslySetInnerHTML={{
              __html: moment(item.relation_create_at)
                .format('YYYY-MM-DD HH:mm')
                .split(' ')
                .join('<br />'),
            }}
          />
        );
      },
    },
    {
      title: '添加时长',
      dataIndex: 'in_connection_time_range',
      valueType: 'text',
      sorter: true,
      renderFormItem: () => {
        return <NumberRangeInput formRef={queryFormRef} label={'天数'}/>;
      },
      render: (dom, item) => {
        return <span>{item.in_connection_time_range}天</span>;
      },
    },
    {
      title: '操作',
      width: 180,
      valueType: 'option',
      render: (__, item) => [
        <a
          key='detail'
          onClick={() => {
            history.push(`/staff-admin/customer-management/customer/detail?ext_customer_id=${item.ext_customer_id}`);
          }}
        >
          客户详情
        </a>,
      ],
    },
  ];

  return (
    <PageContainer
      fixedHeader
      header={{
        title: '客户流失',
        subTitle: (
          <a
            target={'_blank'}
            className={styles.tipsLink}
            // href={'https://www.openscrm.cn/wiki/contact-way'}
          >
            如何添加授权成员？
          </a>
        ),
      }}
      extra={[
        <Button
          key={'settings'}
          type='dashed'
          icon={<SettingOutlined style={{fontSize: 16, verticalAlign: '-3px'}}/>}
          onClick={() => {
            setSettingsModalVisible(true);
          }}
        >
          设置
        </Button>,

        <Button
          key={'export'}
          type='dashed'
          loading={exportLoading}
          icon={<CloudDownloadOutlined style={{fontSize: 16, verticalAlign: '-3px'}}/>}
          onClick={async () => {
            setExportLoading(true);
            try {
              const content = await ExportCustomerLoss(
                formattedParams(queryFormRef.current?.getFieldsValue()),
              );
              const blob = new Blob([content], {
                type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
              });
              FileSaver.saveAs(blob, `客户流失记录.xlsx`);
            } catch (e) {
              console.log(e);
              message.error('导出失败');
            }
            setExportLoading(false);
          }}
        >
          导出Excel
        </Button>,
      ]}
    >
      <ProTable<CustomerLossItem>
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
            QueryCustomerLoss,
          );
        }}
        dateFormatter='string'
      />

      <ModalForm
        width={400}
        className={'dialog from-item-label-100w'}
        layout={'horizontal'}
        visible={settingsModalVisible}
        onVisibleChange={setSettingsModalVisible}
        onFinish={async (values) => {
          return await HandleRequest(
            {is_notify_staff: values.is_notify_staff ? True : False},
            UpdateCustomerLossNotifyRule,
            () => {
              actionRef.current?.clearSelected?.();
              actionRef.current?.reload?.();
            },
          );
        }}
      >
        <h2 className='dialog-title'> 流失提醒设置 </h2>
        <ProFormSwitch
          label={'客户流失提醒：'}
          checkedChildren='开启'
          unCheckedChildren='关闭'
          name='is_notify_staff'
          initialValue={settings?.is_notify_staff === True}
          tooltip={'开启后，当企业成员联系人被客户删除时，被删除的企业成员将收到一条消息提醒'}
        />
      </ModalForm>
    </PageContainer>
  );
};

export default CustomerLossList;
