import React from 'react';
import { Inspector } from 'react-dev-inspector';
import { ConfigProvider } from 'antd';
import zhCN from 'antd/lib/locale/zh_CN';
import 'moment/locale/zh-cn';

const InspectorWrapper = process.env.NODE_ENV === 'development' ? Inspector : React.Fragment;

const Layout: React.FC = ({ children }) => {
  return (
    <InspectorWrapper>
      <ConfigProvider locale={zhCN}>{children}</ConfigProvider>
    </InspectorWrapper>
  );
};

export default Layout;
