import { FC, useEffect, useState, useRef } from "react";
import { Button, Space } from "antd";
import { useSearchParams } from "react-router-dom";
import ResultString from "../../../components/content/result.content";
import Heading from "../../../components/heading/basic.heading";
import Pagination from "../../../components/pagination/basic.pagination";
import { PAGINATION_LIMIT } from "../../../constants/app.constants";
import {
  PaginateDataType,
  UrlType,
  Dropdown,
  DropdownApiDataType,
} from "../../../interface/common";
import { listProducts } from "../../../services/products";
import { listContacts } from "../../../services/contacts";
import { getQueryFromUrl } from "../../../utils/common.utils";
import ProductsTable from "./components/products.table";
import Typeahead from "../../../components/typeahead/basic.typeahead";

const fixedListParams = {
    paginate: true
}

const ProductList: FC = () => {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoding] = useState<boolean>(false);
  const [pagination, setPagination] = useState<PaginateDataType>({
    next: null,
    prev: null,
    count: null,
    resultsCount: 0,
    offset: null,
    hasOffset: true,
    limit: PAGINATION_LIMIT,
  });
  const [dropdown, setDropdown] = useState<Dropdown>([]);
  const [dropdownLoading, setDropdownLoading] = useState<boolean>(false);
  const [resetDisable, setResetDisable] = useState<boolean>(true);
  // const [defaultValue, setDefaultValue] = useState<string>(
  //   "Search products by company name"
  // );
  const dropdownApiResults = useRef<DropdownApiDataType>([]);
  const searchTimeoutId = useRef<number | null>(null);
  const dropdownNextUrl = useRef<string>("");
  const [searchParams, setSearchParams] = useSearchParams();

  // Edited useEffect for bookmark management
  useEffect(() => {
    if (searchParams.get("contact")) {
      initQueryParams();
    } else {
      init();
    }
  }, []);

  const init = async () => {
    await loadProducts();
  };

  const initQueryParams = async () =>{
    const contact = searchParams.get("contact");
    await loadProducts({ contact });
    setResetDisable(false);
  }

  const loadProducts = async (queryParams?: Record<string, any>) => {
    let query = queryParams || {};
    setLoding(true);
    try {
      const res = await listProducts({
        query: { ...fixedListParams, ...query },
      });

      setProducts(res.data.results);
      setPagination((prev) => {
        return {
          ...prev,
          next: res.data.next,
          prev: res.data.previous,
          count: res.data.count,
          resultsCount: res.data.results.length,
          offset: query?.offset ? Number(query.offset) : null,
        };
      });
    } catch (err) {
      console.log(err);
    }
    setLoding(false);
  };

  const handleNext = (next: UrlType) => {
    if (next === null) {
      return;
    }
    let query = getQueryFromUrl(next);
    loadProducts(query);
  };

  const handlePrev = (prev: UrlType) => {
    if (prev === null) {
      return;
    }
    let query = getQueryFromUrl(prev);
    loadProducts(query);
  };

  // load Contacts
  const loadContacts = async (queryParams?: Record<string, any>) => {
    setDropdownLoading(true);
    let query = queryParams || {};

    try {
      const res = await listContacts({
        query: { ...fixedListParams, ...query },
      });

      dropdownApiResults.current = res.data.results;
      dropdownNextUrl.current = res.data.next;
    } catch (err) {
      console.log(err);
    }

    setDropdownLoading(false);
  };

  // this runs when the user selects a search value from dropdown
  const onChange = async (value: string) => {
    setSearchParams({ contact: value });
    loadProducts({ contact: value });
    setResetDisable(false);
  };

  // this runs when a string is being typed
  const onSearch = async (value: string) => {
    if (searchTimeoutId.current) {
      clearTimeout(searchTimeoutId.current);
    }

    searchTimeoutId.current = window.setTimeout(async () => {
      await loadContacts({ search: value });
      setDropdown((prev) => {
        const arr: Dropdown = [];
        dropdownApiResults.current.forEach((contact) => {
          const obj: { label: string; value: string } = {
            label: "",
            value: "",
          };
          obj["label"] = contact.company_name;
          obj["value"] = String(contact.id);
          arr.push(obj);
        });
        return arr;
      });
    }, 500);
  };

  // when the user clicks on the typeahead search box, or navigates to it via keyboard
  const onFocus = async () => {
    if (dropdown.length === 0) {
      await loadContacts();
      setDropdown((prev) => {
        const arr: Dropdown = [];
        dropdownApiResults.current.forEach((contact) => {
          const obj: { label: string; value: string } = {
            label: "",
            value: "",
          };
          obj["label"] = contact.company_name;
          obj["value"] = String(contact.id);
          arr.push(obj);
        });
        return arr;
      });
    }
  };

  // search reset button click handler
  const onClick = async () => {
    // setDefaultValue("Search products by company name");
    setResetDisable(true);
    setSearchParams({});
    await loadProducts();
  };

  // Filter `option.label` match the user type `input`
  const filterOption = (
    input: string,
    option?: { label: string; value: string }
  ) => (option?.label ?? "").toLowerCase().includes(input.toLowerCase());


  // this useEffect will handle infinite laoding inside the dropdown
  useEffect(() => {
    const dropdownElement = document.querySelector(".rc-virtual-list-holder");

    if (dropdownNextUrl.current && dropdownElement) {
      const infiniteScroll = async () => {
        if (
          dropdownElement.scrollHeight - dropdownElement.scrollTop ===
          dropdownElement.clientHeight
        ) {
          setDropdownLoading(true);
          const query = getQueryFromUrl(dropdownNextUrl.current);
          await loadContacts(query);

          setDropdown((prev) => {
            const arr: Dropdown = [...prev];
            dropdownApiResults.current.forEach((contact) => {
              const obj: { label: string; value: string } = {
                label: "",
                value: "",
              };
              obj["label"] = contact.company_name;
              obj["value"] = String(contact.id);
              arr.push(obj);
            });
            return arr;
          });
        }
      };
      
      dropdownElement?.addEventListener("scroll", infiniteScroll);
      return () => {
        dropdownElement?.removeEventListener("scroll", infiniteScroll);
      };
    }

    setDropdownLoading(false);
  }, [dropdown]);


  return (
    <>
      <div style={{ marginBottom: "1rem" }}>
        <Heading titleLevel={2}>Products</Heading>
      </div>
      <div
        style={{
          backgroundColor: "white",
          padding: "0.5rem",
        }}
      >
        <div style={{ marginBottom: "1rem" }}>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <div>
              <div style={{ marginBottom: "1rem" }}>
                <span>
                  <Typeahead
                    onChange={onChange}
                    onSearch={onSearch}
                    onFocus={onFocus}
                    filterOption={filterOption}
                    dropdown={dropdown}
                    dropdownLoading={dropdownLoading}
                    // defaultValue={defaultValue}
                  />
                </span>
                <span style={{marginLeft: "1rem"}}>
                  <Space wrap>
                    <Button onClick={onClick} disabled={resetDisable}>
                      Reset
                    </Button>
                  </Space>
                </span>
              </div>
              <ResultString
                loading={loading}
                pagination={pagination}
                pageString={"product"}
              />
            </div>
            <div>
              <Pagination
                next={pagination.next}
                prev={pagination.prev}
                onNextClick={handleNext}
                onPrevClick={handlePrev}
              />
            </div>
          </div>
        </div>
        <div style={{ marginBottom: "1rem" }}>
          <ProductsTable list={products} loading={loading} />
        </div>
        <div>
          <Pagination
            next={pagination.next}
            prev={pagination.prev}
            onNextClick={handleNext}
            onPrevClick={handlePrev}
          />
        </div>
      </div>
    </>
  );
}

export default ProductList;