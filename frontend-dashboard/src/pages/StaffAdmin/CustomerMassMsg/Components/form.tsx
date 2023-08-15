import React, {useEffect, useRef, useState} from 'react';
import {Alert, Badge, Button, Divider, Form, message, Space, Typography} from 'antd';
import ProForm, {
  ProFormDateRangePicker,
  ProFormDateTimePicker,
  ProFormDependency,
  ProFormRadio,
} from '@ant-design/pro-form';
import type {CreateCustomerMassMsgParam, CustomerMassMsgItem, Msg} from '@/pages/StaffAdmin/CustomerMassMsg/data';
import type {ProFormProps} from '@ant-design/pro-form/lib/layouts/ProForm';
import styles from './form.less';
import {CloseCircleOutlined, PlusOutlined} from '@ant-design/icons';
import type {StaffOption} from '@/pages/StaffAdmin/Components/Modals/StaffTreeSelectionModal';
import StaffTreeSelectionModal from '@/pages/StaffAdmin/Components/Modals/StaffTreeSelectionModal';
import {Disable, Enable} from '../../../../../config/constant';
import AutoReply from '@/pages/StaffAdmin/Components/Fields/AutoReply';
import CustomerTagSelect from '@/pages/StaffAdmin/Components/Fields/CustomerTagSelect';
import type {CustomerTagGroupItem} from '@/pages/StaffAdmin/CustomerTag/data';
import {QueryCustomerTagGroups} from '@/services/customer_tag_group';
import GroupChatSelect from '@/pages/StaffAdmin/Components/Fields/GroupChatSelect';
import type {GroupChatMainInfoItem} from '@/services/group_chat';
import {QueryGroupChatMainInfo} from '@/services/group_chat';
import type {GroupChatOption} from '@/pages/StaffAdmin/Components/Modals/GroupChatSelectionModal';
import type {CommonResp} from '@/services/common';
import {QuerySimpleStaffs} from '@/services/staff';
import type {Dictionary} from 'lodash';
import _ from 'lodash';

export type CustomerMassMsgFormProps = Omit<ProFormProps, 'onFinish' | 'visible' | 'initialValues'> & {
  mode: 'create' | 'edit' | 'copy';
  onFinish: (params: any) => void;
  initialValues?: CustomerMassMsgItem;
};

const CustomerMassMsgForm: React.FC<CustomerMassMsgFormProps> = (props) => {
  const {initialValues} = props;
  const staffSelectRef = useRef<HTMLInputElement>(null);
  const [selectedStaffs, setSelectedStaffs] = useState<StaffOption[]>([]);
  const [staffSelectionVisible, setStaffSelectionVisible] = useState(false);
  const [isFetchDone, setIsFetchDone] = useState(false);
  const [massMsg, setMassMsg] = useState<Msg>({text: ''});
  const [allTagGroups, setAllTagGroups] = useState<CustomerTagGroupItem[]>([]);
  const [allGroupChats, setAllGroupChats] = useState<GroupChatOption[]>([]);
  const [tagLogicalCondition, setTagLogicalCondition] = useState<'and' | 'or' | 'none'>('or');
  const [allStaffs, setAllStaffs] = useState<StaffOption[]>([]);
  const [staffMap, setStaffMap] = useState<Dictionary<StaffOption>>();

  useEffect(() => {
    QuerySimpleStaffs({page_size: 5000}).then((res) => {
      if (res.code === 0) {
        setAllStaffs(res?.data?.items || []);
        setStaffMap(_.keyBy<any>(res?.data?.items, 'ext_id'));
      } else {
        message.error(res.message);
      }
    });
  }, []);


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
    QueryGroupChatMainInfo({page_size: 5000}).then((res: CommonResp) => {
      if (res.code === 0) {
        setAllGroupChats(
          res.data?.items?.map((item: GroupChatMainInfoItem) => {
            return {
              key: item.ext_chat_id,
              label: item.name,
              value: item.ext_chat_id,
              ...item,
            };
          }).filter((item: { name: any; }) => item.name),
        );
      } else {
        message.error(res.message);
      }
    });
  }, []);


  const itemDataToFormValues = (item: CustomerMassMsgItem | any): CreateCustomerMassMsgParam => {
    let values: CreateCustomerMassMsgParam = {
      ...item,
      id: item.id,
      ext_staff_ids: item?.staffs?.map((staff: any) => staff.ext_id),
    };

    if (item?.ext_staff_ids) {
      setSelectedStaffs(
        item?.ext_staff_ids.map((ext_staff_id: string) => {
          let staffInfo = {};
          if (staffMap && staffMap[ext_staff_id]) {
            staffInfo = staffMap[ext_staff_id]
          }
          return {
            ...staffInfo,
            key: ext_staff_id,
            value: ext_staff_id,
          };
        }),
      );
    }

    if (item.msg) {
      setMassMsg(item.msg);
    }

    values = {
      ...values, ...{
        gender: item?.ext_customer_filter?.gender,
        date_range: [item?.ext_customer_filter?.start_time, item?.ext_customer_filter?.end_time],
        ext_group_chat_ids: item?.ext_customer_filter?.ext_group_chat_ids,
        ext_department_ids: item?.ext_customer_filter?.ext_department_ids,
        ext_tag_ids: item?.ext_customer_filter?.ext_tag_ids,
        tag_logical_condition: item?.ext_customer_filter?.tag_logical_condition,
        exclude_ext_tag_ids: item?.ext_customer_filter?.exclude_ext_tag_ids,
      }
    };

    return values;
  };

  useEffect(() => {
    if (initialValues?.id) {
      props?.formRef?.current?.setFieldsValue(itemDataToFormValues(initialValues));
      setIsFetchDone(true);
    }
  }, [initialValues, staffMap]);

  const formatParams = (values: any) => {
    const params: CreateCustomerMassMsgParam = {
      id: initialValues?.id || '',
      chat_type: 'single',
      ext_customer_filter_enable: values?.ext_customer_filter_enable,
      ext_department_ids: [],
      ext_staff_ids: selectedStaffs.map((staff) => staff.ext_id) || [],
      msg: massMsg,
      send_at: values?.send_at,
      send_type: values?.send_type,
    };
    if (params.ext_customer_filter_enable === Enable) {
      params.ext_customer_filter = {
        gender: values?.gender,
        start_time: values?.da,
        end_time: values?.end_time,
        ext_group_chat_ids: values?.ext_group_chat_ids,
        ext_department_ids: values?.ext_department_ids,
        ext_tag_ids: values?.ext_tag_ids,
        tag_logical_condition: tagLogicalCondition,
        exclude_ext_tag_ids: values?.exclude_ext_tag_ids,
      };

      if (values?.date_range) {
        [params.ext_customer_filter.start_time, params.ext_customer_filter.end_time] = values?.date_range;
      }
    }
    return params;
  };

  const checkForm = (values: any): boolean => {
    if (values?.ext_staff_ids?.length === 0) {
      message.warning('请选择使用员工');
      staffSelectRef?.current?.focus();
      return false;
    }
    if (values?.msg?.text === '') {
      message.warning('请填写群发内容');
      return false;
    }
    return true;
  };

  // @ts-ignore
  return (
    <>
      <ProForm
        className={styles.content}
        labelCol={{
          md: 3,
        }}
        layout={'horizontal'}
        formRef={props.formRef}
        onFinish={async (values: any) => {
          const params = formatParams(values);
          if (!checkForm(params)) {
            return false;
          }
          console.log(params);
          return props.onFinish(params);
        }}
      >
        <>
          <h3>基础信息</h3>
          <Divider/>
          <Alert
            showIcon={true}
            style={{maxWidth: '800px', marginBottom: 20}}
            type='warning'
            message={(
              <Typography.Text style={{color: 'rgba(66,66,66,0.8)'}}>客户每个月最多接收来自同一企业的管理员的 4
                条群发消息，4条消息可在同一天发送</Typography.Text>
            )}
          />

          <ProFormRadio.Group
            name='send_type'
            label='群发时机'
            initialValue={1}
            options={[
              {
                label: '立即发送',
                value: 1,
              },
              {
                label: '定时发送',
                value: 2,
              },
            ]}
            rules={[
              {
                required: true,
                message: '请选择群发时机',
              },
            ]}
          />

          <ProFormDependency name={['send_type']}>
            {({send_type}) => {
              if (send_type === 2) {
                return (
                  <ProFormDateTimePicker
                    name='send_at'
                    label='发送时间'
                    rules={[
                      {
                        required: true,
                        message: '请选择发送时间',
                      },
                    ]}
                  />
                );
              }
              return '';
            }}
          </ProFormDependency>

          <Form.Item
            label={<span className={'form-item-required'}>群发账号</span>}
          >
            <Button
              ref={staffSelectRef}
              icon={<PlusOutlined/>}
              onClick={() => setStaffSelectionVisible(true)}
            >
              选择员工
            </Button>
          </Form.Item>

          <Space wrap={true} style={{marginTop: -12, marginBottom: 24, marginLeft: 20}}>
            {selectedStaffs.map((item) => (
              <div key={item.id} className={'staff-item'}>
                <Badge
                  count={
                    <CloseCircleOutlined
                      onClick={() => {
                        setSelectedStaffs(
                          selectedStaffs.filter((staff) => staff.id !== item.id),
                        );
                      }}
                      style={{color: 'rgb(199,199,199)'}}
                    />
                  }
                >
                  <div className={'container'}>
                    <img alt={item.name} className={'avatar'} src={item.avatar_url}/>
                    <span className={'text'}>{item.name}</span>
                  </div>
                </Badge>
              </div>
            ))}
          </Space>

          <ProFormRadio.Group
            name='ext_customer_filter_enable'
            label='目标客户'
            initialValue={2}
            options={[
              {
                label: '全部客户',
                value: Disable,
              },
              {
                label: '筛选客户',
                value: Enable,
              },
            ]}
            rules={[
              {
                required: true,
                message: '请选择目标客户',
              },
            ]}
          />
          <ProFormDependency name={['ext_customer_filter_enable']}>
            {({ext_customer_filter_enable}) => {
              if (ext_customer_filter_enable === Enable) {
                return (
                  <div className={styles.multiFormItemSection}>
                    <ProFormRadio.Group
                      name='gender'
                      label='性别'
                      initialValue={0}
                      options={[
                        {
                          label: '全部',
                          value: 0,
                        },
                        {
                          label: '仅男粉丝',
                          value: 1,
                        },
                        {
                          label: '仅女粉丝',
                          value: 2,
                        },
                        {
                          label: '未知性别',
                          value: 3,
                        },
                      ]}
                    />

                    <ProForm.Item label={'所在群聊'} name={'ext_group_chat_ids'}>
                      <GroupChatSelect
                        placeholder={'请选择群聊'}
                        allGroupChats={allGroupChats}
                        maxTagCount={4}/>
                    </ProForm.Item>

                    <ProFormDateRangePicker name='date_range' label='添加时间'/>

                    <ProForm.Item label={'目标客户'} name={'ext_tag_ids'}>
                      <CustomerTagSelect
                        withLogicalCondition={true}
                        logicalCondition={tagLogicalCondition}
                        setLogicalCondition={setTagLogicalCondition}
                        placeholder={'按标签选择客户'}
                        allTagGroups={allTagGroups}
                        maxTagCount={4}/>
                    </ProForm.Item>

                    <ProForm.Item label={'排除客户'} name={'exclude_ext_tag_ids'}>
                      <CustomerTagSelect
                        placeholder={'按标签排除客户'}
                        allTagGroups={allTagGroups}
                        maxTagCount={4}/>
                    </ProForm.Item>

                  </div>
                );
              }
              return '';
            }}
          </ProFormDependency>

          <h3>群发设置</h3>
          <Divider/>

          <Form.Item
            label={<span className={'form-item-required'}>群发内容</span>}
            style={{marginBottom: 36}}
          >
            <AutoReply welcomeMsg={massMsg} isFetchDone={isFetchDone} setWelcomeMsg={setMassMsg}/>
          </Form.Item>

        </>
      </ProForm>

      <StaffTreeSelectionModal
        visible={staffSelectionVisible}
        setVisible={setStaffSelectionVisible}
        defaultCheckedStaffs={selectedStaffs}
        onFinish={(values) => {
          setSelectedStaffs(values);
        }}
        allStaffs={allStaffs}
      />
    </>
  );
};

export default CustomerMassMsgForm;
