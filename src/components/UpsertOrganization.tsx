import { createAsync, useAction, useNavigate } from "@solidjs/router";
import type { InferSelectModel } from "drizzle-orm";
import { Show } from "solid-js";
import type { organizations, towns } from "~/db/schema";
import { createForm } from "~/lib/createForm";
import { deleteImage } from "~/server/deleteImage";
import { getImages } from "~/server/getImages";
import { getTowns } from "~/server/getTowns";
import { uploadImage } from "~/server/uploadImage";
import {
  organizationSchema,
  upsertOrganization,
} from "~/server/upsertOrganization";
import { t } from "~/t";
import { FormImage } from "./form/FormImage";
import { FormSelect } from "./form/FormSelect";
import { FormTextArea } from "./form/FormTextArea";
import { FormTextField } from "./form/FormTextField";
import { Town } from "./Town";
import { Button } from "./ui/button";

export function UpsertOrganization(props: {
  organization: InferSelectModel<typeof organizations>;
}) {
  const navigate = useNavigate();
  const form = createForm(organizationSchema, () => props.organization);

  const allTowns = createAsync(() => getTowns());
  const images = createAsync(() => getImages());

  const upsertOrganizationAction = useAction(upsertOrganization);
  const uploadImageAction = useAction(uploadImage);
  const deleteImageAction = useAction(deleteImage);

  return (
    <div class="flex flex-col items-stretch gap-2">
      <form
        class="flex flex-col items-stretch gap-2"
        onSubmit={async (e) => {
          e.preventDefault();

          if (form.isValid) {
            await upsertOrganizationAction({
              ...form.result!,
              id: props.organization.id,
            });
            navigate("/");
          }
        }}
      >
        <Show when={props.organization.id}>
          <div class="grid grid-cols-2">
            <span>{t.name}:</span>
            <span class="text-muted-foreground text-right">
              {props.organization.name}
            </span>
            <span>{t.vatId}:</span>
            <span class="text-muted-foreground text-right">
              {props.organization.vatId}
            </span>
            <span>{t.address}:</span>
            <span class="text-muted-foreground text-right">
              {props.organization.address}
            </span>
            <span>{t.postCode}:</span>
            <span class="text-muted-foreground text-right">
              {props.organization.postCode}
            </span>
            <span>{t.isCharity}:</span>
            <span class="text-muted-foreground text-right">
              {props.organization.isCharity ? t.yes : t.no}
            </span>
          </div>
          <hr class="my-4" />
        </Show>

        <FormTextField field={form.fields.vatId} label={t.vatId} required />
        <FormTextField field={form.fields.phone} label={t.phone} />
        <FormSelect<InferSelectModel<typeof towns>>
          field={form.fields.townId}
          label={t.town}
          options={allTowns() ?? []}
          optionTitle={(x) => <Town town={x} />}
          optionValue={(x) => x.id}
          required
        />

        <FormImage
          label={t.image}
          images={images()?.map((x) => x.id) ?? []}
          field={form.fields.imageId}
          onDelete={(imageId) => {
            deleteImageAction(imageId);
          }}
          onUpload={async (file) => {
            uploadImageAction(file);
          }}
        />

        <FormTextArea
          field={form.fields.presentation}
          label={t.presentation}
          required
        />

        <FormImage
          label={t.presentationImages}
          multiple
          images={images()?.map((x) => x.id) ?? []}
          field={form.fields.presentationImages}
          onDelete={(imageId) => {
            deleteImageAction(imageId);
          }}
          onUpload={async (file) => {
            uploadImageAction(file);
          }}
        />

        <hr class="my-4" />

        <Button type="submit" disabled={!form.isValid}>
          {props.organization?.id ? t.save : t.create}
        </Button>
      </form>
    </div>
  );
}
