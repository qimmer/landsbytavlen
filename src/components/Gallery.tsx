import { without } from "lodash-es";
import { createSignal, For, type JSX, Show, splitProps } from "solid-js";
import { cn } from "~/lib/cn";
import { mod } from "~/lib/mod";
import { t } from "~/t";
import { Button } from "./ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTrigger,
} from "./ui/dialog";
import DynamicMedia from "./ui/dynamic-media";
import { Icon } from "./ui/icon";

export type GalleryProps = {
  images: string[];
  onPick?: (imageId: string) => void;
  onDelete?: (imageId: string) => void | Promise<void>;
  onUpload?: (file: File) => void | Promise<void>;
};

export type ImagePickerProps = {
  images: string[];
  onDelete?: (imageId: string) => void | Promise<void>;
  onUpload?: (file: File) => void | Promise<void>;
} & (
  | {
      multiple: true;
      values: string[] | undefined;
      onChange: (imageIds: string[]) => void;
    }
  | {
      multiple?: false | undefined;
      value: string | undefined;
      onChange: (imageId: string | undefined) => void;
    }
);

function GalleryTile(props: JSX.HTMLAttributes<HTMLDivElement>) {
  return <div class="flex flex-col gap-2">{props.children}</div>;
}

function GalleryTileFooter(props: JSX.HTMLAttributes<HTMLDivElement>) {
  return (
    <div class="flex items-center gap-2 overflow-hidden text-sm font-medium justify-around max-w-32">
      {props.children}
    </div>
  );
}

function GalleryTileTrigger(props: JSX.HTMLAttributes<HTMLButtonElement>) {
  return (
    <Button
      {...props}
      variant="outline"
      size="tile"
      class={cn("flex flex-col items-center gap-2 p-2", props.class)}
    >
      {props.children}
    </Button>
  );
}

export function GalleryPicker(
  props: Omit<JSX.HTMLAttributes<HTMLDivElement>, "onChange"> &
    ImagePickerProps,
) {
  const [local, rest] = splitProps(props, [
    "class",
    "onChange",
    "onUpload",
    "onDelete",
    "images",
    "multiple",
  ]);
  const [galleryOpen, setGalleryOpen] = createSignal(false);

  function onPick(id: string) {
    if (props.multiple) {
      props.onChange([...(props.values ?? []), id]);
    } else {
      props.onChange(id);
    }
    setGalleryOpen(false);
  }

  return (
    <div {...rest} class={cn("overflow-hidden", local.class)}>
      <div class="overflow-x-auto max-w-full max-h-full w-full flex gap-2">
        <GalleryTile>
          <Dialog open={galleryOpen()} onOpenChange={setGalleryOpen}>
            <DialogTrigger as={GalleryTileTrigger}>
              <Show
                when={!props.multiple && props.value}
                fallback={
                  <>
                    <Icon iconId="photo" size="xl" />
                    {props.multiple ? t.add : t.choose}
                  </>
                }
              >
                {(id) => (
                  <DynamicMedia
                    class="size-full object-cover overflow-hidden"
                    alt=""
                    src={`/thumbnail/${id()}`}
                    previewTime={1}
                  />
                )}
              </Show>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>{t.pickAlbum}</DialogHeader>
              <Gallery
                images={props.images}
                onPick={onPick}
                onUpload={local.onUpload}
                onDelete={local.onDelete}
              />
              <DialogFooter></DialogFooter>
            </DialogContent>
          </Dialog>

          <GalleryTileFooter></GalleryTileFooter>
        </GalleryTile>

        <Show when={props.multiple}>
          <For each={props.multiple && props.values}>
            {(imageId) => (
              <GalleryTile>
                <GalleryTileTrigger>
                  <DynamicMedia
                    class="size-full object-cover overflow-hidden"
                    alt=""
                    src={`/thumbnail/${imageId}`}
                    previewTime={1}
                  />
                </GalleryTileTrigger>

                <GalleryTileFooter>
                  <Button
                    variant="ghost"
                    onClick={() =>
                      props.multiple &&
                      props.onChange?.(without(props.values ?? [], imageId))
                    }
                  >
                    <Icon class="text-destructive" iconId="trash" />
                    <span>{t.delete}</span>
                  </Button>
                </GalleryTileFooter>
              </GalleryTile>
            )}
          </For>
        </Show>
      </div>
    </div>
  );
}

export function Gallery(
  props: JSX.HTMLAttributes<HTMLDivElement> & GalleryProps,
) {
  const [local, rest] = splitProps(props, [
    "class",
    "onPick",
    "onDelete",
    "onUpload",
    "images",
  ]);
  const [fileInput, setFileInput] = createSignal<HTMLInputElement>();

  return (
    <div {...rest} class={cn("overflow-hidden", local.class)}>
      <div class="overflow-x-auto max-w-full max-h-full flex gap-2">
        <Show when={props.onUpload}>
          <input
            ref={setFileInput}
            type="file"
            accept="image/png, image/jpeg, image/webp, video/mp4, video/avc, video/H264, video/H264-SVC"
            class="hidden"
            onChange={async (e) => {
              const file = e.currentTarget?.files?.[0];
              if (file) {
                await local.onUpload?.(file);
              }
            }}
          />
          <GalleryTile>
            <GalleryTileTrigger onClick={() => fileInput()?.click()}>
              <Icon iconId="upload" size="xl" />
              {t.upload}
            </GalleryTileTrigger>
            <GalleryTileFooter></GalleryTileFooter>
          </GalleryTile>
        </Show>

        <For each={local.images}>
          {(imageId) => (
            <GalleryTile>
              <GalleryTileTrigger onClick={() => local.onPick?.(imageId)}>
                <DynamicMedia
                  class="size-full object-cover overflow-hidden"
                  alt=""
                  src={`/thumbnail/${imageId}`}
                  previewTime={1}
                />
              </GalleryTileTrigger>
              <Show when={props.onDelete}>
                <GalleryTileFooter>
                  <Button
                    variant="ghost"
                    onClick={() => props.onDelete?.(imageId)}
                  >
                    <Icon class="text-destructive" iconId="trash" />
                    <span>{t.delete}</span>
                  </Button>
                </GalleryTileFooter>
              </Show>
            </GalleryTile>
          )}
        </For>
      </div>
    </div>
  );
}

export function Slideshow(
  props: JSX.HTMLAttributes<HTMLDivElement> & {
    images: string[];
    index?: number;
    onIndexChange?: (newIndex: number) => void;
  },
) {
  const [local, rest] = splitProps(props, ["class", "index", "images"]);
  const imageId = () =>
    (props.images ?? [])[mod(props.index ?? 0, props.images.length ?? 0)];

  return (
    <div
      {...rest}
      class={cn(
        "flex flex-col items-stretch gap-2 overflow-hidden",
        local.class,
      )}
    >
      <div class="flex flex-col items-stretch justify-stretch relative bg-black rounded-lg overflow-hidden">
        <DynamicMedia
          class="object-contain overflow-hidden w-full aspect-square"
          alt={t.image}
          src={`/image/${imageId()}`}
          controls
          playsinline
          autoplay
        />
        <Button
          class="absolute left-2 top-1/2 -translate-y-1/2 text-white"
          variant="ghost"
          size="icon"
          onClick={() =>
            props.onIndexChange?.(
              mod((props.index ?? 0) - 1, props.images.length),
            )
          }
        >
          <Icon iconId="chevron-left" size="xl" />
        </Button>
        <Button
          class="absolute right-2 top-1/2 -translate-y-1/2 text-white"
          variant="ghost"
          size="icon"
          onClick={() =>
            props.onIndexChange?.(
              mod((props.index ?? 0) + 1, props.images.length),
            )
          }
        >
          <Icon iconId="chevron-right" size="xl" />
        </Button>
      </div>
    </div>
  );
}
