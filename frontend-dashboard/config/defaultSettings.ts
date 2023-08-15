import { Settings as ProSettings } from '@ant-design/pro-layout';

type DefaultSettings = Partial<ProSettings> & {
  pwa: boolean;
};

const proSettings: DefaultSettings = {
  navTheme: 'dark',
  // 拂晓蓝
  primaryColor: '#0070cc',
  layout: 'side',
  contentWidth: 'Fluid',
  fixedHeader: false,
  fixSiderbar: true,
  colorWeak: false,
  title: 'OpenSCRM',
  pwa: false,
  iconfontUrl: '//at.alicdn.com/t/font_2664214_7d8mhwhp1uv.js',
};

export type { DefaultSettings };

export default proSettings;
