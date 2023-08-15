import React, { useRef, useState } from 'react';
import { PageContainer } from '@ant-design/pro-layout';
import { message } from 'antd/es';
import { history } from 'umi';
import { LeftOutlined } from '@ant-design/icons';
import ProCard from '@ant-design/pro-card';
import type { CommonResp } from '@/services/common';
import { Create } from '@/pages/StaffAdmin/CustomerMassMsg/service';
import CustomerMassMsgForm from '@/pages/StaffAdmin/CustomerMassMsg/Components/form';
import type { CustomerMassMsgItem } from '@/pages/StaffAdmin/CustomerMassMsg/data';
import type { FormInstance } from 'antd';

const CreateCustomerMassMsg: React.FC = () => {
  const [currentCustomerMassMsg] = useState<CustomerMassMsgItem>();
  const formRef = useRef<FormInstance>();

  return (
    <PageContainer
      onBack={() => history.goBack()}
      backIcon={<LeftOutlined />}
      header={{
        title: '创建群发',
      }}
    >
      <ProCard>
        <CustomerMassMsgForm
          formRef={formRef}
          mode={'create'}
          onFinish={async (values) => {
            const params = { ...values };
            const hide = message.loading('处理中');
            const res: CommonResp = await Create(params);
            hide();
            if (res.code === 0) {
              history.push('/staff-admin/customer-conversion/customer-mass-msg');
              message.success('添加成功');
              return true;
            }

            if (res.message) {
              message.error(res.message);
              return false;
            }

            message.error('添加失败');
            return false;
          }}
          initialValues={currentCustomerMassMsg}
        />
      </ProCard>
    </PageContainer>
  );
};

export default CreateCustomerMassMsg;
