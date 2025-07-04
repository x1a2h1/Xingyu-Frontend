import { request } from '../request';

/*
 	fetchPostSlot 创建广告平台代码位
 */
export function fetchPostSlot(data: any) {
  return request({
    data,
    method: 'post',
    url: '/ads/slot'
  });
}

export function fetchBatchCreateSlot(data: any) {
  return request<null>({
    data,
    method: 'post',
    url: '/ads/slot/batch'
  });
}

/**
 * 获取代码位列表
 *
 * @param params 查询参数
 * @param params.bid_type 竞价类型: 0(目标竞价) | 1(实时竞价)
 * @param params.id 应用ID
 * @param params.page 当前页
 * @param params.pageSize 页大小
 * @param params.platform 广告平台: adnetqq(优量汇) | csj(穿山甲) | kwai(快手)
 * @param params.type 广告类型: 1(信息流) | 2(开屏) | 3(激励视频) | 4(新插屏)
 */
export function fetchAdsSlotList(params?: {
  bid_type?: 0 | 1;
  id?: number;
  page?: number;
  pageSize?: number;
  platform?: 'adnetqq' | 'csj' | 'kwai';
  type?: 1 | 2 | 3 | 4;
}) {
  return request<Api.Ads.List>({
    method: 'get',
    params,
    url: '/ads/slot/list'
  });
}
