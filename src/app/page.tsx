import LoadingSpinner from '@/components/main/loading';
import dynamic from 'next/dynamic';

const Main = dynamic(() => import('../components/main/main'), {
  ssr: false,
  loading: () => <LoadingSpinner />,
});

export default function HomePage() {
  return <Main />;
}
