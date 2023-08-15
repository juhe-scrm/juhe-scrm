export const StaffAdminApiPrefix = '/api/v1/staff-admin';
export const CorpAdminApiPrefix = '/api/v1/corp-admin';
export const CodeOK = 0;
export const Enable = 1;
export const True = 1;
export const Disable = 2;
export const False = 2;
export const StaffAdminAuthority = 'staffAdmin';

// 1=已激活，2=已禁用，4=未激活，5=退出企业
export const StaffActive = 1;

// localStorage存储key定义
export const LSAdminType = 'adminType';
export const LSAuthority = 'authority';
export const LSExtStaffAdminID = 'extStaffAdminID';
export const LSExtCorpID = 'extCorpID';

// 角色定义
export const RoleTypeSuperAdmin = 'superAdmin';
export const RoleTypeAdmin = 'admin';
export const RoleTypeDepartmentAdmin = 'departmentAdmin';
export const RoleTypeStaff = 'staff';

// 日期格式定义
export const DateTimeLayout = 'YYYY-MM-DD HH:mm';
export const TimeLayout = 'HH:mm';

export const RoleMap = {
  [RoleTypeSuperAdmin]: '超级管理员',
  [RoleTypeAdmin]: '管理员',
  [RoleTypeDepartmentAdmin]: '部门管理员',
  [RoleTypeStaff]: '普通员工',
};

export const RoleColorMap = {
  [RoleTypeSuperAdmin]: '#ff9318',
  [RoleTypeAdmin]: '#1890ff',
  [RoleTypeDepartmentAdmin]: '#1890ff',
  [RoleTypeStaff]: '#8b9fbb',
};
