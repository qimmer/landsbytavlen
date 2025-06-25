import { useSearchParams } from "@solidjs/router";
import { createSignal, Show } from "solid-js";
import { Logo } from "~/components/Logo";
import { Button } from "~/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { Icon } from "~/components/ui/icon";
import { Link } from "~/components/ui/link";
import { login } from "~/lib/login";
import { t } from "~/t";

export default () => {
  const [{ error, returnUrl }] = useSearchParams();
  const errorText = () =>
    error ? (t[error as keyof typeof t] as string) : undefined;

  return (
    <div class="bg-background text-foreground flex flex-col items-center py-8 px-2 gap-16 min-h-full justify-center">
      <Logo />

      <Card class="w-full max-w-md">
        <CardHeader>
          <CardTitle class="text-2xl self-center">{t.login}</CardTitle>
        </CardHeader>
        <CardContent class="grid gap-4">
          <Show when={errorText()}>
            <Card class="bg-destructive text-destructive-foreground">
              <CardContent class="flex items-center justify-center">
                {errorText()}
              </CardContent>
            </Card>
          </Show>

          <Show when={import.meta.env?.VITE_IS_SAAS}>
            <p class="font-light text-center">
              <span>{t.signinAgreeTerms}</span>
              <Link href="/terms">{t.terms}</Link>
            </p>
          </Show>

          <Button
            class="gap-2"
            onClick={() =>
              login("facebook", {
                loginReturnUrl: (returnUrl as string) ?? "/",
              })
            }
          >
            <Icon iconId="brand-facebook" />
            {t.facebook}
          </Button>

          <Button
            class="gap-2"
            onClick={() =>
              login("google", {
                loginReturnUrl: (returnUrl as string) ?? "/",
              })
            }
          >
            <Icon iconId="brand-google" />
            {t.google}
          </Button>
          <Button
            class="gap-2"
            onClick={() =>
              login("google", {
                loginReturnUrl: (returnUrl as string) ?? "/",
              })
            }
          >
            <Icon iconId="brand-windows" />
            {t.microsoft}
          </Button>
        </CardContent>
      </Card>

      <Link href="/" target="_self">
        {t.back}
      </Link>
    </div>
  );
};
