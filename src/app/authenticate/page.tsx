'use client'

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { authenticateToken } from '../agent';

export default function AuthenticatePage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [status, setStatus] = useState('Verifying your authentication...');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const handleAuthentication = async () => {
      const token = searchParams.get('token');
      
      if (!token) {
        setError('Missing authentication token');
        return;
      }

      try {
        setStatus('Getting latest transaction...');
        // Get the latest pending transaction first
        const pendingResponse = await fetch('/api/latest-pending-transaction');
        const pendingData = await pendingResponse.json();
        
        if (!pendingData.success || !pendingData.transaction) {
          setError('No pending transaction found');
          return;
        }

        setStatus('Authenticating...');
        // Then authenticate with the transaction hash
        const session = await authenticateToken(token, pendingData.transaction.txHash);
        
        if (session) {
          setStatus('Authentication successful! Redirecting...');
          router.push(`/transaction/${pendingData.transaction.txHash}`);
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