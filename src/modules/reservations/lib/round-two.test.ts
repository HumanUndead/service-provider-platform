import { describe, expect, it } from 'vitest';
import { tagParams } from '@/shared/api/lookups';
import {
  orderListParams,
  ORDER_LIST_PATH,
  updatePriceBody,
  updateResultBody,
} from '@/modules/reservations/api/orders';
import { parseMoney } from '@/modules/reservations/lib/order-rules';

/** Answers to the second round of questions (Missing Items §12). */
describe('Missing Items §12', () => {
  it('tag picker: Type=1 for admins, own provider id for everyone else', () => {
    expect(tagParams({ isAdmin: true, serviceProviderId: null })).toEqual({
      Type: 1,
    });
    expect(tagParams({ isAdmin: false, serviceProviderId: 4 })).toEqual({
      ServiceProviderId: 4,
    });
  });

  it('a branch filter stays on ShortcutList as ServiceProviderBranchIds', () => {
    expect(ORDER_LIST_PATH).toBe('Reservation/Reservation/ShortcutList?');
    const params = orderListParams(
      { pageNumber: 1, pageSize: 10, serviceProviderBranchId: 12 },
      null,
    );
    expect(params.ServiceProviderBranchIds).toEqual([12]);
    expect(params).not.toHaveProperty('serviceProviderBranchId');
  });

  it('update price sends type 2 and resends the current fit (Blocked Items §2)', () => {
    expect(
      updatePriceBody({
        reservationId: 'R-1',
        isFit: true,
        cost: 150.5,
        sellPrice: 200,
      }),
    ).toEqual({
      reservationId: 'R-1',
      reservationUpdateType: 2,
      isFit: true,
      cost: 150.5,
      sellPrice: 200,
    });
  });

  it('money inputs take decimals ≥ 0 only', () => {
    expect(parseMoney('150.25')).toBe(150.25);
    expect(parseMoney('0')).toBe(0);
    expect(parseMoney('-1')).toBeNull();
    expect(parseMoney('')).toBeNull();
    expect(parseMoney('12a')).toBeNull();
  });

  it('update result sends a fit-only update with the chosen enrollment', () => {
    expect(
      updateResultBody({
        reservationId: 'R-1',
        isFit: false,
        enrollmentType: 2,
      }),
    ).toEqual({
      reservationId: 'R-1',
      reservationUpdateType: 1,
      isFit: false,
      enrollmentType: 2,
    });
  });
});
