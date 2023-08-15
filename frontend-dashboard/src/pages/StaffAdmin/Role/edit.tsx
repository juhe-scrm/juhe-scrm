import React, { useEffect, useRef, useState } from 'react';
import { PageContainer } from '@ant-design/pro-layout';
import { message } from 'antd/es';
import { history } from 'umi';
import { LeftOutlined } from '@ant-design/icons';
import ProCard from '@ant-design/pro-card';
import type { CommonResp } from '@/services/common';
import { Get, Update } from '@/pages/StaffAdmin/Role/service';
import RoleForm from '@/pages/StaffAdmin/Role/Components/form';
import type { RoleItem } from '@/pages/StaffAdmin/Role/data';
import type { FormInstance } from 'antd';
import { False } from '../../../../config/constant';

const CreateRole: React.FC = () => {
  const [currentRole, setCurrentRole] = useState<RoleItem>({
    is_default: False,
  });
  const [itemID, setItemID] = useState<string>('');
  const roleFormRef = useRef<FormInstance>();

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
    if (itemID) {
      const hide = message.loading('加载数据中');
      Get(itemID).then((res) => {
        hide();
        if (res.code === 0) {
          setCurrentRole(res.data);
          roleFormRef.current?.setFieldsValue(res.data);
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
        title: '修改角色',
      }}
    >
      <ProCard>
        <RoleForm
          // @ts-ignore
          formRef={roleFormRef}
          mode={'edit'}
          onFinish={async (values) => {
            const hide = message.loading('处理中');
            const res: CommonResp = await Update(values);
            hide();
            if (res.code === 0) {
              history.push('/staff-admin/company-management/role');
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
          currentItem={currentRole}
        />
      </ProCard>
    </PageContainer>
  );
};

export default CreateRole;
