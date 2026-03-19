import { redirect } from 'next/navigation';

export default function RootPage() {
  // Redirect / to /karriere/de/
  redirect('/karriere/de/');
}
