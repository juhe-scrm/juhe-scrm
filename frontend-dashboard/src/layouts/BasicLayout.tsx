/**
 * Ant Design Pro v4 use `@ant-design/pro-layout` to handle Layout.
 *
 * @see You can view component api by: https://github.com/ant-design/ant-design-pro-layout
 */
import type {BasicLayoutProps as ProLayoutProps, MenuDataItem, Settings,} from '@ant-design/pro-layout';
import ProLayout from '@ant-design/pro-layout';
import React, {useMemo, useRef} from 'react';
import type {Dispatch} from 'umi';
import {connect, history, Link} from 'umi';
import {Button, Result} from 'antd';
import Authorized from '@/utils/Authorized';
import type {ConnectState} from '@/models/connect';
import {getMatchMenu} from '@umijs/route-utils';
import logo from '../assets/logo.svg';
import headerLogo from '../assets/logo_white.svg';
import type {HeaderViewProps} from '@ant-design/pro-layout/lib/Header';
import RightContent from '@/components/GlobalHeader/RightContent';
import Icon, {createFromIconfontCN} from '@ant-design/icons';
import defaultSettings from '../../config/defaultSettings';
import {isImg, isUrl} from '@/utils/utils';

export type BasicLayoutProps = {
  breadcrumbNameMap: Record<string, MenuDataItem>;
  route: ProLayoutProps['route'] & {
    authority: string[];
  };
  settings: Settings;
  dispatch: Dispatch;
} & ProLayoutProps;

export type BasicLayoutContext = { [K in 'location']: BasicLayoutProps[K] } & {
  breadcrumbNameMap: Record<string, MenuDataItem>;
};

/** Use Authorized check all menu item */

const menuDataRender = (menuList: MenuDataItem[]): MenuDataItem[] =>
  menuList.map((item) => {
    const localItem = {
      ...item,
      children: item.children ? menuDataRender(item.children) : undefined,
    };
    return Authorized.check(item.authority, localItem, null) as MenuDataItem;
  });

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
        <Icon component={() => <img src={icon} alt="icon" className="ant-pro-sider-menu-icon" />} />
      );
    }
    if (icon.startsWith(iconPrefixes)) {
      return <IconFont type={icon} />;
    }
  }
  return icon;
};

// const defaultFooterDom = (
//   // <DefaultFooter
//   //   copyright={`${new Date().getFullYear()} OpenSCRM`}
//   //   links={
//   //     [
//   //     ]
//   //   }
//   // />
// );

const BasicLayout: React.FC<BasicLayoutProps> = (props) => {
  const {
    dispatch,
    children,
    settings,
    location = {
      pathname: '/',
    },
  } = props;
  const menuDataRef = useRef<MenuDataItem[]>([]);

  /** Init variables */

  const handleMenuCollapse = (payload: boolean): void => {
    if (dispatch) {
      dispatch({
        type: 'global/changeLayoutCollapsed',
        payload,
      });
    }
  }; // get children authority

  const noMatch = (
    <Result
      status={403}
      title="403"
      subTitle="抱歉，您无权访问此页面"
      extra={
        <Button type="primary">
          <Link to={'staffAdmin/login'}>
            去登陆
          </Link>
        </Button>
      }
    />
  );

  const authorized = useMemo(
    () =>
      getMatchMenu(location.pathname || '/', menuDataRef.current).pop() || {
        authority: undefined,
      },
    [location.pathname],
  );

  return (
    <ProLayout
      logo={logo}
      {...props}
      {...settings}
      onCollapse={handleMenuCollapse}
      layout={'mix'}
      navTheme={'light'}
      headerTheme={'dark'}
      siderWidth={260}
      className={'main'}
      menu={{
        defaultOpenAll: true,
        type: 'sub',
        ignoreFlatMenu: true,
      }}
      onMenuHeaderClick={() => history.push('/')}
      headerTitleRender={() => {
        return (
          <a onClick={() => history.push('/')}>
            <img src={headerLogo} height={32} alt={'OpenSCRM'} />
          </a>
        );
      }}
      menuRender={(menuProps: HeaderViewProps, defaultDom: React.ReactNode) => {
        return <div className={'sidebar-menu'}>{defaultDom}</div>;
      }}
      menuItemRender={(menuItemProps, defaultDom) => {
        const isTopLevel = menuItemProps && menuItemProps?.pro_layout_parentKeys?.length === 0;
        if (
          menuItemProps.isUrl ||
          !menuItemProps.path ||
          location.pathname === menuItemProps.path
        ) {
          return (
            <div>
              {!isTopLevel && getIcon(menuItemProps.icon)}
              {defaultDom}
            </div>
          );
        }

        return (
          <Link to={menuItemProps.path}>
            {!isTopLevel && getIcon(menuItemProps.icon)}
            {defaultDom}
          </Link>
        );
      }}
      // breadcrumbRender={(routers = []) => [
      //   {
      //     path: '/',
      //     breadcrumbName: '首页',
      //   },
      //   ...routers,
      // ]}
      breadcrumbRender={false}
      footerRender={() => {
        // if (settings.footerRender || settings.footerRender === undefined) {
        //   return defaultFooterDom;
        // }

        return null;
      }}
      menuDataRender={menuDataRender}
      rightContentRender={() => <RightContent />}
      postMenuData={(menuData) => {
        menuDataRef.current = menuData || [];
        return menuData || [];
      }}
    >
      <Authorized authority={authorized!.authority} noMatch={noMatch}>
        {children}
      </Authorized>
    </ProLayout>
  );
};

export default connect(({ global, settings }: ConnectState) => ({
  collapsed: global.collapsed,
  settings,
}))(BasicLayout);
