import { request } from '../request';

/** 创建实体 */
export function fetchCreateEntify(data: Record<string, any>) {
  return request({
    data,
    method: 'POST',
    url: '/entity'
  });
}

/** 更新实体 */
export function fetchUpdateEntify(id: string, data: Record<string, any>) {
  return request({
    data,
    method: 'POST',
    url: `/entity/${id}`
  });
}

/** 创建实体配置 */
export function fetchCreateEntifyConfig(id: string, type: string, data: Record<string, any>) {
  return request({
    data,
    method: 'POST',
    url: `/entity/${id}/${type}`
  });
}

/** 更新实体配置 */
export function fetchUpdateEntifyConfig(id: string, type: string, data: Record<string, any>) {
  return request({
    data,
    method: 'PUT',
    url: `/entity/${id}/${type}`
  });
}

/** 删除实体 */
export function fetchDeleteEntify(id: string) {
  return request({
    method: 'DELETE',
    url: `/entity/${id}`
  });
}

/**
 * 获取实体列表
 *
 * @param {Object} params 请求参数
 */
export function fetchGetEntifyList(params?: Record<string, any>) {
  return request<Api.Entity.List>({
    method: 'GET',
    params,
    url: '/entity/list'
  });
}

/** 获取当前用户的实体列表 */
export function fetchGetMyEntities() {
  return request({
    method: 'GET',
    url: '/entity/me'
  });
}
