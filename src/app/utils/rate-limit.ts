import { isAxiosError } from "axios";

export const RATE_LIMIT_MESSAGE =
  "Muitas tentativas. Aguarde um pouco e tente novamente.";

export function isRateLimitError(error: unknown): boolean {
  return isAxiosError(error) && error.response?.status === 429;
}
