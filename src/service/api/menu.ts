import { request } from "../request";
/** 获取菜单树 */
export function fetchMenuTree() {
  return request<Api.Menu.Tree[]>({
    method: "get",
    url: "/menu/tree",
  });
}

/** 新增菜单 */
export function fetchPostMenu(data: Api.Menu.Tree) {
  return request<null>({
    data,
    method: "post",
    url: "/menu",
  });
}
/** 更新菜单 */
export function fetchPutMenu(id: string, data: Api.Menu.Tree) {
  return request<null>({
    data,
    method: "put",
    url: `/menu/${id}`,
  });
}

/** 删除菜单 */
export function fetchDeleteMenu(id: string) {
  return request<null>({
    method: "delete",
    url: `/menu/${id}`,
  });
}
