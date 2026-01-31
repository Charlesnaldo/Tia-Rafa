// src/app/not-found.tsx
import Link from 'next/link';
export const dynamic = 'force-dynamic';

export default function NotFound() {
  return (
    <div style={{ textAlign: 'center', marginTop: '50px' }}>
      <h2>404 - Página não encontrada</h2>
      <Link href="/">Voltar para a página inicial</Link>
    </div>
  );
}