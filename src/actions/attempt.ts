import 'server-only';

import { ActionResult, failed, ok } from '@/actions/result';
import { ModdexApiError } from '@/utils/api/moddex';
import { NotAuthenticatedError, NotAuthorizedError } from '@/utils/authErrors';
import { logger } from '@/misc/Logger';

export const attempt = async <T>(
  label: string,
  work: () => Promise<T>
): Promise<ActionResult<T>> => {
  try {
    return ok(await work());
  } catch (error) {
    if (error instanceof ModdexApiError) {
      logger.warn(`${label} failed`, error);

      return failed<T>(error.detail || "That didn't go through.", error.code);
    }

    if (error instanceof NotAuthenticatedError) {
      logger.info(`${label} refused: not signed in`);

      return failed<T>("You're signed out. Sign in again and retry.", 'unauthenticated');
    }

    if (error instanceof NotAuthorizedError) {
      logger.info(`${label} refused: ${error.message}`);

      return failed<T>("You don't have permission to do that any more.", 'unauthorized');
    }

    logger.error(`${label} threw`, error);

    return failed<T>('Something went wrong. Try again in a moment.');
  }
};
