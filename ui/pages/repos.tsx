import { useEffect, useState } from 'react';
import { useSession, getSession } from 'next-auth/react';
import { useRouter } from 'next/router';
import { useTranslation } from 'next-i18next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import type { GetServerSidePropsContext } from 'next';
import type { NextPageWithLayout } from 'types';
import { AuthLayout } from '@/components/layouts';
import Head from 'next/head';
import Loading from '@/components/shared/Loading';
import Alert from '@/components/shared/Alert';

interface Repo {
  id: number;
  full_name: string;
  default_branch: string;
}

const Repos: NextPageWithLayout = () => {
  const { data: session, status } = useSession();
  const router = useRouter();
  const { t } = useTranslation('common');
  const [repos, setRepos] = useState<Repo[]>([]);
  const [message, setMessage] = useState<{ text: string; status: 'success' | 'error' } | null>(null);

  // Fetch repositories when the component mounts
  useEffect(() => {
    if (status === 'authenticated') {
      fetchRepos();
    } else if (status === 'unauthenticated') {
      router.push('/auth/login'); // Redirect to login if not authenticated
    }
  }, [status, router]);

  const fetchRepos = async () => {
    try {
      const response = await fetch('/api/repos', {
        headers: {
          Authorization: `Bearer ${session?.accessToken}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch repositories');
      }

      const data = await response.json();
      setRepos(data);
    } catch (error) {
      setMessage({ text: 'Failed to fetch repositories', status: 'error' });
    }
  };

  if (status === 'loading') {
    return <Loading />;
  }

  return (
    <>
      <Head>
        <title>{t('repositories')}</title>
      </Head>
      {message && <Alert status={message.status}>{message.text}</Alert>}
      <div className="container mx-auto p-4">
        <h1 className="text-2xl font-bold mb-4">{t('your-repositories')}</h1>
        <ul className="space-y-2">
          {repos.map((repo) => (
            <li key={repo.id} className="p-4 border rounded-lg">
              <div className="font-semibold">{repo.full_name}</div>
              <div className="text-sm text-gray-600">Default branch: {repo.default_branch}</div>
            </li>
          ))}
        </ul>
      </div>
    </>
  );
};

Repos.getLayout = function getLayout(page: ReactElement) {
  return (
    <AuthLayout heading="your-repositories" description="manage-your-repositories">
      {page}
    </AuthLayout>
  );
};

export const getServerSideProps = async (context: GetServerSidePropsContext) => {
  const { locale } = context;

  return {
    props: {
      ...(locale ? await serverSideTranslations(locale, ['common']) : {}),
    },
  };
};

export default Repos;