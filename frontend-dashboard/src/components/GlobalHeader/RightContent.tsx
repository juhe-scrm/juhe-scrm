import { Tag, Tooltip } from 'antd';
import type { Settings as ProSettings } from '@ant-design/pro-layout';
import { GithubOutlined } from '@ant-design/icons';
import React from 'react';
import type { ConnectProps } from 'umi';
import { connect } from 'umi';
import type { ConnectState } from '@/models/connect';
import styles from './index.less';
import StaffAdminAvatarDropdown from '@/components/GlobalHeader/StaffAdminAvatarDropdown';

export type GlobalHeaderRightProps = {
  theme?: ProSettings['navTheme'] | 'realDark';
} & Partial<ConnectProps> &
  Partial<ProSettings>;

const ENVTagColor = {
  dev: 'orange',
  test: 'green',
  pre: '#87d068',
};

const GlobalHeaderRight: React.SFC<GlobalHeaderRightProps> = (props) => {
  const { theme, layout } = props;
  let className = styles.right;

  if (theme === 'dark' && layout === 'top') {
    className = `${styles.right}  ${styles.dark}`;
  }

  return (
    <div className={className}>
      <Tooltip title="Juhe SCRM 官方仓库">
        <a
          style={{
            color: 'inherit',
          }}
          rel="noreferrer"
          target="_blank"
          href="https://github.com/juhe-scrm/juhe-scrm"
          className={styles.action}
        >
          <GithubOutlined style={{ fontSize: '24px' }} />
        </a>
      </Tooltip>
      <StaffAdminAvatarDropdown menu={true} />
      {REACT_APP_ENV && (
        <span>
          <Tag color={ENVTagColor[REACT_APP_ENV]}>{REACT_APP_ENV}</Tag>
        </span>
      )}
    </div>
  );
};

export default connect(({ settings }: ConnectState) => ({
  theme: settings.navTheme,
  layout: settings.layout,
}))(GlobalHeaderRight);
