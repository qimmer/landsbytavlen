import type {
  FieldPath,
  FieldPathValue,
  FieldProps,
  FieldType,
  FieldValues,
  FormStore,
  ResponseData,
} from "@modular-forms/solid";
import { For, type JSX, splitProps } from "solid-js";
import { Portal } from "solid-js/web";
import {
  DatePicker,
  DatePickerContent,
  DatePickerContext,
  DatePickerControl,
  DatePickerInput,
  DatePickerRangeText,
  DatePickerTable,
  DatePickerTableBody,
  DatePickerTableCell,
  DatePickerTableCellTrigger,
  DatePickerTableHead,
  DatePickerTableHeader,
  DatePickerTableRow,
  DatePickerTrigger,
  DatePickerView,
  DatePickerViewControl,
  DatePickerViewTrigger,
} from "./date-picker";

export function createFormDatePicker<
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
        <DatePicker>
          <DatePickerControl>
            <DatePickerInput {...fieldProps} type="date" />
            <DatePickerTrigger />
          </DatePickerControl>
          <Portal>
            <DatePickerContent>
              <DatePickerView view="day">
                <DatePickerContext>
                  {(api) => (
                    <>
                      <DatePickerViewControl>
                        <DatePickerViewTrigger>
                          <DatePickerRangeText />
                        </DatePickerViewTrigger>
                      </DatePickerViewControl>
                      <DatePickerTable>
                        <DatePickerTableHead>
                          <DatePickerTableRow>
                            <For each={api().weekDays}>
                              {(weekDay) => (
                                <DatePickerTableHeader>
                                  {weekDay.short}
                                </DatePickerTableHeader>
                              )}
                            </For>
                          </DatePickerTableRow>
                        </DatePickerTableHead>
                        <DatePickerTableBody>
                          <For each={api().weeks}>
                            {(week) => (
                              <DatePickerTableRow>
                                <For each={week}>
                                  {(day) => (
                                    <DatePickerTableCell value={day}>
                                      <DatePickerTableCellTrigger>
                                        {day.day}
                                      </DatePickerTableCellTrigger>
                                    </DatePickerTableCell>
                                  )}
                                </For>
                              </DatePickerTableRow>
                            )}
                          </For>
                        </DatePickerTableBody>
                      </DatePickerTable>
                    </>
                  )}
                </DatePickerContext>
              </DatePickerView>
              <DatePickerView view="month">
                <DatePickerContext>
                  {(api) => (
                    <>
                      <DatePickerViewControl>
                        <DatePickerViewTrigger>
                          <DatePickerRangeText />
                        </DatePickerViewTrigger>
                      </DatePickerViewControl>
                      <DatePickerTable>
                        <DatePickerTableBody>
                          <For
                            each={api().getMonthsGrid({
                              columns: 4,
                              format: "short",
                            })}
                          >
                            {(months) => (
                              <DatePickerTableRow>
                                <For each={months}>
                                  {(month) => (
                                    <DatePickerTableCell value={month.value}>
                                      <DatePickerTableCellTrigger>
                                        {month.label}
                                      </DatePickerTableCellTrigger>
                                    </DatePickerTableCell>
                                  )}
                                </For>
                              </DatePickerTableRow>
                            )}
                          </For>
                        </DatePickerTableBody>
                      </DatePickerTable>
                    </>
                  )}
                </DatePickerContext>
              </DatePickerView>
              <DatePickerView view="year">
                <DatePickerContext>
                  {(api) => (
                    <>
                      <DatePickerViewControl>
                        <DatePickerViewTrigger>
                          <DatePickerRangeText />
                        </DatePickerViewTrigger>
                      </DatePickerViewControl>
                      <DatePickerTable>
                        <DatePickerTableBody>
                          <For
                            each={api().getYearsGrid({
                              columns: 4,
                            })}
                          >
                            {(years) => (
                              <DatePickerTableRow>
                                <For each={years}>
                                  {(year) => (
                                    <DatePickerTableCell value={year.value}>
                                      <DatePickerTableCellTrigger>
                                        {year.label}
                                      </DatePickerTableCellTrigger>
                                    </DatePickerTableCell>
                                  )}
                                </For>
                              </DatePickerTableRow>
                            )}
                          </For>
                        </DatePickerTableBody>
                      </DatePickerTable>
                    </>
                  )}
                </DatePickerContext>
              </DatePickerView>
            </DatePickerContent>
          </Portal>
        </DatePicker>
      ),
    });
  };
}
