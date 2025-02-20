module.exports = {
    apps: [{
        name: "gobbl-payments",
        script: "index.js",
        env: {
            NODE_ENV: "production",
        },
        wait_ready: true,
        listen_timeout: 50000,
        kill_timeout: 5000,
        // Add this to ensure PM2 can access the SSL certificates
        user: "root", // changed from "ubuntu" to your actual username
        group: "certsgroup" // the group we created for SSL cert access
    }]
} 