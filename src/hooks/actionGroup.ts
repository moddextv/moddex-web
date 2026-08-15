export interface ActionState {
  pending: boolean;
  error: string | null;
  code: string | null;
}

export interface ClearableAction extends ActionState {
  clearError: () => void;
}

export interface GroupedAction extends ActionState {
  clearError: () => void;
}

export const groupState = (states: readonly ActionState[]): ActionState => {
  const failed = states.find((state) => state.error !== null);

  return {
    pending: states.some((state) => state.pending),
    error: failed?.error ?? null,
    code: failed?.code ?? null
  };
};

export const actionGroup = (...actions: readonly ClearableAction[]): GroupedAction => ({
  ...groupState(actions),
  clearError: () => {
    for (const action of actions) action.clearError();
  }
});
