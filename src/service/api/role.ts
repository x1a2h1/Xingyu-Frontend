import { request } from '../request';

/** 获取角色列表 */
export function fetchGetRoleList(params?: {
  current?: number;
  keyword?: string;
  name?: string;
  size?: number;
  sort_num?: number;
}) {
  return request<Api.Role.List>({
    method: 'get',
    params,
    url: '/role/list'
  });
}

/** 新增角色 */
export function fetchCreateRole(data: Omit<Api.Role.Info, 'create_time' | 'id' | 'update_time'>) {
  return request<Api.Role.Info>({
    data,
    method: 'post',
    url: '/role'
  });
}

/** 获取角色详情 */
export function fetchGetRole(id: number) {
  return request<Api.Role.Info>({
    method: 'get',
    url: `/role/${id}`
  });
}

/** 更新角色 */
export function fetchUpdateRole(id: number, data: Partial<Omit<Api.Role.Info, 'create_time' | 'id' | 'update_time'>>) {
  return request<Api.Role.Info>({
    data,
    method: 'put',
    url: `/role/${id}`
  });
}

/** 删除角色 */
export function fetchDeleteRole(id: number, data?: any) {
  return request<null>({
    data,
    method: 'delete',
    url: `/role/${id}`
  });
}

/** 批量删除角色 */
export function fetchBatchDeleteRole(ids: number[]) {
  return request<null>({
    data: { ids },
    method: 'delete',
    url: '/role/batch'
  });
}

/** 更新角色菜单权限 */
export function fetchUpdateRoleMenu(id: number, data: { menu_ids: React.Key[] }) {
  return request<null>({
    data,
    method: 'put',
    url: `/role/${id}/menus`
  });
}

/** 获取角色菜单权限 */
export function fetchGetRoleMenus(id: number) {
  return request<{ menu_ids: number[] }>({
    method: 'get',
    url: `/role/${id}/menus`
  });
}

/** 更新角色按钮权限 */
export function fetchUpdateRoleButtons(id: number, data: { button_codes: React.Key[] }) {
  return request<null>({
    data,
    method: 'put',
    url: `/role/${id}/buttons`
  });
}

/** 获取角色按钮权限 */
export function fetchGetRoleButtons(id: number) {
  return request<{ button_codes: string[] }>({
    method: 'get',
    url: `/role/${id}/buttons`
  });
}

/** 获取所有角色（用于下拉选择） */
export function fetchGetAllRoles() {
  return request<Pick<Api.Role.Info, 'id' | 'name'>[]>({
    method: 'get',
    url: '/role/all'
  });
}
