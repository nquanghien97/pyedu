import { Result } from 'neverthrow';

export type ResultUnion<R1, R2> =
  R1 extends Result<infer TLeft1, infer TRight1>
    ? R2 extends Result<infer TLeft2, infer TRight2>
      ? Result<TLeft1 | TLeft2, TRight1 | TRight2>
      : never
    : never;
