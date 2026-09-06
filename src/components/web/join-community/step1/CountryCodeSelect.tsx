"use client";

import { useEffect, useId, useRef, useState, type Ref } from "react";
import { Globe } from "lucide-react";

interface CountryCodeOption {
  code: string;
  country: string;
  iso2: string;
}

interface CountryCodeSelectProps {
  options: CountryCodeOption[];
  value: string;
  onChange: (value: string) => void;
  onBlur: () => void;
  inputRef: Ref<HTMLInputElement>;
  name: string;
  disabled: boolean;
  loading: boolean;
  className: string;
  invalid: boolean;
}

export default function CountryCodeSelect({ options, value, onChange, onBlur, inputRef, name, disabled, loading, className, invalid }: CountryCodeSelectProps) {
  const listId = useId();
  const listRef = useRef<HTMLUListElement>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [activeIndex, setActiveIndex] = useState(-1);
  const [selectedIso2, setSelectedIso2] = useState("");
  const selected = options.find((option) => option.code === value && option.iso2 === selectedIso2)
    || options.find((option) => option.code === value);
  const search = query.trim().toLowerCase();
  const matches = options.filter(({ country, code, iso2 }) =>
    `${code} (${country})`.toLowerCase().includes(search) || iso2.toLowerCase().includes(search)
  );
  const open = isOpen && !disabled;

  useEffect(() => {
    if (open && activeIndex >= 0) {
      listRef.current?.children[activeIndex]?.scrollIntoView({ block: "nearest" });
    }
  }, [activeIndex, open]);

  const select = (option: CountryCodeOption) => {
    setSelectedIso2(option.iso2);
    onChange(option.code);
    setIsOpen(false);
    setQuery("");
    setActiveIndex(-1);
  };

  return (
    <div className="relative">
      <Globe className="pointer-events-none absolute left-4 top-1/2 hidden -translate-y-1/2 h-4 w-4 text-[#6B5E5A]/40 sm:block" />
      <input
        ref={inputRef}
        name={name}
        type="text"
        role="combobox"
        aria-label="Country Code"
        aria-autocomplete="list"
        aria-expanded={open}
        aria-controls={open ? listId : undefined}
        aria-activedescendant={open && matches[activeIndex] ? `${listId}-${matches[activeIndex].iso2}` : undefined}
        aria-invalid={invalid}
        autoComplete="off"
        disabled={disabled}
        placeholder={loading ? "Loading..." : "Code"}
        className={`${className} sm:pl-12`}
        value={open ? query : selected ? `${selected.code} (${selected.country})` : value}
        onFocus={() => {
          setIsOpen(true);
          setQuery("");
          setActiveIndex(-1);
        }}
        onClick={() => setIsOpen(true)}
        onChange={(event) => {
          setQuery(event.target.value);
          setIsOpen(true);
          setActiveIndex(-1);
        }}
        onBlur={() => {
          setIsOpen(false);
          setQuery("");
          onBlur();
        }}
        onKeyDown={(event) => {
          if (event.key === "ArrowDown" || event.key === "ArrowUp") {
            event.preventDefault();
            setIsOpen(true);
            setActiveIndex((index) => event.key === "ArrowDown"
              ? Math.min(index + 1, matches.length - 1)
              : Math.max(index - 1, 0));
          } else if (event.key === "Enter" && open) {
            event.preventDefault();
            const option = matches[activeIndex] || (matches.length === 1 ? matches[0] : undefined);
            if (option) select(option);
          } else if (event.key === "Escape" && open) {
            event.preventDefault();
            setIsOpen(false);
            setQuery("");
            setActiveIndex(-1);
          }
        }}
      />
      {open && (
        <div className="absolute left-0 z-30 mt-1 w-full min-w-56 max-w-[calc(100vw-3rem)] rounded-xl border border-[#D4C8C0]/60 bg-white p-1 shadow-lg">
          <ul ref={listRef} id={listId} role="listbox" aria-label="Country codes" className="max-h-48 overflow-y-auto">
            {matches.map((option, index) => (
              <li
                key={option.iso2}
                id={`${listId}-${option.iso2}`}
                role="option"
                aria-selected={selected?.iso2 === option.iso2}
                onMouseDown={(event) => event.preventDefault()}
                onClick={() => select(option)}
                className={`cursor-pointer rounded-lg px-3 py-2 text-left text-sm text-[#2A1636] hover:bg-[#6B1E5B]/10 ${index === activeIndex ? "bg-[#6B1E5B]/10" : ""}`}
              >
                {option.code} ({option.country})
              </li>
            ))}
          </ul>
          {!matches.length && <p role="status" className="px-3 py-2 text-sm text-[#6B5E5A]">No matching countries</p>}
        </div>
      )}
    </div>
  );
}
