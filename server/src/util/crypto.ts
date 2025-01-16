import { hash as bcryptHash } from 'bcryptjs';

export const hash = (value: string): Promise<string> => bcryptHash(value, 10);
