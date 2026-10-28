"use client";

import { useEffect, useLayoutEffect, useRef, useState, type FormEvent, type ReactNode } from "react";
import { CircleAlert, LoaderCircle, MailOpen } from "lucide-react";
import { cn } from "@/lib/utils";
import { AuthButton, AuthCodeBoxes, AuthDivider, AuthField, AuthLayout } from "@/registry/dgit/blocks/auth-page";

/**
 * The whole sign-in flow on one screen, from Neotax's (auth.neotax.tech): type an email, press Continue, and
 * the app's `lookup` says whether the account exists and how it signs in. The screen then branches
 * (`stepAfterLookup`):
 *
 *   no account          → create account (name, password) → 6-digit code    (signup on)
 *                       → 6-digit code by email                              (signup off, code on)
 *   has a passkey       → passkey prompt → on cancel: password, else back to email
 *   has a password      → password · "Forgot password?" → reset mail → "Mail sent"
 *   email code          → 6-digit code by email                              (code on)
 *   Google-only account → one "Continue with Google" button
 *   2-step account      → authenticator code or a recovery code (when a sign-in answers `twoFactor: true`)
 *
 * The block holds no URLs and no app logic: every server call is a prop, and `onDone` decides where to go.
 * Strings are Korean by default; pass `text={AUTH_TEXT_EN}` (or any part of it) for English.
 *
 *   <AuthFlow
 *     brand={<Logo />}
 *     methods={{ code: true, google: true }}
 *     lookup={(email) => api.post("/login/lookup", { email })}
 *     sendCode={(email) => api.post("/login/code", { email })}
 *     verifyCode={({ email, code }) => api.post("/login/code/verify", { email, code })}
 *     google={() => auth.signIn.social({ provider: "google" })}
 *     onDone={() => location.replace(next)}
 *     text={{ emailTitle: "보더에 로그인하기" }}
 *   />
 */

// ── Types

/** Which ways in the app offers. Off by default; the screen only shows what's on. */
export interface AuthMethods {
  /** 6-digit code by email (passwordless). */
  code?: boolean;
  password?: boolean;
  passkey?: boolean;
  google?: boolean;
  /** New accounts make a name (and a password, when `password` is on) and confirm a code. */
  signup?: boolean;
  /** Authenticator-app step after a sign-in that answers `twoFactor: true`. */
  twoFactor?: boolean;
}

/** What the account has, from `lookup`. `code: false` keeps an account off email codes (e.g. Google-only). */
export type LookupAnswer =
  | { ok?: true; account: "none" }
  | { ok?: true; account: "exists"; methods: { password?: boolean; passkey?: boolean; google?: boolean; code?: boolean } };

export type AuthErrorCode =
  | "generic"
  | "email_empty"
  | "email_invalid"
  | "email_hangul"
  | "no_account"
  | "invite_required"
  | "rate_limited"
  | "password_empty"
  | "password_invalid"
  | "password_too_short"
  | "password_too_long"
  | "name_required"
  | "name_too_long"
  | "name_invalid_chars"
  | "account_exists"
  | "invitation_mismatch"
  | "code_incomplete"
  | "code_invalid"
  | "code_expired"
  | "too_many_attempts"
  | "recently_sent"
  | "retry_after"
  | "too_many_codes"
  | "send_failed"
  | "no_pending_signup"
  | "google_failed"
  | "google_two_factor"
  | "passkey_failed"
  | "passkey_failed_password"
  | "two_factor_invalid"
  | "recovery_empty"
  | "recovery_invalid"
  | "session_expired"
  | "sign_in_failed";

/** A refused call. `error` picks the line from `text.errors` (unknown codes show the generic line); `message` replaces it. */
export interface AuthFailure {
  ok: false;
  error?: AuthErrorCode | (string & {});
  message?: string;
  /** For `recently_sent`: "Try again in N seconds." */
  retryAfterSeconds?: number;
}
/** A sign-in call's answer. `twoFactor: true` = the first factor passed and the authenticator step comes next. */
export type AuthResult = { ok: true; twoFactor?: boolean } | AuthFailure;

export type CodePurpose = "sign-in" | "sign-up";
export type AuthStep = "email" | "code" | "password" | "passkey" | "google" | "signup" | "twofactor" | "forgot" | "sent" | "routing";

export interface AuthFlowProps {
  methods: AuthMethods;
  /** Does the account exist, and how does it sign in. Without it: code if on, else password. */
  lookup?: (email: string) => Promise<LookupAnswer | AuthFailure>;
  /** Mail a 6-digit code (sign-in, or a new account's confirmation and its resend). */
  sendCode?: (email: string, purpose: CodePurpose) => Promise<AuthResult>;
  /** Check the code. For `sign-up` the new account's password comes along (Neotax signs in with it). */
  verifyCode?: (input: { email: string; code: string; purpose: CodePurpose; password?: string }) => Promise<AuthResult>;
  password?: (input: { email: string; password: string }) => Promise<AuthResult>;
  /** The browser's passkey prompt. `autoFill: true` is the email field's passkey autofill, started on load. */
  passkey?: (input: { email: string | null; autoFill: boolean }) => Promise<AuthResult>;
  /** Start Google sign-in. Usually it leaves the page (resolve nothing); a refusal shows the Google error. */
  google?: () => Promise<AuthResult | void>;
  /** Create the account. `next: "verify"` (default) goes to the code step; `"signed_in"` is done. */
  signup?: (input: { email: string; name: string; password?: string }) => Promise<{ ok: true; next?: "verify" | "signed_in" } | AuthFailure>;
  twoFactor?: (input: { code: string; recovery: boolean }) => Promise<AuthResult>;
  /** Mail a password reset link. */
  resetPassword?: (email: string) => Promise<AuthResult>;
  /** Signed in: go where the app goes next. The screen shows a spinner until it resolves; a throw shows `sign_in_failed`. */
  onDone: () => void | Promise<void>;

  /** Prefill (an invitation's email, say). */
  initialEmail?: string;
  /** Show an error from the start, e.g. `google_failed` when Google sent the person back with an error. */
  initialError?: AuthErrorCode;
  /** Show only the spinner (back from Google, the app is deciding where to go). */
  finishing?: boolean;
  passwordMin?: number;
  passwordMax?: number;
  /** Strings: Korean by default. Pass `AUTH_TEXT_EN`, or only the lines to change. */
  text?: Partial<Omit<AuthText, "errors">> & { errors?: Partial<AuthText["errors"]> };

  /** `AuthLayout`'s brand (top left), `app` ("Signing in to …") and footer. */
  brand?: ReactNode;
  app?: string;
  footer?: ReactNode;
  /** Only the column, without `AuthLayout` (to put it in your own page). */
  bare?: boolean;
  className?: string;
}

// ── Strings

export interface AuthText {
  emailTitle: string;
  emailSub: string;
  emailLabel: string;
  emailPlaceholder: string;
  emailSuggestion: string;
  continue: string;
  or: string;
  google: string;
  back: string;
  busy: string;
  signingIn: string;
  passwordTitle: string;
  passwordLabel: string;
  forgotLink: string;
  signIn: string;
  passkeyTitle: string;
  passkeySub: string;
  passkeyRetry: string;
  usePassword: string;
  googleTitle: string;
  googleSub: string;
  codeTitle: string;
  codeSub: string;
  verifyTitle: string;
  codeLabel: string;
  codeHint: string;
  codeSent: string;
  resendCode: string;
  otherEmail: string;
  signupTitle: string;
  nameLabel: string;
  newPasswordLabel: string;
  createAccount: string;
  twoFactorTitle: string;
  twoFactorSub: string;
  recoverySub: string;
  twoFactorLabel: string;
  recoveryLabel: string;
  twoFactorHint: string;
  useRecovery: string;
  useApp: string;
  forgotTitle: string;
  forgotSub: string;
  sendReset: string;
  sentTitle: string;
  sentSub: string;
  resendReset: string;
  errors: Record<AuthErrorCode, string>;
}

/** Neotax's lines ({email}, {min}, {max}, {seconds} are filled in). */
export const AUTH_TEXT_KO: AuthText = {
  emailTitle: "로그인하기",
  emailSub: "",
  emailLabel: "이메일",
  emailPlaceholder: "이메일 주소",
  emailSuggestion: "혹시 {email} 인가요?",
  continue: "계속하기",
  or: "또는",
  google: "구글로 계속하기",
  back: "돌아가기",
  busy: "처리 중",
  signingIn: "로그인하는 중",
  passwordTitle: "비밀번호 입력하기",
  passwordLabel: "비밀번호",
  forgotLink: "비밀번호를 잊으셨나요?",
  signIn: "로그인하기",
  passkeyTitle: "패스키로 확인해 주세요",
  passkeySub: "브라우저 창에서 {email} 의 패스키로 확인하세요.",
  passkeyRetry: "패스키로 다시 하기",
  usePassword: "비밀번호로 로그인하기",
  googleTitle: "구글로 로그인하기",
  googleSub: "{email} 은 구글 계정으로 만든 계정이에요.",
  codeTitle: "메일함을 확인해 주세요",
  codeSub: "{email} 로 보낸 6자리 코드를 입력하세요.",
  verifyTitle: "이메일 확인",
  codeLabel: "메일로 받은 6자리 코드",
  codeHint: "메일이 안 왔으면 스팸함을 확인해 주세요.",
  codeSent: "새 코드를 보냈어요. 메일이 안 왔으면 스팸함을 확인해 주세요.",
  resendCode: "코드 다시 받기",
  otherEmail: "다른 이메일로",
  signupTitle: "계정 만들기",
  nameLabel: "이름",
  newPasswordLabel: "비밀번호 ({min}자 이상)",
  createAccount: "계정 만들기",
  twoFactorTitle: "2단계 로그인",
  twoFactorSub: "인증 앱에 보이는 6자리 코드를 입력하세요.",
  recoverySub: "등록할 때 받은 복구 코드 하나를 입력하세요. 한 번 쓰면 못 써요.",
  twoFactorLabel: "인증 앱의 6자리 코드",
  recoveryLabel: "복구 코드",
  twoFactorHint: "코드는 30초마다 바뀌어요.",
  useRecovery: "복구 코드로 로그인하기",
  useApp: "인증 앱 코드로 로그인하기",
  forgotTitle: "비밀번호 찾기",
  forgotSub: "가입한 이메일로 재설정 링크를 보내요.",
  sendReset: "재설정 메일 보내기",
  sentTitle: "메일을 보냈어요",
  sentSub: "{email} 의 링크를 열어 새 비밀번호를 정하세요. 링크는 1시간 동안 쓸 수 있어요.",
  resendReset: "메일 다시 보내기",
  errors: {
    generic: "일시적인 오류가 발생했어요",
    email_empty: "이메일 주소를 입력해 주세요.",
    email_invalid: "이메일 형식이 맞지 않아요.",
    email_hangul: "한글이 들어 있어요. 한/영 키를 영문으로 바꿔 입력해 주세요.",
    no_account: "이 이메일로 만든 계정이 없어요.",
    invite_required: "초대받은 이메일로만 들어올 수 있어요.",
    rate_limited: "요청이 너무 많아요. 잠시 뒤 다시 시도해 주세요.",
    password_empty: "비밀번호를 입력해 주세요.",
    password_invalid: "비밀번호가 맞지 않아요.",
    password_too_short: "비밀번호는 {min}자 이상이어야 해요.",
    password_too_long: "비밀번호는 {max}자 이하로 정해 주세요.",
    name_required: "이름을 입력해 주세요.",
    name_too_long: "이름은 50자 이하로 적어 주세요.",
    name_invalid_chars: "이름에 쓸 수 없는 글자가 있어요.",
    account_exists: "이미 계정이 있는 이메일이에요. 돌아가서 로그인해 주세요.",
    invitation_mismatch: "초대받은 이메일로만 가입할 수 있어요.",
    code_incomplete: "6자리 코드를 입력해 주세요.",
    code_invalid: "코드가 맞지 않아요.",
    code_expired: "코드가 만료됐어요. 코드를 다시 받아 주세요.",
    too_many_attempts: "여러 번 틀렸어요. 코드를 다시 받아 주세요.",
    recently_sent: "방금 코드를 보냈어요. 1분 뒤 다시 시도해 주세요.",
    retry_after: "{seconds}초 뒤에 다시 보낼 수 있어요.",
    too_many_codes: "오늘 보낼 수 있는 코드를 다 보냈어요. 내일 다시 시도해 주세요.",
    send_failed: "메일을 보내지 못했어요. 잠시 뒤 다시 시도해 주세요.",
    no_pending_signup: "가입을 마치지 못했어요. 처음부터 다시 해 주세요.",
    google_failed: "구글 로그인을 마치지 못했어요. 다시 시도해 주세요.",
    google_two_factor: "2단계 로그인 계정은 이메일로 로그인해 주세요.",
    passkey_failed: "패스키 확인을 마치지 못했어요. 다시 시도해 주세요.",
    passkey_failed_password: "패스키 확인을 마치지 못했어요. 비밀번호로 로그인해 주세요.",
    two_factor_invalid: "코드가 맞지 않아요. 인증 앱에서 새 코드를 확인해 주세요.",
    recovery_empty: "복구 코드를 입력해 주세요.",
    recovery_invalid: "복구 코드가 맞지 않아요.",
    session_expired: "시간이 지났어요. 처음부터 다시 로그인해 주세요.",
    sign_in_failed: "로그인을 마치지 못했어요. 다시 시도해 주세요.",
  },
};

export const AUTH_TEXT_EN: AuthText = {
  emailTitle: "Log in",
  emailSub: "",
  emailLabel: "Email",
  emailPlaceholder: "Email address",
  emailSuggestion: "Did you mean {email}?",
  continue: "Continue",
  or: "or",
  google: "Continue with Google",
  back: "Back",
  busy: "Working",
  signingIn: "Signing in",
  passwordTitle: "Enter your password",
  passwordLabel: "Password",
  forgotLink: "Forgot password?",
  signIn: "Log in",
  passkeyTitle: "Confirm with your passkey",
  passkeySub: "Use the passkey for {email} in the browser window.",
  passkeyRetry: "Try the passkey again",
  usePassword: "Log in with password",
  googleTitle: "Log in with Google",
  googleSub: "{email} was made with a Google account.",
  codeTitle: "Check your email",
  codeSub: "Enter the 6-digit code we sent to {email}.",
  verifyTitle: "Confirm your email",
  codeLabel: "6-digit code from the email",
  codeHint: "No mail? Check your spam folder.",
  codeSent: "We sent a new code. No mail? Check your spam folder.",
  resendCode: "Send a new code",
  otherEmail: "Use another email",
  signupTitle: "Create your account",
  nameLabel: "Name",
  newPasswordLabel: "Password ({min}+ characters)",
  createAccount: "Create account",
  twoFactorTitle: "Two-step login",
  twoFactorSub: "Enter the 6-digit code in your authenticator app.",
  recoverySub: "Enter one of your recovery codes. Each works once.",
  twoFactorLabel: "6-digit code from the app",
  recoveryLabel: "Recovery code",
  twoFactorHint: "The code changes every 30 seconds.",
  useRecovery: "Use a recovery code",
  useApp: "Use the authenticator app",
  forgotTitle: "Reset your password",
  forgotSub: "We'll mail a reset link to your email.",
  sendReset: "Send reset link",
  sentTitle: "Check your email",
  sentSub: "Open the link sent to {email} to set a new password. It works for 1 hour.",
  resendReset: "Send again",
  errors: {
    generic: "Something went wrong. Try again.",
    email_empty: "Enter your email address.",
    email_invalid: "That doesn't look like an email address.",
    email_hangul: "Korean input is on. Switch to English and type again.",
    no_account: "No account uses this email.",
    invite_required: "Only invited emails can sign in.",
    rate_limited: "Too many tries. Wait a moment and try again.",
    password_empty: "Enter your password.",
    password_invalid: "Wrong password.",
    password_too_short: "Use at least {min} characters.",
    password_too_long: "Use {max} characters or fewer.",
    name_required: "Enter your name.",
    name_too_long: "Use 50 characters or fewer.",
    name_invalid_chars: "The name has characters we can't use.",
    account_exists: "This email already has an account. Go back and log in.",
    invitation_mismatch: "Sign up with the email that was invited.",
    code_incomplete: "Enter the 6-digit code.",
    code_invalid: "Wrong code.",
    code_expired: "The code expired. Get a new one.",
    too_many_attempts: "Too many wrong tries. Get a new code.",
    recently_sent: "We just sent a code. Try again in a minute.",
    retry_after: "You can send again in {seconds} seconds.",
    too_many_codes: "No more codes today. Try again tomorrow.",
    send_failed: "We couldn't send the mail. Try again soon.",
    no_pending_signup: "Sign-up didn't finish. Start again.",
    google_failed: "Google sign-in didn't finish. Try again.",
    google_two_factor: "Two-step accounts log in with email.",
    passkey_failed: "The passkey check didn't finish. Try again.",
    passkey_failed_password: "The passkey check didn't finish. Use your password.",
    two_factor_invalid: "Wrong code. Check the app for a new one.",
    recovery_empty: "Enter a recovery code.",
    recovery_invalid: "Wrong recovery code.",
    session_expired: "Time ran out. Log in again from the start.",
    sign_in_failed: "Sign-in didn't finish. Try again.",
  },
};

// ── Rules (pure, exported for apps and tests)

/**
 * The step after the email. Neotax's order (no account → sign-up; passkey → password → Google-only),
 * with the email code where the password goes for apps that use codes. Only methods the app has on count.
 * "none" = no account and no way to make one here.
 */
export function stepAfterLookup(answer: LookupAnswer, on: AuthMethods): "signup" | "code" | "passkey" | "password" | "google" | "none" {
  if (answer.account === "none") return on.signup ? "signup" : on.code ? "code" : "none";
  const has = answer.methods;
  if (on.passkey && has.passkey) return "passkey";
  if (on.password && has.password) return "password";
  if (on.code && has.code !== false) return "code";
  if (on.google && has.google) return "google";
  return on.password ? "password" : on.code ? "code" : on.google ? "google" : "none";
}

/** After a cancelled or failed passkey: the password if the account has one, else back to the email. */
export function stepAfterPasskeyFailure(has: { password?: boolean } | null, on: AuthMethods): "password" | "email" {
  return on.password && has?.password ? "password" : "email";
}

const EMAIL_LOCAL = /^[A-Za-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[A-Za-z0-9!#$%&'*+/=?^_`{|}~-]+)*$/;
const EMAIL_DOMAIN = /^(?:[A-Za-z0-9](?:[A-Za-z0-9-]{0,61}[A-Za-z0-9])?\.)+[A-Za-z]{2,63}$/;
const HANGUL = /[ᄀ-ᇿ㄰-㆏ꥠ-꥿가-힣ힰ-퟿]/;

function isEmailAddress(value: string): boolean {
  if (value.length === 0 || value.length > 254) return false;
  const at = value.lastIndexOf("@");
  if (at <= 0 || at > 64 || value.indexOf("@") !== at) return false;
  return EMAIL_LOCAL.test(value.slice(0, at)) && EMAIL_DOMAIN.test(value.slice(at + 1));
}

// Dubeolsik keyboard: jamo → the Latin key in the same place (double jamo = both keys).
const JAMO_KEYS: Record<string, string> = {
  ㄱ: "r", ㄲ: "R", ㄳ: "rt", ㄴ: "s", ㄵ: "sw", ㄶ: "sg", ㄷ: "e", ㄸ: "E", ㄹ: "f", ㄺ: "fr", ㄻ: "fa", ㄼ: "fq", ㄽ: "ft", ㄾ: "fx",
  ㄿ: "fv", ㅀ: "fg", ㅁ: "a", ㅂ: "q", ㅃ: "Q", ㅄ: "qt", ㅅ: "t", ㅆ: "T", ㅇ: "d", ㅈ: "w", ㅉ: "W", ㅊ: "c", ㅋ: "z", ㅌ: "x", ㅍ: "v",
  ㅎ: "g", ㅏ: "k", ㅐ: "o", ㅑ: "i", ㅒ: "O", ㅓ: "j", ㅔ: "p", ㅕ: "u", ㅖ: "P", ㅗ: "h", ㅘ: "hk", ㅙ: "ho", ㅚ: "hl", ㅛ: "y", ㅜ: "n",
  ㅝ: "nj", ㅞ: "np", ㅟ: "nl", ㅠ: "b", ㅡ: "m", ㅢ: "ml", ㅣ: "l",
};
const CHO = "ㄱㄲㄴㄷㄸㄹㅁㅂㅃㅅㅆㅇㅈㅉㅊㅋㅌㅍㅎ";
const JUNG = "ㅏㅐㅑㅒㅓㅔㅕㅖㅗㅘㅙㅚㅛㅜㅝㅞㅟㅠㅡㅢㅣ";
const JONG = ["", ..."ㄱㄲㄳㄴㄵㄶㄷㄹㄺㄻㄼㄽㄾㄿㅀㅁㅂㅄㅅㅆㅇㅈㅊㅋㅌㅍㅎ"];

/** Text typed with the Korean layout on, back to the Latin keys pressed (「ㅠㅐㅠㅠㅛ」 → "bobby"). */
export function hangulKeysToLatin(value: string): string {
  let out = "";
  for (const ch of value.normalize("NFC")) {
    const code = ch.charCodeAt(0);
    if (code >= 0xac00 && code <= 0xd7a3) {
      const i = code - 0xac00;
      out += JAMO_KEYS[CHO[Math.floor(i / 588)]!]! + JAMO_KEYS[JUNG[Math.floor((i % 588) / 28)]!]!;
      const jong = JONG[i % 28]!;
      if (jong) out += JAMO_KEYS[jong]!;
    } else {
      out += JAMO_KEYS[ch] ?? ch;
    }
  }
  return out;
}

/** The email field's check (Neotax's): trimmed and lower-cased when fine; Hangul input gets a Latin suggestion. */
export function checkEmail(value: string): { ok: true; email: string } | { ok: false; error: "email_empty" | "email_hangul" | "email_invalid"; suggestion: string | null } {
  const email = value.trim();
  if (!email) return { ok: false, error: "email_empty", suggestion: null };
  if (HANGUL.test(email)) {
    const latin = hangulKeysToLatin(email).toLowerCase();
    return { ok: false, error: "email_hangul", suggestion: isEmailAddress(latin) ? latin : null };
  }
  if (!isEmailAddress(email)) return { ok: false, error: "email_invalid", suggestion: null };
  return { ok: true, email: email.toLowerCase() };
}

// ── Parts

const fill = (line: string, vars: Record<string, string | number | undefined>) => line.replace(/\{(\w+)\}/g, (m, k: string) => (vars[k] === undefined ? m : String(vars[k])));

/** Neotax's sizes on the auth-page pills: 40px buttons, 14px/500 text, 20px icons. */
const btn = "gap-2 px-6 text-sm leading-5 [&_svg]:size-5";
/** Neotax's field: 44px, 14px text (16px on touch, so iOS doesn't zoom), a 2px ring on focus, red when wrong. */
const field = (bad: boolean) =>
  cn(
    "h-11 px-4 text-base transition-[border-color,box-shadow] read-only:text-muted-foreground sm:text-sm pointer-coarse:text-base",
    bad ? "border-destructive focus:border-destructive focus:ring-1 focus:ring-destructive" : "hover:border-gray-500 focus:border-ring focus:ring-1 focus:ring-ring",
  );

function Spinner({ label }: { label: string }) {
  return <LoaderCircle className="animate-spin" role="status" aria-label={label} />;
}

/** A button's label, or the spinner while its call runs (never "…중" text). */
function Busy({ busy, label, children }: { busy: boolean; label: string; children: ReactNode }) {
  return busy ? <Spinner label={label} /> : <>{children}</>;
}

/** The colored Google "G". */
export function GoogleIcon() {
  return (
    <svg viewBox="0 0 18 18" aria-hidden="true">
      <path fill="#4285F4" d="M17.64 9.2c0-.64-.06-1.25-.16-1.84H9v3.48h4.84a4.14 4.14 0 0 1-1.8 2.72v2.26h2.91c1.7-1.57 2.68-3.88 2.68-6.62z" />
      <path fill="#34A853" d="M9 18c2.43 0 4.47-.81 5.96-2.18l-2.91-2.26c-.81.54-1.84.86-3.05.86-2.34 0-4.33-1.58-5.04-3.71H.96v2.33A9 9 0 0 0 9 18z" />
      <path fill="#FBBC05" d="M3.96 10.71A5.41 5.41 0 0 1 3.68 9c0-.59.1-1.17.28-1.71V4.96H.96A9 9 0 0 0 0 9c0 1.45.35 2.83.96 4.04l3-2.33z" />
      <path fill="#EA4335" d="M9 3.58c1.32 0 2.51.45 3.44 1.35l2.58-2.58C13.46.89 11.43 0 9 0A9 9 0 0 0 .96 4.96L3.96 7.29C4.67 5.16 6.66 3.58 9 3.58z" />
    </svg>
  );
}

/** An error line: under its field, or centered under the title when no field owns it. */
export function AuthError({ children, center }: { children: ReactNode; center?: boolean }) {
  if (!children) return null;
  return (
    <p role="alert" className={cn("mt-1 flex items-start gap-1.5 text-xs leading-4 text-destructive [&_svg]:mt-px [&_svg]:size-3.5 [&_svg]:shrink-0", center && "mt-0 mb-4 justify-center text-center")}>
      <CircleAlert aria-hidden="true" />
      <span>{children}</span>
    </p>
  );
}

function Heading({ title, sub, mark }: { title: ReactNode; sub?: ReactNode; mark?: ReactNode }) {
  return (
    <div className="mb-6 text-center">
      {mark ? <div className="mx-auto mb-4 flex size-12 items-center justify-center rounded-full bg-gray-100 text-foreground [&_svg]:size-6">{mark}</div> : null}
      {title ? <h1 className="m-0 text-heading-30 text-balance max-sm:text-2xl max-sm:leading-8 max-sm:tracking-[-0.6px]">{title}</h1> : null}
      {sub ? <p className="mt-2 mb-0 text-sm leading-5 text-muted-foreground text-balance">{sub}</p> : null}
    </div>
  );
}

function Label({ htmlFor, children, bad, sr }: { htmlFor: string; children: ReactNode; bad?: boolean; sr?: boolean }) {
  return (
    <label htmlFor={htmlFor} className={cn("mb-1.5 text-sm leading-[14px]", bad && "text-destructive", sr && "sr-only")}>
      {children}
    </label>
  );
}

// ── The flow

type Field = "email" | "password" | "name" | "code";
type Problem = { field: Field | null; message: string };
type BusyKind = null | "submit" | "google" | "resend";

/** Which field a code belongs under (others are centered under the title). */
const FIELD_OF: Partial<Record<string, Field>> = {
  email_empty: "email",
  email_invalid: "email",
  email_hangul: "email",
  password_empty: "password",
  password_invalid: "password",
  password_too_short: "password",
  password_too_long: "password",
  name_required: "name",
  name_too_long: "name",
  name_invalid_chars: "name",
  code_incomplete: "code",
  code_invalid: "code",
  code_expired: "code",
  too_many_attempts: "code",
  retry_after: "code",
  two_factor_invalid: "code",
  recovery_empty: "code",
  recovery_invalid: "code",
};

/** What a missing prop answers: the generic error. */
const NOT_SET: AuthFailure = { ok: false };

const isFailure = (r: unknown): r is AuthFailure => typeof r === "object" && r !== null && (r as { ok?: unknown }).ok === false;

export function AuthFlow(props: AuthFlowProps) {
  const { methods: on, passwordMin = 8, passwordMax = 128 } = props;
  const t: AuthText = { ...AUTH_TEXT_KO, ...props.text, errors: { ...AUTH_TEXT_KO.errors, ...props.text?.errors } };

  const [step, setStep] = useState<AuthStep>(props.finishing ? "routing" : "email");
  const [email, setEmail] = useState(props.initialEmail ?? "");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [code, setCode] = useState("");
  const [purpose, setPurpose] = useState<CodePurpose>("sign-in");
  const [recovery, setRecovery] = useState(false);
  const [known, setKnown] = useState<{ password?: boolean; passkey?: boolean } | null>(null);
  const [passkeyFailed, setPasskeyFailed] = useState(false);
  const [problem, setProblem] = useState<Problem | null>(() => (props.initialError ? { field: null, message: t.errors[props.initialError] ?? t.errors.generic } : null));
  const [suggestion, setSuggestion] = useState<string | null>(null);
  const [notice, setNotice] = useState("");
  const [busy, setBusy] = useState<BusyKind>(null);
  const [forgotFrom, setForgotFrom] = useState<AuthStep>("password");
  /** Bumped on every step change: a reply that comes back after the person moved on is dropped. */
  const gen = useRef(0);
  const busyRef = useRef(false);

  const refs = {
    email: useRef<HTMLInputElement>(null),
    password: useRef<HTMLInputElement>(null),
    name: useRef<HTMLInputElement>(null),
    code: useRef<HTMLInputElement>(null),
  };

  // Each step focuses its first field.
  useLayoutEffect(() => {
    const first: Partial<Record<AuthStep, { current: HTMLInputElement | null }>> = { email: refs.email, forgot: refs.email, password: refs.password, signup: refs.name, code: refs.code, twofactor: refs.code };
    const target = first[step];
    target?.current?.focus();
    // Only when the step changes.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [step]);

  // `finishing` and `initialError` can change after mount (back from Google, the app decides): spinner while
  // finishing, then the email step with the error, if any.
  const mounted = useRef(false);
  useEffect(() => {
    if (!mounted.current) {
      mounted.current = true;
      return;
    }
    if (props.finishing) return go("routing");
    if (step === "routing") go("email");
    if (props.initialError) fail({ error: props.initialError });
    // Only when these props change.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [props.finishing, props.initialError]);

  // Back from Google with the browser's back button (page restored from the back-forward cache): no spinner.
  useEffect(() => {
    const onShow = (e: PageTransitionEvent) => {
      if (!e.persisted) return;
      busyRef.current = false;
      setBusy(null);
    };
    window.addEventListener("pageshow", onShow);
    return () => window.removeEventListener("pageshow", onShow);
  }, []);

  // The email field's passkey autofill: browsers with a passkey offer it when the field is tapped.
  useEffect(() => {
    if (!on.passkey || !props.passkey || props.finishing || typeof PublicKeyCredential === "undefined") return;
    let alive = true;
    (async () => {
      try {
        if (!(await PublicKeyCredential.isConditionalMediationAvailable?.())) return;
        const r = await props.passkey!({ email: null, autoFill: true });
        if (alive && r.ok) await finish(r);
      } catch {
        // Cancelled (another check started) or unsupported: stay quiet.
      }
    })();
    return () => {
      alive = false;
    };
    // Once.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const message = (f: AuthFailure | { error: string; retryAfterSeconds?: number; message?: string }) => {
    const key = f.error === "recently_sent" && f.retryAfterSeconds ? "retry_after" : f.error;
    const line = f.message ?? (key && key in t.errors ? t.errors[key as AuthErrorCode] : t.errors.generic);
    return { key: key ?? "generic", text: fill(line, { min: passwordMin, max: passwordMax, seconds: f.retryAfterSeconds, email }) };
  };

  function clear() {
    setProblem(null);
    setSuggestion(null);
    setNotice("");
  }

  /** Change step. Calls still running for the old step are dropped, and their spinner goes. */
  function go(to: AuthStep) {
    gen.current++;
    busyRef.current = false;
    setBusy(null);
    clear();
    setStep(to);
  }

  /** Show a failure: under its field when this step has that field, else centered. */
  function fail(f: AuthFailure | { error: AuthErrorCode; retryAfterSeconds?: number }, owner?: Field) {
    const m = message(f);
    setProblem({ field: owner ?? FIELD_OF[m.key] ?? null, message: m.text });
  }

  /**
   * One server call at a time, with a spinner on the button that started it. `live()` turns false once the
   * step changes (Back, another email): check it after every await. A throw is the generic error.
   */
  async function run(kind: Exclude<BusyKind, null>, work: (live: () => boolean) => Promise<void>) {
    if (busyRef.current) return;
    const g = gen.current;
    const live = () => g === gen.current;
    busyRef.current = true;
    setBusy(kind);
    try {
      await work(live);
    } catch {
      if (live()) setProblem({ field: null, message: t.errors.generic });
    } finally {
      if (live()) {
        busyRef.current = false;
        setBusy(null);
      }
    }
  }

  /** Signed in (or the first factor passed). */
  async function finish(r: AuthResult) {
    if (r.ok && r.twoFactor) {
      setCode("");
      setRecovery(false);
      go("twofactor");
      return;
    }
    go("routing");
    const g = gen.current;
    try {
      await props.onDone();
    } catch {
      if (g !== gen.current) return;
      go("email");
      setProblem({ field: null, message: t.errors.sign_in_failed });
    }
  }

  function badEmail(): string | null {
    const c = checkEmail(email);
    if (c.ok) return c.email;
    fail({ error: c.error }, "email");
    if (c.suggestion) setSuggestion(c.suggestion);
    return null;
  }

  async function toCode(value: string, p: CodePurpose, live: () => boolean) {
    if (!props.sendCode) throw new Error("sendCode missing");
    const r = await props.sendCode(value, p);
    if (!live()) return;
    if (isFailure(r)) return fail(r);
    setPurpose(p);
    setCode("");
    go("code");
  }

  async function startPasskey(has: { password?: boolean } | null, address: string) {
    go("passkey");
    const g = gen.current;
    let r: AuthResult;
    try {
      r = props.passkey ? await props.passkey({ email: address, autoFill: false }) : NOT_SET;
    } catch {
      r = NOT_SET;
    }
    if (g !== gen.current) return;
    if (r.ok) return finish(r);
    if (stepAfterPasskeyFailure(has, on) === "password") {
      setPasskeyFailed(true);
      setPassword("");
      go("password");
      fail({ error: "passkey_failed_password" });
    } else {
      go("email");
      fail({ error: "passkey_failed" });
    }
  }

  function toEmail() {
    setPassword("");
    setPasskeyFailed(false);
    go("email");
  }

  function toPassword() {
    setPasskeyFailed(false);
    setPassword("");
    go("password");
  }

  function onEmail(e: FormEvent) {
    e.preventDefault();
    clear();
    const value = badEmail();
    if (!value) return;
    setEmail(value);
    void run("submit", async (live) => {
      let answer: LookupAnswer;
      if (props.lookup) {
        const r = await props.lookup(value);
        if (!live()) return;
        if (isFailure(r)) return fail(r);
        answer = r;
      } else {
        answer = { account: "exists", methods: { password: true, code: true } };
      }
      const has = answer.account === "exists" ? answer.methods : null;
      setKnown(has);
      const to = stepAfterLookup(answer, on);
      if (to === "none") return fail({ error: "no_account" });
      if (to === "code") return toCode(value, answer.account === "none" ? "sign-up" : "sign-in", live);
      if (to === "passkey") {
        void startPasskey(has, value);
        return;
      }
      setPassword("");
      setPasskeyFailed(false);
      go(to);
    });
  }

  function onPassword(e: FormEvent) {
    e.preventDefault();
    clear();
    if (!password) return fail({ error: "password_empty" });
    void run("submit", async (live) => {
      const r = props.password ? await props.password({ email, password }) : NOT_SET;
      if (!live()) return;
      if (isFailure(r)) return fail(r);
      await finish(r);
    });
  }

  function onSignup(e: FormEvent) {
    e.preventDefault();
    clear();
    if (!name.trim()) return fail({ error: "name_required" });
    if (on.password && password.length < passwordMin) return fail({ error: "password_too_short" });
    if (on.password && password.length > passwordMax) return fail({ error: "password_too_long" });
    void run("submit", async (live) => {
      const r = props.signup
        ? await props.signup({ email, name: name.trim(), ...(on.password ? { password } : {}) })
        : NOT_SET;
      if (!live()) return;
      if (isFailure(r)) return fail(r);
      if (r.next === "signed_in") return finish({ ok: true });
      setPurpose("sign-up");
      setCode("");
      go("code");
    });
  }

  function onCode(e: FormEvent) {
    e.preventDefault();
    clear();
    if (code.length !== 6) {
      fail({ error: "code_incomplete" });
      refs.code.current?.focus();
      return;
    }
    void run("submit", async (live) => {
      const r = props.verifyCode
        ? await props.verifyCode({ email, code, purpose, ...(purpose === "sign-up" && password ? { password } : {}) })
        : NOT_SET;
      if (!live()) return;
      if (isFailure(r)) {
        // A wrong or expired code is useless: empty the boxes for the next one.
        if (r.error === "code_invalid" || r.error === "code_expired") setCode("");
        fail(r, "code");
        refs.code.current?.focus();
        return;
      }
      await finish(r);
    });
  }

  function resend() {
    clear();
    void run("resend", async (live) => {
      if (!props.sendCode) throw new Error("sendCode missing");
      const r = await props.sendCode(email, purpose);
      if (!live()) return;
      if (isFailure(r)) return fail(r, "code");
      setCode("");
      setNotice(t.codeSent);
      refs.code.current?.focus();
    });
  }

  function onTwoFactor(e: FormEvent) {
    e.preventDefault();
    clear();
    const value = recovery ? code.trim() : code;
    if (recovery ? !value : value.length !== 6) {
      fail({ error: recovery ? "recovery_empty" : "code_incomplete" });
      refs.code.current?.focus();
      return;
    }
    void run("submit", async (live) => {
      const r = props.twoFactor ? await props.twoFactor({ code: value, recovery }) : NOT_SET;
      if (!live()) return;
      if (isFailure(r)) return fail(r.error || r.message ? r : { error: recovery ? "recovery_invalid" : "two_factor_invalid" }, "code");
      await finish({ ok: true });
    });
  }

  function sendReset(e?: FormEvent) {
    e?.preventDefault();
    clear();
    const value = badEmail();
    if (!value) return;
    setEmail(value);
    const from = step;
    void run(from === "sent" ? "resend" : "submit", async (live) => {
      const r = props.resetPassword ? await props.resetPassword(value) : NOT_SET;
      if (!live()) return;
      if (isFailure(r)) return fail(r);
      if (from !== "sent") go("sent");
    });
  }

  function startGoogle() {
    if (busyRef.current) return;
    clear();
    const g = gen.current;
    busyRef.current = true;
    setBusy("google");
    (async () => {
      let r: AuthResult | void;
      try {
        r = props.google ? await props.google() : NOT_SET;
      } catch {
        r = { ok: false, error: "google_failed" };
      }
      if (g !== gen.current) return;
      if (!r) return; // Leaving for Google: keep the spinner (pageshow clears it if they come back).
      busyRef.current = false;
      setBusy(null);
      if (isFailure(r)) fail({ ...r, error: r.error ?? "google_failed" });
      else await finish(r);
    })();
  }

  const errorOf = (f: Field) => (problem && problem.field === f ? problem.message : "");
  const formError = (fields: Field[]) => (problem && (problem.field === null || !fields.includes(problem.field)) ? <AuthError center>{problem.message}</AuthError> : null);
  const submitting = busy === "submit";

  const googleButton = (primary: boolean) => (
    <AuthButton type="button" primary={primary} className={btn} disabled={busy === "google"} aria-busy={busy === "google" || undefined} onClick={startGoogle}>
      <Busy busy={busy === "google"} label={t.busy}>
        <GoogleIcon />
        {t.google}
      </Busy>
    </AuthButton>
  );

  const submit = (label: string) => (
    <AuthButton type="submit" primary className={btn} disabled={submitting} aria-busy={submitting || undefined}>
      <Busy busy={submitting} label={t.busy}>
        {label}
      </Busy>
    </AuthButton>
  );

  const outline = (label: ReactNode, onClick: () => void, extra?: { busy?: boolean }) => (
    <AuthButton type="button" className={btn} onClick={onClick} disabled={extra?.busy} aria-busy={extra?.busy || undefined}>
      <Busy busy={Boolean(extra?.busy)} label={t.busy}>
        {label}
      </Busy>
    </AuthButton>
  );

  const emailField = (id: string, labelled: boolean) => (
    <div className="flex flex-col gap-1">
      <Label htmlFor={id} sr={!labelled} bad={Boolean(errorOf("email"))}>
        {t.emailLabel}
      </Label>
      <AuthField
        id={id}
        ref={refs.email}
        type="email"
        name="email"
        placeholder={t.emailPlaceholder}
        autoComplete={on.passkey ? "username webauthn" : "username"}
        value={email}
        onChange={(e) => {
          setEmail(e.target.value);
          setSuggestion(null);
        }}
        aria-invalid={Boolean(errorOf("email")) || undefined}
        className={field(Boolean(errorOf("email")))}
      />
      <AuthError>{errorOf("email")}</AuthError>
      {suggestion ? (
        <p className="mt-1 text-xs leading-4 text-muted-foreground">
          <button
            type="button"
            className="cursor-pointer border-0 bg-transparent p-0 text-foreground underline underline-offset-2"
            onClick={() => {
              setEmail(suggestion);
              clear();
              refs.email.current?.focus();
            }}
          >
            {fill(t.emailSuggestion, { email: suggestion })}
          </button>
        </p>
      ) : null}
    </div>
  );

  const readOnlyEmail = (
    <div className="flex flex-col gap-1">
      <Label htmlFor="auth-email-shown">{t.emailLabel}</Label>
      <AuthField id="auth-email-shown" type="email" name="email" autoComplete="username" value={email} readOnly className={field(false)} />
    </div>
  );

  const passwordField = (id: string, label: string, autoComplete: string, aside?: ReactNode, focus?: boolean) => (
    <div className="flex flex-col gap-1">
      <div className="flex items-baseline justify-between">
        <Label htmlFor={id} bad={Boolean(errorOf("password"))}>
          {label}
        </Label>
        {aside}
      </div>
      <AuthField
        id={id}
        ref={focus ? refs.password : undefined}
        type="password"
        name="password"
        autoComplete={autoComplete}
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        aria-invalid={Boolean(errorOf("password")) || undefined}
        className={field(Boolean(errorOf("password")))}
      />
      <AuthError>{errorOf("password")}</AuthError>
    </div>
  );

  const usesEmail = Boolean(on.code || on.password || on.passkey || on.signup);
  let body: ReactNode;

  switch (step) {
    case "email":
      body = (
        <>
          <Heading title={t.emailTitle} sub={t.emailSub} />
          {formError(usesEmail ? ["email"] : [])}
          {usesEmail ? (
            <form className="m-0 flex flex-col gap-4" noValidate onSubmit={onEmail}>
              {emailField("auth-email", false)}
              {submit(t.continue)}
            </form>
          ) : null}
          {on.google ? (
            <>
              {usesEmail ? <AuthDivider className="my-4 text-xs leading-4">{t.or}</AuthDivider> : null}
              {googleButton(false)}
            </>
          ) : null}
        </>
      );
      break;

    case "password":
      body = (
        <>
          <Heading title={t.passwordTitle} />
          {formError(["password"])}
          <form className="m-0 flex flex-col gap-4" noValidate onSubmit={onPassword}>
            {readOnlyEmail}
            {passwordField(
              "auth-password",
              t.passwordLabel,
              "current-password",
              props.resetPassword ? (
                <button
                  type="button"
                  className="cursor-pointer border-0 bg-transparent p-0 text-[13px] leading-[14px] text-muted-foreground underline underline-offset-2 hover:text-foreground"
                  onClick={() => {
                    setForgotFrom("password");
                    go("forgot");
                  }}
                >
                  {t.forgotLink}
                </button>
              ) : null,
              true,
            )}
            <div className="flex flex-col gap-3">
              {submit(t.signIn)}
              {passkeyFailed ? outline(t.passkeyRetry, () => void startPasskey(known, email)) : outline(t.back, toEmail)}
            </div>
          </form>
        </>
      );
      break;

    case "passkey":
      body = (
        <>
          <div role="status">
            <Heading mark={<LoaderCircle className="animate-spin" />} title={t.passkeyTitle} sub={fill(t.passkeySub, { email })} />
          </div>
          <div className="flex flex-col gap-3">{on.password && known?.password ? outline(t.usePassword, toPassword) : outline(t.back, toEmail)}</div>
        </>
      );
      break;

    case "google":
      body = (
        <>
          <Heading title={t.googleTitle} sub={fill(t.googleSub, { email })} />
          {formError([])}
          <div className="flex flex-col gap-3">
            {googleButton(true)}
            {outline(t.back, toEmail)}
          </div>
        </>
      );
      break;

    case "signup":
      body = (
        <>
          <Heading title={t.signupTitle} />
          {formError(on.password ? ["name", "password"] : ["name"])}
          <form className="m-0 flex flex-col gap-4" noValidate onSubmit={onSignup}>
            {readOnlyEmail}
            <div className="flex flex-col gap-1">
              <Label htmlFor="auth-name" bad={Boolean(errorOf("name"))}>
                {t.nameLabel}
              </Label>
              <AuthField
                id="auth-name"
                ref={refs.name}
                name="name"
                autoComplete="name"
                maxLength={50}
                value={name}
                onChange={(e) => setName(e.target.value)}
                aria-invalid={Boolean(errorOf("name")) || undefined}
                className={field(Boolean(errorOf("name")))}
              />
              <AuthError>{errorOf("name")}</AuthError>
            </div>
            {on.password ? passwordField("auth-new-password", fill(t.newPasswordLabel, { min: passwordMin }), "new-password") : null}
            <div className="flex flex-col gap-3">
              {submit(t.createAccount)}
              {outline(t.back, toEmail)}
            </div>
          </form>
        </>
      );
      break;

    case "code": {
      const bad = errorOf("code");
      body = (
        <>
          <Heading title={purpose === "sign-up" ? t.verifyTitle : t.codeTitle} sub={fill(t.codeSub, { email })} />
          {formError(["code"])}
          <form className="m-0 flex flex-col gap-4" noValidate onSubmit={onCode}>
            <div className="flex justify-center">
              <AuthCodeBoxes
                id="auth-code"
                name="code"
                inputRef={refs.code}
                value={code}
                label={t.codeLabel}
                bad={Boolean(bad)}
                onChange={(v) => {
                  if (problem?.field === "code") setProblem(null);
                  setCode(v);
                }}
              />
            </div>
            {bad ? (
              <div className="-mt-3 flex justify-center">
                <AuthError>{bad}</AuthError>
              </div>
            ) : (
              <p className="m-0 text-center text-xs leading-4 text-muted-foreground">{notice || t.codeHint}</p>
            )}
            <div className="flex flex-col gap-3">
              {submit(t.continue)}
              {outline(t.resendCode, resend, { busy: busy === "resend" })}
            </div>
          </form>
          <p className="mt-4 mb-0 text-center text-xs leading-4 text-muted-foreground">
            <button type="button" className="cursor-pointer border-0 bg-transparent p-0 text-inherit underline underline-offset-2 hover:text-foreground" onClick={toEmail}>
              {t.otherEmail}
            </button>
          </p>
        </>
      );
      break;
    }

    case "twofactor": {
      const bad = errorOf("code");
      body = (
        <>
          <Heading title={t.twoFactorTitle} sub={recovery ? t.recoverySub : t.twoFactorSub} />
          {formError(["code"])}
          <form className="m-0 flex flex-col gap-4" noValidate onSubmit={onTwoFactor}>
            {recovery ? (
              <div className="flex flex-col gap-1">
                <Label htmlFor="auth-recovery" bad={Boolean(bad)}>
                  {t.recoveryLabel}
                </Label>
                <AuthField
                  id="auth-recovery"
                  ref={refs.code}
                  autoComplete="off"
                  autoCapitalize="off"
                  spellCheck={false}
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  aria-invalid={Boolean(bad) || undefined}
                  className={field(Boolean(bad))}
                />
                <AuthError>{bad}</AuthError>
              </div>
            ) : (
              <>
                <div className="flex justify-center">
                  <AuthCodeBoxes
                    id="auth-two-factor"
                    inputRef={refs.code}
                    value={code}
                    label={t.twoFactorLabel}
                    bad={Boolean(bad)}
                    onChange={(v) => {
                      if (problem?.field === "code") setProblem(null);
                      setCode(v);
                    }}
                  />
                </div>
                {bad ? (
                  <div className="-mt-3 flex justify-center">
                    <AuthError>{bad}</AuthError>
                  </div>
                ) : (
                  <p className="m-0 text-center text-xs leading-4 text-muted-foreground">{t.twoFactorHint}</p>
                )}
              </>
            )}
            <div className="flex flex-col gap-3">
              {submit(t.signIn)}
              {outline(recovery ? t.useApp : t.useRecovery, () => {
                clear();
                setCode("");
                setRecovery((r) => !r);
                setTimeout(() => refs.code.current?.focus(), 0);
              })}
            </div>
          </form>
        </>
      );
      break;
    }

    case "forgot":
      body = (
        <>
          <Heading title={t.forgotTitle} sub={t.forgotSub} />
          {formError(["email"])}
          <form className="m-0 flex flex-col gap-4" noValidate onSubmit={sendReset}>
            {emailField("auth-forgot-email", false)}
            <div className="flex flex-col gap-3">
              {submit(t.sendReset)}
              {outline(t.back, () => go(forgotFrom))}
            </div>
          </form>
        </>
      );
      break;

    case "sent":
      body = (
        <>
          <div role="status">
            <Heading mark={<MailOpen />} title={t.sentTitle} sub={fill(t.sentSub, { email })} />
          </div>
          {formError([])}
          <div className="flex flex-col gap-3">{outline(t.resendReset, () => sendReset(), { busy: busy === "resend" })}</div>
        </>
      );
      break;

    case "routing":
      body = (
        <div role="status" aria-label={t.signingIn} className="flex justify-center [&_svg]:size-6">
          <LoaderCircle className="animate-spin" aria-hidden="true" />
        </div>
      );
      break;
  }

  const column = (
    <section data-step={step} className={cn("flex w-full flex-col text-foreground [word-break:keep-all]", props.className)}>
      {body}
    </section>
  );
  if (props.bare) return column;
  return (
    <AuthLayout brand={props.brand} app={props.app} footer={props.footer}>
      {column}
    </AuthLayout>
  );
}
