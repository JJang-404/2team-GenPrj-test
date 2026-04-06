import BaseApi from './baseApi';

class UsersApi extends BaseApi {
  async signup(userName, userPassword) {
    return this.post(
      '/user/signup',
      {
        user_name: userName,
        user_passwd: userPassword,
      },
      '회원가입에 실패했습니다.',
    );
  }

  async login(userName, userPassword) {
    return this.post(
      '/user/login',
      {
        user_name: userName,
        user_passwd: userPassword,
      },
      '로그인에 실패했습니다.',
    );
  }
}

export const usersApi = new UsersApi();
export default UsersApi;