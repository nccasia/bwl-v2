'use client';

import { useMezonWebView } from '@/providers/mezon-webview-provider';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function ChannelPage() {
  const { isReady, isLoading, error } = useMezonWebView();
  const router = useRouter();

  useEffect(() => {
    if (isReady && !error) {
      router.replace('/');
    }
  }, [isReady, error, router]);

  if (error) {
    return (
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '100vh',
          fontFamily: 'sans-serif',
          gap: '12px',
          color: '#e53e3e',
          padding: '24px',
          textAlign: 'center',
        }}
      >
        <span style={{ fontSize: '32px' }}>⚠️</span>
        <p style={{ margin: 0, fontWeight: 600 }}>WebView login failed</p>
        <p style={{ margin: 0, fontSize: '14px', color: '#718096' }}>
          {error.message}
        </p>
      </div>
    );
  }

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
        flexDirection: 'column',
        gap: '16px',
        fontFamily: 'sans-serif',
      }}
    >
      {/* Simple spinner */}
      <div
        style={{
          width: '40px',
          height: '40px',
          border: '3px solid #e2e8f0',
          borderTopColor: '#667eea',
          borderRadius: '50%',
          animation: 'spin 0.8s linear infinite',
        }}
      />
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      <p style={{ margin: 0, color: '#718096', fontSize: '14px' }}>
        {isLoading ? 'Signing you in via Mezon…' : 'Redirecting…'}
      </p>
    </div>
  );
}
