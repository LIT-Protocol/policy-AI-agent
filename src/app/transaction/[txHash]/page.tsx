'use client'

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { signAndBroadcastTransaction } from '../../agent';

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
      const response = await fetch(`/api/transaction/${params.txHash}`);
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
      const txHash = await signAndBroadcastTransaction(transaction.txHash);
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

  // Helper function to format amount
  const formatAmount = (amount: number) => {
    // Convert from stored integer to USDC decimal format
    const amountInUSDC = amount / 1_000_000;
    return `${amountInUSDC.toFixed(2)} USDC`;
  };

  if (loading) {
    return (
      <div className="min-h-screen p-8 flex items-center justify-center bg-[#014421]">
        <div className="bg-white p-8 rounded-md">
          <p>Loading transaction details...</p>
        </div>
      </div>
    );
  }

  if (!transaction) {
    return (
      <div className="min-h-screen p-8 flex items-center justify-center bg-[#014421]">
        <div className="bg-white p-8 rounded-md">
          <p>Transaction not found</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-8 flex items-center justify-center bg-[#014421]">
      <div className="bg-white p-8 rounded-md w-full max-w-2xl">
        {showSuccessMessage && transaction?.approved && (
          <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative mb-6">
            <strong className="font-bold">Success! </strong>
            <span className="block sm:inline">
              Transaction completed with hash: {transaction.txHash.split('_')[2]}
            </span>
          </div>
        )}
        
        <h1 className="text-2xl font-bold mb-6">Transaction Details</h1>
        <div className="space-y-4">
          <div className="flex justify-between border-b pb-2">
            <span className="font-semibold">Transaction Hash:</span>
            <span className="font-mono text-blue-600">{transaction?.txHash.split('_')[2]}</span>
          </div>
          <div className="flex justify-between border-b pb-2">
            <span className="font-semibold">Amount:</span>
            <span>{transaction ? formatAmount(transaction.amount) : '-'}</span>
          </div>
          <div className="flex justify-between border-b pb-2">
            <span className="font-semibold">Status:</span>
            <span className={`${
              transaction?.status === 'AUTHENTICATED' ? 'text-green-600' : 'text-yellow-600'
            }`}>
              {transaction?.status}
            </span>
          </div>
          <div className="flex justify-between border-b pb-2">
            <span className="font-semibold">Timestamp:</span>
            <span>{transaction ? new Date(transaction.timestamp).toLocaleString() : '-'}</span>
          </div>
          <div className="flex justify-between border-b pb-2">
            <span className="font-semibold">Approved:</span>
            <span className={`${
              transaction?.approved ? 'text-green-600' : 'text-red-600'
            }`}>
              {transaction?.approved ? 'Yes' : 'No'}
            </span>
          </div>
          {!transaction?.approved && transaction?.status === 'AUTHENTICATED' && (
            <div className="flex justify-center mt-6">
              <button
                onClick={handleApprove}
                disabled={approving}
                className={`bg-green-500 text-white px-6 py-2 rounded-md ${
                  approving ? 'opacity-50 cursor-not-allowed' : 'hover:bg-green-600'
                }`}
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