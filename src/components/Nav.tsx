import { A } from "@solidjs/router";
import { Logo } from "./Logo";
import Profile from "./Profile";

export default function Nav() {
  return (
    <div class="flex sticky top-0 z-50 items-center gap-2 p-2 justify-between bg-background shadow-lg">
      <A href="/">
        <Logo />
      </A>
      <Profile />
    </div>
  );
}
