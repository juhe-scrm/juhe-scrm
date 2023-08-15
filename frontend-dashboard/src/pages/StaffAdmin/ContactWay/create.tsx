import React, { useEffect, useState } from 'react';
import { PageContainer } from '@ant-design/pro-layout';
import { message } from 'antd/es';
import { history } from 'umi';
import { LeftOutlined } from '@ant-design/icons';
import ProCard from '@ant-design/pro-card';
import type { StaffOption } from '../Components/Modals/StaffTreeSelectionModal';
import type { SimpleStaffInterface } from '@/services/staff';
import { QuerySimpleStaffs } from '@/services/staff';
import type { CommonResp } from '@/services/common';
import { Create } from '@/pages/StaffAdmin/ContactWay/service';
import ContactWayForm from '@/pages/StaffAdmin/ContactWay/Components/form';
import type {CustomerTagGroupItem} from "@/pages/StaffAdmin/CustomerTag/data";
import {QueryCustomerTagGroups} from "@/services/customer_tag_group";

const CreateContactWay: React.FC = () => {
  const [allStaffs, setAllStaffs] = useState<StaffOption[]>([]);
  const [allTagGroups, setAllTagGroups] = useState<CustomerTagGroupItem[]>([]);

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
    QuerySimpleStaffs({ page_size: 5000 }).then((res) => {
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

  return (
    <PageContainer
      onBack={() => history.goBack()}
      backIcon={<LeftOutlined />}
      header={{
        title: '创建渠道活码',
      }}
    >
      <ProCard>
        <ContactWayForm
          mode={'create'}
          onFinish={async (values) => {
            const params = { ...values };
            const hide = message.loading('处理中');
            const res: CommonResp = await Create(params);
            hide();
            if (res.code === 0) {
              history.push('/staff-admin/customer-growth/contact-way');
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
          staffs={allStaffs}
          tagGroups={allTagGroups}
        />
      </ProCard>
    </PageContainer>
  );
};

export default CreateContactWay;
