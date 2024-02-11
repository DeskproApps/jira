const mockClient = {
  getProxyAuth: () => new Promise(() => {}),
  getAdminGenericProxyAuth: () => () => new Promise(() => {}),
  resize: () => {},
  setWidth: () => {},
  setHeight: () => {},
  registerElement: () => {},
  deregisterElement: () => {},
  setBadgeCount: () => {},
  setTitle: () => {},

  entityAssociationSet: () => Promise.resolve(),
  entityAssociationDelete: () => Promise.resolve(),
  entityAssociationGet: async () => null,
  entityAssociationList: async () => [""],
  entityAssociationCountEntities: async () => 0,

  setState: async () => ({ isSuccess: false, errors: [] }),
  setUserState: async () => ({ isSuccess: false, errors: [] }),
  getState: async () => [],
  getUserState: async () => [],
  deleteState: async () => false,
  deleteUserState: async () => false,
  hasState: async () => false,
  hasUserState: async () => false,

  setSetting: () => Promise.resolve(),
  setSettings: () => Promise.resolve(),

  setBlocking: () => Promise.resolve(),

  registerTargetAction: () => Promise.resolve(),
  deregisterTargetAction: () => Promise.resolve(),

  getOAuth2CallbackUrl: async () => ({ url: "", statePath: "", statePathPlaceholder: "" }),
  getStaticOAuth2CallbackUrl: async () => ({ url: "" }),
  getStaticOAuth2CallbackUrlValue: async () => "",
  getStaticOAuth2Token: async () => null,

  setAdminSetting: () => Promise.resolve(),
  setAdminSettingInvalid: () => Promise.resolve(),

  oauth2: () => ({
    getGenericCallbackUrl: () => Promise.resolve({
      callbackUrl: "deskpro.test/oauth2/1/generic/callback",
      poll: () => Promise.resolve({ token: "auth_code" }),
    }),
  }),
};

export { mockClient };
