import React, {useEffect, useRef, useState} from 'react';
import {PageContainer} from '@ant-design/pro-layout';
import {message} from 'antd/es';
import {history} from 'umi';
import {LeftOutlined} from '@ant-design/icons';
import ProCard from '@ant-design/pro-card';
import type {CommonResp} from '@/services/common';
import {Get, Update} from '@/pages/StaffAdmin/CustomerMassMsg/service';
import CustomerMassMsgForm from '@/pages/StaffAdmin/CustomerMassMsg/Components/form';
import type {CustomerMassMsgItem} from '@/pages/StaffAdmin/CustomerMassMsg/data';
import type {FormInstance} from 'antd';

const EditCustomerMassMsg: React.FC = () => {
  const [currentCustomerMassMsg, setCurrentCustomerMassMsg] = useState<CustomerMassMsgItem>();
  const formRef = useRef<FormInstance>();
  const id = new URLSearchParams(window.location.search).get('id');

  useEffect(() => {
    if (id) {
      const hide = message.loading('加载数据中');
      Get(id).then((res) => {
        hide();
        if (res.code === 0) {
          setCurrentCustomerMassMsg(res.data);
          formRef.current?.setFieldsValue(res.data);
        } else {
          message.error(res.message);
        }
      });
    }
  }, []);

  return (
    <PageContainer
      onBack={() => history.goBack()}
      backIcon={<LeftOutlined/>}
      header={{
        title: '修改群发',
      }}
    >
      <ProCard>
        <CustomerMassMsgForm
          formRef={formRef}
          mode={'edit'}
          onFinish={async (values) => {
            console.log("values", values);
            const params = {...values};
            const hide = message.loading('处理中');
            const res: CommonResp = await Update(params);
            hide();
            if (res.code === 0) {
              history.push('/staff-admin/customer-conversion/customer-mass-msg');
              message.success('修改成功');
              return true;
            }

            if (res.message) {
              message.error(res.message);
              return false;
            }

            message.error('修改失败');
            return false;
          }}
          initialValues={currentCustomerMassMsg}
          itemID={id || ''}
        />
      </ProCard>
    </PageContainer>
  );
};

export default EditCustomerMassMsg;
