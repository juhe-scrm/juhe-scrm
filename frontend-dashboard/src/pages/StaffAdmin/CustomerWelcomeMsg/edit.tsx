import React, { useEffect, useRef, useState } from 'react';
import { PageContainer } from '@ant-design/pro-layout';
import { message } from 'antd/es';
import { history } from 'umi';
import { LeftOutlined } from '@ant-design/icons';
import ProCard from '@ant-design/pro-card';
import type { CommonResp } from '@/services/common';
import { Get, Update } from '@/pages/StaffAdmin/CustomerWelcomeMsg/service';
import CustomerWelcomeMsgForm from '@/pages/StaffAdmin/CustomerWelcomeMsg/Components/form';
import type { CustomerWelcomeMsgItem } from '@/pages/StaffAdmin/CustomerWelcomeMsg/data';
import type { FormInstance } from 'antd';
import type { StaffOption } from '@/pages/StaffAdmin/Components/Modals/StaffTreeSelectionModal';
import { QuerySimpleStaffs } from '@/services/staff';

const CreateCustomerWelcomeMsg: React.FC = () => {
  const [currentCustomerWelcomeMsg, setCurrentCustomerWelcomeMsg] = useState<CustomerWelcomeMsgItem>();
  const [itemID, setItemID] = useState<string>('');
  const formRef = useRef<FormInstance>();
  const [allStaffs, setAllStaffs] = useState<StaffOption[]>([]);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const id = params.get('id');
    if (id) {
      setItemID(id);
    } else {
      message.error('传入参数请带上ID');
    }
  }, []);

  useEffect(() => {
    QuerySimpleStaffs({ page_size: 5000 }).then((res) => {
      if (res.code === 0) {
        setAllStaffs(res?.data?.items || []);
      } else {
        message.error(res.message);
      }
    });
  }, []);

  useEffect(() => {
    if (itemID) {
      const hide = message.loading('加载数据中');
      Get(itemID).then((res) => {
        hide();
        if (res.code === 0) {
          setCurrentCustomerWelcomeMsg(res.data);
          formRef.current?.setFieldsValue(res.data);
        } else {
          message.error(res.message);
        }
      });
    }
  }, [itemID]);

  return (
    <PageContainer
      onBack={() => history.goBack()}
      backIcon={<LeftOutlined />}
      header={{
        title: '修改欢迎语',
      }}
    >
      <ProCard>
        <CustomerWelcomeMsgForm
          formRef={formRef}
          staffs={allStaffs}
          mode={'edit'}
          onFinish={async (values) => {
            const params = { ...values };
            const hide = message.loading('处理中');
            const res: CommonResp = await Update(params);
            hide();
            if (res.code === 0) {
              history.push('/staff-admin/customer-conversion/customer-welcome-msg');
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
          initialValues={currentCustomerWelcomeMsg}
          itemID={itemID}
        />
      </ProCard>
    </PageContainer>
  );
};

export default CreateCustomerWelcomeMsg;
