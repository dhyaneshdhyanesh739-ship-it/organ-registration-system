// ============================================
// ORGAN SEARCH ICON - READY-TO-USE EXAMPLES
// ============================================

import { Search, Heart, Shield, Eye, Activity, Wind, Zap, Filter, X } from 'lucide-react';

// ============================================
// Example 1: Simple Search Input
// ============================================
function SimpleOrganSearch() {
  return (
    <div className="relative">
      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
      <input
        type="text"
        placeholder="Search organs..."
        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
      />
    </div>
  );
}

// ============================================
// Example 2: Search Button
// ============================================
function SearchButton() {
  return (
    <button className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors">
      <Search className="w-5 h-5" />
      <span>Search Organs</span>
    </button>
  );
}

// ============================================
// Example 3: Search with Clear Button
// ============================================
function SearchWithClear() {
  const [query, setQuery] = useState('');

  return (
    <div className="relative">
      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
      <input
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search organs, donors, hospitals..."
        className="w-full pl-10 pr-10 py-3 border rounded-xl focus:ring-2 focus:ring-primary-500"
      />
      {query && (
        <button
          onClick={() => setQuery('')}
          className="absolute right-3 top-1/2 -translate-y-1/2 p-1 hover:bg-gray-100 rounded-full"
        >
          <X className="w-4 h-4 text-gray-400" />
        </button>
      )}
    </div>
  );
}

// ============================================
// Example 4: Organ Type Filter with Icons
// ============================================
function OrganTypeFilter() {
  const [selected, setSelected] = useState('all');

  const organs = [
    { id: 'all', name: 'All', icon: Heart, color: 'text-gray-600' },
    { id: 'heart', name: 'Heart', icon: Heart, color: 'text-red-500' },
    { id: 'kidneys', name: 'Kidneys', icon: Shield, color: 'text-blue-500' },
    { id: 'liver', name: 'Liver', icon: Activity, color: 'text-orange-500' },
    { id: 'lungs', name: 'Lungs', icon: Wind, color: 'text-cyan-500' },
    { id: 'pancreas', name: 'Pancreas', icon: Zap, color: 'text-yellow-500' },
    { id: 'corneas', name: 'Corneas', icon: Eye, color: 'text-emerald-500' },
  ];

  return (
    <div className="flex gap-2 overflow-x-auto pb-2">
      {organs.map(({ id, name, icon: Icon, color }) => (
        <button
          key={id}
          onClick={() => setSelected(id)}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg whitespace-nowrap transition-all ${
            selected === id
              ? 'bg-primary-600 text-white'
              : 'bg-white border border-gray-200 hover:border-primary-300'
          }`}
        >
          <Icon className={`w-4 h-4 ${selected === id ? 'text-white' : color}`} />
          {name}
        </button>
      ))}
    </div>
  );
}

// ============================================
// Example 5: Complete Search Component
// ============================================
function CompleteOrganSearch() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedOrgan, setSelectedOrgan] = useState('all');
  const [showFilters, setShowFilters] = useState(false);

  return (
    <div className="space-y-4">
      {/* Search Bar */}
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search organs, donors, or hospitals..."
            className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          />
        </div>
        
        <button
          onClick={() => setShowFilters(!showFilters)}
          className={`flex items-center gap-2 px-4 py-3 rounded-xl border transition-colors ${
            showFilters 
              ? 'bg-primary-600 text-white border-primary-600' 
              : 'bg-white border-gray-300 hover:border-primary-300'
          }`}
        >
          <Filter className="w-5 h-5" />
          <span className="hidden sm:inline">Filters</span>
        </button>
      </div>

      {/* Organ Type Filters */}
      {showFilters && (
        <OrganTypeFilter />
      )}

      {/* Search Results Count */}
      {searchQuery && (
        <p className="text-sm text-gray-600">
          Found <span className="font-semibold">24 results</span> for "{searchQuery}"
        </p>
      )}
    </div>
  );
}

// ============================================
// Example 6: Icon-Only Search Button
// ============================================
function IconOnlySearch() {
  return (
    <button 
      className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
      aria-label="Search organs"
      title="Search"
    >
      <Search className="w-5 h-5 text-gray-600" />
    </button>
  );
}

// ============================================
// Example 7: Animated Search Icon
// ============================================
function AnimatedSearch() {
  const [isSearching, setIsSearching] = useState(false);

  return (
    <button 
      onClick={() => setIsSearching(!isSearching)}
      className="relative p-3 rounded-full bg-primary-600 text-white hover:bg-primary-700 transition-all"
    >
      <Search className={`w-6 h-6 transition-transform ${isSearching ? 'scale-110 rotate-12' : ''}`} />
      {isSearching && (
        <span className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full animate-pulse" />
      )}
    </button>
  );
}

// ============================================
// Example 8: Search with Organ Icon Badge
// ============================================
function SearchWithOrganBadge({ organType = 'heart' }) {
  const organIcons = {
    heart: Heart,
    kidneys: Shield,
    liver: Activity,
    lungs: Wind,
    pancreas: Zap,
    corneas: Eye,
  };

  const OrganIcon = organIcons[organType] || Heart;

  return (
    <div className="relative">
      <div className="flex items-center gap-2 px-4 py-3 bg-white border border-gray-300 rounded-xl">
        <Search className="w-5 h-5 text-gray-400" />
        <input
          type="text"
          placeholder={`Search ${organType}...`}
          className="flex-1 outline-none"
        />
        <div className="flex items-center gap-1 px-2 py-1 bg-red-50 rounded-md">
          <OrganIcon className="w-4 h-4 text-red-500" />
          <span className="text-xs font-medium text-red-700 capitalize">{organType}</span>
        </div>
      </div>
    </div>
  );
}

// ============================================
// USAGE IN YOUR EXISTING COMPONENTS
// ============================================

// In OrgansPage.jsx - Add search at the top
/*
import { Search } from 'lucide-react';

// Add this before the organs grid
<div className="mb-8">
  <div className="relative max-w-2xl mx-auto">
    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
    <input
      type="text"
      placeholder="Search organs by name or type..."
      className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500"
    />
  </div>
</div>
*/

// In HospitalDashboard.jsx - Already using Search icon
/*
import { Search } from 'lucide-react';
// You already have this imported!
*/

// In SearchFilter.jsx - Already using Search icon
/*
import { Search } from 'lucide-react';
// You already have this imported!
*/

export {
  SimpleOrganSearch,
  SearchButton,
  SearchWithClear,
  OrganTypeFilter,
  CompleteOrganSearch,
  IconOnlySearch,
  AnimatedSearch,
  SearchWithOrganBadge,
};
