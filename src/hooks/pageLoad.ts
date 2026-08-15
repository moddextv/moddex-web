// A list asks two different questions about a reply that is on its way back, and
// conflating them is what left "Load more" disabled for the rest of the session
// on 2026-08-13.
//
//   wanted  — does this reply still belong to the query on screen? the LIST's
//             question. a superseded page must be dropped.
//   newest  — is this still the most recent request? the BUTTON's question. a
//             superseded page must STILL put the button back.
//
// They differ exactly when the query moves while a page is in flight.

export interface PageLoad {
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
