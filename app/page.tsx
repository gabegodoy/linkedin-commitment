import { redirect } from 'next/navigation';
import { requireProfile } from '@/lib/session';

export default async function Home() {
  const { profile } = await requireProfile();
  redirect(profile.role === 'mentor' ? '/mentor' : '/hoje');
}
