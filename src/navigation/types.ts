/**
 * Navigation Types
 * Define typed navigation params for the app
 */

export type RootStackParamList = {
    index: undefined;
    "(auth)/signin": undefined;
    "(auth)/signup": undefined;
    "(auth)/forgot-password": undefined;
    "(auth)/forgot-password/otp": undefined;
    "(auth)/forgot-password/reset": undefined;
};

export type AuthStackParamList = {
    signin: undefined;
    signup: undefined;
    "forgot-password": undefined;
};

export type ForgotPasswordStackParamList = {
    index: undefined;
    otp: undefined;
    reset: undefined;
};

// Add more navigation types as you build out the app
export type MainTabParamList = {
    dashboard: undefined;
    loans: undefined;
    notifications: undefined;
    settings: undefined;
};
