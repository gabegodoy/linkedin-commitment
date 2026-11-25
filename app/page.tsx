import { redirect } from 'next/navigation';
import { requireProfile } from '@/lib/session';
import { homeOf } from '@/lib/types';

export default async function Home() {
  const { profile } = await requireProfile();
  redirect(profile.role === 'mentor' ? '/mentor' : homeOf(profile));
}
