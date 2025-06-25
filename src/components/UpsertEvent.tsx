import { createForm, valiForm } from "@modular-forms/solid";
import { For } from "solid-js";
import {
  eventSchema,
  type UpsertEventInput,
  upsertEvent,
} from "~/server/upsertEvent";
import { t } from "~/t";
import { Button } from "./ui/button";
import { createFormDatePicker } from "./ui/createFormDatePicker";
import { createFormTextArea } from "./ui/createFormTextArea";
import { createFormTextField } from "./ui/createFormTextField";

export function UpsertEvent(props: { event: UpsertEventInput }) {
  const [_form, { Form, Field, FieldArray }] = createForm<UpsertEventInput>({
    initialValues: props.event,
    validate: valiForm(eventSchema),
  });

  const FormTextField = createFormTextField(Field);
  const FormTextArea = createFormTextArea(Field);
  const FormDate = createFormDatePicker(Field);

  return (
    <div class="flex flex-col items-stretch">
      <Form onSubmit={(values) => upsertEvent(values)}>
        <FormTextField name="title" label={t.title} />
        <FieldArray name="tags">
          {(fieldArray) => (
            <For each={fieldArray.items}>
              {(_, index) => (
                <div>
                  <FormTextField name={`tags.${index()}`} label={t.title} />
                </div>
              )}
            </For>
          )}
        </FieldArray>
        <FormTextField name="location" label={t.location} />
        <FormDate name="start" label={t.start} />
        <FormDate name="end" label={t.end} />
        <FormTextArea name="description" label={t.description} />
        <Button type="submit">{props.event ? t.save : t.create}</Button>
      </Form>
    </div>
  );
}
