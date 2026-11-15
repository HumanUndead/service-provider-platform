import { useMemo } from 'react';
import {
  Link,
  useLocation,
  useNavigate,
  useSearchParams,
} from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { ChevronDown } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/shared/components/ui/dropdown-menu';
import { useUiLang } from '@/shared/hooks/use-ui-lang';
import { pickTranslation } from '@/shared/lib/translation';
import { usePermissionCheck, useSpPermissionCheck } from '@/shared/permissions';
import { useCurrentUser } from '@/shared/session/current-user';
import { SCREENS, screenKeyOf, type ScreenKey } from '@/app/screens';
import { branchListQuery } from '@/modules/branches/api/branches';
import {
  formatBranchParam,
  parseBranchParam,
} from '@/modules/today/lib/branch-param';

/**
 * Screens with a URL branch filter, and the param each one uses. The
 * switcher writes that param in place; on any other screen choosing a
 * branch opens Today scoped to it.
 */
const BRANCH_PARAM: Partial<Record<ScreenKey, 'branch' | 'branches'>> = {
  today: 'branches',
  reservations: 'branch',
};

const ALL = 'all';

const CARD =
  'border-line bg-sunken text-ink flex w-full items-center gap-2.5 rounded-xl border px-3 py-2.5 text-start';

/**
 * Sidebar provider card + branch switcher (design: `.bsw`). The label
 * follows the current screen's branch filter; "Manage branches" opens the
 * Branches screen. Without the branch permission it is a static card.
 */
export function BranchSwitcher({ onNavigate }: { onNavigate?: () => void }) {
  const { t } = useTranslation();
  const lang = useUiLang();
  const can = usePermissionCheck();
  const canSp = useSpPermissionCheck();
  const { user, serviceProviderId } = useCurrentUser();
  const { pathname } = useLocation();
  const [params, setParams] = useSearchParams();
  const navigate = useNavigate();

  const canBranches = canSp('view:service-provider-branch');
  const branches = useQuery({
    ...branchListQuery({
      pageNumber: 1,
      pageSize: 1000,
      serviceProviderId: serviceProviderId ?? undefined,
    }),
    enabled: canBranches && serviceProviderId != null,
  });
  const options = useMemo(
    () =>
      (branches.data?.data ?? []).map((b) => ({
        id: b.id,
        name:
          pickTranslation(b.translations, lang)?.name ??
          t('shell.unnamedBranch', { id: b.id }),
      })),
    [branches.data, lang, t],
  );

  const screen = screenKeyOf(pathname);
  const param = screen ? BRANCH_PARAM[screen] : undefined;
  // Only a single branch counts as "the" branch; several (Today) read as all.
  const ids = param ? parseBranchParam(params.get(param)) : [];
  const current = ids.length === 1 ? ids[0] : undefined;
  const currentName = options.find((o) => o.id === current)?.name;
  const count =
    options.length || user?.userServiceProviderBranches?.length || 0;

  const summary = (
    <span className='flex min-w-0 flex-1 flex-col leading-snug'>
      <span className='truncate font-bold'>
        {user?.serviceProviderName ?? '—'}
      </span>
      <span className='text-ink-2 truncate text-xs'>
        {currentName
          ? t('shell.branchNamed', { name: currentName })
          : count > 0
            ? `${t('shell.allBranches')} · ${t('shell.branchCount', { count })}`
            : t('shell.allBranches')}
      </span>
    </span>
  );

  if (!canBranches) return <div className={CARD}>{summary}</div>;

  const choose = (value: string) => {
    const id = value === ALL ? undefined : Number(value);
    if (param) {
      const next = new URLSearchParams(params);
      const v = id === undefined ? null : formatBranchParam([id]);
      if (v === null) next.delete(param);
      else next.set(param, v);
      next.delete('page');
      setParams(next);
    } else {
      navigate(
        id === undefined
          ? SCREENS.today.path
          : `${SCREENS.today.path}?branches=${id}`,
      );
    }
    onNavigate?.();
  };

  return (
    <DropdownMenu dir={lang === 'ar' ? 'rtl' : 'ltr'}>
      <DropdownMenuTrigger
        className={`${CARD} hover:border-brand data-[state=open]:border-brand group transition-colors`}
        aria-label={t('shell.branchSwitcher')}
      >
        {summary}
        <ChevronDown
          aria-hidden
          className='size-4.5 flex-none transition-transform group-data-[state=open]:rotate-180'
        />
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align='start'
        className='w-(--radix-dropdown-menu-trigger-width)'
      >
        <DropdownMenuRadioGroup
          value={current === undefined ? ALL : String(current)}
          onValueChange={choose}
        >
          <DropdownMenuRadioItem value={ALL}>
            {t('shell.allBranches')}
          </DropdownMenuRadioItem>
          {options.map((o) => (
            <DropdownMenuRadioItem key={o.id} value={String(o.id)}>
              {o.name}
            </DropdownMenuRadioItem>
          ))}
        </DropdownMenuRadioGroup>
        {can(SCREENS.branches.permission) && (
          <>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild className='text-brand'>
              <Link to={SCREENS.branches.path} onClick={onNavigate}>
                {t('shell.manageBranches')}
              </Link>
            </DropdownMenuItem>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
