"use client";

import { useActionState } from "react";
import { LogIn, User, Lock, AlertTriangle, Car, ShieldCheck } from "lucide-react";
import { loginAction, type LoginActionState } from "@/app/actions/auth";

export function LoginForm({ nextTarget }: { nextTarget: string }) {
  const [state, formAction, isPending] = useActionState<LoginActionState, FormData>(
    loginAction,
    {}
  );

  return (
    <div className="login-form-wrapper">
      <div className="login-header">
        <div className="login-brand-badge" aria-hidden="true">
          <Car size={20} />
        </div>
        <h1 className="login-title">Dream Car House</h1>
        <p className="login-subtitle">
          Sign in to the enterprise management dashboard
        </p>
      </div>

      <form action={formAction} noValidate className="login-form">
        <input type="hidden" name="next" value={nextTarget} />

        {state?.error && (
          <div role="alert" className="login-alert">
            <AlertTriangle size={15} style={{ flexShrink: 0, marginTop: 1 }} />
            <span>{state.error}</span>
          </div>
        )}

        <div className="form-group">
          <label className="form-label" htmlFor="username">
            Username
          </label>
          <div className="input-affix-wrapper">
            <span className="input-affix-icon" aria-hidden="true">
              <User size={15} />
            </span>
            <input
              id="username"
              name="username"
              type="text"
              required
              autoComplete="username"
              placeholder="Enter your staff username"
              className="form-input input-with-affix"
              aria-invalid={!!state?.fieldErrors?.username}
              aria-describedby={state?.fieldErrors?.username ? "username-error" : undefined}
              disabled={isPending}
            />
          </div>
          {state?.fieldErrors?.username && (
            <span id="username-error" className="form-error">
              {state.fieldErrors.username}
            </span>
          )}
        </div>

        <div className="form-group">
          <label className="form-label" htmlFor="password">
            Password
          </label>
          <div className="input-affix-wrapper">
            <span className="input-affix-icon" aria-hidden="true">
              <Lock size={15} />
            </span>
            <input
              id="password"
              name="password"
              type="password"
              required
              autoComplete="current-password"
              placeholder="Enter your password"
              className="form-input input-with-affix"
              aria-invalid={!!state?.fieldErrors?.password}
              aria-describedby={state?.fieldErrors?.password ? "password-error" : undefined}
              disabled={isPending}
            />
          </div>
          {state?.fieldErrors?.password && (
            <span id="password-error" className="form-error">
              {state.fieldErrors.password}
            </span>
          )}
        </div>

        <button
          type="submit"
          className="login-submit-btn"
          disabled={isPending}
        >
          {isPending ? (
            <>
              <span className="ui-spinner" aria-hidden="true" />
              <span>Signing in…</span>
            </>
          ) : (
            <>
              <LogIn size={15} aria-hidden="true" />
              <span>Sign in to Dashboard</span>
            </>
          )}
        </button>

        <div className="login-security-notice">
          <ShieldCheck size={13} aria-hidden="true" />
          <span>Staff session monitoring & audit logging active</span>
        </div>
      </form>
    </div>
  );
}
