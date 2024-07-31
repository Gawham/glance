'use client';

import { trpc } from '@/app/_trpc/client';
import { ChevronLeft, Loader2, XCircle } from 'lucide-react';
import Link from 'next/link';
import ChatInput from './ChatInput';
import Messages from './Messages';
import { ChatContextProvider } from './ChatContext';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useMediaQuery } from 'react-responsive';
import React, { useEffect } from 'react';

interface ChatWrapperProps {
  fileId: string;
}

const queryClient = new QueryClient();

const ChatWrapper = ({ fileId }: ChatWrapperProps) => {
  const { data, isLoading } = trpc.getFileUploadStatus.useQuery(
    { fileId },
    {
      refetchInterval: (query) =>
        query.state.data?.status === 'SUCCESS' || query.state.data?.status === 'FAILED'
          ? false
          : 500,
    }
  );

  const isMobile = useMediaQuery({ query: '(max-width: 768px)' });

  useEffect(() => {
    if (isMobile) {
      document.documentElement.style.setProperty('--chat-input-height', '56px');
    } else {
      document.documentElement.style.setProperty('--chat-input-height', 'auto');
    }
  }, [isMobile]);

  if (isLoading)
    return (
      <div className="relative min-h-full bg-zinc-50 flex divide-y divide-zinc-200 flex-col justify-between gap-2">
        <div className="flex-1 flex justify-center items-center flex-col mb-28">
          <div className="flex flex-col items-center gap-2">
            <Loader2 className="h-8 w-8 text-blue-500 animate-spin" />
            <h3 className="font-semibold text-xl">Loading...</h3>
            <p className="text-zinc-500 text-sm">We're preparing your PDF.</p>
          </div>
        </div>
        <ChatInput isDisabled />
      </div>
    );

  if (data?.status === 'PROCESSING')
    return (
      <div className="relative min-h-full bg-zinc-50 flex divide-y divide-zinc-200 flex-col justify-between gap-2">
        <div className="flex-1 flex justify-center items-center flex-col mb-28">
          <div className="flex flex-col items-center gap-2">
            <Loader2 className="h-8 w-8 text-blue-500 animate-spin" />
            <h3 className="font-semibold text-xl">Processing PDF...</h3>
            <p className="text-zinc-500 text-sm">This won't take long.</p>
          </div>
        </div>
        <ChatInput isDisabled />
      </div>
    );

  if (data?.status === 'FAILED')
    return (
      <div className="relative min-h-full bg-zinc-50 flex divide-y divide-zinc-200 flex-col justify-between gap-2">
        <div className="flex-1 flex justify-center items-center flex-col mb-28">
          <div className="flex flex-col items-center gap-2">
            <XCircle className="h-8 w-8 text-red-500" />
            <h3 className="font-semibold text-xl">Too many pages in PDF</h3>
            <p className="text-zinc-500 text-sm">Your plan supports up to 5 pages per PDF.</p>
            <Link href="/dashboard" className="mt-4 flex items-center justify-center text-sm font-medium text-blue-600 hover:text-blue-500">
              <ChevronLeft className="h-3 w-3 mr-1.5" />
              Back
            </Link>
          </div>
        </div>
        <ChatInput isDisabled />
      </div>
    );

  return (
    <QueryClientProvider client={queryClient}>
      <ChatContextProvider fileId={fileId}>
        <div className="relative min-h-full bg-zinc-50 flex flex-col justify-between gap-2">
          <div className="flex-1 overflow-y-auto" style={{ paddingBottom: 'var(--chat-input-height)' }}>
            <Messages fileId={fileId} />
          </div>
          <div className="sticky bottom-0 left-0 right-0 bg-white z-10" style={{ height: 'var(--chat-input-height)' }}>
            <ChatInput />
          </div>
        </div>
      </ChatContextProvider>
    </QueryClientProvider>
  );
};

export default ChatWrapper;
