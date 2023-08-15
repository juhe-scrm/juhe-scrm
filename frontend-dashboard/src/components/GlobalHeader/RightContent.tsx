import { Tag, Tooltip } from 'antd';
import type { Settings as ProSettings } from '@ant-design/pro-layout';
import { QuestionCircleOutlined } from '@ant-design/icons';
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
      <Tooltip title="使用帮助">
        <a
          style={{
            color: 'inherit',
          }}
          target="_blank"
          href="https://www.openscrm.cn"
          className={styles.action}
        >
          <QuestionCircleOutlined />
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
