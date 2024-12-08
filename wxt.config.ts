import { defineConfig } from "wxt";

export default defineConfig({
    extensionApi: "chrome",
    manifest: {
        permissions: ["storage", "windows", "tabs"],
        host_permissions: ["*://*/*"],
        action: {
            default_popup: "entrypoints/popup/index.html",
        },
    },
    modules: ["@wxt-dev/module-react"],
});
