'use client'

import React, { useEffect, useState } from "react";
import { startAutonomousAgent } from "./atonomous-agent";

interface ConsoleMessage {
  timestamp: string;
  message: string;
}

export default function Home() {
  const [consoleOutput, setConsoleOutput] = useState<ConsoleMessage[]>([]);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
    setConsoleOutput([
      {
        timestamp: new Date().toLocaleTimeString(),
        message: "Initializing Lit AI Agent..."
      },
    ]);

    const originalConsoleLog = console.log;
    console.log = (...args) => {
      originalConsoleLog.apply(console, args);
      setConsoleOutput(prev => [...prev, {
        timestamp: new Date().toLocaleTimeString(),
        message: args.join(' ')
      }]);
    };

    startAutonomousAgent();

    return () => {
      console.log = originalConsoleLog;
    };
  }, []);

  return (
    <div className="min-h-screen bg-[#1A1A1A] text-gray-200 relative overflow-hidden">
      <div className="relative z-10 flex items-center justify-center min-h-screen p-8">
        <main className="bg-[#242424] p-12 rounded-2xl border border-[#FF5733]/20 shadow-2xl shadow-[#FF5733]/5 max-w-2xl w-full">
          <h1 className="text-3xl font-bold text-gray-100 mb-6">
            Lit AI Agent <span className="text-[#FF5733]">Console</span>
          </h1>
          
          {/* Console Output Box */}
          <div className="bg-[#1A1A1A] rounded-lg border border-[#FF5733]/10 p-4 font-mono text-sm h-[400px] overflow-y-auto">
            <div className="space-y-2">
              {isClient && consoleOutput.map((entry, index) => (
                <div 
                  key={index} 
                  className="text-gray-300 font-mono leading-relaxed flex"
                >
                  <span className="text-[#FF5733]/70 mr-2">[{entry.timestamp}]</span>
                  <span className="text-gray-400 mr-2">{`>`}</span>
                  <span>{entry.message}</span>
                </div>
              ))}
              <div className="text-[#FF5733] animate-pulse">▊</div>
            </div>
          </div>

          <div className="mt-4 text-sm text-gray-400 flex items-center justify-between">
            <span>Status: <span className="text-[#FF5733]">Active</span></span>
            {isClient && (
              <span className="text-xs">Session started: {new Date().toLocaleTimeString()}</span>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}

