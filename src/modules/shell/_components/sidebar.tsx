import { NavLink } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { CircleHelp } from 'lucide-react';
import { SCREEN_KEYS, SCREENS } from '@/app/screens';
import { usePermissionCheck } from '@/shared/permissions';
import { cn } from '@/shared/lib/utils';
import { BranchSwitcher } from '@/modules/shell/_components/branch-switcher';

const NAV_ITEM =
  'flex h-10.5 items-center gap-2.5 rounded-[14px] px-3 font-bold transition-colors [&_svg]:size-4.5';

/**
 * Pulse sidebar — a light surface panel beside the page (design update:
 * no longer the dark hero palette): brand, provider + branch switcher,
 * the modules, help at the bottom. Rendered inline on desktop and inside a
 * Sheet on small screens (`onNavigate` closes it).
 */
export function SidebarContent({
  onNavigate,
  badges,
}: {
  onNavigate?: () => void;
  /** Count bubbles per screen, e.g. `{ reservations: 2 }`; 0 = none. */
  badges?: Partial<Record<string, number>>;
}) {
  const { t } = useTranslation();
  const can = usePermissionCheck();

  return (
    <div className='bg-surface text-ink-2 border-line flex h-full flex-col gap-4.5 border-e px-3.5 py-5'>
      <div className='flex items-center gap-2.5 px-1.5'>
        <span
          aria-hidden
          className='bg-brand text-on-brand grid size-9 flex-none place-items-center rounded-md'
        >
          <svg viewBox='0 0 24 24' className='size-4.5'>
            <path fill='currentColor' d='M4 4h16v8h-8v8H4z' />
          </svg>
        </span>
        <span className='flex flex-col leading-snug'>
          <span className='hd text-ink text-[15px] font-bold'>
            {t('appName')}
          </span>
          <span className='text-xs'>{t('appSubtitle')}</span>
        </span>
      </div>

      <BranchSwitcher onNavigate={onNavigate} />

      <nav aria-label={t('shell.mainNav')} className='flex flex-col gap-1'>
        {SCREEN_KEYS.filter((k) => can(SCREENS[k].permission)).map((key) => {
          const { path, icon: Icon } = SCREENS[key];
          const badge = badges?.[key];
          return (
            <NavLink
              key={key}
              to={path}
              onClick={onNavigate}
              className={({ isActive }) =>
                cn(
                  NAV_ITEM,
                  isActive ? 'bg-brand-soft text-brand' : 'hover:text-ink',
                )
              }
            >
              <Icon aria-hidden />
              <span className='flex-1'>{t(`nav.${key}`)}</span>
              {badge ? (
                <span className='num bg-brand text-on-brand grid h-5.5 min-w-5.5 place-items-center rounded-full px-1.5 text-xs font-semibold'>
                  {badge}
                </span>
              ) : null}
            </NavLink>
          );
        })}
      </nav>

      <div className='flex-1' />
      <a href='#' className={cn(NAV_ITEM, 'hover:text-ink')}>
        <CircleHelp aria-hidden />
        {t('shell.help')}
      </a>
    </div>
  );
}
