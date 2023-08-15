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
  BizDeleteCustomer_Read,
  BizRole_Full,
  BizRole_Read,
  BizMassMsg_Full,
  BizMassMsg_Read,
  BizWelcomeMsg_Full,
  BizWelcomeMsg_Read,
  BizMsgArch_Full,
  BizMsgArch_Read,
} from './permission';

export default [
  {
    path: '/',
    component: '../layouts/BlankLayout',
    routes: [
      // 公开路由
      {
        path: '/staff-admin/login',
        component: '../layouts/LoginLayout',
        routes: [
          {
            name: '员工登录',
            path: '/staff-admin/login',
            component: './StaffAdmin/Login',
          },
        ],
      },
      {
        path: '/staff-admin/login-callback',
        component: '../layouts/LoginLayout',
        routes: [
          {
            name: '员工登录',
            path: '/staff-admin/login-callback',
            component: './StaffAdmin/Login/callback',
          },
        ],
      },
      {
        path: '/',
        exact: true,
        redirect: '/staff-admin/login',
      },

      // 普通管理员授权路由
      {
        name:'普通管理员授权路由',
        path: '/staff-admin/',
        component: '../layouts/StaffAdminSecurityLayout',
        routes: [
          {
            path: '/staff-admin/',
            component: '../layouts/BasicLayout',
            routes: [
              {
                path: '/staff-admin/',
                exact: true,
                redirect: '/staff-admin/welcome',
              },
              {
                path: '/staff-admin/welcome',
                name: '首页',
                icon: 'Home',
                component: './StaffAdmin/Welcome/index',
              },
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
                    authority: [BizMsgArch_Full, BizMsgArch_Read],
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
                authority: [BizRole_Full, BizRole_Read],
                routes: [
                  {
                    path: '/staff-admin/company-management/staff',
                    name: '员工管理',
                    icon: 'icon-staff',
                    component: './StaffAdmin/Staff/index',
                    authority: [BizRole_Full, BizRole_Read],

                  },
                  {
                    path: '/staff-admin/company-management/staff-details',
                    component: './StaffAdmin/Staff/StaffDetails/index',
                    authority: [BizRole_Full, BizRole_Read],
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
              },

              {
                component: './404',
              },
            ],
          },
          {
            component: './404',
          },
        ],
      },

      //缺省路由
      {
        component: './404',
      },
    ],
  },
  {
    component: './404',
  },
];
