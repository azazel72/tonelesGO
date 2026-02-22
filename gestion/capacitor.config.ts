import type { CapacitorConfig } from "@capacitor/cli";

const config: CapacitorConfig = {
  appId: "com.paezlobato.factory",
  appName: "FactoryGestion",
  webDir: "dist/factory-gestion/browser",
  bundledWebRuntime: false,
  server: {
    cleartext: true
  }
};

export default config;

