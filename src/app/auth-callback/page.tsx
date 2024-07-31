// /app/auth-callback/page.js

"use client";

import { Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { trpc } from '../_trpc/client';
import { Loader2 } from 'lucide-react';
import { useEffect } from 'react';

const PageContent = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const origin = searchParams ? searchParams.get('origin') : null;

  const { data, isLoading, error } = trpc.authCallback.useQuery(undefined, {
    retry: true,
    retryDelay: 500,
  });

  useEffect(() => {
    if (data?.success) {
      router.push(origin ? `/${origin}` : '/dashboard');
    } else if (error?.data?.code === 'UNAUTHORIZED') {
      router.push('/sign-in');
    }
  }, [data, error, origin, router]);

  return (
    <div className='w-full mt-24 flex justify-center'>
      <div className='flex flex-col items-center gap-2'>
        {isLoading ? (
          <>
            <Loader2 className='h-8 w-8 animate-spin text-zinc-800' />
            <h3 className='font-semibold text-xl'>
              Setting up your account...
            </h3>
            <p>You will be redirected automatically.</p>
          </>
        ) : (
          <h3 className='font-semibold text-xl'>
            Content loaded
          </h3>
        )}
      </div>
    </div>
  );
};

const Page = () => {
  return (
    <Suspense fallback={
      <div className='w-full mt-24 flex justify-center'>
        <div className='flex flex-col items-center gap-2'>
          <Loader2 className='h-8 w-8 animate-spin text-zinc-800' />
          <h3 className='font-semibold text-xl'>
            Loading...
          </h3>
        </div>
      </div>
    }>
      <PageContent />
    </Suspense>
  );
};

export default Page;
