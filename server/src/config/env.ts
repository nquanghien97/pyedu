import * as dotenv from 'dotenv';
dotenv.config({ path: '.env' });
import { z } from 'zod';

const deployableEnvironments = ['local', 'prd'] as const;
export type DeployableEnvironments = (typeof deployableEnvironments)[number];

const envVarSchema = z.object({
  DeploymentEnvironment: z.enum([...deployableEnvironments]),
  databaseUrl: z.string(),
  jwtSecret: z.string(),
  internalAuthSecret: z.string(),
  cloudinaryUrl: z.string().optional(),
  geminiApiKey: z.string(),
});

export type EnvironmentVariables = z.infer<typeof envVarSchema>;

const isValidDeploymentEnvironment = (
  e: DeployableEnvironments | string
): e is DeployableEnvironments =>
  deployableEnvironments.includes(e as DeployableEnvironments);

const getEnvVars = (): EnvironmentVariables => {
  const DeploymentEnvironment = process.env.DEPLOYMENT_ENV || 'local';
  if (!isValidDeploymentEnvironment(DeploymentEnvironment)) {
    throw new Error(
      `Unexpected deployment environment provided ${DeploymentEnvironment}`
    );
  }

  return envVarSchema.parse({
    DeploymentEnvironment,
    databaseUrl: process.env.DATABASE_URL,
    jwtSecret: process.env.JWT_SECRET,
    internalAuthSecret: process.env.INTERNAL_AUTH_SECRET,
    cloudinaryUrl: process.env.CLOUDINARY_URL,
    geminiApiKey: process.env.GEMINI_API_KEY,
  });
};

export const ENV_VARS: EnvironmentVariables = getEnvVars();
