import { NICHES } from '@/lib/types';

interface FilterSidebarProps {
  selectedNiches: string[];
  minFollowers: number;
  maxFollowers: number;
  searchQuery: string;
  onNicheChange: (niches: string[]) => void;
  onMinFollowersChange: (value: number) => void;
  onMaxFollowersChange: (value: number) => void;
  onSearchChange: (value: string) => void;
  onClearFilters: () => void;
  resultCount: number;
}

export default function FilterSidebar({
  selectedNiches,
  minFollowers,
  maxFollowers,
  searchQuery,
  onNicheChange,
  onMinFollowersChange,
  onMaxFollowersChange,
  onSearchChange,
  onClearFilters,
  resultCount,
}: FilterSidebarProps) {
  const handleNicheToggle = (niche: string) => {
    if (selectedNiches.includes(niche)) {
      onNicheChange(selectedNiches.filter((n) => n !== niche));
    } else {
      onNicheChange([...selectedNiches, niche]);
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 sticky top-6 h-fit">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
          <svg className="h-5 w-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
          </svg>
          Filters
        </h2>
        <span className="px-2 py-0.5 bg-slate-100 text-slate-500 rounded text-xs font-semibold">
          {resultCount} results
        </span>
      </div>

      {/* Search */}
      <div className="mb-8">
        <label className="block text-sm font-semibold text-slate-700 mb-2">
          Username
        </label>
        <div className="relative">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search handle..."
            className="w-full px-4 py-2 pl-10 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all placeholder:text-slate-400"
          />
          <svg className="absolute left-3 top-2.5 h-5 w-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
      </div>

      {/* Niche Filter */}
      <div className="mb-8">
        <label className="block text-sm font-semibold text-slate-700 mb-3">
          Niche Categories
        </label>
        <div className="space-y-1.5 max-h-72 overflow-y-auto pr-2 custom-scrollbar">
          {NICHES.map((niche) => (
            <label
              key={niche}
              className={`flex items-center gap-3 p-2 rounded-lg cursor-pointer transition-colors ${
                selectedNiches.includes(niche) ? 'bg-blue-50' : 'hover:bg-slate-50'
              }`}
            >
              <div className="relative flex items-center">
                <input
                  type="checkbox"
                  checked={selectedNiches.includes(niche)}
                  onChange={() => handleNicheToggle(niche)}
                  className="peer h-5 w-5 appearance-none border-2 border-slate-300 rounded bg-white checked:bg-primary checked:border-primary transition-all cursor-pointer"
                />
                <svg
                  className="absolute h-3.5 w-3.5 text-white opacity-0 peer-checked:opacity-100 pointer-events-none left-0.5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <span className={`text-sm font-medium transition-colors ${
                selectedNiches.includes(niche) ? 'text-primary' : 'text-slate-600'
              }`}>
                {niche}
              </span>
            </label>
          ))}
        </div>
      </div>

      {/* Follower Count Range */}
      <div className="mb-8">
        <label className="block text-sm font-semibold text-slate-700 mb-3">
          Follower Count Range
        </label>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
              Min
            </label>
            <input
              type="number"
              value={minFollowers || ''}
              onChange={(e) => onMinFollowersChange(parseInt(e.target.value) || 0)}
              placeholder="0"
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all text-sm"
            />
          </div>
          <div>
            <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
              Max
            </label>
            <input
              type="number"
              value={maxFollowers || ''}
              onChange={(e) => onMaxFollowersChange(parseInt(e.target.value) || 0)}
              placeholder="Any"
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all text-sm"
            />
          </div>
        </div>
      </div>

      {/* Clear Filters Button */}
      <button
        onClick={onClearFilters}
        className="w-full px-4 py-2.5 text-sm font-bold text-slate-500 bg-slate-100 rounded-lg hover:bg-slate-200 transition-colors"
      >
        Clear All
      </button>
    </div>
  );
}

