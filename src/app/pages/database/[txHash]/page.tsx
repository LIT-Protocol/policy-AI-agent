'use client'

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { signAndBroadcastTransaction } from '../../../agent-helpers';

interface Transaction {
  id: number;
  txHash: string;
  amount: number;
  timestamp: Date;
  status: string;
  approved: boolean;
}

export default function TransactionPage() {
  const params = useParams();
  const [transaction, setTransaction] = useState<Transaction | null>(null);
  const [loading, setLoading] = useState(true);
  const [approving, setApproving] = useState(false);
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);

  const fetchTransaction = async () => {
    try {
      const response = await fetch(`/api/database/fetch-transaction/${params.txHash}`);
      const data = await response.json();
      if (data.success) {
        setTransaction(data.transaction);
        if (data.transaction.approved) {
          setShowSuccessMessage(true);
        }
      }
    } catch (error) {
      console.error('Failed to fetch transaction:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (params.txHash) {
      fetchTransaction();
    }
  }, [params.txHash]);

  const handleApprove = async () => {
    if (!transaction) return;
    
    setApproving(true);
    try {
      const txHash = await signAndBroadcastTransaction(true, transaction.txHash);
      if (txHash) {
        await fetchTransaction();
        setShowSuccessMessage(true);
      }
    } catch (error) {
      console.error('Failed to approve transaction:', error);
    } finally {
      setApproving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen p-8 flex items-center justify-center bg-[#1A1A1A]">
        <div className="bg-[#242424] p-8 rounded-xl border border-[#FF5733]/20 shadow-lg">
          <p className="text-gray-300">Loading transaction details...</p>
        </div>
      </div>
    );
  }

  if (!transaction) {
    return (
      <div className="min-h-screen p-8 flex items-center justify-center bg-[#1A1A1A]">
        <div className="bg-[#242424] p-8 rounded-xl border border-[#FF5733]/20 shadow-lg">
          <p className="text-gray-300">Transaction not found</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-8 flex items-center justify-center bg-[#1A1A1A]">
      <div className="bg-[#242424] p-8 rounded-xl border border-[#FF5733]/20 shadow-lg w-full max-w-2xl">
        {showSuccessMessage && transaction?.approved && (
          <div className="bg-[#2A2A2A] border border-[#FF5733]/30 text-[#FF5733] px-4 py-3 rounded-lg relative mb-6">
            <strong className="font-bold">Success! </strong>
            <span className="block sm:inline">
              Transaction completed with hash: {transaction.txHash}
            </span>
          </div>
        )}
        
        <h1 className="text-2xl font-bold mb-6 text-gray-100">
          Lit AI Agent <span className="text-[#FF5733]">Transaction Details</span>
        </h1>
        <div className="space-y-4">
          <div className="flex justify-between border-b border-gray-700 pb-2">
            <span className="font-semibold text-gray-300">Transaction Hash:</span>
            <span className="font-mono text-sm text-gray-400">{transaction.txHash}</span>
          </div>
          <div className="flex justify-between border-b border-gray-700 pb-2">
            <span className="font-semibold text-gray-300">Amount:</span>
            <span className="text-gray-400">{transaction.amount} gwei</span>
          </div>
          <div className="flex justify-between border-b border-gray-700 pb-2">
            <span className="font-semibold text-gray-300">Status:</span>
            <span className={`${
              transaction.status === 'AUTHENTICATED' ? 'text-[#FF5733]' : 'text-yellow-500'
            }`}>
              {transaction.status}
            </span>
          </div>
          <div className="flex justify-between border-b border-gray-700 pb-2">
            <span className="font-semibold text-gray-300">Timestamp:</span>
            <span className="text-gray-400">{new Date(transaction.timestamp).toLocaleString()}</span>
          </div>
          <div className="flex justify-between border-b border-gray-700 pb-2">
            <span className="font-semibold text-gray-300">Approved:</span>
            <span className={`${
              transaction.approved ? 'text-[#FF5733]' : 'text-red-500'
            }`}>
              {transaction.approved ? 'Yes' : 'No'}
            </span>
          </div>
          {!transaction.approved && transaction.status === 'AUTHENTICATED' && (
            <div className="flex justify-center mt-6">
              <button
                onClick={handleApprove}
                disabled={approving}
                className={`bg-[#FF5733] text-white px-6 py-2 rounded-lg ${
                  approving ? 'opacity-50 cursor-not-allowed' : 'hover:bg-[#FF5733]/80'
                } transition-all duration-200`}
              >
                {approving ? 'Approving...' : 'Approve Transaction'}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 