import {
  createEffect,
  createResource,
  createSignal,
  on,
  onCleanup,
  Show,
} from "solid-js";

type DynamicMediaProps = {
  src: string;
  alt?: string;
  class?: string;
  controls?: boolean;
  loop?: boolean;
  playsinline?: boolean;
  autoplay?: boolean;
  muted?: boolean;
};

export default function DynamicMedia(props: DynamicMediaProps) {
  const [contentType] = createResource(
    () => props.src,
    async (src) => {
      const res = await fetch(src, { method: "HEAD" });
      return res.headers.get("Content-Type") ?? "";
    },
  );

  return (
    <Show when={contentType.latest}>
      {(contentType) => (
        <>
          <Show when={contentType().startsWith("image/")}>
            <img
              src={props.src}
              alt={props.alt ?? "image"}
              class={props.class}
            />
          </Show>
          <Show when={contentType().startsWith("video/")}>
            <video
              controlslist="nodownload noplaybackrate"
              src={props.src}
              muted={props.muted}
              controls={props.controls}
              autoplay={props.autoplay}
              loop={props.loop}
              playsinline={props.playsinline}
              preload="metadata"
              class={props.class}
            >
              Your browser does not support the video tag.
            </video>
          </Show>
        </>
      )}
    </Show>
  );
}
