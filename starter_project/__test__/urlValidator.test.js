import { isValidUrl } from "../src/client/js/urlValidator";

describe("urlValidator.js", () => {
    test("should return true for valid URLs", () => {
        const validUrls = [
            "https://www.example.com",
            "http://example.org",
            "https://example.com/path/to/file.html",
            "https://example.com?query=search",
        ];

        validUrls.forEach((url) => {
            expect(isValidUrl(url)).toBe(true);
        });
    });

    test("should return false for invalid URLs", () => {
        const invalidUrls = [
            "example.com",
            "http://",
            "https://invalid%url",
            "://example.com",
        ];

        invalidUrls.forEach((url) => {
            expect(isValidUrl(url)).toBe(false);
        });
    });
});
