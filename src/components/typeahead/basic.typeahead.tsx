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
  filterOption,
  dropdown,
  dropdownLoading,
  // defaultValue
}) => (
    <Select
      showSearch
      placeholder="Search products by company name"
      optionFilterProp="value"
      onChange={onChange}
      onSearch={onSearch}
      onFocus={onFocus}
      filterOption={filterOption}
      options={dropdown}
      loading={dropdownLoading}
      popupMatchSelectWidth={false}
      dropdownStyle={dropdownStyles}
      // defaultValue={defaultValue}
      // value={defaultValue}
    />
);

export default Typeahead;
