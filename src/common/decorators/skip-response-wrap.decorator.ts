import { SetMetadata } from '@nestjs/common';

export const SKIP_WRAP_KEY = 'skipResponseWrap';
export const SkipResponseWrap = SetMetadata(SKIP_WRAP_KEY, true);
