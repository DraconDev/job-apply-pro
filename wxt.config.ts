import { defineConfig } from "wxt";

export default defineConfig({
  extensionApi: "chrome",
  manifest: {
    name: "LinkedIn Auto Apply Pro",
    description: "Automate your LinkedIn job application process",
    version: "1.1.12",
    // This is a development public key, it will generate a consistent ID
    permissions: ["storage", "windows", "tabs"],
    host_permissions: ["https://*.linkedin.com/*"],
    action: {
      default_popup: "entrypoints/popup/index.html",
      default_title: "LinkedIn Auto Apply Pro",
    },
  },
  modules: ["@wxt-dev/module-react"],
});
