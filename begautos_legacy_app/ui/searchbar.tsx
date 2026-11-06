import { Search } from "lucide-react";

interface Props {
    query: string | undefined;
    setQuery: (str:string) => void;
}

export default function SearchBar({setQuery, query}:Props) {
  return (
    <div className="dream-search flex items-center justify-between border border-line rounded-xl px-3 py-3 sm:py-2 w-full box-border ">
      <div className="flex min-w-0">
        <Search className="text-muted mr-2 w-5 h-5 inline-block" />
        <input
          type="text"
          placeholder="Search cars"
          aria-label="Search inventory"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="bg-transparent outline-none text-ink placeholder-gray-400 text-sm sm:pr-1.5 pr-1 w-full"
        />
      </div>
      <button
        type="submit"
        className="text-muted text-xs tracking-widest inline-block cursor-pointer"
      >
        SEARCH
      </button>
    </div>
  );
}
