import { UrlSanitizerPipe } from './url-sanitizer.pipe';

describe('UrlSanitizerPipe', () => {
  it('create an instance', () => {
    const pipe = new UrlSanitizerPipe();
    expect(pipe).toBeTruthy();
  });
});
