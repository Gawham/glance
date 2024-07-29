import { NextApiRequest, NextApiResponse } from 'next';
import { getKindeServerSession } from '@kinde-oss/kinde-auth-nextjs/server';
import { db } from '@/db';
import { SendMessageValidator } from '@/lib/validators/SendMessageValidator';
import { initializationTool } from '@/agents/initializationAgent';
import { generateContext } from '@/agents/pdfagent';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }

  const body = req.body;

  const { getUser } = await getKindeServerSession({ req, res } as any);
  const user = await getUser();

  if (!user || !user.id) {
    return res.status(401).send('Unauthorized');
  }

  const { id: userId } = user;
  const { fileId, message } = SendMessageValidator.parse(body);

  const file = await db.file.findFirst({
    where: { id: fileId, userId },
  });

  if (!file) {
    return res.status(404).send('Not found');
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
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');

  res.write(`data: ${combinedContext}\n\n`);

  res.end();
}
