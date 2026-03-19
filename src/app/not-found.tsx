import Link from 'next/link';

export default function NotFound() {
  return (
    <div style={{ padding: '100px 20px', textAlign: 'center', fontFamily: 'sans-serif' }}>
      <h1>404 - Page Not Found</h1>
      <p>The page you are looking for does not exist in our static export.</p>
      <Link href="/" style={{ color: '#db2777', fontWeight: 'bold' }}>
        Return to Home
      </Link>
    </div>
  );
}
