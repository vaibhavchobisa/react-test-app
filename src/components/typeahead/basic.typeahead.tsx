import { Select } from "antd";
import { TypeaheadProps } from "../../interface/common";
import { CSSProperties } from "react";

const dropdownStyles: CSSProperties = {
  padding: "5px",
};


const Typeahead: React.FC<TypeaheadProps> = ({
  onChange,
  onSearch,
  onFocus,
  // filterOption,
  dropdown,
  dropdownLoading,
  // defaultValue,
  selectedValue,
}) => (
  <Select
    labelInValue
    showSearch
    placeholder="Search products by company name"
    style={{ width: 275 }}
    optionFilterProp="value"
    onChange={onChange}
    onSearch={onSearch}
    onFocus={onFocus}
    filterOption={false}
    options={dropdown}
    loading={dropdownLoading}
    popupMatchSelectWidth={false}
    dropdownStyle={dropdownStyles}
    value={selectedValue}
    getPopupContainer={(triggerNode) => triggerNode.parentElement}
    // defaultValue={defaultValue}
    virtual={false}
    // allowClear
    // value={defaultValue}
  />
);

export default Typeahead;
