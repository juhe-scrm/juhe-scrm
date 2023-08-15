import React, {useEffect, useRef, useState} from 'react';
import {GetDetail, QueryGroup} from '@/pages/StaffAdmin/ContactWay/service';
import {message} from 'antd/es';
import type {FormInstance} from 'antd';
import {Alert, Badge, Button, Divider, Form, Row, Space, Tooltip, Typography} from 'antd';
import {Link} from 'umi';
import {CloseCircleOutlined, PlusOutlined} from '@ant-design/icons';
import ProCard from '@ant-design/pro-card';
import styles from './form.less';
import type {ProFormProps} from '@ant-design/pro-form';
import ProForm, {
  ProFormDependency,
  ProFormDigit,
  ProFormList,
  ProFormRadio,
  ProFormSelect,
  ProFormSwitch,
  ProFormText,
  ProFormTimePicker,
} from '@ant-design/pro-form';
import {DateTimeLayout, Disable, Enable, False, TimeLayout, True} from '../../../../../config/constant';
import type {StaffOption} from '../../Components/Modals/StaffTreeSelectionModal';
import StaffTreeSelectionModal from '../../Components/Modals/StaffTreeSelectionModal';
import EditableTag from '@/pages/StaffAdmin/Components/Fields/EditableTag';
import StaffTreeSelect from '@/pages/StaffAdmin/Components/Fields/StaffTreeSelect';
import type {
  ContactWayGroupItem,
  ContactWayItem,
  CreateContactWayParam,
  StaffParam,
} from '@/pages/StaffAdmin/ContactWay/data';
import moment from 'moment';
import _ from 'lodash';
import AutoReply from '@/pages/StaffAdmin/Components/Fields/AutoReply';
import type {WelcomeMsg} from '@/pages/StaffAdmin/CustomerWelcomeMsg/data';
import type {CustomerTagGroupItem} from "@/pages/StaffAdmin/CustomerTag/data";
import CustomerTagSelect from "@/pages/StaffAdmin/Components/Fields/CustomerTagSelect";

const {Text} = Typography;

const WeekdaysEnum = {
  1: '周一',
  2: '周二',
  3: '周三',
  4: '周四',
  5: '周五',
  6: '周六',
  7: '周日',
};

export type ContactWayFormProps = Omit<ProFormProps, 'onFinish' | 'visible' | 'initialValues'> & {
  mode: 'create' | 'edit' | 'copy';
  onFinish: (params: any) => void;
  staffs: StaffOption[];
  tagGroups: CustomerTagGroupItem[];
  initialValues?: ContactWayItem;
  itemID?: string;
};

const defaultValues: CreateContactWayParam = {
  daily_add_customer_limit: 0,
  group_id: '',
  name: '',
  remark: '',
  skip_verify: false,
  auto_reply_type: 3,
  auto_reply: {
    text: '',
    attachments: [],
  },
  customer_desc: '',
  customer_desc_enable: false,
  customer_remark: '',
  customer_remark_enable: false,
  daily_add_customer_limit_enable: false,
  schedule_enable: Disable,
  auto_tag_enable: false,
  customer_tag_ext_ids: [],
  staffs: [],
  backup_staffs: [],
  schedules: [
    {
      ext_staff_ids: [],
      start_time: moment('09:00:00', TimeLayout),
      end_time: moment('18:00:00', TimeLayout),
    },
  ],
  auto_skip_verify_enable: 2,
  skip_verify_start_time: moment('09:00:00', TimeLayout),
  skip_verify_end_time: moment('18:00:00', TimeLayout),
  staff_control_enable: false,
  nickname_block_enable: false,
  nickname_block_list: [],
};

const ContactWayForm: React.FC<ContactWayFormProps> = (props) => {
  const {staffs, tagGroups, initialValues, mode, ...rest} = props;
  const [staffSelectionVisible, setStaffSelectionVisible] = useState(false);
  const [selectedStaffs, setSelectedStaffs] = useState<StaffOption[]>([]);
  const [backupStaffSelectionVisible, setBackupStaffSelectionVisible] = useState(false);
  const [backupSelectedStaffs, setBackupSelectedStaffs] = useState<StaffOption[]>([]);
  const [blockNicknames, setBlockNicknames] = useState<string[]>([]);
  const [isFetchDone, setIsFetchDone] = useState(false);
  const [autoReply, setAutoReply] = useState<WelcomeMsg>({text: ''});
  const formRef = useRef<FormInstance>();
  const backupSelectRef = useRef<HTMLInputElement>(null);
  const staffSelectRef = useRef<HTMLInputElement>(null);
  const addScheduleRef = useRef<HTMLInputElement>(null);
  const [currentItem, setCurrentItem] = useState<ContactWayItem>();

  const itemDataToFormValues = (item: ContactWayItem | any): CreateContactWayParam => {
    const values: CreateContactWayParam = {
      daily_add_customer_limit: 0,
      ...item,
      id: props.itemID,
    };
    if (item.staffs) {
      setSelectedStaffs(
        item.staffs.map((staff: any) => {
          return {
            key: staff.ext_staff_id,
            label: staff.id,
            value: staff.ext_staff_id,
            ...staff,
            ext_id: staff.ext_staff_id,
          };
        }),
      );
    }

    if (item.auto_reply) {
      setAutoReply(item.auto_reply);
    }

    if (item.nickname_block_list) {
      setBlockNicknames(item.nickname_block_list);
    }

    if (item.backup_staffs) {
      setBackupSelectedStaffs(
        item.backup_staffs.map((staff: any) => {
          return {
            key: staff.ext_staff_id,
            label: staff.id,
            value: staff.ext_staff_id,
            ...staff,
            ext_id: staff.ext_staff_id,
          };
        }),
      );
    }

    const invertWeekdaysEnum = _.invert(WeekdaysEnum);

    if (item.schedules) {
      values.schedules = item.schedules.map((schedule: any) => {
        return {
          ...schedule,
          ext_staff_ids: schedule?.staffs?.map((staff: any) => staff.ext_staff_id),
          weekdays: schedule?.weekdays?.map((day: string) => invertWeekdaysEnum[day]),
          start_time: moment(schedule?.start_time, TimeLayout),
          end_time: moment(schedule?.end_time, TimeLayout),
        };
      });
    }

    // 将内置的boolean转为后端约定的数字
    Object.keys(values).forEach((key) => {
      const t = typeof values[key];
      if (
        !['schedule_enable', 'auto_skip_verify_enable'].includes(key) &&
        t === 'number' &&
        key.includes('_enable') &&
        [1, 2].includes(values[key])
      ) {
        values[key] = values[key] === True;
      }
    });

    if (!values.customer_tag_ext_ids) {
      values.customer_tag_ext_ids = [];
    }

    values.skip_verify_start_time = moment(values.skip_verify_start_time, TimeLayout);
    values.skip_verify_end_time = moment(values.skip_verify_end_time, TimeLayout);

    return values;
  };

  useEffect(() => {
    if (['edit', 'copy'].includes(mode) && props?.itemID) {
      const hide = message.loading('加载数据中');
      GetDetail(props?.itemID).then((res) => {
        hide();
        if (res.code === 0) {
          setCurrentItem(res.data);
          formRef.current?.setFieldsValue(itemDataToFormValues(res.data));
          setIsFetchDone(true);
          setAutoReply(res.data.auto_reply);
        } else {
          message.error(res.message);
        }
      });
    }
  }, [mode, props?.itemID]);

  // 校验参数
  const checkForm = (params: any): boolean => {
    if (backupSelectedStaffs.length === 0) {
      message.warning('请添加备份员工');
      backupSelectRef?.current?.focus();
      return false;
    }

    if (params.schedule_enable === Disable) {
      if (selectedStaffs.length === 0) {
        message.warning('请绑定员工');
        staffSelectRef?.current?.focus();
        return false;
      }
    }

    if (params.schedule_enable === Enable) {
      if (params.schedules.length === 0) {
        message.warning('请添加工作周期');
        addScheduleRef?.current?.focus();
        return false;
      }
    }

    return true;
  };

  // 格式化参数
  const formatParams = (origin: any): CreateContactWayParam => {
    const out = {...origin, id: props.itemID};
    // 将内置的boolean转为后端约定的数字
    Object.keys(out).forEach((key) => {
      const t = typeof out[key];
      if (t === 'boolean') {
        out[key] = out[key] ? True : False;
      }
    });

    const refStaffMap = _.keyBy(currentItem?.staffs, 'ext_staff_id');
    out.staffs = selectedStaffs.map((item): StaffParam => {
      return {
        id: refStaffMap[item.ext_id]?.id || '',
        ext_staff_id: item.ext_id,
        daily_add_customer_limit: out.daily_add_customer_limit ? out.daily_add_customer_limit : 0,
      };
    });

    const refBackupStaffMap = _.keyBy(currentItem?.backup_staffs, 'ext_staff_id');
    out.backup_staffs = backupSelectedStaffs.map((item): StaffParam => {
      return {
        id: refBackupStaffMap[item.ext_id]?.id || '',
        ext_staff_id: item.ext_id,
        daily_add_customer_limit: out.daily_add_customer_limit ? out.daily_add_customer_limit : 0,
      };
    });


    if (out.nickname_block_enable === True) {
      out.nickname_block_list = blockNicknames;
    }

    if (out.skip_verify_start_time) {
      out.skip_verify_start_time = moment(out.skip_verify_start_time, 'HH:mm')
        .format('HH:mm:ss')
        .toString();
    }

    if (out.skip_verify_end_time) {
      out.skip_verify_end_time = moment(out.skip_verify_end_time, 'HH:mm')
        .format('HH:mm:ss')
        .toString();
    }


    if (out.schedules) {
      out.schedules = out.schedules.map((schedule: any, index: number) => {
        // @ts-ignore
        const refScheduleStaffMap = _.keyBy(currentItem?.schedules[index]?.staffs, 'ext_staff_id');
        return {
          ...schedule,
          end_time: moment(schedule.end_time, DateTimeLayout).format('HH:mm:ss').toString(),
          start_time: moment(schedule.start_time, DateTimeLayout).format('HH:mm:ss').toString(),
          staffs: schedule.ext_staff_ids.map((ext_id: string) => {
            return {
              id: refScheduleStaffMap[ext_id]?.id ? refScheduleStaffMap[ext_id]?.id : '',
              daily_add_customer_limit: 0,
              ext_staff_id: ext_id,
            };
          }),
          weekdays: schedule.weekdays.map((day: string) => {
            return WeekdaysEnum[day];
          }),
        };
      });
    }

    if (autoReply) {
      out.auto_reply = autoReply;
    }

    return out;
  };

  return (
    <>
      <ProForm<ContactWayItem>
        {...rest}
        layout={'horizontal'}
        labelCol={{
          md: 4,
        }}
        className={styles.content}
        formRef={formRef}
        onFinish={async (values: any) => {
          const params = formatParams(values);
          if (!checkForm(params)) {
            return false;
          }
          if (props.onFinish) {
            return props.onFinish(params);
          }
          return false;
        }}
        initialValues={{...defaultValues, ...initialValues}}
      >
        <h3>基础信息</h3>
        <Divider/>

        <div className={styles.section}>
          <ProFormText
            labelAlign={'right'}
            width={'md'}
            name='name'
            label='渠道码名称'
            placeholder='请输入名称'
            rules={[
              {
                required: true,
                message: '请输入名称',
              },
            ]}
          />

          <ProFormSelect
            width={'md'}
            name='group_id'
            label='渠道码分组'
            placeholder='请选择分组'
            request={async () => {
              const res = await QueryGroup();
              if (res.data) {
                const items = res.data.items as ContactWayGroupItem[];
                return items.map((item) => {
                  return {label: item.name, value: item.id};
                });
              }
              return [];
            }}
            rules={[
              {
                required: true,
                message: '请选择分组',
              },
            ]}
          />

          <Form.Item
            label={<span className={'form-item-required'}>备份员工</span>}
            tooltip={'此渠道码没有活跃员工时，使用此处配置的员工兜底'}
          >
            <Button
              ref={backupSelectRef}
              icon={<PlusOutlined/>}
              onClick={() => setBackupStaffSelectionVisible(true)}
            >
              添加备用员工
            </Button>
          </Form.Item>

          <Space style={{marginTop: -12, marginBottom: 24, marginLeft: 20}}>
            {backupSelectedStaffs.map((item) => (
              <div key={item.id} className={'staff-item'}>
                <Badge
                  count={
                    <CloseCircleOutlined
                      onClick={() => {
                        setBackupSelectedStaffs(
                          backupSelectedStaffs.filter((staff) => staff.id !== item.id),
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
            name='schedule_enable'
            label='绑定员工'
            tooltip={'用户扫描此二维码会添加这里配置的员工'}
            options={[
              {
                label: '全天在线',
                value: Disable,
              },
              {
                label: '自动上下线',
                value: Enable,
              },
            ]}
            rules={[
              {
                required: true,
                message: '请绑定员工',
              },
            ]}
          />
          <ProFormDependency name={['schedule_enable']}>
            {({schedule_enable}) => {
              // 全天在线
              if (schedule_enable === Disable) {
                return (
                  <div style={{marginLeft: 20}}>
                    <Space className={styles.formItem} style={{marginTop: -16, marginLeft: 12}}>
                      <Button
                        ref={staffSelectRef}
                        icon={<PlusOutlined/>}
                        onClick={() => setStaffSelectionVisible(true)}
                      >
                        添加员工
                      </Button>
                      <Text type={'secondary'}>
                        同一个二维码可绑定多个员工，客户扫码后随机分配一名员工进行接待
                      </Text>
                    </Space>

                    <Space className={styles.formItem} style={{marginTop: -16, marginLeft: 12}}>
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
                  </div>
                );
              }

              // 自动上下线
              return (
                <div className={styles.scheduleList} style={{marginLeft: 36}}>
                  <Alert
                    className={styles.tips}
                    type='info'
                    message={
                      '自动上下线：1、可用于员工早晚班等不同上班时间段使用；2、员工在非线上时间将不再接待新客户。'
                    }
                  />
                  <ProFormList
                    name='schedules'
                    creatorButtonProps={{
                      type: 'default',
                      style: {width: '160px'},
                      position: 'bottom',
                      creatorButtonText: '添加其他工作周期',
                    }}
                    creatorRecord={{
                      ext_staff_ids: [],
                    }}
                  >
                    <ProCard className={styles.scheduleItem} ref={addScheduleRef}>
                      <ProForm.Item name={'id'} noStyle={true}>
                        <input type={'hidden'}/>
                      </ProForm.Item>
                      <Row>
                        <label className={styles.label}>选择员工：</label>
                        <ProForm.Item name={'ext_staff_ids'} style={{width: 468}}>
                          <StaffTreeSelect options={staffs} maxTagCount={4}/>
                        </ProForm.Item>
                      </Row>
                      <Row>
                        <label className={styles.label}>工作日：</label>
                        <ProFormSelect
                          mode='multiple'
                          name='weekdays'
                          width={468}
                          valueEnum={WeekdaysEnum}
                          placeholder='请选择工作日'
                          rules={[{required: true, message: '请选择工作日'}]}
                        />
                      </Row>
                      <Row>
                        <label className={styles.label}>工作时间：</label>
                        <ProFormTimePicker
                          fieldProps={{
                            format: TimeLayout,
                          }}
                          name='start_time'
                          placeholder='开始时间'
                          rules={[{required: true, message: '请选择开始时间'}]}
                        />
                        <Space style={{marginLeft: 6}}> </Space>
                        <ProFormTimePicker
                          fieldProps={{
                            format: TimeLayout,
                          }}
                          name='end_time'
                          placeholder='结束时间'
                          rules={[{required: true, message: '请选择结束时间'}]}
                        />
                      </Row>
                    </ProCard>
                  </ProFormList>
                </div>
              );
            }}
          </ProFormDependency>

          <ProFormSwitch
            label={'员工添加上限'}
            checkedChildren='开启'
            unCheckedChildren='关闭'
            name='daily_add_customer_limit_enable'
            tooltip={'开启后员工可在侧边栏修改个人上下线状态'}
          />

          <ProFormDependency name={['daily_add_customer_limit_enable']}>
            {({daily_add_customer_limit_enable}) => {
              if (daily_add_customer_limit_enable) {
                return (
                  <div className={'sub-from-item'}>
                    <ProFormDigit
                      label={
                        <Tooltip title='员工添加上限：员工从该渠道添加的客户达到每日上限后，将自动下线当日不再接待该渠道新客户'>
                          每日最多添加
                        </Tooltip>
                      }
                      width={'md'}
                      name='daily_add_customer_limit'
                      min={0}
                      max={5000}
                    />
                  </div>
                );
              }
              return <></>;
            }}
          </ProFormDependency>

          <ProFormSwitch
            label={'员工自行上下线'}
            checkedChildren='开启'
            unCheckedChildren='关闭'
            name='staff_control_enable'
            tooltip={'开启后员工可在侧边栏修改个人上下线状态'}
          />

          <ProFormSwitch
            label={'客户标签：'}
            checkedChildren='开启'
            unCheckedChildren='关闭'
            name='auto_tag_enable'
            tooltip={
              <>
                通过此渠道码添加的客户，将自动打上此处配置的标签。您还可以转到
                <Link to={'/staff-admin/customer-management/customer-tag'}> 管理客户标签</Link>
              </>
            }
          />

          <ProFormDependency name={['auto_tag_enable']}>
            {({auto_tag_enable}) => {
              if (auto_tag_enable) {
                return (
                  <div className={'sub-from-item'}>
                    <ProForm.Item
                      name={'customer_tag_ext_ids'}
                      label={"客户标签"}
                      rules={[{required: true, message: '请选择客户标签'}]}
                    >
                      <CustomerTagSelect isEditable={true} allTagGroups={tagGroups} maxTagCount={6}
                                         style={{maxWidth: 468}}/>
                    </ProForm.Item>
                  </div>
                );
              }
              return '';
            }}
          </ProFormDependency>

          <ProFormSwitch
            label={'客户备注：'}
            checkedChildren='开启'
            unCheckedChildren='关闭'
            name='customer_remark_enable'
            tooltip={<>客户备注将自动附加在客户昵称之后，方便员工查看</>}
          />

          <ProFormDependency name={['customer_remark_enable']}>
            {({customer_remark_enable}) => {
              if (customer_remark_enable) {
                return (
                  <div className={'sub-from-item'}>
                    <ProFormText
                      width={'md'}
                      name='customer_remark'
                      label='客户备注'
                      placeholder='客户备注'
                      fieldProps={{
                        prefix: <span style={{color: '#666666'}}>客户昵称-</span>,
                      }}
                      rules={[{required: true, message: '请填写客户备注'}]}
                    />
                  </div>
                );
              }
              return '';
            }}
          </ProFormDependency>

          <ProFormSwitch
            label={'客户描述：'}
            checkedChildren='开启'
            unCheckedChildren='关闭'
            name='customer_desc_enable'
            tooltip={'开启后可为客户添加描述，将在客户画像里展示'}
          />
          <ProFormDependency name={['customer_desc_enable']}>
            {({customer_desc_enable}) => {
              if (customer_desc_enable) {
                return (
                  <div className={'sub-from-item'}>
                    <ProFormText
                      width={'md'}
                      name='customer_desc'
                      label='客户描述'
                      placeholder='客户描述'
                      rules={[{required: true, message: '请填写客户描述'}]}
                    />
                  </div>
                );
              }
              return '';
            }}
          </ProFormDependency>

          <h3 style={{marginTop: 30}}>设置欢迎语</h3>
          <Divider/>

          <Alert
            showIcon={true}
            style={{maxWidth: '680px', marginBottom: 20}}
            type='info'
            message={
              '因企业微信限制，若使用成员已在「企业微信后台」配置了欢迎语，这里的欢迎语将不会生效'
            }
          />

          <ProFormRadio.Group
            // 欢迎语类型：1，渠道欢迎语；2, 渠道默认欢迎语；3，不送欢迎语；
            name='auto_reply_type'
            label='设置欢迎语'
            tooltip={'客户添加企业之后，将自动发送此消息给客户'}
            options={[
              {
                label: '渠道欢迎语',
                value: 1,
              },
              {
                label: '渠道默认欢迎语',
                value: 2,
              },
              {
                label: '不送欢迎语',
                value: 3,
              },
            ]}
            rules={[
              {
                required: true,
                message: '请设置欢迎语',
              },
            ]}
          />

          <ProFormDependency name={['auto_reply_type']}>
            {({auto_reply_type}) => {
              if (auto_reply_type === 1) {
                // 渠道欢迎语
                return (
                  <div className={'sub-from-item'}>
                    <Form.Item
                      label={<span className={'form-item-required'}>欢迎语</span>}
                    >
                      <AutoReply welcomeMsg={autoReply} isFetchDone={isFetchDone} setWelcomeMsg={setAutoReply}/>
                    </Form.Item>
                  </div>
                );
              }
              if (auto_reply_type === 2) {
                // 渠道默认欢迎语
                return (
                  <div className={'sub-from-item'} style={{marginBottom: 32, marginLeft: 26}}>
                    <Text type={'secondary'}>
                      将发送成员已设置的欢迎语，若所选成员未设置欢迎语，则不会发送欢迎语
                    </Text>
                  </div>
                );
              }
              if (auto_reply_type === 3) {
                // 不送欢迎语
                return <div className={'sub-from-item'}></div>;
              }
              return '';
            }}
          </ProFormDependency>

          <ProFormSwitch
            label={'欢迎语屏蔽：'}
            checkedChildren='开启'
            unCheckedChildren='关闭'
            name='nickname_block_enable'
            tooltip={<>开启后，客户昵称中包含设定的关键词的客户不会收到欢迎语</>}
          />

          <ProFormDependency name={['nickname_block_enable']}>
            {({nickname_block_enable}) => {
              if (nickname_block_enable) {
                return (
                  <div className={'sub-from-item'} style={{marginLeft: 26, marginTop:-20}}>
                    <EditableTag tags={blockNicknames} setTags={setBlockNicknames}/>
                  </div>
                );
              }
              return '';
            }}
          </ProFormDependency>

          <h3 style={{marginTop: 30}}>功能设置</h3>
          <Divider/>

          <ProFormSwitch
            label={'自动通过好友：'}
            checkedChildren='开启'
            unCheckedChildren='关闭'
            name='skip_verify'
            tooltip={<>开启后，客户添加该企业微信时，无需好友验证，将会自动添加成功</>}
          />

          <ProFormDependency name={['skip_verify']}>
            {({skip_verify}) => {
              if (skip_verify) {
                return (
                  <div className={'sub-from-item'}>
                    <ProFormRadio.Group
                      // 欢迎语类型：1，渠道欢迎语；2, 渠道默认欢迎语；3，不送欢迎语；
                      name='auto_skip_verify_enable'
                      label='自动通过时段'
                      options={[
                        {
                          label: '全天开启',
                          value: 2,
                        },
                        {
                          label: '选择时间段',
                          value: 1,
                        },
                      ]}
                      rules={[
                        {
                          required: true,
                          message: '请选择时段控制',
                        },
                      ]}
                    />

                    <ProFormDependency name={['auto_skip_verify_enable']}>
                      {({auto_skip_verify_enable}) => {
                        if (auto_skip_verify_enable === 1) {
                          return (
                            <Row className={'sub-from-item'}>
                              <span style={{marginTop: 6, marginLeft: 36}}>工作时间：</span>
                              <ProFormTimePicker
                                width={'xs'}
                                name='skip_verify_start_time'
                                fieldProps={{
                                  format: TimeLayout,
                                }}
                                placeholder='开始时间'
                                rules={[{required: true, message: '请选择开始时间'}]}
                              />
                              <Space style={{marginLeft: 6}}> </Space>
                              <ProFormTimePicker
                                width={'xs'}
                                name='skip_verify_end_time'
                                fieldProps={{
                                  format: TimeLayout,
                                }}
                                placeholder='结束时间'
                                rules={[{required: true, message: '请选择结束时间'}]}
                              />
                            </Row>
                          );
                        }
                        return '';
                      }}
                    </ProFormDependency>
                  </div>
                );
              }
              return '';
            }}
          </ProFormDependency>
        </div>
      </ProForm>

      <StaffTreeSelectionModal
        visible={staffSelectionVisible}
        setVisible={setStaffSelectionVisible}
        defaultCheckedStaffs={selectedStaffs}
        onFinish={(values) => {
          setSelectedStaffs(values);
        }}
        allStaffs={staffs}
      />

      <StaffTreeSelectionModal
        visible={backupStaffSelectionVisible}
        setVisible={setBackupStaffSelectionVisible}
        defaultCheckedStaffs={backupSelectedStaffs}
        onFinish={(values: React.SetStateAction<any[]>) => {
          setBackupSelectedStaffs(values);
        }}
        allStaffs={staffs}
      />
    </>
  );
};
export default ContactWayForm;
