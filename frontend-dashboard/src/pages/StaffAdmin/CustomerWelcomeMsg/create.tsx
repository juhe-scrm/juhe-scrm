import React, { useEffect, useRef, useState } from 'react';
import { PageContainer } from '@ant-design/pro-layout';
import { message } from 'antd/es';
import { history } from 'umi';
import { LeftOutlined } from '@ant-design/icons';
import ProCard from '@ant-design/pro-card';
import type { CommonResp } from '@/services/common';
import { Create } from '@/pages/StaffAdmin/CustomerWelcomeMsg/service';
import CustomerWelcomeMsgForm from '@/pages/StaffAdmin/CustomerWelcomeMsg/Components/form';
import type { CustomerWelcomeMsgItem } from '@/pages/StaffAdmin/CustomerWelcomeMsg/data';
import type { FormInstance } from 'antd';
import type { StaffOption } from '@/pages/StaffAdmin/Components/Modals/StaffTreeSelectionModal';
import { QuerySimpleStaffs } from '@/services/staff';

const CreateCustomerWelcomeMsg: React.FC = () => {
  const [currentCustomerWelcomeMsg] = useState<CustomerWelcomeMsgItem>();
  const formRef = useRef<FormInstance>();
  const [allStaffs, setAllStaffs] = useState<StaffOption[]>([]);

  useEffect(() => {
    QuerySimpleStaffs({ page_size: 5000 }).then((res) => {
      if (res.code === 0) {
        setAllStaffs(res?.data?.items || []);
      } else {
        message.error(res.message);
      }
    });
  }, []);

  return (
    <PageContainer
      onBack={() => history.goBack()}
      backIcon={<LeftOutlined />}
      header={{
        title: '创建欢迎语',
      }}
    >
      <ProCard>
        <CustomerWelcomeMsgForm
          formRef={formRef}
          staffs={allStaffs}
          mode={'create'}
          onFinish={async (values) => {
            const params = { ...values };
            const hide = message.loading('处理中');
            const res: CommonResp = await Create(params);
            hide();
            if (res.code === 0) {
              history.push('/staff-admin/customer-conversion/customer-welcome-msg');
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
          initialValues={currentCustomerWelcomeMsg}
        />
      </ProCard>
    </PageContainer>
  );
};

export default CreateCustomerWelcomeMsg;
