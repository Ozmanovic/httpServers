import { describe, it, expect, beforeAll } from "vitest";
import { makeJWT, validateJWT } from "./auth.js";
import { hashPassword, checkPasswordHash } from "./auth.js";
import { Payload } from "./auth.js";


describe("Password Hashing", () => {
  const password1 = "correctPassword123!";
  const password2 = "anotherPassword456!";
  let hash1: string;
  let hash2: string;

  beforeAll(async () => {
    hash1 = await hashPassword(password1);
    hash2 = await hashPassword(password2);
  });

  it("should return true for the correct password", async () => {
    const result = await checkPasswordHash(password1, hash1);
    expect(result).toBe(true);
  });
});


describe("JWT rejects expired tokens", () => {
  it("should throw on expired token", () => {
    const secret = "testsecret";
    const token = makeJWT("Tom", secret);
    expect(() => validateJWT(token, secret)).toThrow();
  });
});


describe("makeJWT and validateJWT round-trip", () => {
  it("returns the same user id", () => {
    const secret = "testsecret";
    const userId = "Tom";
    const token = makeJWT(userId, secret); // not expired
    const validatedUserId = validateJWT(token, secret);
    expect(validatedUserId).toEqual(userId);
  });
});