export const msalConfig = {
  auth: {
    clientId: "a0b128b1-1290-4e6e-94e7-6d0b823896dd",

    // FIX: "common" allows both personal (@outlook/@hotmail) and
    // work/school Microsoft accounts instead of locking to one tenant
    authority: "https://login.microsoftonline.com/common",

    redirectUri: "https://cybersec-hub-production-9802.up.railway.app",
  },
};

export const loginRequest = {
  scopes: ["User.Read"],
};
