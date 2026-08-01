import { useEffect, useRef, useState } from "react";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { ScrollArea} from "@/components/ui/scroll-area"

export const SearchSelect = ({
  option,
  placeholder,
  value,
  onChange,
  icon,
  subtitle,
}: any) => {
  const [isOpen, setisOpen] = useState(false);
  const [searchterm, setSearchterm] = useState("");
  const wrapperref = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        wrapperref.current &&
        !wrapperref.current.contains(event.target as Node)
      ) {
        setisOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);
  const filteredOptions = option.filter((option: any) =>
    option.label.toLowerCase().includes(searchterm.toLowerCase()),
  );
  return (
    <div ref={wrapperref} className="relative ">
      <div 
         className="border rounded-lg p-3 hover:border-blue-500 cursor-pointer"
      onClick={() => setisOpen(!isOpen)}>
        <div className="flex items-center space-x-2">
          {icon}
          <div className="flex-1 min-w-0">
            <div className="text-sm text-gray-500 truncate">{placeholder}</div>
            <Input
              type="text"
              value={value || searchterm}
              onChange={(e) => {
                setSearchterm(e.target.value);
                onChange("");
              }} 
              className="font-semibold w-full bg-transparent border-none p-0 focus-visible:ring-0 focus-visible:ring-offset-0"
              placeholder={placeholder}
            />
            <div className="text-xs text-gray-400 truncate">{subtitle}</div>
          </div>
        </div>
      </div>
      {isOpen && (
        <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg">
          <ScrollArea className="h-64">
            {filteredOptions.map((option: any) => (
              <Button
                key={option.value}
                className="w-full justify-start font-normal"
                variant="ghost"
                onClick={() => {
                  onChange(option.value);
                  setSearchterm("");
                  setisOpen(false);
                }}
              >
                {option.label}
              </Button>
            ))}
          </ScrollArea>
        </div>
      )}
    </div>
  );
};

// export default SearchSelect;
