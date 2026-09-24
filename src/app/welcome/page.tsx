'use client';
import { authClient } from '@/lib/auth-client';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function WelcomePage() {
  const { data: session, isPending } = authClient.useSession();
  const router = useRouter();

  useEffect(() => {
    if (!isPending && !session) {
      router.push('/sign-in');
    }
  }, [session, isPending, router]);

  if (isPending) {
    return (
      <div className="min-h-screen bg-[#030014] text-white flex items-center justify-center" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
        <p className="text-purple-400 animate-pulse">Loading session...</p>
      </div>
    );
  }

  if (!session) {
    return null;
  }

  return (
    <div className="min-h-screen bg-[#030014] flex flex-col items-center justify-center text-white" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
      <style dangerouslySetInnerHTML={{__html: `
        @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@300;400;500;600;700&display=swap');
      `}} />
      <div className="p-8 rounded-3xl bg-[#05001a] border border-purple-500/20 shadow-[0_0_50px_-12px_rgba(168,85,247,0.4)] text-center max-w-md w-full mx-4">
        <h1 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-white via-purple-200 to-purple-400 mb-6 drop-shadow-[0_0_15px_rgba(168,85,247,0.4)]">
          Welcome!
        </h1>
        <div className="space-y-4 text-left">
          <div className="p-4 bg-white/[0.02] border border-white/5 rounded-xl">
            <p className="text-gray-400 text-xs uppercase tracking-wider mb-1">Name</p>
            <p className="text-lg font-medium text-purple-200">{session.user.name}</p>
          </div>
          <div className="p-4 bg-white/[0.02] border border-white/5 rounded-xl">
            <p className="text-gray-400 text-xs uppercase tracking-wider mb-1">Email</p>
            <p className="text-lg font-medium text-purple-200">{session.user.email}</p>
          </div>
        </div>
        
        <button
          onClick={async () => {
            await authClient.signOut();
            router.push('/sign-in');
          }}
          className="mt-8 w-full py-4 rounded-xl border border-red-500/30 text-red-400 hover:bg-red-500/10 hover:border-red-500/50 transition-all duration-300 font-semibold"
        >
          Sign Out
        </button>
      </div>
    </div>
  );
}
