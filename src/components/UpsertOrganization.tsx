import { createAsync, useAction, useNavigate } from "@solidjs/router";
import type { InferSelectModel } from "drizzle-orm";
import { createMemo, createSignal, Show } from "solid-js";
import { organizations, towns } from "~/db/schema";
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
import { groupBy, orderBy } from "lodash-es";
import { TextFieldLabel, TextFieldRoot } from "./ui/textfield";
import { VirtualSelect, VirtualSelectContent, VirtualSelectTrigger } from "./ui/virtual-select";
import { FormTownSelect } from "./form/FormTownSelect";

export function UpsertOrganization(props: {
  organization: InferSelectModel<typeof organizations>;
}) {
  const navigate = useNavigate();
  const form = createForm(organizationSchema, () => props.organization);

  const allTowns = createAsync(() => getTowns());
  const images = createAsync(() => getImages());
  const townsByMunicipality = createMemo(() => groupBy(allTowns() ?? [], "municipality"));
  const municipalities = createMemo(() => orderBy(Object.keys(townsByMunicipality()), x => x));
  const [municipality, setMunicipality] = createSignal("");

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

            if (form.result?.id) {
              navigate("/");
            }
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

        <FormTownSelect
          field={form.fields.townId}
          label={t.town}
          required
        />

        <Show when={!!props.organization.id}>
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

        </Show>

        <FormTextArea
          field={form.fields.presentation}
          label={t.presentation}
          required
        />

        <Show when={!!props.organization.id}>
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

        </Show>

        <hr class="my-4" />

        <Button type="submit" disabled={!form.isValid}>
          {props.organization?.id ? t.save : t.create}
        </Button>
      </form>
    </div>
  );
}
