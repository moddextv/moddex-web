import { describe, expect, it, vi } from 'vitest';
import { actionGroup, groupState } from '@/hooks/actionGroup';

const idle = { pending: false, error: null, code: null };
const busy = { pending: true, error: null, code: null };
const broken = (error: string, code: string | null = null) => ({ pending: false, error, code });

describe('groupState', () => {
  it('is idle when every action is', () => {
    expect(groupState([idle, idle])).toEqual(idle);
  });

  it('is pending when any one action is', () => {
    expect(groupState([idle, busy, idle]).pending).toBe(true);
  });

  it('reports the first error rather than the last', () => {
    expect(groupState([idle, broken('first'), broken('second')]).error).toBe('first');
  });

  it('carries the code belonging to that same error', () => {
    const state = groupState([broken('this is the owner account', 'owner'), broken('other', 'x')]);

    expect(state).toEqual({ pending: false, error: 'this is the owner account', code: 'owner' });
  });

  it('does not pair an error with a code from a different action', () => {
    const state = groupState([broken('no code here'), broken('other', 'last admin')]);

    expect(state.code).toBeNull();
  });

  it('handles being given nothing', () => {
    expect(groupState([])).toEqual(idle);
  });
});

describe('actionGroup', () => {
  it('clears every member, not just the failed one', () => {
    const first = { ...broken('boom'), clearError: vi.fn() };
    const second = { ...idle, clearError: vi.fn() };

    actionGroup(first, second).clearError();

    expect(first.clearError).toHaveBeenCalledOnce();
    expect(second.clearError).toHaveBeenCalledOnce();
  });

  it('exposes the grouped state alongside the clear', () => {
    const group = actionGroup({ ...idle, clearError: () => {} }, { ...busy, clearError: () => {} });

    expect(group.pending).toBe(true);
    expect(group.error).toBeNull();
  });
});
