'use client'

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { authenticateToken } from '../utils';

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
          router.push(`/database/${txHash}`);
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
    <div className="min-h-screen p-8 flex items-center justify-center bg-[#014421]">
      <div className="bg-white p-8 rounded-md">
        {error ? (
          <p className="text-center text-red-500">{error}</p>
        ) : (
          <p className="text-center">{status}</p>
        )}
      </div>
    </div>
  );
} 