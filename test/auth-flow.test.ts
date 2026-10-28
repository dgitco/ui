import { describe, expect, test } from "bun:test";
import { checkEmail, stepAfterLookup, stepAfterPasskeyFailure } from "../registry/dgit/blocks/auth-flow";

// The contract between an app's `lookup` answer and the step the block shows (Neotax's flow.ts order).
describe("stepAfterLookup", () => {
  const neotax = { password: true, passkey: true, google: true, signup: true };
  const boarder = { code: true, google: true };

  test("Neotax: no account → sign-up; passkey → password → Google-only", () => {
    expect(stepAfterLookup({ account: "none" }, neotax)).toBe("signup");
    expect(stepAfterLookup({ account: "exists", methods: { passkey: true, password: true } }, neotax)).toBe("passkey");
    expect(stepAfterLookup({ account: "exists", methods: { password: true, google: true } }, neotax)).toBe("password");
    expect(stepAfterLookup({ account: "exists", methods: { google: true } }, neotax)).toBe("google");
    expect(stepAfterLookup({ account: "exists", methods: {} }, neotax)).toBe("password");
  });

  test("code apps: code for every account unless lookup says code: false", () => {
    expect(stepAfterLookup({ account: "none" }, boarder)).toBe("code");
    expect(stepAfterLookup({ account: "exists", methods: { google: true } }, boarder)).toBe("code");
    expect(stepAfterLookup({ account: "exists", methods: { google: true, code: false } }, boarder)).toBe("google");
  });

  test("methods the app has off never show", () => {
    expect(stepAfterLookup({ account: "exists", methods: { passkey: true, password: true } }, boarder)).toBe("code");
    expect(stepAfterLookup({ account: "none" }, { google: true })).toBe("none");
    expect(stepAfterPasskeyFailure({ password: true }, neotax)).toBe("password");
    expect(stepAfterPasskeyFailure({ password: true }, { passkey: true })).toBe("email");
  });
});

describe("checkEmail", () => {
  test("trims and lower-cases; Korean-layout input gets a suggestion", () => {
    expect(checkEmail("  Ada@Example.com ")).toEqual({ ok: true, email: "ada@example.com" });
    expect(checkEmail("")).toEqual({ ok: false, error: "email_empty", suggestion: null });
    expect(checkEmail("ada@example")).toEqual({ ok: false, error: "email_invalid", suggestion: null });
    expect(checkEmail("ㅠㅐㅠㅠㅛ@ㅜ댓ㅁㅌ.ㅅㄷ초")).toEqual({ ok: false, error: "email_hangul", suggestion: "bobby@neotax.tech" });
  });
});
