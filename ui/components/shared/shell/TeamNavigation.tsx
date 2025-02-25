import {
  Cog6ToothIcon,
  CodeBracketIcon,
  CloudIcon, // For Infrastructure Deployment
  EyeIcon, // For Observability
  CurrencyDollarIcon, // For Cost Management
  ShieldCheckIcon, // For Security
  ArrowPathIcon, // For CI/CD
} from '@heroicons/react/24/outline';
import { useTranslation } from 'next-i18next';
import NavigationItems from './NavigationItems';
import { NavigationProps, MenuItem } from './NavigationItems';

interface NavigationItemsProps extends NavigationProps {
  slug: string;
}

const TeamNavigation = ({ slug, activePathname }: NavigationItemsProps) => {
  const { t } = useTranslation('common');

  const menus: MenuItem[] = [
    {
      name: t('all-products'),
      href: `/teams/${slug}/products`,
      icon: CodeBracketIcon,
      active: activePathname === `/teams/${slug}/products`,
    },
    {
      name: t('code-ci-cd-deploy'),
      href: `/teams/${slug}/ci-cd`,
      icon: ArrowPathIcon, // You can use a different icon if needed
      active: activePathname === `/teams/${slug}/ci-cd`,
    },
    {
      name: t('infrastructure-deployment'),
      href: `/teams/${slug}/infrastructure`,
      icon: CloudIcon, // You can use a different icon if needed
      active: activePathname === `/teams/${slug}/infrastructure`,
    },
    {
      name: t('cloud-connect'),
      href: `/teams/${slug}/cloud-connect`,
      icon: CloudIcon, // Icon for Cloud Connect
      active: activePathname === `/teams/[slug]/cloud-connect`,
    },
    {
      name: t('observability'),
      href: `/teams/${slug}/observability`,
      icon: EyeIcon, // You can use a different icon if needed
      active: activePathname === `/teams/${slug}/observability`,
    },
    {
      name: t('cost-management'),
      href: `/teams/${slug}/cost-management`,
      icon: CurrencyDollarIcon, // You can use a different icon if needed
      active: activePathname === `/teams/${slug}/cost-management`,
    },
    {
      name: t('security'),
      href: `/teams/${slug}/security`,
      icon: ShieldCheckIcon, // You can use a different icon if needed
      active: activePathname === `/teams/${slug}/security`,
    },
    {
      name: t('settings'),
      href: `/teams/${slug}/settings`,
      icon: Cog6ToothIcon,
      active:
        activePathname?.startsWith(`/teams/${slug}`) &&
        !activePathname.includes('products') &&
        !activePathname.includes('ci-cd') &&
        !activePathname.includes('infrastructure') &&
        !activePathname.includes('observability') &&
        !activePathname.includes('cost-management') &&
        !activePathname.includes('security'),
    },
  ];

  return <NavigationItems menus={menus} />;
};

export default TeamNavigation;
