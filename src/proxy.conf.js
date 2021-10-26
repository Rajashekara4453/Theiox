const PROXY_CONFIG = [
  {
    context: ['/app2', '/alarms'],
    target: 'iot.elmeasure.com',
    secure: false,
    changeOrigin: true
  }
];

module.exports = PROXY_CONFIG;
