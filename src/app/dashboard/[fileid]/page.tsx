import { getKindeServerSession } from '@kinde-oss/kinde-auth-nextjs/server';
import { notFound, redirect } from 'next/navigation';
import { db } from '@/db';
import PdfRenderer from '@/components/PdfRenderer';
import ChatWrapper from '@/components/chat/ChatWrapper';
import { LoadingProvider } from '@/context/LoadingContext';
import { ChatContextProvider } from '@/components/chat/ChatContext';

interface PageProps {
  params: {
    fileid: string;
  };
}

const Page = async ({ params }: PageProps) => {
  const { fileid } = params;

  const session = getKindeServerSession();
  const user = await session.getUser();

  if (!user || !user.id) {
    redirect(`/auth-callback?origin=dashboard/${fileid}`);
    return null;
  }

  const file = await db.file.findFirst({
    where: {
      id: fileid,
      userId: user.id,
    },
  });

  if (!file) {
    notFound();
    return null;
  }

  return (
    <LoadingProvider>
      <ChatContextProvider fileId={fileid}>
        <div className="flex-1 flex flex-col h-[calc(100vh-3.5rem)]">
          <div className="mx-auto w-full max-w-8xl grow flex flex-col lg:flex-row xl:px-2">
            <div className="flex-1 xl:flex">
              <div className="px-4 py-6 sm:px-6 lg:pl-8 xl:flex-1 xl:pl-6">
                <PdfRenderer fileId={fileid} />
              </div>
            </div>
            <div className="shrink-0 lg:w-2/5 border-t border-gray-200 lg:border-l lg:border-t-0">
              <ChatWrapper fileId={fileid} />
            </div>
          </div>
        </div>
      </ChatContextProvider>
    </LoadingProvider>
  );
};

export default Page;
