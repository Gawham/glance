import { z } from 'zod';

export const FirmTickerValidator = z.object({
  firmName: z.string(),
});
