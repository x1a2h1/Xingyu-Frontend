import { request } from '../request';

/** 获取所有应用列表（管理员） */
export function fetchGetAppList(params?: { keyword?: string; page?: number; pageSize?: number }) {
  return request<Api.AppLication.List>({
    method: 'get',
    params,
    url: '/app/list'
  });
}

/** 获取我的应用列表 */
export function fetchGetMyAppList(params?: { keyword?: string; page?: number; pageSize?: number }) {
  return request({
    method: 'get',
    params,
    url: '/app/list/me'
  });
}

/** 获取应用详情 */
export function fetchGetAppDetail(id: string) {
  return request({
    method: 'get',
    url: `/app/${id}`
  });
}

/** 创建应用 */
export function fetchCreateApp(data: {
  aggregation?: string;
  entity_id: number;
  name: string;
  package_name: string;
  remarks?: string;
}) {
  return request({
    data,
    method: 'post',
    url: '/app'
  });
}

/** 更新应用 */
export function fetchUpdateApp(
  id: string,
  data: {
    aggregation?: string;
    entity_id: number;
    name: string;
    package_name: string;
    remarks?: string;
  }
) {
  return request({
    data,
    method: 'put',
    url: `/app/${id}`
  });
}

/** 删除应用 */
export function fetchDeleteApp(id: string) {
  return request({
    method: 'delete',
    url: `/app/${id}`
  });
}

/**
 * 更新应用配置
 *
 * @param id 应用ID
 * @param type 平台类型(topon/taku/kwai/csj/oceanengine/gromore/adnetqq)
 * @param data 配置数据
 */
export function fetchUpdateAppConfig(
  id: string,
  type: string,
  data: {
    app_id: string;
  }
) {
  return request({
    data,
    method: 'put',
    url: `/app/${id}/${type}`
  });
}

// 更新应用聚合工具
export function fetchPutAppMediation(id: number, platform: string) {
  return request({
    method: 'put',
    url: `/app/${id}/mediation/${platform}`
  });
}
