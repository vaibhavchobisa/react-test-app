import { FC, useEffect, useState, useRef, ReactNode } from "react";
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
  // const [defaultValue, setDefaultValue] = useState<
  //   { value: string; label: ReactNode } | null | undefined
  // >(undefined);
  const [selectedValue, setSelectedValue] = useState<{
    value: string;
    label: ReactNode;
  }>();
  const dropdownApiResults = useRef<DropdownApiDataType>([]);
  const searchTimeoutId = useRef<number | null>(null);
  const dropdownNextUrl = useRef<string>("");
  // const nextUrl = useRef<string>('');
  const isFetching = useRef<boolean>(false);
  const resetOnce = useRef<boolean>(false);
  const scrollPosition = useRef<number>(0);
  // const abortControllerRef = useRef<AbortController>(new AbortController());
  const [searchParams, setSearchParams] = useSearchParams();

  // Edited useEffect for bookmark management & initializing state
  useEffect(() => {
    const initializeState = async () => {
    if (window.location.search) {
      await initWhenQueryParams();
    } else {
      await init();
    }
  }
  initializeState();
  }, []);

  const init = async () => {
    await loadProducts();
  };

  const initWhenQueryParams = async () => {
    const contactNo = searchParams.get("contact");
    const limit = searchParams.get("limit");
    const offset = searchParams.get("offset");

    const getCompanyName = async(args = {query: {}}) => {
      if(contactNo) {
      setDropdownLoading(true);
      try {
        const res = await listContacts(args);
        const nextUrl = res.data.next;
        if(nextUrl) {
          const query = getQueryFromUrl(nextUrl);
          args["query"] = query;
          console.log(args["query"]);
        }
        
        const contacts = res.data.results;
        for(let i=0; i<contacts.length;i++) {
          if(contacts[i]['id'] === Number(contactNo)) {
            setSelectedValue({
              value: contactNo,
              label: contacts[i].company_name,
            });
            return;
          }
        }
        await getCompanyName(args);
    } catch (error) {
      console.log(error);
    }
    }
  }
  await getCompanyName();
  setDropdownLoading(false);

  await loadProducts({ contact: contactNo, limit, offset });
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
    setSearchParams(query);
    loadProducts(query);
  };
  
  const handlePrev = (prev: UrlType) => {
    if (prev === null) {
      return;
    }
    let query = getQueryFromUrl(prev);
    setSearchParams(query);
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
  const onChange = async (value: { value: string; label: React.ReactNode }) => {

    if(resetOnce.current) {
      const selectDiv = document.querySelector(".ant-select-selector");
      const placeholder = document.querySelector(".ant-select-selection-placeholder")
      if (placeholder) {
        placeholder.remove();
      }
      selectDiv?.children[1]?.remove();

      const selectedItem = document.createElement("span");
      selectedItem.setAttribute("class", "ant-select-selection-item");
      selectedItem.setAttribute("title", String(value["label"]));
      selectedItem.textContent = String(value["label"]);

      if (selectDiv) {
        selectDiv.insertBefore(selectedItem, selectDiv.children[1]);
      }
}
    
    setSelectedValue({value: value["value"], label: value["label"]})
    setSearchParams({
      contact: value["value"],
      limit: String(PAGINATION_LIMIT),
      paginate: "true",
    });
    loadProducts({ contact: value["value"] });
    setResetDisable(false);
  };

  // this runs when a string is being typed
  const onSearch = async (value: string) => {
    if(resetOnce.current) {
      if(value.length !== 0) {
        const selectDiv = document.querySelector(".ant-select-selector");
        selectDiv?.children[1]?.remove();
      } else if (value.length === 0) {
        const selectDiv: HTMLDivElement | null = document.querySelector(
          ".ant-select-selector"
        ); 
        if (!selectedValue?.label) {
          const placeholder = document.createElement("span");
          placeholder.textContent = "Search products by company name";
          placeholder.setAttribute(
            "class",
            "ant-select-selection-placeholder"
          );
          selectDiv?.insertBefore(
            placeholder,
            selectDiv.children[1]
          );
        } else if (selectedValue?.label) {
          const selectedSpan = document.createElement('span');
          selectedSpan.setAttribute('class', 'ant-select-selection-item');
          selectedSpan.setAttribute('title', String(selectedValue?.label));
          selectedSpan.textContent = String(selectedValue?.label);
          selectDiv?.insertBefore(selectedSpan, selectDiv.children[1]);
        }
      }
    }

    if (searchTimeoutId.current) {
      clearTimeout(searchTimeoutId.current);
    }

    searchTimeoutId.current = window.setTimeout(async () => {

      try {
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
    } finally {
        const dropdownElement = document.querySelector(
          ".rc-virtual-list-holder"
        );
        if (dropdownElement) {
          dropdownElement.scrollTop = 0;
        }
    }
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
    // setDefaultValue(undefined);
    const selectSpan = document.querySelector('.ant-select-selection-search');
    selectSpan?.nextElementSibling?.remove();
    const placeholder = document.createElement('span');
    placeholder.setAttribute('class', 'ant-select-selection-placeholder')
    placeholder.textContent = "Search products by company name";
    selectSpan?.parentNode?.insertBefore(placeholder, selectSpan.nextSibling);

    resetOnce.current = true;

    setSelectedValue({value: '', label: null});
    setResetDisable(true);
    setSearchParams({});
    setDropdown([]);
    await init();
  };

  // Filter `option.label` match the user type `input`
  // const filterOption = (
    // input: string,
    // option?: { label: string; value: string }
  // ) => {
    // (option?.label ?? "").toLowerCase().includes(input.toLowerCase())
    // return true;
  // };


  // this useEffect will handle infinite laoding inside the dropdown
  useEffect(() => {
    const dropdownElement = document.querySelector(".rc-virtual-list-holder");

    if (dropdownNextUrl.current && dropdownElement) {
      isFetching.current = false;

      var infiniteScroll = async () => {
        if (
          dropdownElement.scrollHeight - dropdownElement.scrollTop ===
          dropdownElement.clientHeight
        ) {

          if(!isFetching.current) {
            isFetching.current = true;
            scrollPosition.current = dropdownElement.scrollTop;

            try {
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
        } finally {
          // dropdownElement.scrollTop = scrollPosition.current;
          isFetching.current = true;
          setDropdownLoading(false);
          dropdownElement.scrollTop = dropdownElement.scrollHeight;
        }
      };
    }
  }
      
      dropdownElement?.addEventListener("scroll", infiniteScroll);
    }
    
    return () => {
      dropdownElement?.removeEventListener("scroll", infiniteScroll);
    };
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
                    // filterOption={filterOption}
                    dropdown={dropdown}
                    dropdownLoading={dropdownLoading}
                    // defaultValue={defaultValue}
                    selectedValue={selectedValue}
                  />
                </span>
                <span style={{ marginLeft: "1rem" }}>
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