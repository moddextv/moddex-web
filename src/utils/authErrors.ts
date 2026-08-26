export class NotAuthenticatedError extends Error {
  constructor() {
    super('not authenticated');
    this.name = 'NotAuthenticatedError';
  }
}

export class NotAuthorizedError extends Error {
  constructor(
    readonly required: number,
    readonly actual: number
  ) {
    super(`not authorized: requires permission ${required}, has ${actual}`);
    this.name = 'NotAuthorizedError';
  }
}
