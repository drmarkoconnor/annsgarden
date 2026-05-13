type OpenAIEnv = {
  apiKey: string;
  model: string;
};

const defaultModel = "gpt-5-mini";

function requireEnv(name: string) {
  const value = process.env[name];

  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }

  return value;
}

export function getOpenAIEnv(): OpenAIEnv {
  return {
    apiKey: requireEnv("OPENAI_API_KEY"),
    model: process.env.OPENAI_MODEL ?? defaultModel,
  };
}
