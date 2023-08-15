import React, { useEffect } from 'react';
import type { FormInstance} from 'antd';
import { Alert, Divider, Table } from 'antd';
import ProForm, { ProFormRadio } from '@ant-design/pro-form';
import { False, True } from '../../../../../config/constant';
import lodash from 'lodash';
import styles from './index.less';
import type { RoleItem } from '@/pages/StaffAdmin/Role/data';
import type { ColumnsType } from 'antd/es/table';
import {
  BizContactWay_Full,
  BizContactWay_Read,
  BizCustomerGroupChat_Full,
  BizCustomerGroupChat_Read,
  BizCustomerInfo_Full,
  BizCustomerInfo_Read,
  BizCustomerLoss_Full,
  BizCustomerLoss_Read,
  BizCustomerTag_Full,
  BizCustomerTag_Read,
  BizDeleteCustomer_Full,
  BizDeleteCustomer_Read, BizMassMsg_Full, BizMassMsg_Read,
  BizRole_Full,
  BizRole_Read, BizWelcomeMsg_Full, BizWelcomeMsg_Read,
} from '../../../../../config/permission';
import Icon, { createFromIconfontCN } from '@ant-design/icons';
import defaultSettings from '../../../../../config/defaultSettings';
import { isImg, isUrl } from '@/utils/utils';
import allIcons from '@@/plugin-antd-icon/icons';
import type { ProFormProps } from '@ant-design/pro-form/lib/layouts/ProForm';
import { ProFormText } from '@ant-design/pro-form/es';

const IconFont = createFromIconfontCN({
  scriptUrl: defaultSettings.iconfontUrl,
});

// Allow menu.js config icon as string or ReactNode
//   icon: 'setting',
//   icon: 'icon-geren' #For Iconfont ,
//   icon: 'http://demo.com/icon.png',
//   icon: '/favicon.png',
//   icon: <Icon type="setting" />,
const getIcon = (
  icon?: string | React.ReactNode,
  iconPrefixes: string = 'icon-',
): React.ReactNode => {
  if (typeof icon === 'string' && icon !== '') {
    if (isUrl(icon) || isImg(icon)) {
      return (
        <Icon component={() => <img src={icon} alt='icon' className='ant-pro-sider-menu-icon' />} />
      );
    }
    if (icon.startsWith(iconPrefixes)) {
      return <IconFont type={icon} />;
    }
    return React.createElement(allIcons[icon] || allIcons[`${icon}Outlined`]);
  }

  return icon;
};

const menus = [
  {
    name: '引流获客',
    path: '/staff-admin/customer-growth',
    icon: 'UsergroupAdd',
    routes: [
      {
        path: '/staff-admin/customer-growth/contact-way',
        name: '渠道活码',
        icon: 'QrcodeOutlined',
        component: './StaffAdmin/ContactWay/index',
        authority: [BizContactWay_Full, BizContactWay_Read],
      },
      {
        path: '/staff-admin/customer-growth/contact-way/create',
        component: './StaffAdmin/ContactWay/create',
        authority: [BizContactWay_Full, BizContactWay_Read],
      },
      {
        path: '/staff-admin/customer-growth/contact-way/edit',
        component: './StaffAdmin/ContactWay/edit',
        authority: [BizContactWay_Full, BizContactWay_Read],
      },
      {
        path: '/staff-admin/customer-growth/contact-way/copy',
        component: './StaffAdmin/ContactWay/copy',
        authority: [BizContactWay_Full, BizContactWay_Read],
      },
      {
        path: '/staff-admin/customer-growth/add-customer-tutorial',
        name: '用户搜索添加',
        icon: 'icon-people-search',
        component: './StaffAdmin/Tutorials/addCustomer',
      },
    ],
  },
  {
    name: '客户管理',
    icon: 'User',
    path: '/staff-admin/customer-management',
    routes: [
      {
        path: '/staff-admin/customer-management/customer',
        name: '客户管理',
        icon: 'IdcardOutlined',
        component: './StaffAdmin/Customer/index',
        authority: [BizCustomerInfo_Full, BizCustomerInfo_Read],
      },
      {
        path: '/staff-admin/customer-management/customer/detail',
        component: './StaffAdmin/Customer/detail',
        authority: [BizCustomerInfo_Full, BizCustomerInfo_Read],
      },
      {
        path: '/staff-admin/customer-management/customer-loss',
        name: '流失提醒',
        icon: 'UsergroupDelete',
        component: './StaffAdmin/CustomerLoss/index',
        authority: [BizCustomerLoss_Full, BizCustomerLoss_Read],
      },
      {
        path: '/staff-admin/customer-management/customer-tag',
        name: '客户标签',
        icon: 'Tags',
        component: './StaffAdmin/CustomerTag/index',
        authority: [BizCustomerTag_Full, BizCustomerTag_Read],
      },
    ],
  },
  {
    name: '企业风控',
    icon: 'SafetyCertificate',
    path: '/staff-admin/corp-risk-control',
    routes: [
      {
        path: '/staff-admin/corp-risk-control/delete-customer',
        name: '删人提醒',
        icon: 'icon-people-delete',
        component: './StaffAdmin/DeleteCustomerRecord/index',
        authority: [BizDeleteCustomer_Full, BizDeleteCustomer_Read],
      },
      {
        path: '/staff-admin/corp-risk-control/chat-session',
        name: '消息存档',
        icon: 'MessageOutlined',
        component: './StaffAdmin/ChatSession/index',
        authority: [BizDeleteCustomer_Full, BizDeleteCustomer_Read],
      },
    ],
  },
  {
    name: '客户群运营',
    icon: 'icon-quanzi',
    path: '/staff-admin/group-chat',
    routes: [
      {
        path: '/staff-admin/group-chat/list',
        name: '客户群列表',
        icon: 'icon-every-user',
        component: './StaffAdmin/GroupChat/index',
        authority: [BizCustomerGroupChat_Full, BizCustomerGroupChat_Read],
      },
      {
        path: '/staff-admin/group-chat/tags',
        name: '客户群标签',
        icon: 'TagOutlined',
        component: './StaffAdmin/GroupChatTag/index',
        authority: [BizCustomerGroupChat_Full, BizCustomerGroupChat_Read],
      },
    ],
  },
  {
    name: '客户转化',
    icon: 'icon-transform',
    path: '/staff-admin/customer-conversion',
    routes: [
      {
        path: '/staff-admin/customer-conversion/customer-mass-msg',
        name: '客户群发',
        icon: 'icon-fasong',
        component: './StaffAdmin/CustomerMassMsg/index',
        authority: [BizMassMsg_Full, BizMassMsg_Read],
      },
      {
        path: '/staff-admin/customer-conversion/customer-mass-msg/create',
        component: './StaffAdmin/CustomerMassMsg/create',
        authority: [BizMassMsg_Full],
      },
      {
        path: '/staff-admin/customer-conversion/customer-mass-msg/edit',
        component: './StaffAdmin/CustomerMassMsg/edit',
        authority: [BizMassMsg_Full],
      },
      {
        path: '/staff-admin/customer-conversion/customer-mass-msg/detail',
        component: './StaffAdmin/CustomerMassMsg/detail',
        authority: [BizMassMsg_Read],
      },
      {
        path: '/staff-admin/customer-conversion/material-library',
        name: '素材库',
        icon: 'icon-sucai-outline',
        component: './StaffAdmin/MaterialLibrary/index',
        authority: [BizWelcomeMsg_Full, BizWelcomeMsg_Read],
      },
      {
        path: '/staff-admin/customer-conversion/script-library',
        name: '企业话术库',
        icon: 'icon-message-success',
        component: './StaffAdmin/ScriptLibrary/index',
        authority: [BizCustomerGroupChat_Full, BizCustomerGroupChat_Read],
      },
      {
        path: '/staff-admin/customer-conversion/customer-welcome-msg',
        name: '客户欢迎语',
        icon: 'icon-welcome-msg',
        component: './StaffAdmin/CustomerWelcomeMsg/index',
        authority: [BizWelcomeMsg_Full, BizWelcomeMsg_Read],
      },
      {
        path: '/staff-admin/customer-conversion/customer-welcome-msg/create',
        component: './StaffAdmin/CustomerWelcomeMsg/create',
        authority: [BizWelcomeMsg_Full],
      },
      {
        path: '/staff-admin/customer-conversion/customer-welcome-msg/edit',
        component: './StaffAdmin/CustomerWelcomeMsg/edit',
        authority: [BizWelcomeMsg_Full],
      },
    ],
  },

  {
    name: '企业管理',
    icon: 'icon-enterprise',
    path: '/staff-admin/company-management',
    routes: [
      {
        path: '/staff-admin/company-management/staff',
        name: '员工管理',
        icon: 'icon-staff',
        component: './StaffAdmin/Staff/index',
        authority: [BizCustomerGroupChat_Full, BizCustomerGroupChat_Read],
      },
      {
        path: '/staff-admin/company-management/staff-details',
        component: './StaffAdmin/Staff/StaffDetails/index',
        authority: [BizCustomerGroupChat_Full, BizCustomerGroupChat_Read],
      },
      {
        path: '/staff-admin/company-management/role',
        name: '权限管理',
        icon: 'icon-permissions',
        component: './StaffAdmin/Role/index',
        authority: [BizRole_Full, BizRole_Read],
      },
      {
        path: '/staff-admin/company-management/role/create',
        component: './StaffAdmin/Role/create',
        authority: [BizRole_Full],
      },
      {
        path: '/staff-admin/company-management/role/edit',
        component: './StaffAdmin/Role/edit',
        authority: [BizRole_Full],
      },
    ],
  }
];

export type RoleFormProps = Omit<ProFormProps, 'onFinish' | 'visible' | 'initialValues'> & {
  mode: 'create' | 'edit' | 'simpleEdit';
  onFinish: (params: any) => void;
  currentItem: RoleItem | undefined;
  formRef: React.MutableRefObject<(FormInstance & {
    getFieldsFormatValue?: () => any;
  })>;
};


const RoleForm: React.FC<RoleFormProps> = (props) => {
  const { currentItem, mode, formRef } = props;
  const routeColumns: ColumnsType = [
    {
      title: '功能名称',
      dataIndex: 'name',
      key: 'name',
      width: '180px',
      render: (_, item: any) => {
        return (
          <>
            <span style={{ marginRight: 6 }}>{getIcon(item?.icon)}</span>
            <span>{item?.name}</span>
          </>
        );
      },
    },
    {
      title: '管理权限',
      dataIndex: 'authority',
      key: 'authority',
      render: (_, item: any) => {
        const authority = [...item?.authority];
        const biz = authority.pop()?.split('_')?.shift();
        return (
          <ProFormRadio.Group
            disabled={currentItem?.is_default === True}
            noStyle={true}
            name={biz}
            options={[
              {
                label: `全权控制`,
                value: `${biz}_Full`,
              },
              {
                label: `仅查看权限`,
                value: `${biz}_Read`,
              },
              {
                label: '无权限',
                value: '',
              },
            ]}
          />
        );
      },
    },
  ];
  const formatParams = (values: any) => {
    const params = { ...values };
    if (mode === 'edit' || mode === 'simpleEdit') {
      params.id = currentItem?.id;
    }
    let permissionIDs: any[] = [];
    Object.keys(params).forEach((key) => {
      if (key.startsWith('Biz') && params[key]) {
        permissionIDs.push(params[key]);
        delete params[key];
      }
    });
    permissionIDs = lodash.uniq<string>(permissionIDs);
    permissionIDs = lodash.filter<string>(permissionIDs);
    params.permission_ids = permissionIDs;
    return params;
  };

  useEffect(() => {
    const values = formRef.current?.getFieldsValue();
    if (values) {
      Object.keys(values).forEach((key) => {
        if (!key.startsWith('Biz')) {
          return;
        }
        let defaultValue = '';
        if (currentItem?.permission_ids?.includes(`${key}_Full`)) {
          defaultValue = `${key}_Full`;
        } else if (currentItem?.permission_ids?.includes(`${key}_Read`)) {
          defaultValue = `${key}_Read`;
        }
        values[key] = defaultValue;
      });
      formRef.current?.setFieldsValue(values);
    }
  }, [currentItem, formRef]);

  return (
    <ProForm
      layout={'horizontal'}
      // @ts-ignore
      submitter={currentItem?.is_default === False}
      formRef={props.formRef}
      onFinish={async (values: any) => {
        return props.onFinish(formatParams(values));
      }}
    >
      <>
        {currentItem?.is_default === True && (
          <Alert
            showIcon={true}
            style={{ maxWidth: '600px', marginBottom: 20 }}
            type='info'
            message={
              '为了保证系统安全性，内置角色不允许修改权限'
            }
          />
        )}

        {['create', 'edit'].includes(mode) && (
          <>
            <h3>基础信息</h3>
            <Divider />

            <ProFormText
              width={'md'}
              name='name'
              label='角色名称'
              placeholder='请输入角色名称'
              rules={[
                {
                  required: true,
                  message: '请填写角色名称',
                },
              ]}
            />

            <h3>权限信息</h3>
            <Divider />
          </>
        )}

        <div className={styles.permissionList}>
          {menus.map((topMenu) => {
            return (
              <div key={topMenu.path} className={styles.permissionItem}>
                <div className={styles.title}>
                  <span className={styles.icon}>{getIcon(topMenu.icon)}</span>
                  <span className={styles.name}>{topMenu.name}</span>
                </div>
                <Table
                  rowKey={'path'}
                  className={styles.routeTable}
                  bordered={true}
                  pagination={false}
                  dataSource={topMenu.routes.filter((item: any) => item.name && item.authority)}
                  // @ts-ignore
                  columns={routeColumns}
                />
              </div>
            );
          })}
        </div>
      </>
    </ProForm>
  );
};

export default RoleForm;
