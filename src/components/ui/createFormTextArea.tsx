import type {
  FieldPath,
  FieldPathValue,
  FieldProps,
  FieldType,
  FieldValues,
  FormStore,
  ResponseData,
} from "@modular-forms/solid";
import { type JSX, splitProps } from "solid-js";
import { TextArea } from "./textarea";
import { TextFieldLabel, TextFieldRoot } from "./textfield";

export function createFormTextArea<
  TFieldValues extends FieldValues,
  TFieldName extends FieldPath<TFieldValues>,
  TResponseData extends ResponseData = undefined,
>(
  Field: (
    props: FieldProps<TFieldValues, TResponseData, TFieldName>,
  ) => JSX.Element,
) {
  return (
    props: {
      label: string;
      type?: FieldType<FieldPathValue<TFieldValues, TFieldName>>;
      of?: FormStore<TFieldValues, TResponseData>;
      inputType?: string;
    } & Omit<
      FieldProps<TFieldValues, TResponseData, TFieldName>,
      "children" | "type" | "of"
    >,
  ) => {
    const [local, rest] = splitProps(props, [
      "label",
      "type",
      "of",
      "inputType",
    ]);
    return Field({
      ...rest,
      type: local.type!,
      of: local.of!,
      children: (_field, fieldProps) => (
        <TextFieldRoot>
          <TextFieldLabel>{local.label}</TextFieldLabel>
          <TextArea {...fieldProps} />
        </TextFieldRoot>
      ),
    });
  };
}
