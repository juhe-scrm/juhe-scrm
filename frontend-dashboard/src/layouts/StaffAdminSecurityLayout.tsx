import React from 'react';
import {PageLoading} from '@ant-design/pro-layout';
import type {ConnectProps} from 'umi';
import {connect, Redirect} from 'umi';
import {stringify} from 'querystring';
import type {ConnectState} from '@/models/connect';
import type {StaffAdminInterface} from '@/services/staffAdmin';
import {LSExtStaffAdminID} from '../../config/constant';

type SecurityLayoutProps = {
  loading?: boolean;
  currentStaffAdmin?: StaffAdminInterface;
} & ConnectProps;

type SecurityLayoutState = {
  isReady: boolean;
};

class StaffAdminSecurityLayout extends React.Component<SecurityLayoutProps, SecurityLayoutState> {
  state: SecurityLayoutState = {
    isReady: false,
  };

  componentDidMount() {
    this.setState({
      isReady: true,
    });
    const {dispatch} = this.props;
    if (dispatch) {
      // dispatch({
      //   type: 'adminType/changeStatus',
      //   payload: 'staffAdmin',
      // });
      dispatch({
        type: 'staffAdmin/getCurrent',
      });
    }
  }

  render() {
    const {isReady} = this.state;
    const {children, loading} = this.props;
    // You can replace it to your authentication rule (such as check token exists)
    // You can replace it with your own login authentication rules (such as judging whether the token exists)
    const isLogin = localStorage.getItem(LSExtStaffAdminID) !== null;
    const queryString = stringify({
      redirect: window.location.href,
    });

    if ((!isLogin && loading) || !isReady) {
      return <PageLoading/>;
    }
    if (!isLogin && window.location.pathname !== '/staff-admin/login') {
      return <Redirect to={`/staff-admin/login?${queryString}`}/>;
    }
    return children;
  }
}

export default connect(({staffAdmin, loading}: ConnectState) => ({
  currentStaffAdmin: staffAdmin.currentStaffAdmin,
  loading: loading.models.staffAdmin,
}))(StaffAdminSecurityLayout);
