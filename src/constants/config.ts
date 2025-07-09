import Constants from 'expo-constants';

const ENV = {
  dev: {
    apiUrl: 'https://podcastserver-production.up.railway.app/api',
    apiTimeout: 10000,
  },
  staging: {
    apiUrl: 'https://staging-api.podcast.com/api',
    apiTimeout: 10000,
  },
  prod: {
    apiUrl: 'https://api.podcast.com/api',
    apiTimeout: 10000,
  },
};

const getEnvVars = () => {
  if (__DEV__) {
    return ENV.dev;
  }
  
  // Sử dụng extra config để xác định environment
  const environment = Constants.expoConfig?.extra?.environment;
  
  switch (environment) {
    case 'staging':
      return ENV.staging;
    case 'prod':
      return ENV.prod;
    default:
      return ENV.prod;
  }
};

export default getEnvVars();