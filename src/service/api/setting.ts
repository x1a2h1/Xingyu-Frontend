import { request } from '../request';

export function fetchGetSetting<T>(key: string) {
  return request<T>({
    url: `/settings/${key}`
  });
}

export function fetchSetSetting(key: string, data: { value: string }) {
  return request({
    data,
    method: 'put',
    url: `/settings/${key}`
  });
}
