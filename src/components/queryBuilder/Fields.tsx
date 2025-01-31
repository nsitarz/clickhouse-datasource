import React, { useState, useEffect } from 'react';
import { InlineFormLabel, MultiSelect } from '@grafana/ui';
import { SelectableValue } from '@grafana/data';
import { FullField } from './../../types';
import { selectors } from './../../selectors';
import { styles } from '../../styles';

interface FieldsEditorProps {
  fieldsList: FullField[];
  fields: string[];
  onFieldsChange: (fields: string[]) => void;
}
export const FieldsEditor = (props: FieldsEditorProps) => {
  const columns = (props.fieldsList || []).map((f) => ({ label: f.label, value: f.name }));
  const [custom, setCustom] = useState<Array<SelectableValue<string>>>([]);
  const [isOpen, setIsOpen] = useState(false);
  const defaultFields: Array<SelectableValue<string>> = [];
  const [fields, setFields] = useState<string[]>(props.fields || []);
  const { label, tooltipTable } = selectors.components.QueryEditor.QueryBuilder.SELECT;

  useEffect(() => {
    if (props.fieldsList.length === 0) {
      return;
    }
    const customFields = getCustomFields(props.fields, props.fieldsList);
    setCustom(customFields);
  }, [props.fieldsList, props.fields]);

  const onFieldsChange = (fields: string[]) => {
    const cleanFields = cleanupFields(fields);
    setFields(cleanFields);
    const customFields = getCustomFields(fields, props.fieldsList);
    setCustom(customFields);
  };

  const cleanupFields = (fields: string[]): string[] => {
    if (
      defaultFields.map((d) => d.value).includes(fields[0]) ||
      defaultFields.map((d) => d.value).includes(fields[fields.length - 1])
    ) {
      return [fields[fields.length - 1]];
    }
    return fields;
  };

  const onUpdateField = () => {
    props.onFieldsChange(fields);
  };

  const onChange = (e: Array<SelectableValue<string>>): void => {
    setIsOpen(false);
    onFieldsChange(e.map((v) => v.value!));
  };

  return (
    <div className="gf-form">
      <InlineFormLabel width={8} className="query-keyword" tooltip={tooltipTable}>
        {label}
      </InlineFormLabel>
      <div data-testid="query-builder-fields-multi-select-container" className={styles.Common.selectWrapper}>
        <MultiSelect<string>
          options={[...columns, ...defaultFields, ...custom]}
          value={fields && fields.length > 0 ? fields : []}
          isOpen={isOpen}
          onOpenMenu={() => setIsOpen(true)}
          onCloseMenu={() => setIsOpen(false)}
          onChange={onChange}
          onBlur={onUpdateField}
          allowCustomValue={true}
        />
      </div>
    </div>
  );
};

function getCustomFields(fields: string[], columns: FullField[]) {
  return fields
    .filter((f) => {
      return columns.findIndex((c) => c.name === f) === -1;
    })
    .map((f) => ({ label: f, value: f }));
}
