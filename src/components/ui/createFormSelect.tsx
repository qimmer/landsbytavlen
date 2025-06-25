import type {
  FieldPath,
  FieldPathValue,
  FieldProps,
  FieldType,
  FieldValues,
  FormStore,
  ResponseData,
} from "@modular-forms/solid";
import {
  type Accessor,
  createEffect,
  createSignal,
  type JSX,
  Show,
  splitProps,
} from "solid-js";
import {
  Select,
  SelectContent,
  SelectErrorMessage,
  SelectHiddenSelect,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./select";
import { TextFieldLabel } from "./textfield";

type SelectProps<TOption extends object> = {
  name?: string;
  label?: string;
  placeholder?: JSX.Element | undefined;
  options?: TOption[];
  value?: string | undefined;
  error?: string;
  required?: boolean | undefined;
  disabled?: boolean | undefined;
  optionValue: keyof TOption;
  optionTextValue: keyof TOption;
  ref?: (element: HTMLSelectElement) => void;
  onInput?: JSX.EventHandler<HTMLSelectElement, InputEvent>;
  onChange?: JSX.EventHandler<HTMLSelectElement, Event>;
  onBlur?: JSX.EventHandler<HTMLSelectElement, FocusEvent>;
};
function FormSelect<TOption extends object>(props: SelectProps<TOption>) {
  const [rootProps, selectProps] = splitProps(
    props,
    ["name", "placeholder", "required", "disabled"],
    ["placeholder", "ref", "onInput", "onChange", "onBlur"],
  );
  const [getValue, setValue] = createSignal<TOption | undefined>();
  createEffect(() => {
    setValue(
      (_last) =>
        props.options?.find(
          (option) => props.value === (option[props.optionValue] as string),
        ) as TOption,
    );
  });
  return (
    <Select<string>
      {...rootProps}
      options={props.options?.map((x) => x[props.optionValue] as string) ?? []}
      multiple={false}
      value={(getValue()?.[props.optionValue] as string) ?? ""}
      onChange={(v) =>
        setValue(
          () =>
            (props.options?.find(
              (x) => x[props.optionValue] === v,
            ) as TOption) ?? undefined,
        )
      }
      validationState={props.error ? "invalid" : "valid"}
      itemComponent={(props) => (
        <SelectItem item={props.item}>{props.item.textValue}</SelectItem>
      )}
    >
      <Show when={props.label}>
        <TextFieldLabel>{props.label}</TextFieldLabel>
      </Show>
      <SelectHiddenSelect {...selectProps} />
      <SelectTrigger>
        <SelectValue<TOption>>
          {(state) => state.selectedOption()[props.optionTextValue] as string}
        </SelectValue>
      </SelectTrigger>

      <SelectContent />
      <SelectErrorMessage>{props.error}</SelectErrorMessage>
    </Select>
  );
}

export function createFormSelect<
  TOption extends object,
  TFieldValues extends FieldValues,
  TFieldName extends FieldPath<TFieldValues>,
  TResponseData extends ResponseData = undefined,
>(
  Field: (
    props: FieldProps<TFieldValues, TResponseData, TFieldName>,
  ) => JSX.Element,
  options: Accessor<TOption[]>,
  optionValue: keyof TOption,
  optionTextValue: keyof TOption,
) {
  return (
    props: Omit<
      SelectProps<TOption>,
      "options" | "optionTextValue" | "optionValue"
    > & {
      type?: FieldType<FieldPathValue<TFieldValues, TFieldName>>;
      of?: FormStore<TFieldValues, TResponseData>;
    } & Omit<
        FieldProps<TFieldValues, TResponseData, TFieldName>,
        "children" | "type" | "of"
      >,
  ) => {
    const [local, rest] = splitProps(props, ["of", "type"]);
    return Field({
      ...rest,
      type: local.type!,
      of: local.of!,
      children: (_field, fieldProps) => {
        return (
          <FormSelect<TOption>
            {...rest}
            {...fieldProps}
            options={options()}
            optionValue={optionValue}
            optionTextValue={optionTextValue}
          />
        );
      },
    });
  };
}
