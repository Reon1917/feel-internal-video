"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Loader2Icon } from "lucide-react";

import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import {
  Tabs,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { authClient } from "@/lib/auth-client";

type AuthMode = "sign-in" | "sign-up";

function getPasswordError(password: string, confirmPassword: string) {
  if (password.length < 8) {
    return "Password must be at least 8 characters.";
  }

  if (!/[A-Za-z]/.test(password) || !/[0-9]/.test(password)) {
    return "Password must include at least one letter and one number.";
  }

  if (password !== confirmPassword) {
    return "Passwords do not match.";
  }

  return null;
}

export function LoginForm() {
  const router = useRouter();
  const [mode, setMode] = useState<AuthMode>("sign-in");
  const [error, setError] = useState<string | null>(null);
  const [isPending, setIsPending] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);

    const formData = new FormData(event.currentTarget);
    const email = String(formData.get("email") ?? "");
    const password = String(formData.get("password") ?? "");
    const confirmPassword = String(formData.get("confirmPassword") ?? "");
    const name = String(formData.get("name") ?? email);

    if (mode === "sign-up") {
      const passwordError = getPasswordError(password, confirmPassword);

      if (passwordError) {
        setError(passwordError);
        return;
      }
    }

    setIsPending(true);

    const result =
      mode === "sign-up"
        ? await authClient.signUp.email({
            email,
            password,
            name,
            callbackURL: "/dashboard",
          })
        : await authClient.signIn.email({
            email,
            password,
            callbackURL: "/dashboard",
          });

    setIsPending(false);

    if (result.error) {
      setError(
        mode === "sign-up"
          ? "Signup failed. Check that this email is whitelisted."
          : "Sign in failed. Check your credentials or whitelist status.",
      );
      return;
    }

    router.push("/dashboard");
    router.refresh();
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{mode === "sign-in" ? "Sign in" : "Create account"}</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-6">
        <Tabs
          onValueChange={(value) => {
            setError(null);
            setMode(value as AuthMode);
          }}
          value={mode}
        >
          <TabsList className="w-full" variant="line">
            <TabsTrigger value="sign-in">Sign in</TabsTrigger>
            <TabsTrigger value="sign-up">Sign up</TabsTrigger>
          </TabsList>
        </Tabs>

        <form className="flex flex-col gap-6" onSubmit={handleSubmit}>
          <FieldGroup>
            {mode === "sign-up" ? (
              <Field>
                <FieldLabel htmlFor="name">Name</FieldLabel>
                <Input id="name" name="name" required type="text" />
              </Field>
            ) : null}

            <Field>
              <FieldLabel htmlFor="email">Email</FieldLabel>
              <Input
                autoComplete="email"
                id="email"
                name="email"
                placeholder="name@gmail.com"
                required
                type="email"
              />
            </Field>

            <Field>
              <FieldLabel htmlFor="password">Password</FieldLabel>
              <Input
                autoComplete={
                  mode === "sign-up" ? "new-password" : "current-password"
                }
                id="password"
                minLength={8}
                name="password"
                pattern={
                  mode === "sign-up"
                    ? "^(?=.*[A-Za-z])(?=.*\\d).{8,}$"
                    : undefined
                }
                required
                title="Use at least 8 characters with at least one letter and one number."
                type="password"
              />
              {mode === "sign-up" ? (
                <FieldDescription>
                  At least 8 characters with one letter and one number.
                </FieldDescription>
              ) : null}
            </Field>

            {mode === "sign-up" ? (
              <Field data-invalid={!!error && error.includes("Passwords")}>
                <FieldLabel htmlFor="confirmPassword">
                  Confirm password
                </FieldLabel>
                <Input
                  autoComplete="new-password"
                  aria-invalid={!!error && error.includes("Passwords")}
                  id="confirmPassword"
                  minLength={8}
                  name="confirmPassword"
                  required
                  type="password"
                />
                {error?.includes("Passwords") ? (
                  <FieldError>{error}</FieldError>
                ) : null}
              </Field>
            ) : null}
          </FieldGroup>

          {error && !error.includes("Passwords") ? (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          ) : null}

          <Button disabled={isPending} type="submit">
            {isPending ? <Loader2Icon data-icon="inline-start" /> : null}
            {mode === "sign-in" ? "Sign in" : "Create account"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
