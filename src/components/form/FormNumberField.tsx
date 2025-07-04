import { createEffect, createSignal, on, Show } from "solid-js";
import type { FormField } from "~/lib/createForm";
import {
  TextField,
  TextFieldErrorMessage,
  TextFieldLabel,
  TextFieldRoot,
} from "../ui/textfield";

export function FormNumberField(
  props: Omit<Parameters<typeof TextFieldRoot>[0], "validationState"> & {
    field:
      | FormField<number>
      | FormField<number | null>
      | FormField<number | undefined>
      | FormField<number | null | undefined>;
    label: string;
    required?: boolean;
    type?: Parameters<typeof TextField>[0]["type"];
  },
) {
  const [value, setValue] = createSignal(""); // input string

  createEffect(
    on(
      () => props.field.value,
      (newValue) => {
        const current = parseLocaleNumber(value());

        // biome-ignore lint/suspicious/noDoubleEquals: explanation
        if (newValue != undefined && current != null && newValue !== current) {
          setValue(formatLocaleNumber(newValue));
        }
      },
      { defer: true },
    ),
  );

  const locale = "da-DK";
  const decimalSeparator = Intl.NumberFormat(locale)
    .format(1.1)
    .replace(/\d/g, ""); // get ',' or '.' dynamically

  function parseLocaleNumber(input: string): number | null {
    const normalized = input
      .replace(decimalSeparator, ".")
      .replace(/[^0-9.-]/g, "");
    const n = Number(normalized);
    return Number.isNaN(n) ? null : n;
  }

  function formatLocaleNumber(n: number): string {
    return new Intl.NumberFormat(locale, {
      maximumFractionDigits: 20,
      useGrouping: false,
    }).format(n);
  }

  function onInput(e: InputEvent) {
    const raw = (e.target as HTMLInputElement).value;
    setValue(raw);

    const num = parseLocaleNumber(raw);
    if (num != null && Number.isFinite(num)) {
      props.field.set(num);
    }
  }

  return (
    <TextFieldRoot validationState={props.field.state}>
      <TextFieldLabel required={props.required}>{props.label}</TextFieldLabel>
      <TextField
        required={props.required}
        value={value()}
        onInput={onInput}
        onBlur={() =>
          setValue(
            props.field.value != null
              ? formatLocaleNumber(props.field.value)
              : "",
          )
        }
        type={props.type ?? "text"}
        inputmode="decimal"
      />
      <Show when={props.field.issue}>
        {(issue) => <TextFieldErrorMessage>{issue()}</TextFieldErrorMessage>}
      </Show>
    </TextFieldRoot>
  );
}
