import { defineConfig } from "wxt";

export default defineConfig({
    extensionApi: "chrome",
    manifest: {
        name: "LinkedIn Auto Apply Pro",
        description: "Automate your LinkedIn job application process",
        version: "1.4.75",
        // This is a development public key, it will generate a consistent ID
        key: "MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAhm3X7qutsrskke84ltbOvV/BgZWLDjFJBovR6vqQZ+DgrXj3K/RqCxHRYABHIYAZWEg4GXq+JqkbBU4L5EUmZf0j2+HMHWZPrZph7/Xs3WUk5jEakL1x0LYr4KDZmQJrxrXBCWsUM1qwGgsHJKp7LW/GXPTEUPMRRngbKZRBKVqpgz+QWkKonI5CCqpKcYJRN0uGRhFyL/0OYg8BL8r2/CTN3WnvBo1YoHwzEhqp9Jt9yCnvWrn9qLRMvIXeZ4CmxQPRoVPrqXt/zPUz9nEGQJyJw7S5nki7B2V+HcwH8QyvB3RvT1BJp5yj9ZKwZ4jEqUgEp/EGyVwEv9r8cwIDAQAB",
        permissions: ["storage", "windows", "tabs"],
        host_permissions: ["*://*/*"],
        action: {
            default_popup: "entrypoints/popup/index.html",
        },
    },
    modules: ["@wxt-dev/module-react"],
});
