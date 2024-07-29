import { NextRequest, NextResponse } from 'next/server';
import { getKindeServerSession } from '@kinde-oss/kinde-auth-nextjs/server';
import { db } from '@/db';
import { SendMessageValidator } from '@/lib/validators/SendMessageValidator';
import { initializationTool } from '@/agents/initializationAgent';
import { generateContext } from '@/agents/pdfagent';

export const POST = async (req: NextRequest) => {
  const body = await req.json();

  const { getUser } = await getKindeServerSession();
  const user = await getUser();

  if (!user || !user.id) {
    return new NextResponse('Unauthorized', { status: 401 });
  }

  const { id: userId } = user;
  const { fileId, message } = SendMessageValidator.parse(body);

  const file = await db.file.findFirst({
    where: { id: fileId, userId },
  });

  if (!file) {
    return new NextResponse('Not found', { status: 404 });
  }

  await db.message.create({
    data: { text: message, isUserMessage: true, userId, fileId },
  });

  const prevMessages = await db.message.findMany({
    where: { fileId },
    orderBy: { createdAt: 'asc' },
    take: 6,
  });

  const formattedPrevMessages = prevMessages.map((msg) => ({
    role: msg.isUserMessage ? 'user' : 'assistant',
    content: msg.text,
  }));

  const initializationOutputs = await initializationTool.func({ message, fileId });

  const combinedContext = await generateContext(initializationOutputs, fileId, message);

  await db.message.create({
    data: { text: combinedContext, isUserMessage: false, fileId, userId },
  });

  // Stream response setup
  const stream = new ReadableStream({
    start(controller) {
      controller.enqueue(`data: ${combinedContext}\n\n`);
      controller.close();
    },
  });

  return new NextResponse(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
    },
  });
};
