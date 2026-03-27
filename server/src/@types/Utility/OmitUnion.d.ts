// TS Omit on unions does not work as expected for how we use it.
// It was merging each event payloads into one giga-payload type
// Read https://github.com/microsoft/TypeScript/issues/31501
// This makes it so we get the typing we want (A | B, compared to merging)
type OmitUnion<T, K extends keyof any> = T extends any ? Omit<T, K> : never;
