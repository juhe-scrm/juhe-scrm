import React, { useRef, useState } from 'react';
import { PageContainer } from '@ant-design/pro-layout';
import { message } from 'antd/es';
import { history } from 'umi';
import { LeftOutlined } from '@ant-design/icons';
import ProCard from '@ant-design/pro-card';
import type { CommonResp } from '@/services/common';
import { Create } from '@/pages/StaffAdmin/Role/service';
import RoleForm from '@/pages/StaffAdmin/Role/Components/form';
import type { RoleItem } from '@/pages/StaffAdmin/Role/data';
import type { FormInstance } from 'antd';
import { False } from '../../../../config/constant';

const CreateRole: React.FC = () => {
  const [currentRole] = useState<RoleItem>({
    is_default: False,
  });

  const roleForm = useRef<FormInstance>();

  return (
    <PageContainer
      onBack={() => history.goBack()}
      backIcon={<LeftOutlined />}
      header={{
        title: '创建角色',
      }}
    >
      <ProCard>
        <RoleForm
          // @ts-ignore
          formRef={roleForm}
          mode={'create'}
          onFinish={async (values) => {
            const params = { ...values };
            const hide = message.loading('处理中');
            const res: CommonResp = await Create(params);
            hide();
            if (res.code === 0) {
              history.push('/staff-admin/company-management/role');
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
          currentItem={currentRole}
        />
      </ProCard>
    </PageContainer>
  );
};

export default CreateRole;
