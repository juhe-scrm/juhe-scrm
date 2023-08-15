// https://umijs.org/config/
import {defineConfig} from 'umi';
import proxy from './proxy';
import routes from './routes';
import theme from './theme';

const {REACT_APP_ENV} = process.env;

export default defineConfig({
  hash: true,
  antd: {},
  dva: {
    hmr: true,
  },
  history: {
    type: 'browser',
  },
  dynamicImport: {
    loading: '@/components/PageLoading/index',
  },
  targets: {
    ie: 11,
  },
  // umi routes: https://umijs.org/docs/routing
  routes,
  // https://umijs.org/zh-CN/config#theme
  theme: theme,
  title: false,
  ignoreMomentLocale: true,
  proxy: proxy[REACT_APP_ENV || 'dev'],
  manifest: {
    basePath: '/',
  },
  // 快速刷新功能 https://umijs.org/config#fastrefresh
  fastRefresh: {},
  esbuild: {},
  // webpack5: {},
  request: {
    dataField: 'data',
  },
  scripts: [
    'https://unpkg.com/react@17/umd/react.production.min.js',
    'https://unpkg.com/react-dom@17/umd/react-dom.production.min.js',
    'https://unpkg.com/@ant-design/charts@1.0.5/dist/charts.min.js',
    //使用 组织架构图、流程图、资金流向图、缩进树图 才需要使用
    //'https://unpkg.com/@ant-design/charts@1.0.5/dist/charts_g6.min.js',
  ],
  externals: {
    react: 'React',
    'react-dom': 'ReactDOM',
    "@ant-design/charts": "charts"
  },
  devServer: {
    host: 'dashboard.dev.openscrm.cn',
    port: 9000,
  },
});
