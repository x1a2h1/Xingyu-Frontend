/**
 * Namespace Api
 *
 * All backend api type
 */
declare namespace Api {
  type Base = {
    create_time: string;
    id: number;
    update_time: string;
  };
  namespace Common {
    type PageableData<T = any> = {
      list: T[];
      total: number;
    };
    /** common params of paginating */
    interface PaginatingCommonParams {
      /** current page number */
      current: number;
      /** page size */
      size: number;
      /** total count */
      total: number;
    }

    /** common params of paginating query list data */
    interface PaginatingQueryRecord<T = any> extends PaginatingCommonParams {
      records: T[];
    }

    type CommonSearchParams = Pick<Common.PaginatingCommonParams, 'current' | 'size'>;

    /**
     * enable status
     *
     * - "1": enabled
     * - "2": disabled
     */
    type EnableStatus = '1' | '2';

    /** common record */
    type CommonRecord<T = any> = {
      /** record creator */
      createBy: string;
      /** record create time */
      createTime: string;
      /** record id */
      id: number;
      /** record status */
      status: EnableStatus | null;
      /** record updater */
      updateBy: string;
      /** record update time */
      updateTime: string;
    } & T;
  }

  /**
   * namespace Auth
   *
   * backend api module: "auth"
   */
  namespace Auth {
    interface LoginToken {
      refreshToken: string;
      token: string;
    }

    interface UserInfo {
      buttons: string[];
      roles: string[];
      userId: string;
      userName: string;
    }

    type Info = {
      token: LoginToken['token'];
      userInfo: UserInfo;
    };
  }

  /**
   * namespace Route
   *
   * backend api module: "route"
   */
  namespace Route {
    type ElegantConstRoute = import('@soybean-react/vite-plugin-react-router').ElegantConstRoute;

    interface MenuRoute extends ElegantConstRoute {
      id: string;
    }

    interface UserRoute {
      home: import('@soybean-react/vite-plugin-react-router').LastLevelRouteKey;
      routes: string[];
    }
  }

  /**
   * namespace SystemManage
   *
   * backend api module: "systemManage"
   */
  namespace SystemManage {
    type CommonSearchParams = Pick<Common.PaginatingCommonParams, 'current' | 'size'>;

    /** role */
    type Role = Common.CommonRecord<{
      /** role code */
      roleCode: string;
      /** role description */
      roleDesc: string;
      /** role name */
      roleName: string;
    }>;

    /** role search params */
    type RoleSearchParams = CommonType.RecordNullable<
      Pick<Api.SystemManage.Role, 'roleCode' | 'roleName' | 'status'> & CommonSearchParams
    >;

    /** role list */
    type RoleList = Common.PaginatingQueryRecord<Role>;

    /** all role */
    type AllRole = Pick<Role, 'id' | 'roleCode' | 'roleName'>;

    /**
     * user gender
     *
     * - "1": "male"
     * - "2": "female"
     */
    type UserGender = '1' | '2';

    /** user */
    type User = Common.CommonRecord<{
      /** user nick name */
      nickName: string;
      /** user email */
      userEmail: string;
      /** user gender */
      userGender: UserGender | null;
      /** user name */
      userName: string;
      /** user phone */
      userPhone: string;
      /** user role code collection */
      userRoles: string[];
    }>;

    /** user search params */
    type UserSearchParams = CommonType.RecordNullable<
      Pick<Api.SystemManage.User, 'nickName' | 'status' | 'userEmail' | 'userGender' | 'userName' | 'userPhone'> &
        CommonSearchParams
    >;

    /** user list */
    type UserList = Common.PaginatingQueryRecord<User>;

    /**
     * menu type
     *
     * - "1": directory
     * - "2": menu
     */
    type MenuType = '1' | '2';

    type MenuButton = {
      /**
       * button code
       *
       * it can be used to control the button permission
       */
      code: string;
      /** button description */
      desc: string;
    };

    /**
     * icon type
     *
     * - "1": iconify icon
     * - "2": local icon
     */
    type IconType = '1' | '2';

    type MenuPropsOfRoute = Pick<
      import('@soybean-react/vite-plugin-react-router').RouteMeta,
      | 'activeMenu'
      | 'constant'
      | 'fixedIndexInTab'
      | 'hideInMenu'
      | 'href'
      | 'i18nKey'
      | 'keepAlive'
      | 'multiTab'
      | 'order'
      | 'query'
    >;

    type Menu = Common.CommonRecord<{
      /** buttons */
      buttons?: MenuButton[] | null;
      /** children menu */
      children?: Menu[] | null;
      /** component */
      component?: string;
      /** iconify icon name or local icon name */
      icon: string;
      /** icon type */
      iconType: IconType;
      /** menu name */
      menuName: string;
      /** menu type */
      menuType: MenuType;
      /** parent menu id */
      parentId: number;
      /** route name */
      routeName: string;
      /** route path */
      routePath: string;
    }> &
      MenuPropsOfRoute;

    /** menu list */
    type MenuList = Common.PaginatingQueryRecord<Menu>;

    type MenuTree = {
      children?: MenuTree[];
      id: number;
      label: string;
      pId: number;
    };
  }
  // New
  namespace AppLication {
    type Info = Base & {
      adnetqq_app_id: number;
      app_name: string;
      csj_app_id: number;
      entity: Entity.Entity;
      entity_id: number;
      gromore_app_id: number;
      kwai_app_id: number;
      package_name: string;
      privacy_agreement_short_code: string;
      remarks: string;
      status: Common.EnableStatus;
      taku_app_id: number;
      user_agreement_short_code: string;
      user_id: number;
    };
    type List = Common.PageableData<Info>;
  }
  namespace Entity {
    type Entity = Base & {
      adnetqq: AdnetQQConfig;
      csj: CsjConfig;
      domain: string;
      kwai: KwaiConfig;
      name: string;
      taku: TakuConfig;
      user: Auth.UserInfo;
      user_id: number;
    };
    type AdnetQQConfig = {
      member_id: string;
      secret: string;
    };
    type CsjConfig = {
      role_id: string;
      security_key: string;
      user_id: string;
    };
    type KwaiConfig = {
      access_key: string;
      security_key: string;
    };
    type TakuConfig = {
      publisher_id: string;
    };
    type List = Common.PageableData<Entity>;
  }
  namespace Ads {
    type Slot = Base & {
      ad_slot_id: number;
      app_name: string;
      bid_type: number;
      callback_url: string;
      ecpm: string;
      entity_name: string;
      key: string;
      name: string;
      platform: string;
      type: string;
    };
    type List = Common.PageableData<Slot>;
  }
  // 用户
  namespace User {
    type Info = Base & {
      account: string;
      cellphone: string;
      email: string;
      menu_list: Menu.Info[] | null;
      nickname: string;
      remark: string;
      role_list: Role.Info[] | null;
      root: boolean;
      status: number;
    };
    type List = Common.PageableData<Info>;
  }
  // 角色
  namespace Role {
    type Info = Base & {
      menu_list: Menu.Info[] | null;
      name: string;
      sort_num: number;
    };
    type List = Common.PageableData<Info>;
  }
  // 菜单
  namespace Menu {
    type Info = Base & {
      display: number;
      external: number;
      external_way: number;
      icon: string;
      name: string;
      page: string;
      parent_id: number;
      path: string;
      sort_num: number;
      symbol: string;
      url: string;
    };
    type Tree = {
      children?: Tree[];
      display: number;
      external: number;
      external_way: number;
      icon: string;
      id: string;
      name: string;
      parent_id: number;
      sort_num: number;
      symbol: string;
      url: string;
    };
    type List = Common.PageableData<Info>;
  }
  // ECPM
  namespace ECPM {
    type ECPMEntry = {
      /** 广告类型：信息流、开屏、激励视频、新插屏 */
      ad_type: string;
      /** 竞价方式：目标｜实时竞价 */
      bid_type: string;
      /** eCPM值，默认值为1 */
      ecpm: number;
    };

    type Info = Base & {
      ECPMEntry: ECPMEntry[];
    };
    type List = Common.PageableData<Info>;
  }
  // 渠道
  namespace Channel {
    type Info = Base & {
      channel_name: string;
      channel_no: string;
      status: number;
    };
    type Options = {
      greeter_login: boolean;
      qq_login: boolean;
      wechat_login: boolean;
    };
    type List = Common.PageableData<Info>;
  }
  // 应用渠道
  namespace AppChan {
    type Info = Base & {
      app_id: number;
      app_name: string;
      channel_id: number;
      channel_name: string;
      status: number;
    };
    type List = Common.PageableData<Info>;
  }
  // 玩家
  namespace Player {
    type Info = Base & {
      account: string;
      app_id: number;
      app_name: string;
      channel_id: number;
      channel_name: string;
      entity_id: number;
      entity_name: string;
      status: number;
    };
    type List = Common.PageableData<Info>;
  }
  // 提现
  namespace Withdrawal {
    // 提现记录表
    type WithdrawalStatus =
      | 'approved' // 待审批
      | 'failed' // 已审批
      | 'paid' // 打款中
      | 'pending' // 已完成
      | 'processing' // 已拒绝
      | 'rejected'; // 打款失败

    type Info = Base & {
      amount: string;
      app_chan_id: number;
      app_chan_name?: string; // 支付宝资金流水号

      app_id: number;
      app_name?: string;
      entity_id: number;
      entity_name?: string; // 提现金额(单位:厘)
      identity: string;
      operator_id?: number;
      operator_name?: string;
      operator_remarks?: string;
      // 提现状态
      out_biz_no: string;
      // 支付宝转账订单号
      pay_fund_order_id: string;
      // 业务订单号
      payment_order_id: string;
      // 真实姓名
      platform: string;

      processed_at?: number;
      // 身份证号/支付宝账号
      real_name: string;
      remarks?: string;
      // 支付平台(alipay,wechatpay)
      status: WithdrawalStatus;

      uid: string;
    };
    type List = Common.PageableData<Info>;
  }
}
