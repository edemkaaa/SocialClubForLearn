export type AppConfig = {
  nodeEnv: string;
  name: string;
  workingDirectory: string;
  frontendDomain?: string;
  backendDomain: string;
  port: number;
  apiPrefix: string;
  fallbackLanguage: string;
  headerLanguage: string;

  // Добавляем тип для конфигурации Elasticsearch
  elasticsearch: {
    node: string;
    username: string;
    password: string;
    maxRetries: number;
    requestTimeout: number;
  };
};
