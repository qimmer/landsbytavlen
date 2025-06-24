import Profile from "./Profile";

export default function Nav() {
  return (
    <div class="flex items-center gap-2 p-2 justify-between">
      <div class="flex items-center text-xl font-black tracking-[-1.2pt] select-none">
        <span>TYLSTRUP</span>
        <div class="text-3xl leading-0 font-semibold -translate-y-0.5">/</div>
        <span class="text-destructive">APPEN</span>
      </div>
      <Profile />
    </div>
  );
}
