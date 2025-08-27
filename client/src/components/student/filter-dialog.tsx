import { useState } from "react";
import { X, Filter } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Slider } from "@/components/ui/slider";
import { Checkbox } from "@/components/ui/checkbox";

interface FilterDialogProps {
  isOpen: boolean;
  onClose: () => void;
  filters: {
    dietary: string[];
    priceRange: number[];
    rating: number;
    deliveryTime: number;
  };
  onFiltersChange: (filters: any) => void;
}

export function FilterDialog({ isOpen, onClose, filters, onFiltersChange }: FilterDialogProps) {
  const [tempFilters, setTempFilters] = useState(filters);

  if (!isOpen) return null;

  const dietaryOptions = [
    "Vegetarian",
    "Vegan", 
    "Gluten-Free",
    "Dairy-Free",
    "Keto",
    "Low-Carb",
    "High-Protein",
    "Halal",
    "Jain"
  ];

  const handleDietaryChange = (dietary: string, checked: boolean) => {
    setTempFilters(prev => ({
      ...prev,
      dietary: checked 
        ? [...prev.dietary, dietary]
        : prev.dietary.filter(d => d !== dietary)
    }));
  };

  const handleApplyFilters = () => {
    onFiltersChange(tempFilters);
    onClose();
  };

  const handleClearFilters = () => {
    const clearedFilters = {
      dietary: [],
      priceRange: [0, 1000],
      rating: 0,
      deliveryTime: 60,
    };
    setTempFilters(clearedFilters);
    onFiltersChange(clearedFilters);
  };

  const hasActiveFilters = tempFilters.dietary.length > 0 || 
                          tempFilters.rating > 0 || 
                          tempFilters.priceRange[0] > 0 || 
                          tempFilters.priceRange[1] < 1000 ||
                          tempFilters.deliveryTime < 60;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4" data-testid="filter-dialog">
      <div className="bg-background rounded-lg max-w-md w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b">
          <h2 className="text-lg font-semibold flex items-center" data-testid="filter-title">
            <Filter className="w-5 h-5 mr-2" />
            Filters
          </h2>
          <Button variant="ghost" size="sm" onClick={onClose} data-testid="close-filter">
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* Filter Content */}
        <div className="p-6 space-y-6 overflow-y-auto max-h-96">
          {/* Dietary Preferences */}
          <div>
            <h3 className="font-medium mb-3">Dietary Preferences</h3>
            <div className="grid grid-cols-2 gap-3">
              {dietaryOptions.map(option => (
                <div key={option} className="flex items-center space-x-2">
                  <Checkbox
                    id={option}
                    checked={tempFilters.dietary.includes(option)}
                    onCheckedChange={(checked) => handleDietaryChange(option, checked as boolean)}
                    data-testid={`dietary-${option.toLowerCase().replace(/[^a-z0-9]/g, '-')}`}
                  />
                  <label htmlFor={option} className="text-sm cursor-pointer">
                    {option}
                  </label>
                </div>
              ))}
            </div>
          </div>

          {/* Price Range */}
          <div>
            <h3 className="font-medium mb-3">Price Range (for two people)</h3>
            <div className="px-2">
              <Slider
                value={tempFilters.priceRange}
                onValueChange={(value) => setTempFilters(prev => ({ ...prev, priceRange: value }))}
                max={1000}
                min={0}
                step={50}
                className="w-full"
                data-testid="price-range-slider"
              />
              <div className="flex justify-between text-sm text-muted-foreground mt-2">
                <span>₹{tempFilters.priceRange[0]}</span>
                <span>₹{tempFilters.priceRange[1]}</span>
              </div>
            </div>
          </div>

          {/* Minimum Rating */}
          <div>
            <h3 className="font-medium mb-3">Minimum Rating</h3>
            <div className="flex gap-2">
              {[0, 3, 3.5, 4, 4.5].map(rating => (
                <Button
                  key={rating}
                  variant={tempFilters.rating === rating ? "default" : "outline"}
                  size="sm"
                  onClick={() => setTempFilters(prev => ({ ...prev, rating }))}
                  data-testid={`rating-${rating}`}
                >
                  {rating === 0 ? "Any" : `${rating}+`}
                  {rating > 0 && " ⭐"}
                </Button>
              ))}
            </div>
          </div>

          {/* Maximum Delivery Time */}
          <div>
            <h3 className="font-medium mb-3">Maximum Delivery Time</h3>
            <div className="px-2">
              <Slider
                value={[tempFilters.deliveryTime]}
                onValueChange={(value) => setTempFilters(prev => ({ ...prev, deliveryTime: value[0] }))}
                max={60}
                min={15}
                step={5}
                className="w-full"
                data-testid="delivery-time-slider"
              />
              <div className="text-center text-sm text-muted-foreground mt-2">
                Up to {tempFilters.deliveryTime} minutes
              </div>
            </div>
          </div>

          {/* Active Filters Display */}
          {hasActiveFilters && (
            <div>
              <h3 className="font-medium mb-3">Active Filters</h3>
              <div className="flex flex-wrap gap-2">
                {tempFilters.dietary.map(diet => (
                  <Badge key={diet} variant="secondary" className="cursor-pointer" 
                         onClick={() => handleDietaryChange(diet, false)}>
                    {diet} ✕
                  </Badge>
                ))}
                {tempFilters.rating > 0 && (
                  <Badge variant="secondary" className="cursor-pointer"
                         onClick={() => setTempFilters(prev => ({ ...prev, rating: 0 }))}>
                    {tempFilters.rating}+ ⭐ ✕
                  </Badge>
                )}
                {(tempFilters.priceRange[0] > 0 || tempFilters.priceRange[1] < 1000) && (
                  <Badge variant="secondary" className="cursor-pointer"
                         onClick={() => setTempFilters(prev => ({ ...prev, priceRange: [0, 1000] }))}>
                    ₹{tempFilters.priceRange[0]}-₹{tempFilters.priceRange[1]} ✕
                  </Badge>
                )}
                {tempFilters.deliveryTime < 60 && (
                  <Badge variant="secondary" className="cursor-pointer"
                         onClick={() => setTempFilters(prev => ({ ...prev, deliveryTime: 60 }))}>
                    ≤{tempFilters.deliveryTime}min ✕
                  </Badge>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex gap-3 p-6 border-t">
          <Button 
            variant="outline" 
            onClick={handleClearFilters}
            className="flex-1"
            disabled={!hasActiveFilters}
            data-testid="clear-filters"
          >
            Clear All
          </Button>
          <Button 
            onClick={handleApplyFilters}
            className="flex-1 bg-primary hover:bg-primary/90"
            data-testid="apply-filters"
          >
            Apply Filters
          </Button>
        </div>
      </div>
    </div>
  );
}