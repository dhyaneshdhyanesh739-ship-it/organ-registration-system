# 🔍 Organ Search Icons Guide

## Current Search Icon Usage

Your project uses **Lucide React** icons. The `Search` icon is already being used in multiple components.

### Import Statement
```javascript
import { Search } from 'lucide-react';
```

### Basic Usage
```jsx
<Search className="w-5 h-5" />
```

---

## 🫀 Available Organ & Medical Icons from Lucide React

Here are all the relevant icons you can use for organ-related features:

### Primary Search Icon
```javascript
import { Search } from 'lucide-react';

// Usage
<Search className="w-6 h-6 text-primary-600" />
```

### Organ & Medical Related Icons

```javascript
import { 
  Heart,           // ❤️ Heart organ
  Activity,        // 📊 Medical activity/heartbeat
  Stethoscope,     // 🩺 Medical examination
  Pill,            // 💊 Medication
  Syringe,         // 💉 Medical injection
  Thermometer,     // 🌡️ Temperature
  Microscope,      // 🔬 Laboratory
  Scan,            // 🔍 Medical scan
  Eye,             // 👁️ Vision/Corneas
  Droplet,         // 💧 Blood/fluids
  Shield,          // 🛡️ Protection/Kidneys
  Zap,             // ⚡ Energy/Pancreas
  Wind,            // 💨 Lungs/breathing
  Users,           // 👥 Patients/donors
  UserCheck,       // ✅ Verified donor
  Plus,            // ➕ Add organ
  Filter,          // 🔽 Filter organs
  MapPin,          // 📍 Location
  Clock,           // ⏰ Wait time
  TrendingUp,      // 📈 Success rate
  AlertCircle,     // ⚠️ Critical
  CheckCircle,     // ✅ Success
  XCircle,         // ❌ Failed
  Info             // ℹ️ Information
} from 'lucide-react';
```

---

## 🎨 Icon Usage Examples

### 1. Search with Organ Type
```jsx
import { Search, Heart, Activity } from 'lucide-react';

// Search button with icon
<button className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg">
  <Search className="w-5 h-5" />
  Search Organs
</button>

// Search input with icon
<div className="relative">
  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
  <input 
    type="text"
    placeholder="Search organs..."
    className="pl-10 pr-4 py-2 border rounded-lg w-full"
  />
</div>
```

### 2. Organ Cards with Icons
```jsx
import { Heart, Shield, Eye, Activity } from 'lucide-react';

const organIcons = {
  heart: Heart,
  kidneys: Shield,
  corneas: Eye,
  liver: Activity,
};

// Usage in card
<div className="flex items-center gap-3">
  <Heart className="w-8 h-8 text-red-500" />
  <h3>Heart</h3>
</div>
```

### 3. Search Filter Component
```jsx
import { Search, Filter, X } from 'lucide-react';

function OrganSearchFilter() {
  return (
    <div className="flex gap-2">
      {/* Search */}
      <div className="relative flex-1">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
        <input 
          type="text"
          placeholder="Search organs, donors, hospitals..."
          className="pl-10 pr-4 py-2 border rounded-lg w-full"
        />
      </div>
      
      {/* Filter */}
      <button className="flex items-center gap-2 px-4 py-2 border rounded-lg">
        <Filter className="w-5 h-5" />
        Filter
      </button>
    </div>
  );
}
```

### 4. Organ Stats with Icons
```jsx
import { Users, TrendingUp, Clock } from 'lucide-react';

<div className="grid grid-cols-3 gap-4">
  <div className="flex items-center gap-2">
    <Users className="w-5 h-5 text-blue-500" />
    <div>
      <p className="text-sm text-gray-500">Waiting List</p>
      <p className="text-xl font-bold">12,000+</p>
    </div>
  </div>
  
  <div className="flex items-center gap-2">
    <TrendingUp className="w-5 h-5 text-green-500" />
    <div>
      <p className="text-sm text-gray-500">Success Rate</p>
      <p className="text-xl font-bold">88%</p>
    </div>
  </div>
  
  <div className="flex items-center gap-2">
    <Clock className="w-5 h-5 text-orange-500" />
    <div>
      <p className="text-sm text-gray-500">Avg. Wait Time</p>
      <p className="text-xl font-bold">11 Months</p>
    </div>
  </div>
</div>
```

---

## 🎯 Specific Use Cases

### Organ Search Page Header
```jsx
import { Search, Heart, Filter } from 'lucide-react';

<div className="flex items-center justify-between mb-6">
  <div className="flex items-center gap-3">
    <Heart className="w-8 h-8 text-red-500" />
    <h1 className="text-3xl font-bold">Search Organs</h1>
  </div>
  
  <div className="flex gap-2">
    <div className="relative">
      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
      <input 
        type="text"
        placeholder="Search..."
        className="pl-10 pr-4 py-2 border rounded-lg"
      />
    </div>
    <button className="p-2 border rounded-lg">
      <Filter className="w-5 h-5" />
    </button>
  </div>
</div>
```

### Organ Type Selector with Icons
```jsx
import { Heart, Shield, Eye, Activity, Wind, Zap } from 'lucide-react';

const organTypes = [
  { name: 'Heart', icon: Heart, color: 'text-red-500' },
  { name: 'Kidneys', icon: Shield, color: 'text-blue-500' },
  { name: 'Liver', icon: Activity, color: 'text-orange-500' },
  { name: 'Lungs', icon: Wind, color: 'text-cyan-500' },
  { name: 'Pancreas', icon: Zap, color: 'text-yellow-500' },
  { name: 'Corneas', icon: Eye, color: 'text-emerald-500' },
];

<div className="grid grid-cols-3 gap-4">
  {organTypes.map(({ name, icon: Icon, color }) => (
    <button 
      key={name}
      className="flex flex-col items-center gap-2 p-4 border rounded-lg hover:bg-gray-50"
    >
      <Icon className={`w-8 h-8 ${color}`} />
      <span className="font-medium">{name}</span>
    </button>
  ))}
</div>
```

---

## 🎨 Icon Styling Options

### Size Variants
```jsx
<Search className="w-4 h-4" />   {/* Small */}
<Search className="w-5 h-5" />   {/* Medium */}
<Search className="w-6 h-6" />   {/* Large */}
<Search className="w-8 h-8" />   {/* Extra Large */}
```

### Color Variants
```jsx
<Search className="text-gray-400" />      {/* Gray */}
<Search className="text-primary-600" />   {/* Primary */}
<Search className="text-red-500" />       {/* Red */}
<Search className="text-blue-500" />      {/* Blue */}
```

### With Animation
```jsx
<Search className="w-5 h-5 animate-pulse" />
<Search className="w-5 h-5 transition-transform hover:scale-110" />
```

---

## 📦 Complete Search Component Example

Here's a ready-to-use organ search component:

```jsx
import { useState } from 'react';
import { Search, Filter, X, Heart, Shield, Eye, Activity } from 'lucide-react';

function OrganSearchComponent() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedOrgan, setSelectedOrgan] = useState('all');

  const organFilters = [
    { id: 'all', name: 'All Organs', icon: Heart },
    { id: 'heart', name: 'Heart', icon: Heart },
    { id: 'kidneys', name: 'Kidneys', icon: Shield },
    { id: 'corneas', name: 'Corneas', icon: Eye },
    { id: 'liver', name: 'Liver', icon: Activity },
  ];

  return (
    <div className="space-y-4">
      {/* Search Bar */}
      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search organs, donors, or hospitals..."
          className="w-full pl-12 pr-12 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent"
        />
        {searchQuery && (
          <button
            onClick={() => setSearchQuery('')}
            className="absolute right-4 top-1/2 -translate-y-1/2 p-1 hover:bg-gray-100 rounded-full"
          >
            <X className="w-4 h-4 text-gray-400" />
          </button>
        )}
      </div>

      {/* Organ Type Filters */}
      <div className="flex gap-2 overflow-x-auto pb-2">
        {organFilters.map(({ id, name, icon: Icon }) => (
          <button
            key={id}
            onClick={() => setSelectedOrgan(id)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg whitespace-nowrap transition-all ${
              selectedOrgan === id
                ? 'bg-primary-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            <Icon className="w-4 h-4" />
            {name}
          </button>
        ))}
      </div>
    </div>
  );
}

export default OrganSearchComponent;
```

---

## 🔗 Quick Reference

**Current Usage in Your Project:**
- ✅ `SearchFilter.jsx` - Uses `Search` icon
- ✅ `LocationPicker.jsx` - Uses `Search` icon
- ✅ `ChatList.jsx` - Uses `Search` icon
- ✅ `HospitalDashboard.jsx` - Uses `Search` icon

**Icon Library:** Lucide React
**Documentation:** https://lucide.dev/icons/

**Installation (already installed in your project):**
```bash
npm install lucide-react
```

---

## 💡 Pro Tips

1. **Consistency**: Use the same icon size throughout similar components
2. **Accessibility**: Add `aria-label` to icon-only buttons
3. **Color Coding**: Use consistent colors for organ types across the app
4. **Animation**: Add subtle hover effects for better UX

```jsx
// Accessible icon button
<button aria-label="Search organs">
  <Search className="w-5 h-5" />
</button>

// With tooltip
<button title="Search for available organs">
  <Search className="w-5 h-5" />
</button>
```

---

Need a specific icon or custom implementation? Let me know! 🚀
