'use client'

import React, { useEffect } from "react";
import { startAutonomousAgent } from "./atonomous-agent";

export default function Home() {

  useEffect(() => {
    startAutonomousAgent();

    return () => {
    };
  }, []);

  return (
    <div className="min-h-screen bg-[#014421] text-black relative overflow-hidden">
      <div className="relative z-10 flex items-center justify-center min-h-screen p-8">
        <main className="bg-white/5 backdrop-blur-sm p-12 rounded-2xl border border-white/10 shadow-2xl max-w-2xl w-full">
          <h1 className="text-2xl text-white mb-6">AI Agent Activity Log (Console)</h1>
        </main>
      </div>
    </div>
  );
}

