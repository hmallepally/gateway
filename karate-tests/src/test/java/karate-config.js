function fn() {
  var env = karate.env; // get system property 'karate.env'
  karate.log('karate.env system property was:', env);
  
  if (!env) {
    env = 'dev';
  }
  
  var config = {
    env: env,
    baseUrl: 'http://localhost:8000',
    frontendUrl: 'http://localhost:5173',
    timeout: 30000
  }
  
  if (env == 'dev') {
    config.baseUrl = 'http://localhost:8000';
    config.frontendUrl = 'http://localhost:5173';
  } else if (env == 'staging') {
    config.baseUrl = 'https://api-gateway-staging.local';
    config.frontendUrl = 'https://gateway-staging.local';
  } else if (env == 'prod') {
    config.baseUrl = 'https://api-gateway.local';
    config.frontendUrl = 'https://gateway.local';
  }
  
  karate.log('Final config:', config);
  return config;
}
