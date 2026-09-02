// Metro resolves the .native.ts / .web.ts split at build time; TypeScript does not
// follow platform extensions, so declare the module for the type checker only.
declare module "@/polyfills/wallet-compat";
