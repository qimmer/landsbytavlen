import {
  type FieldPath,
  type FieldPathValue,
  type FieldProps,
  type FieldType,
  type FieldValues,
  type FormStore,
  type ResponseData,
  setValue as setFormValue,
} from "@modular-forms/solid";
import {
  type Accessor,
  createEffect,
  createSignal,
  type JSX,
  Show,
  splitProps,
} from "solid-js";
import { Button } from "./button";
import {
  TextFieldErrorMessage,
  TextFieldLabel,
  textfieldLabel,
} from "./textfield";
import {
  VirtualSelect,
  VirtualSelectContent,
  VirtualSelectTrigger,
} from "./virtual-select";

type VirtualSelectProps<
  TOption,
  TFieldValues extends FieldValues,
  TFieldName extends FieldPath<TFieldValues>,
  TResponseData extends ResponseData = undefined,
> = {
  name: TFieldName;
  form: FormStore<TFieldValues, TResponseData>;
  label?: string;
  placeholder?: JSX.Element | undefined;
  options: TOption[];
  value?: string | undefined;
  error?: string;
  required?: boolean | undefined;
  disabled?: boolean | undefined;
  optionTitle: (item: TOption) => JSX.Element;
  optionValue: (item: TOption) => string | undefined;
  height: number;
  rowHeight: number;
  ref?: (element: HTMLSelectElement) => void;
  onInput?: JSX.EventHandler<HTMLSelectElement, InputEvent>;
  onChange?: JSX.EventHandler<HTMLSelectElement, Event>;
  onBlur?: JSX.EventHandler<HTMLSelectElement, FocusEvent>;
};
function FormVirtualSelect<
  TOption extends object,
  TFieldValues extends FieldValues,
  TFieldName extends FieldPath<TFieldValues>,
  TResponseData extends ResponseData = undefined,
>(props: VirtualSelectProps<TOption, TFieldValues, TFieldName, TResponseData>) {
  const [rootProps, _selectProps] = splitProps(
    props,
    [
      "name",
      "placeholder",
      "required",
      "disabled",
      "options",
      "value",
      "height",
      "rowHeight",
      "optionTitle",
      "optionValue",
    ],
    ["placeholder", "ref", "onInput", "onChange", "onBlur"],
  );
  const [getValue, setValue] = createSignal<string | undefined>();
  createEffect(() => {
    setValue((_last) =>
      props.optionValue(
        props.options?.find(
          (option) => props.value === (props.optionValue(option) as string),
        ) as TOption,
      ),
    );
  });
  return (
    <VirtualSelect
      {...rootProps}
      id={props.name}
      value={getValue()}
      onChange={(v) => {
        setValue(() => v);
        setFormValue<any, any, any>(props.form, props.name, v);
      }}
    >
      <Show when={props.label}>
        <label for={props.name} class={textfieldLabel()}>
          {props.label}
        </label>
      </Show>
      <VirtualSelectTrigger
        as={Button}
        variant="outline"
        class="flex items-center w-full"
      />

      <VirtualSelectContent />
      <Show when={props.error}>
        <div class={textfieldLabel({ error: true })}>{props.error}</div>
      </Show>
    </VirtualSelect>
  );
}

export function createFormVirtualSelect<
  TOption extends object,
  TFieldValues extends FieldValues,
  TFieldName extends FieldPath<TFieldValues>,
  TResponseData extends ResponseData = undefined,
>(
  Field: (
    props: FieldProps<TFieldValues, TResponseData, TFieldName>,
  ) => JSX.Element,
  form: FormStore<TFieldValues, TResponseData>,
  options: Accessor<TOption[]>,
  optionTitle: (item: TOption | undefined) => JSX.Element,
  optionValue: (item: TOption | undefined) => string | undefined,
  height: () => number,
  rowHeight: () => number,
) {
  return (
    props: Omit<
      VirtualSelectProps<TOption, TFieldValues, TFieldName, TResponseData>,
      | "options"
      | "optionTitle"
      | "optionValue"
      | "rowHeight"
      | "height"
      | "form"
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
          <FormVirtualSelect<TOption, TFieldValues, TFieldName, TResponseData>
            {...rest}
            {...fieldProps}
            form={form}
            options={options()}
            optionValue={optionValue}
            optionTitle={optionTitle}
            height={height()}
            rowHeight={rowHeight()}
          />
        );
      },
    });
  };
}
