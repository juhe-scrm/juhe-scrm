import React, { useEffect, useRef, useState } from 'react';
import { Alert, Badge, Button, Divider, Form, message, Space } from 'antd';
import ProForm, { ProFormText } from '@ant-design/pro-form';
import type { CustomerWelcomeMsgItem, WelcomeMsg } from '@/pages/StaffAdmin/CustomerWelcomeMsg/data';
import type { CreateCustomerWelcomeMsgParam } from '@/pages/StaffAdmin/CustomerWelcomeMsg/data';
import type { ProFormProps } from '@ant-design/pro-form/lib/layouts/ProForm';
import styles from '@/pages/StaffAdmin/ContactWay/Components/form.less';
import { CloseCircleOutlined, PlusOutlined } from '@ant-design/icons';
import type { StaffOption } from '@/pages/StaffAdmin/Components/Modals/StaffTreeSelectionModal';
import StaffTreeSelectionModal from '@/pages/StaffAdmin/Components/Modals/StaffTreeSelectionModal';
import { Disable } from '../../../../../config/constant';
import AutoReply from '@/pages/StaffAdmin/Components/Fields/AutoReply';

export type CustomerWelcomeMsgFormProps = Omit<ProFormProps, 'onFinish' | 'visible' | 'initialValues'> & {
  mode: 'create' | 'edit' | 'copy';
  onFinish: (params: any) => void;
  staffs: StaffOption[];
  initialValues?: CustomerWelcomeMsgItem;
};

const CustomerWelcomeMsgForm: React.FC<CustomerWelcomeMsgFormProps> = (props) => {
  const { staffs, initialValues } = props;
  const staffSelectRef = useRef<HTMLInputElement>(null);
  const [selectedStaffs, setSelectedStaffs] = useState<StaffOption[]>([]);
  const [staffSelectionVisible, setStaffSelectionVisible] = useState(false);
  const [isFetchDone, setIsFetchDone] = useState(false);
  const [welcomeMsg, setWelcomeMsg] = useState<WelcomeMsg>({ text: '' });

  const itemDataToFormValues = (item: CustomerWelcomeMsgItem | any): CreateCustomerWelcomeMsgParam => {
    const values: CreateCustomerWelcomeMsgParam = {
      ...item,
      id: item.id,
      ext_staff_ids: item?.staffs?.map((staff: any) => staff.ext_id),
    };

    if (item?.staffs) {
      setSelectedStaffs(
        item?.staffs.map((staff: any) => {
          return {
            key: staff.ext_id,
            label: staff.id,
            value: staff.ext_id,
            ...staff,
            ext_id: staff.ext_id,
          };
        }),
      );
    }

    if (item.welcome_msg) {
      setWelcomeMsg(item.welcome_msg);
    }

    return values;
  };

  useEffect(() => {
    if (initialValues?.id) {
      props?.formRef?.current?.setFieldsValue(itemDataToFormValues(initialValues));
      setIsFetchDone(true);
    }
  }, [initialValues]);

  const formatParams = (values: any) => {
    const params = { ...values };
    params.ext_staff_ids = selectedStaffs.map((staff) => staff.ext_id) || [];
    params.enable_time_period_msg = Disable;
    params.id = initialValues?.id;
    params.welcome_msg = welcomeMsg;
    return params;
  };

  const checkForm = (values: any): boolean => {
    if (values.ext_staff_ids.length === 0) {
      message.warning('请选择使用员工');
      staffSelectRef?.current?.focus();
      return false;
    }
    if (values.welcome_msg.text === '') {
      message.warning('请填写欢迎语内容');
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
          return props.onFinish(params);
        }}
      >
        <>
          <h3>基础信息</h3>
          <Divider />
          <Alert
            showIcon={true}
            style={{ maxWidth: '800px', marginBottom: 20 }}
            type='info'
            message={(
              <span> 1.渠道码设置的欢迎语有更高优先级；2.同一用户设置多个欢迎语时，系统使用最新的一个</span>
            )}
          />

          <ProFormText
            name='name'
            label='欢迎语名称'
            width='md'
            rules={[
              {
                required: true,
                message: '请输入欢迎语名称！',
              },
            ]}
          />

          <Form.Item
            label={<span className={'form-item-required'}>使用员工</span>}
            tooltip={'此处设置的员工的所有新客户好友将配置此处的欢迎语'}
          >
            <Button
              ref={staffSelectRef}
              icon={<PlusOutlined />}
              onClick={() => setStaffSelectionVisible(true)}
            >
              选择员工
            </Button>
          </Form.Item>

          <Space wrap={true} style={{ marginTop: -12, marginBottom: 24, marginLeft: 20 }}>
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
                      style={{ color: 'rgb(199,199,199)' }}
                    />
                  }
                >
                  <div className={'container'}>
                    <img alt={item.name} className={'avatar'} src={item.avatar_url} />
                    <span className={'text'}>{item.name}</span>
                  </div>
                </Badge>
              </div>
            ))}
          </Space>

          <h3>欢迎语设置</h3>
          <Divider />

          <Form.Item
            label={<span className={'form-item-required'}>欢迎语</span>}
          >
            <AutoReply enableQuickInsert={true} welcomeMsg={welcomeMsg} isFetchDone={isFetchDone} setWelcomeMsg={setWelcomeMsg} />
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
        allStaffs={staffs}
      />
    </>
  );
};

export default CustomerWelcomeMsgForm;
