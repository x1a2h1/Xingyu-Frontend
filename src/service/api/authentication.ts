import { request } from '../request';
/**
 * Login
 *
 * @param userName User name
 * @param password Password
 */
export function fetchLogin(account: string, password: string) {
  return request<Api.Auth.LoginToken>({
    data: {
      account,
      password
    },
    method: 'post',
    url: '/comm/login'
  });
}

export function fetchGetMyInfo() {
  return request<Api.User.Info>({
    url: '/user/me'
  });
}
