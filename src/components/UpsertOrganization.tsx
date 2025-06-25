import { createForm, valiForm } from "@modular-forms/solid";
import { createAsync, useNavigate } from "@solidjs/router";
import { getTowns } from "~/server/getTowns";
import {
  organizationSchema,
  type UpsertOrganizationInput,
  upsertOrganization,
} from "~/server/upsertOrganization";
import { t } from "~/t";
import { Button } from "./ui/button";
import { createFormDatePicker } from "./ui/createFormDatePicker";
import { createFormTextArea } from "./ui/createFormTextArea";
import { createFormTextField } from "./ui/createFormTextField";
import { createFormVirtualSelect } from "./ui/createFormVirtualSelect";

export function UpsertOrganization(props: {
  organization: UpsertOrganizationInput;
}) {
  const navigate = useNavigate();
  const [form, { Form, Field }] = createForm<UpsertOrganizationInput>({
    initialValues: props.organization,
    validate: valiForm(organizationSchema),
  });

  const allTowns = createAsync(() => getTowns());

  const FormTownField = createFormVirtualSelect(
    Field,
    form,
    () => allTowns() ?? [],
    (x) => (
      <div class="flex items-center gap-2 justify-between">
        <span>{x?.name ?? ""}</span>
        <span class="text-muted-foreground">{x?.municipality ?? ""}</span>
      </div>
    ),
    (x) => x?.id,
    () => 400,
    () => 24,
  );
  const FormTextField = createFormTextField(Field);
  const _FormTextArea = createFormTextArea(Field);
  const _FormDate = createFormDatePicker(Field);

  return (
    <div class="flex flex-col items-stretch gap-2">
      <Form
        class="flex flex-col items-stretch gap-2"
        onSubmit={(values) =>
          upsertOrganization(values).then((_x) => navigate("/"))
        }
      >
        <FormTextField name="vatId" label={t.vatId} />
        <FormTownField name="townId" label={t.town} />
        <hr class="my-4" />

        <Button type="submit">
          {props.organization?.id ? t.save : t.create}
        </Button>
      </Form>
    </div>
  );
}
