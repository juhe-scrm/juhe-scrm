import {reloadAuthorized} from './Authorized';
import {StaffAdminAuthority} from '../../config/constant';

// use localStorage to store the authority info, which might be sent from server in actual project.
export function getAuthority(str?: string): string | string[] {
  const authorityString =
    typeof str === 'undefined' && localStorage ? localStorage.getItem('authority') : str;
  // authorityString could be admin, "admin", ["admin"]
  let authority;
  try {
    if (authorityString) {
      authority = JSON.parse(authorityString);
    }
  } catch (e) {
    authority = authorityString;
  }
  if (typeof authority === 'string') {
    return [authority];
  }
  // preview.pro.ant.design only do not use in your production.
  // preview.pro.ant.design Dedicated environment variable, please do not use it in your project.
  if (!authority && ANT_DESIGN_PRO_ONLY_DO_NOT_USE_IN_YOUR_PRODUCTION === 'site') {
    return [StaffAdminAuthority];
  }
  return authority;
}

export function setAuthority(authority: string | string[]): void {
  const proAuthority = typeof authority === 'string' ? [authority] : authority;
  localStorage.setItem('authority', JSON.stringify(proAuthority));
  // auto reload
  reloadAuthorized();
}

export function CanSee(authority: string | string[]): boolean {
  const authorityString = localStorage.getItem('authority');
  if (!authorityString) {
    return false;
  }
  const requiredAuthority = typeof authority === 'string' ? [authority] : authority;
  try {
    const authorities = JSON.parse(authorityString) || [];
    let result = false;
    requiredAuthority.forEach((item) => {
      if (authorities.includes(item)){
        result = true
      }
    })
    return result;
  } catch (e) {
    console.log('canSee failed', 'e', e)
    return false;
  }

}
