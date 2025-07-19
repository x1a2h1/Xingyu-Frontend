import { request } from '../request';

/** 新增用户接口 */
export function fetchPostUser(data: Api.User.Info) {
  return request<null>({
    data,
    method: 'post',
    url: '/user'
  });
}

// /** 获取用户详情 */
// export function fetchGetUser(id: string) {
//   return request<Api.SystemManage.User>({
//     method: "get",
//     url: `/user/${id}`,
//   });
// }

/** 获取用户列表 */
export function fetchGetUserList(params?: Api.SystemManage.UserSearchParams) {
  return request<Api.User.List>({
    method: 'get',
    params,
    url: '/user/list'
  });
}

/** 更新用户接口 */
export function fetchPutUser(id: string, data: Api.User.Info) {
  return request<null>({
    data, // 使用 data 而不是 params 发送请求体数据
    method: 'put',
    url: `/user/${id}/update`
  });
}

/** 启用用户接口 */
export function fetchEnableUser(id: string) {
  return request<null>({
    method: 'put',
    url: `/user/enable/${id}`
  });
}

/** 禁用用户接口 */
export function fetchDisableUser(id: string) {
  return request<null>({
    method: 'put',
    url: `/user/disable/${id}`
  });
}

/** 删除用户接口 */
export function fetchDeleteUser(id: string) {
  return request<null>({
    method: 'delete',
    url: `/user/delete/${id}`
  });
}
