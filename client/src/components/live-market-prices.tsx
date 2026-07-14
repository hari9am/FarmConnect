import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  getVegetablePrices, 
  getPopularVegetablePrices, 
  formatPrice, 
  getPriceTrend,
  type MarketPrice,
  type VegetablePrices 
} from '@/services/market-prices';
import { TrendingUp, TrendingDown, Minus, RefreshCw, MapPin, Calendar } from 'lucide-react';
import { useLanguage } from '@/hooks/use-language';

interface LiveMarketPricesProps {
  state?: string;
  district?: string;
}

export default function LiveMarketPrices({ state = "Karnataka", district = "Bengaluru" }: LiveMarketPricesProps) {
  const [prices, setPrices] = useState<VegetablePrices>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedState, setSelectedState] = useState(state);
  const [selectedDistrict, setSelectedDistrict] = useState(district);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const { t } = useLanguage();

  // Indian states list
  const states = [
    "Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar", "Chhattisgarh", "Goa",
    "Gujarat", "Haryana", "Himachal Pradesh", "Jharkhand", "Karnataka", "Kerala",
    "Madhya Pradesh", "Maharashtra", "Manipur", "Meghalaya", "Mizoram", "Nagaland",
    "Odisha", "Punjab", "Rajasthan", "Sikkim", "Tamil Nadu", "Telangana",
    "Tripura", "Uttar Pradesh", "Uttarakhand", "West Bengal", "Delhi", "Jammu & Kashmir"
  ];

  // Major districts for Karnataka (example)
  const karnatakaDistricts = [
    "Bengaluru", "Mysuru", "Mangaluru", "Belagavi", "Hubballi-Dharwad", "Davanagere",
    "Kalaburagi", "Vijayapura", "Bagalkot", "Chitradurga", "Koppal", "Udupi", "Chikkamagaluru",
    "Shivamogga", "Tumakuru", "Ramanagara", "Chitradurga", "Hassan", "Dakshina Kannada", "Uttara Kannada"
  ];

  const fetchPrices = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getPopularVegetablePrices(selectedState, selectedDistrict);
      setPrices(data);
      setLastUpdated(new Date());
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch prices');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPrices();
  }, [selectedState, selectedDistrict]);

  const refreshPrices = () => {
    fetchPrices();
  };

  const getPriceTrendIcon = (trend: 'up' | 'down' | 'stable') => {
    switch (trend) {
      case 'up':
        return <TrendingUp className="h-4 w-4 text-green-600" />;
      case 'down':
        return <TrendingDown className="h-4 w-4 text-red-600" />;
      default:
        return <Minus className="h-4 w-4 text-gray-600" />;
    }
  };

  if (loading) {
    return (
      <div className="p-6 space-y-4">
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-violet-200 border-t-violet-600 mx-auto"></div>
          <p className="mt-4 text-muted-foreground font-medium">Loading market prices...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <Card className="border-red-200">
          <CardContent className="p-6 text-center">
            <p className="text-red-600 mb-4">{error}</p>
            <Button onClick={refreshPrices} className="flex items-center space-x-2">
              <RefreshCw className="h-4 w-4" />
              Retry
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="glass p-6 rounded-2xl">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="animate-fade-up">
            <h2 className="text-3xl font-bold bg-gradient-to-r from-violet-600 to-fuchsia-600 bg-clip-text text-transparent mb-2" style={{ fontFamily: 'var(--font-display)' }}>
              🥬 Live Market Prices
            </h2>
            <div className="flex items-center space-x-4 text-muted-foreground">
              <div className="flex items-center space-x-2">
                <MapPin className="h-4 w-4 text-violet-600" />
                <span className="font-medium">{selectedState}, {selectedDistrict}</span>
              </div>
              {lastUpdated && (
                <div className="flex items-center space-x-2">
                  <Calendar className="h-4 w-4 text-violet-600" />
                  <span className="text-sm">{lastUpdated.toLocaleString()}</span>
                </div>
              )}
            </div>
          </div>
          
          <div className="flex flex-wrap items-center gap-2">
            <Select value={selectedState} onValueChange={setSelectedState}>
              <SelectTrigger className="w-40 glass border-white/20">
                <SelectValue placeholder="Select State" />
              </SelectTrigger>
              <SelectContent className="glass border-white/20">
                {states.map((s) => (
                  <SelectItem key={s} value={s} className="hover:bg-violet-50">
                    {s}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            
            <Select value={selectedDistrict} onValueChange={setSelectedDistrict}>
              <SelectTrigger className="w-40 glass border-white/20">
                <SelectValue placeholder="Select District" />
              </SelectTrigger>
              <SelectContent className="glass border-white/20">
                {selectedState === "Karnataka" && karnatakaDistricts.map((d) => (
                  <SelectItem key={d} value={d} className="hover:bg-violet-50">
                    {d}
                  </SelectItem>
                ))}
                {selectedState !== "Karnataka" && (
                  <SelectItem value="All Districts" className="hover:bg-violet-50">All Districts</SelectItem>
                )}
              </SelectContent>
            </Select>
            
            <Button onClick={refreshPrices} className="modern-button" size="sm">
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
          </div>
        </div>
      </div>

      {/* Prices Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {Object.entries(prices).map(([commodity, price]) => (
          <Card key={commodity} className="modern-card elevate group animate-fade-up">
            <CardHeader className="pb-3">
              <div className="flex justify-between items-start">
                <CardTitle className="text-xl font-bold text-gray-900 group-hover:text-violet-600 transition-colors" style={{ fontFamily: 'var(--font-display)' }}>
                  🥗 {commodity}
                </CardTitle>
                <Badge className="bg-gradient-to-r from-violet-100 to-fuchsia-100 text-violet-700 border-0 font-medium">
                  {price.market}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="space-y-4">
                {/* Current Price */}
                <div className="text-center p-4 bg-gradient-to-br from-violet-50 to-fuchsia-50 rounded-xl">
                  <div className="text-3xl font-bold bg-gradient-to-r from-violet-600 to-fuchsia-600 bg-clip-text text-transparent">
                    {formatPrice(price.modalPrice)}
                  </div>
                  <p className="text-sm text-muted-foreground font-medium mt-1">Modal Price</p>
                </div>

                {/* Price Range */}
                <div className="flex justify-between items-center p-3 bg-gray-50 rounded-xl">
                  <div className="text-center">
                    <div className="text-xs text-muted-foreground mb-1">Min</div>
                    <div className="font-bold text-green-600">{formatPrice(price.minPrice)}</div>
                  </div>
                  <div className="w-px h-8 bg-gray-300"></div>
                  <div className="text-center">
                    <div className="text-xs text-muted-foreground mb-1">Max</div>
                    <div className="font-bold text-red-600">{formatPrice(price.maxPrice)}</div>
                  </div>
                </div>

                {/* Price Trend */}
                <div className="flex items-center justify-between p-3 bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl">
                  <span className="text-sm font-medium text-green-700">Daily Trend</span>
                  <div className="flex items-center space-x-1">
                    {getPriceTrendIcon('stable')}
                    <span className="text-sm font-bold text-green-600">Stable</span>
                  </div>
                </div>

                {/* Arrival Date */}
                <div className="text-xs text-muted-foreground text-center p-2 bg-gray-50 rounded-lg">
                  📅 Arrival: {price.arrivalDate}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Empty State */}
      {Object.keys(prices).length === 0 && !loading && !error && (
        <Card className="modern-card elevate">
          <CardContent className="p-12 text-center">
            <div className="text-8xl mb-6 animate-float">🥬</div>
            <h3 className="text-2xl font-bold bg-gradient-to-r from-violet-600 to-fuchsia-600 bg-clip-text text-transparent mb-3" style={{ fontFamily: 'var(--font-display)' }}>
              No Price Data Available
            </h3>
            <p className="text-muted-foreground mb-6 text-lg max-w-md mx-auto">
              Try selecting a different state or district, or refresh the data to get the latest market prices.
            </p>
            <Button onClick={refreshPrices} className="modern-button">
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh Prices
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Footer */}
      <div className="glass p-6 rounded-2xl text-center">
        <div className="space-y-2">
          <p className="text-sm font-medium text-violet-600">
            📊 Data Source: AGMARKNET (Ministry of Agriculture, Government of India)
          </p>
          <p className="text-xs text-muted-foreground">
            Prices are updated daily from various agricultural markets across India.
          </p>
        </div>
      </div>
    </div>
  );
}
