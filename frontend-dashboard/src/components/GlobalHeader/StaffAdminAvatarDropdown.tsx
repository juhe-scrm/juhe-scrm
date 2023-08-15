import {LogoutOutlined, SettingOutlined} from '@ant-design/icons';
import {Menu, Spin} from 'antd';
import React from 'react';
import type {ConnectProps} from 'umi';
import {connect, history} from 'umi';
import type {ConnectState} from '@/models/connect';
import HeaderDropdown from '../HeaderDropdown';
import styles from './index.less';
import type {StaffAdminInterface} from '@/services/staffAdmin';
import Avatar from 'antd/es/avatar/avatar';
import {CanSee} from "@/utils/authority";
import {BizRole_Full, BizRole_Read} from '../../../config/permission';

export type GlobalHeaderRightProps = {
  currentStaffAdmin?: StaffAdminInterface;
  menu?: boolean;
} & Partial<ConnectProps>;

class StaffAdminAvatarDropdown extends React.Component<GlobalHeaderRightProps> {
  onMenuClick = (event: { key: React.Key; keyPath: React.Key[]; item: React.ReactInstance }) => {
    const { key } = event;

    if (key === 'settings'){
      history.push('/staff-admin/company-management/role')
      return;
    }

    if (key === 'logout') {
      const { dispatch } = this.props;

      if (dispatch) {
        dispatch({
          type: 'staffAdmin/logout',
        });
      }

      return;
    }

    history.push(`/staff-admin/${key}`);
  };

  render(): React.ReactNode {
    const { menu, currentStaffAdmin } = this.props;

    const currentUser = {
      ...currentStaffAdmin,
    };

    const menuHeaderDropdown = (
      <Menu className={styles.menu} selectedKeys={[]} onClick={this.onMenuClick}>
        {menu && CanSee([BizRole_Full, BizRole_Read]) && (
          <Menu.Item
            key="settings"
          >
            <SettingOutlined />
            权限设置
          </Menu.Item>
        )}
        {menu && <Menu.Divider />}
        <Menu.Item key="logout">
          <LogoutOutlined />
          退出登录
        </Menu.Item>
      </Menu>
    );
    return currentUser && currentUser.name ? (
      <HeaderDropdown overlay={menuHeaderDropdown}>
        <span className={`${styles.action} ${styles.account}`}>
          <Avatar
            size="small"
            className={styles.avatar}
            src={currentUser.avatar_url}
            alt="avatar"
          />
          <span className={`${styles.name} anticon`}>{currentUser.name}</span>
        </span>
      </HeaderDropdown>
    ) : (
      <span className={`${styles.action} ${styles.account}`}>
        <Spin
          size="small"
          style={{
            marginLeft: 8,
            marginRight: 8,
          }}
        />
      </span>
    );
  }
}

export default connect(({ staffAdmin }: ConnectState) => ({
  currentStaffAdmin: staffAdmin.currentStaffAdmin,
}))(StaffAdminAvatarDropdown);
