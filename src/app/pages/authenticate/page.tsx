'use client'

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { authenticateToken } from '../../utils';

export default function AuthenticatePage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [status, setStatus] = useState('Verifying your authentication...');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const handleAuthentication = async () => {
      const token = searchParams.get('token');
      const txHash = searchParams.get('txHash');
      
      if (!token) {
        setError('Missing authentication token');
        return;
      }

      if (!txHash) {
        setError('Missing transaction hash');
        return;
      }

      try {
        setStatus('Authenticating transaction...');
        const session = await authenticateToken(token, txHash);
        
        if (session) {
          setStatus('Authentication successful! Redirecting...');
          router.push(`/pages/database/${txHash}`);
        } else {
          setError('Authentication failed');
        }
      } catch (err) {
        console.error('Authentication error:', err);
        setError(err instanceof Error ? err.message : 'Authentication failed');
      }
    };

    handleAuthentication();
  }, [searchParams, router]);

  return (
    <div className="min-h-screen p-8 flex items-center justify-center bg-[#1A1A1A]">
      <div className="bg-[#242424] p-8 rounded-xl border border-[#FF5733]/20 shadow-lg shadow-[#FF5733]/5">
        <h2 className="text-xl font-bold text-gray-100 mb-4">Lit AI Agent Authentication</h2>
        {error ? (
          <p className="text-center text-[#FF5733]">{error}</p>
        ) : (
          <p className="text-center text-gray-300">{status}</p>
        )}
      </div>
    </div>
  );
} 