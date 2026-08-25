// wanted is the list's question, newest the button's; they differ mid-flight

interface PageLoad {
  generation: number;
  ticket: number;
}

export interface Attempt {
  generation: number;
  ticket: number;
}

export const createPageLoad = (): PageLoad => ({ generation: 0, ticket: 0 });

// a new query — sort, search or filter changed. everything in flight is stale.
export const beginQuery = (load: PageLoad): Attempt => ({
  generation: ++load.generation,
  ticket: load.ticket
});

// one more page of the query already on screen
export const beginPage = (load: PageLoad): Attempt => ({
  generation: load.generation,
  ticket: ++load.ticket
});

export const wanted = (load: PageLoad, attempt: Attempt): boolean =>
  attempt.generation === load.generation;

export const newest = (load: PageLoad, attempt: Attempt): boolean => attempt.ticket === load.ticket;
