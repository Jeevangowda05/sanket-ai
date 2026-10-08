import { describe, expect, it } from 'vitest';

import { isLiveOutgoingMessage } from './validation';

describe('isLiveOutgoingMessage', () => {
  it('accepts valid payload', () => {
    expect(
      isLiveOutgoingMessage({
        type: 'status',
        status: 'unavailable',
        message: 'Model unavailable',
      }),
    ).toBe(true);
  });

  it('rejects malformed payload', () => {
    expect(isLiveOutgoingMessage({ type: 'status', message: 'missing status' })).toBe(false);
  });
});
