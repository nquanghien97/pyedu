import { generateSlug } from './generateSlug';

describe('generateSlug', () => {
  it('should convert text to lowercase', () => {
    const result = generateSlug('HELLO WORLD');
    expect(result).toMatch(/^hello-world-[a-z0-9]{6}$/);
  });

  it('should replace spaces with hyphens', () => {
    const result = generateSlug('hello world test');
    expect(result).toMatch(/^hello-world-test-[a-z0-9]{6}$/);
  });

  it('should remove special characters', () => {
    const result = generateSlug('hello@world!test');
    expect(result).toMatch(/^helloworldtest-[a-z0-9]{6}$/);
  });

  it('should trim leading and trailing spaces', () => {
    const result = generateSlug('  hello world  ');
    expect(result).toMatch(/^hello-world-[a-z0-9]{6}$/);
  });

  it('should generate unique suffixes', () => {
    const result1 = generateSlug('test');
    const result2 = generateSlug('test');
    expect(result1).not.toBe(result2);
    expect(result1).toMatch(/^test-[a-z0-9]{6}$/);
    expect(result2).toMatch(/^test-[a-z0-9]{6}$/);
  });

  it('should handle multiple consecutive spaces and special characters', () => {
    const result = generateSlug('hello   @#$   world!!!');
    expect(result).toMatch(/^hello-world-[a-z0-9]{6}$/);
  });
});
