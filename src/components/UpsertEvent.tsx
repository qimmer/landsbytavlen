import { createAsync, useAction, useNavigate } from "@solidjs/router";
import { Show } from "solid-js";
import { createForm } from "~/lib/createForm";
import { deleteImage } from "~/server/deleteImage";
import { getImages } from "~/server/getImages";
import { uploadImage } from "~/server/uploadImage";
import {
  defaultEventInput,
  eventSchema,
  type UpsertEventInput,
  upsertEvent,
} from "~/server/upsertEvent";
import { t } from "~/t";
import { FormDateField } from "./form/FormDateField";
import { FormImage } from "./form/FormImage";
import { FormNumberField } from "./form/FormNumberField";
import { FormTextArea } from "./form/FormTextArea";
import { FormTextField } from "./form/FormTextField";
import { Button } from "./ui/button";
import { Icon } from "./ui/icon";

export function UpsertEvent(props: {
  event: UpsertEventInput;
  onSaved?: () => void;
}) {
  const navigate = useNavigate();

  const form = createForm(
    eventSchema,
    () => props.event ?? defaultEventInput(),
  );

  const images = createAsync(() => getImages());

  const upsertEventAction = useAction(upsertEvent);
  const uploadImageAction = useAction(uploadImage);
  const deleteImageAction = useAction(deleteImage);

  return (
    <div class="flex flex-col items-stretch gap-4">
      <h1 class="text-4xl font-bold">
        {props.event?.id ? t.editEvent : t.createEvent}
      </h1>
      <form
        class="flex flex-col gap-2 w-full lg:basis-1/4 lg:w-auto items-stretch"
        onSubmit={async (e) => {
          e.preventDefault();

          if (form.isValid) {
            await upsertEventAction(form.result!);
            navigate("/");
          }
        }}
      >
        <FormTextField field={form.fields.title} label={t.title} required />
        <FormTextField
          field={form.fields.location}
          label={t.location}
          required
        />
        <FormDateField
          class="self-start"
          field={form.fields.start}
          label={t.start}
          required
        />
        <FormNumberField
          class="self-start"
          field={form.fields.hours}
          label={t.durationHours}
          required
        />

        <FormImage
          label={t.coverImage}
          images={images()?.map((x) => x.id) ?? []}
          field={form.fields.coverImageId}
          onDelete={(imageId) => {
            deleteImageAction(imageId);
          }}
          onUpload={async (file) => {
            uploadImageAction(file);
          }}
        />

        <FormImage
          label={t.images}
          multiple
          images={images()?.map((x) => x.id) ?? []}
          field={form.fields.images}
          onDelete={(imageId) => {
            deleteImageAction(imageId);
          }}
          onUpload={async (file) => {
            uploadImageAction(file);
          }}
        />

        <FormTextArea
          field={form.fields.description}
          label={t.description}
          required
        />

        <Button type="submit" disabled={!form.isValid}>
          {props.event?.id ? t.save : t.create}
        </Button>

        <Show when={props.event?.id}>
          <Button
            type="button"
            variant="destructive"
            onClick={async () => {
              await upsertEventAction({ id: props.event.id!, deleted: true });
              navigate("/");
            }}
          >
            {t.delete}
            <Icon iconId="trash" />
          </Button>
        </Show>
      </form>
    </div>
  );
}
