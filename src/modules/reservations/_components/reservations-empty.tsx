import { useTranslation } from 'react-i18next';
import { Inbox, SearchX } from 'lucide-react';
import { EmptyState } from '@/shared/components/empty-state';
import { Button } from '@/shared/components/ui/button';

/**
 * Empty reservations list. With a search term it names the term and offers
 * "Clear search" (design: Reservations empty state); otherwise it points at
 * the views and filters.
 */
export function ReservationsEmpty({
  search,
  onClearSearch,
}: {
  search: string | null;
  onClearSearch: () => void;
}) {
  const { t } = useTranslation('reservations');
  if (search) {
    return (
      <EmptyState
        icon={SearchX}
        title={t('emptySearch.title', { q: search })}
        hint={t('emptySearch.hint')}
        action={
          <Button variant='outline' size='sm' onClick={onClearSearch}>
            {t('emptySearch.clear')}
          </Button>
        }
      />
    );
  }
  return <EmptyState icon={Inbox} title={t('empty')} hint={t('emptyHint')} />;
}
