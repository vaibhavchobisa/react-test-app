export type UrlType = string | null;

interface PaginationUIInterface {
  next: UrlType;
  prev: UrlType;
  onPrevClick?: (prev: UrlType) => void;
  onNextClick?: (next: UrlType) => void;
}

interface ResultStringInterface {
  pagination: PaginateDataType;
  loading: boolean;
  pageString?: string;
}

type PaginateDataType = {
  next: UrlType;
  prev: UrlType;
  count: number | null;
  count: number | null;
  resultsCount: number;
  limit: number | null;
  hasOffset: boolean;
  offset: number | null;
};

type Dropdown = Array<{ label: string; value: string }>;

interface TypeaheadProps {
  onChange: (value: string) => void;
  onSearch: (value: string) => void;
  onFocus: () => void;
  filterOption: (
    input: string,
    option?: { label: string; value: string }
  ) => boolean;
  dropdown: Dropdown;
  dropdownLoading: boolean;
  defaultValue?: string;
}

type DropdownApiDataType = Array<{id: string, company_name:string}>