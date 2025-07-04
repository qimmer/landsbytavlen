import { type JSX, splitProps } from "solid-js";
import { cn } from "~/lib/cn";
import { t } from "~/t";
import { Kimatik } from "./Kimatik";
import { Logo } from "./Logo";
import { Link } from "./ui/link";

export function Footer(props: JSX.HTMLAttributes<HTMLDivElement>) {
  const [local, rest] = splitProps(props, ["class"]);

  return (
    <div
      {...rest}
      class={cn("flex flex-col gap-4 py-4 container", local.class)}
    >
      <div class="flex flex-col gap-8 justify-between md:flex-row">
        <div class="flex flex-col md:flex-row gap-4 items-start justify-between">
          <div class="flex gap-4 items-start">
            <Link variant="link" href="/terms">
              {t.terms}
            </Link>
            <Link variant="link" href="/privacy">
              {t.privacy}
            </Link>
            <Link href="mailto:support@landsbytavlen.dk" absolute>
              {t.support}
            </Link>
          </div>
        </div>

        <div class="flex items-center gap-4">
          <a href="https://kimatik.dk/">
            <Kimatik class="h-12 justify-self-end" />
          </a>
          <Logo />
        </div>
      </div>

      <div class="flex justify-end relative">
        <p class="text-xs absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
          {t.copyright({ year: new Date().getFullYear().toFixed() })}
        </p>
      </div>
    </div>
  );
}
