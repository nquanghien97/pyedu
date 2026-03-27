// Behaves like a Record, except the key type is not comprehensively represented
// in the object. For example {foo: null} satisfies the following:
// PartialRecord<'foo' | 'bar', any>.
export type PartialRecord<K, T> = {
  [P in K]?: T;
};
