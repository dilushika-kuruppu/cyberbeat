const { createProxyMiddleware } = require('http-proxy-middleware');

module.exports = function(app) {
    app.use(
        '/v1/report',
        createProxyMiddleware({
            target: 'http://vkenpayreport.us-east-2.elasticbeanstalk.com',
            changeOrigin: true
        })
    );
};