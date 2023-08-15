import type { Effect, Reducer } from 'umi';
import type { StaffAdminInterface } from '@/services/staffAdmin';
import { GetCurrentStaffAdmin } from '@/services/staffAdmin';
import { setAuthority } from '@/utils/authority';
import { getPageQuery } from '@/utils/utils';
import { history } from '@@/core/history';
import { stringify } from 'querystring';
import { LSExtStaffAdminID } from '../../config/constant';

export type StaffAdminModelState = {
  currentStaffAdmin?: StaffAdminInterface;
};

export type StaffAdminModelType = {
  namespace: 'staffAdmin';
  state: StaffAdminModelState;
  effects: {
    getCurrent: Effect;
  };
  reducers: {
    applyCurrent: Reducer<StaffAdminModelState>;
    logout: Reducer;
  };
};

const StaffAdminModel: StaffAdminModelType = {
  namespace: 'staffAdmin',

  state: {},

  effects: {
    *getCurrent(_, { call, put }) {
      const response = yield call(GetCurrentStaffAdmin);
      yield put({
        type: 'applyCurrent',
        payload: response.data,
      });
    },
  },

  reducers: {
    applyCurrent(state, action) {
      const params = action.payload as StaffAdminInterface;
      localStorage.setItem(LSExtStaffAdminID, params.ext_staff_id);
      if (params?.role?.permission_ids) {
        setAuthority(params.role.permission_ids);
      }
      return {
        currentStaffAdmin: params || {},
      };
    },

    logout() {
      const { redirect } = getPageQuery();
      localStorage.removeItem(LSExtStaffAdminID);
      // Note: There may be security issues, please note
      if (window.location.pathname !== '/staff-admin/login' && !redirect) {
        history.replace({
          pathname: '/staff-admin/login',
          search: stringify({
            redirect: window.location.href,
          }),
        });
      }

      return {
        currentStaffAdmin: {},
      };
    },
  },
};

export default StaffAdminModel;
