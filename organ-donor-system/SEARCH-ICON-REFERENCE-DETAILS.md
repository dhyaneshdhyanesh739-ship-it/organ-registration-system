# 🔍 Search Icon Reference - Complete Details

## All Icons from the Reference Image

Based on the Search Icon Reference image, here are all 12 icons with complete implementation details:

---

## 📋 Icon Grid (4 columns × 3 rows)

### **Row 1: Search & Primary Organs**

#### 1. 🔍 **Search**
- **Icon Name:** `Search`
- **Purpose:** Search functionality for organs, donors, hospitals
- **Color:** Blue (`text-blue-600`)
- **Import:** `import { Search } from 'lucide-react';`
- **Usage:**
  ```jsx
  <Search className="w-6 h-6 text-blue-600" />
  ```
- **Common Use Cases:**
  - Search input fields
  - Search buttons
  - Filter triggers
  - Global search

#### 2. ❤️ **Heart**
- **Icon Name:** `Heart`
- **Purpose:** Heart organ representation
- **Color:** Red (`text-red-500`)
- **Import:** `import { Heart } from 'lucide-react';`
- **Usage:**
  ```jsx
  <Heart className="w-6 h-6 text-red-500" />
  ```
- **Common Use Cases:**
  - Heart organ cards
  - Cardiac transplant info
  - Donor registration (heart)
  - Medical stats

#### 3. 🛡️ **Kidneys**
- **Icon Name:** `Shield`
- **Purpose:** Kidney organ representation (protective function)
- **Color:** Blue (`text-blue-500`)
- **Import:** `import { Shield } from 'lucide-react';`
- **Usage:**
  ```jsx
  <Shield className="w-6 h-6 text-blue-500" />
  ```
- **Common Use Cases:**
  - Kidney organ cards
  - Renal transplant info
  - Most needed organ indicator
  - Filtering kidney donors

#### 4. 👁️ **Corneas**
- **Icon Name:** `Eye`
- **Purpose:** Cornea/eye organ representation
- **Color:** Light Blue (`text-sky-400`)
- **Import:** `import { Eye } from 'lucide-react';`
- **Usage:**
  ```jsx
  <Eye className="w-6 h-6 text-sky-400" />
  ```
- **Common Use Cases:**
  - Cornea donation cards
  - Vision restoration info
  - Eye tissue transplants
  - Visibility toggles

---

### **Row 2: Other Organs**

#### 5. 📊 **Liver**
- **Icon Name:** `Activity`
- **Purpose:** Liver organ representation (metabolic activity)
- **Color:** Orange (`text-orange-500`)
- **Import:** `import { Activity } from 'lucide-react';`
- **Usage:**
  ```jsx
  <Activity className="w-6 h-6 text-orange-500" />
  ```
- **Common Use Cases:**
  - Liver organ cards
  - Hepatic transplant info
  - Medical activity indicators
  - Health monitoring

#### 6. 💨 **Lungs**
- **Icon Name:** `Wind`
- **Purpose:** Lung organ representation (breathing/air)
- **Color:** Light Blue (`text-cyan-400`)
- **Import:** `import { Wind } from 'lucide-react';`
- **Usage:**
  ```jsx
  <Wind className="w-6 h-6 text-cyan-400" />
  ```
- **Common Use Cases:**
  - Lung organ cards
  - Respiratory transplant info
  - Breathing/ventilation indicators
  - Air quality stats

#### 7. ⚡ **Pancreas**
- **Icon Name:** `Zap`
- **Purpose:** Pancreas organ representation (energy/insulin)
- **Color:** Yellow (`text-yellow-500`)
- **Import:** `import { Zap } from 'lucide-react';`
- **Usage:**
  ```jsx
  <Zap className="w-6 h-6 text-yellow-500" />
  ```
- **Common Use Cases:**
  - Pancreas organ cards
  - Diabetes-related transplants
  - Metabolic function indicators
  - Energy/power symbols

#### 8. 👥 **Patients/Donors**
- **Icon Name:** `Users`
- **Purpose:** Represent patients, donors, or groups
- **Color:** Purple (`text-purple-500`)
- **Import:** `import { Users } from 'lucide-react';`
- **Usage:**
  ```jsx
  <Users className="w-6 h-6 text-purple-500" />
  ```
- **Common Use Cases:**
  - Waiting list statistics
  - Donor count displays
  - Patient management
  - Community features

---

### **Row 3: Utility Icons**

#### 9. 🔽 **Filter**
- **Icon Name:** `Filter`
- **Purpose:** Filtering and sorting functionality
- **Color:** Dark Gray (`text-gray-700`)
- **Import:** `import { Filter } from 'lucide-react';`
- **Usage:**
  ```jsx
  <Filter className="w-6 h-6 text-gray-700" />
  ```
- **Common Use Cases:**
  - Filter buttons
  - Advanced search options
  - Sort/refine results
  - Data filtering

#### 10. ⏰ **Wait Time**
- **Icon Name:** `Clock`
- **Purpose:** Time-related information (waiting periods)
- **Color:** Light Blue (`text-sky-500`)
- **Import:** `import { Clock } from 'lucide-react';`
- **Usage:**
  ```jsx
  <Clock className="w-6 h-6 text-sky-500" />
  ```
- **Common Use Cases:**
  - Average wait time displays
  - Time remaining indicators
  - Scheduling information
  - Urgency levels

#### 11. 📈 **Success Rate**
- **Icon Name:** `TrendingUp`
- **Purpose:** Success rates and positive trends
- **Color:** Green (`text-green-500`)
- **Import:** `import { TrendingUp } from 'lucide-react';`
- **Usage:**
  ```jsx
  <TrendingUp className="w-6 h-6 text-green-500" />
  ```
- **Common Use Cases:**
  - Transplant success rates
  - Positive statistics
  - Growth indicators
  - Performance metrics

#### 12. 📍 **Location**
- **Icon Name:** `MapPin`
- **Purpose:** Location and geographical information
- **Color:** Teal (`text-teal-500`)
- **Import:** `import { MapPin } from 'lucide-react';`
- **Usage:**
  ```jsx
  <MapPin className="w-6 h-6 text-teal-500" />
  ```
- **Common Use Cases:**
  - Hospital locations
  - Donor locations
  - Map markers
  - Address indicators

---

## 📦 Complete Import Statement

```javascript
import { 
  Search,        // Row 1, Col 1 - Blue
  Heart,         // Row 1, Col 2 - Red
  Shield,        // Row 1, Col 3 - Blue (Kidneys)
  Eye,           // Row 1, Col 4 - Light Blue (Corneas)
  Activity,      // Row 2, Col 1 - Orange (Liver)
  Wind,          // Row 2, Col 2 - Cyan (Lungs)
  Zap,           // Row 2, Col 3 - Yellow (Pancreas)
  Users,         // Row 2, Col 4 - Purple (Patients/Donors)
  Filter,        // Row 3, Col 1 - Gray
  Clock,         // Row 3, Col 2 - Sky Blue (Wait Time)
  TrendingUp,    // Row 3, Col 3 - Green (Success Rate)
  MapPin         // Row 3, Col 4 - Teal (Location)
} from 'lucide-react';
```

---

## 🎨 Color Palette Reference

| Icon | Color Name | Tailwind Class | Hex Code |
|------|-----------|----------------|----------|
| Search | Blue | `text-blue-600` | #2563EB |
| Heart | Red | `text-red-500` | #EF4444 |
| Shield (Kidneys) | Blue | `text-blue-500` | #3B82F6 |
| Eye (Corneas) | Sky Blue | `text-sky-400` | #38BDF8 |
| Activity (Liver) | Orange | `text-orange-500` | #F97316 |
| Wind (Lungs) | Cyan | `text-cyan-400` | #22D3EE |
| Zap (Pancreas) | Yellow | `text-yellow-500` | #EAB308 |
| Users | Purple | `text-purple-500` | #A855F7 |
| Filter | Gray | `text-gray-700` | #374151 |
| Clock | Sky Blue | `text-sky-500` | #0EA5E9 |
| TrendingUp | Green | `text-green-500` | #22C55E |
| MapPin | Teal | `text-teal-500` | #14B8A6 |

---

## 💡 Complete Usage Example

```jsx
import React from 'react';
import { 
  Search, Heart, Shield, Eye, Activity, Wind, Zap, 
  Users, Filter, Clock, TrendingUp, MapPin 
} from 'lucide-react';

function OrganSearchDashboard() {
  return (
    <div className="p-6 space-y-6">
      {/* Search Bar */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-blue-600" />
        <input
          type="text"
          placeholder="Search organs, donors, hospitals..."
          className="w-full pl-10 pr-4 py-3 border rounded-lg"
        />
      </div>

      {/* Organ Types */}
      <div className="grid grid-cols-4 gap-4">
        <div className="p-4 bg-white rounded-lg shadow text-center">
          <Heart className="w-8 h-8 text-red-500 mx-auto mb-2" />
          <p className="font-medium">Heart</p>
        </div>
        
        <div className="p-4 bg-white rounded-lg shadow text-center">
          <Shield className="w-8 h-8 text-blue-500 mx-auto mb-2" />
          <p className="font-medium">Kidneys</p>
        </div>
        
        <div className="p-4 bg-white rounded-lg shadow text-center">
          <Eye className="w-8 h-8 text-sky-400 mx-auto mb-2" />
          <p className="font-medium">Corneas</p>
        </div>
        
        <div className="p-4 bg-white rounded-lg shadow text-center">
          <Activity className="w-8 h-8 text-orange-500 mx-auto mb-2" />
          <p className="font-medium">Liver</p>
        </div>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-3 gap-4">
        <div className="p-4 bg-white rounded-lg shadow">
          <div className="flex items-center gap-3">
            <Users className="w-6 h-6 text-purple-500" />
            <div>
              <p className="text-sm text-gray-500">Waiting List</p>
              <p className="text-2xl font-bold">12,000+</p>
            </div>
          </div>
        </div>
        
        <div className="p-4 bg-white rounded-lg shadow">
          <div className="flex items-center gap-3">
            <TrendingUp className="w-6 h-6 text-green-500" />
            <div>
              <p className="text-sm text-gray-500">Success Rate</p>
              <p className="text-2xl font-bold">88%</p>
            </div>
          </div>
        </div>
        
        <div className="p-4 bg-white rounded-lg shadow">
          <div className="flex items-center gap-3">
            <Clock className="w-6 h-6 text-sky-500" />
            <div>
              <p className="text-sm text-gray-500">Avg. Wait</p>
              <p className="text-2xl font-bold">11 Months</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filter & Location */}
      <div className="flex gap-4">
        <button className="flex items-center gap-2 px-4 py-2 border rounded-lg hover:bg-gray-50">
          <Filter className="w-5 h-5 text-gray-700" />
          <span>Filter Results</span>
        </button>
        
        <button className="flex items-center gap-2 px-4 py-2 border rounded-lg hover:bg-gray-50">
          <MapPin className="w-5 h-5 text-teal-500" />
          <span>Near Me</span>
        </button>
      </div>
    </div>
  );
}

export default OrganSearchDashboard;
```

---

## 🎯 Icon Mapping to Organs

| Organ | Icon | Color | Reasoning |
|-------|------|-------|-----------|
| **Heart** | `Heart` | Red | Direct representation, vital organ |
| **Kidneys** | `Shield` | Blue | Protective/filtering function |
| **Liver** | `Activity` | Orange | Metabolic activity, regeneration |
| **Lungs** | `Wind` | Cyan | Breathing, air flow |
| **Pancreas** | `Zap` | Yellow | Energy production (insulin) |
| **Corneas** | `Eye` | Sky Blue | Vision, eye tissue |
| **Intestines** | `Activity` | Green | Digestive activity |
| **Skin** | `Shield` | Pink | Protective barrier |

---

## 📱 Responsive Sizing

```jsx
// Small (Mobile)
<Search className="w-4 h-4" />

// Medium (Tablet)
<Search className="w-5 h-5" />

// Large (Desktop)
<Search className="w-6 h-6" />

// Extra Large (Hero)
<Search className="w-8 h-8" />
```

---

## ✨ Animation Examples

```jsx
// Pulse animation
<Heart className="w-6 h-6 text-red-500 animate-pulse" />

// Spin animation
<Search className="w-6 h-6 animate-spin" />

// Hover scale
<Search className="w-6 h-6 transition-transform hover:scale-110" />

// Bounce animation
<TrendingUp className="w-6 h-6 animate-bounce" />
```

---

## 🔗 Quick Reference Links

- **Lucide Icons:** https://lucide.dev/icons/
- **Tailwind Colors:** https://tailwindcss.com/docs/customizing-colors
- **Your Guide:** `ORGAN-SEARCH-ICONS-GUIDE.md`
- **Code Examples:** `client/src/examples/OrganSearchIconExamples.jsx`

---

## 📊 Summary Table

| # | Icon Name | Component | Color | Primary Use |
|---|-----------|-----------|-------|-------------|
| 1 | Search | `<Search />` | Blue | Search functionality |
| 2 | Heart | `<Heart />` | Red | Heart organ |
| 3 | Kidneys | `<Shield />` | Blue | Kidney organ |
| 4 | Corneas | `<Eye />` | Sky Blue | Eye/cornea organ |
| 5 | Liver | `<Activity />` | Orange | Liver organ |
| 6 | Lungs | `<Wind />` | Cyan | Lung organ |
| 7 | Pancreas | `<Zap />` | Yellow | Pancreas organ |
| 8 | Patients | `<Users />` | Purple | User groups |
| 9 | Filter | `<Filter />` | Gray | Filtering |
| 10 | Wait Time | `<Clock />` | Sky Blue | Time info |
| 11 | Success | `<TrendingUp />` | Green | Statistics |
| 12 | Location | `<MapPin />` | Teal | Geography |

---

**All icons are from Lucide React and are already available in your project!** 🎉
