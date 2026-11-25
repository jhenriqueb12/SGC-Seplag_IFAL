import { Redirect } from 'expo-router';
import { useApp } from '../state/AppProvider';
import { LoginScreen } from '../screens/LoginScreen';

export default function Index() {
  const { session, contracts } = useApp();

  if (!session) return <LoginScreen />;

  const firstContract = contracts[0];
  return (
    <Redirect
      href={firstContract ? `/contracts/${firstContract.id}` : '/contracts/new'}
    />
  );
}
