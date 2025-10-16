import { dynamic } from 'next/dynamic';
import ResetPassword from '../../components/admin/ResetPassword';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'Reset Password - ADONS Studio',
  description: 'Reset your ADONS Studio admin password',
};

export default function ResetPasswordPage() {
  return <ResetPassword />;
}
