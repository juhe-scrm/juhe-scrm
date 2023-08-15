import type {MenuDataItem, Settings as ProSettings} from '@ant-design/pro-layout';
import {GlobalModelState} from './global';
import type {StaffAdminModelState} from '@/models/staffAdmin';

export { GlobalModelState };

export type Loading = {
  global: boolean;
  effects: Record<string, boolean | undefined>;
  models: {
    global?: boolean;
    menu?: boolean;
    setting?: boolean;
    staffAdmin?: boolean;
  };
};

export type ConnectState = {
  global: GlobalModelState;
  loading: Loading;
  settings: ProSettings;
  staffAdmin: StaffAdminModelState;
};

export type Route = {
  routes?: Route[];
} & MenuDataItem;
