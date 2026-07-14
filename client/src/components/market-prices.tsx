import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { RefreshCw, TrendingUp, TrendingDown, Minus } from "lucide-react";
import { useLanguage } from "@/hooks/use-language";
import { getLocalizedProduceName } from "@/lib/produce-translations";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface MarketItem {
  name: string;
  price: number;
  change?: number; // positive for increase, negative for decrease, 0 for no change
  unit: string;
}

// Mock data based on the website structure - in a real app, this would come from an API
const mockPrices: MarketItem[] = [
  { name: "Tomato", price: 5.65, change: -0.15, unit: "kg" },
  { name: "Onion Big", price: 1.56, change: 0.05, unit: "kg" },
  { name: "Snake Gourd", price: 1.27, change: 0.0, unit: "kg" },
  { name: "Potato", price: 1.09, change: -0.08, unit: "kg" },
  { name: "Carrot", price: 2.45, change: 0.12, unit: "kg" },
  { name: "Spinach", price: 1.85, change: -0.03, unit: "kg" },
  { name: "Wheat", price: 2.20, change: 0.0, unit: "kg" },
  { name: "Rice", price: 3.15, change: 0.18, unit: "kg" },
];

export default function MarketPrices() {
  const [category, setCategory] = useState<"vegetables" | "eggs" | "fruits">("vegetables");
  const [prices, setPrices] = useState<MarketItem[]>(mockPrices);
  const [isLoading, setIsLoading] = useState(false);
  const [lastUpdated, setLastUpdated] = useState(new Date());
  const { t, language } = useLanguage();
  const [ttlSeconds, setTtlSeconds] = useState<number | null>(null);

  const refreshPrices = async () => {
    setIsLoading(true);
    try {
      if (category === "eggs") {
        const res = await fetch("/api/market/eggs");
        if (!res.ok) throw new Error(await res.text());
        const data = await res.json();
        const items: MarketItem[] = (data.items || []).map((x: any) => ({
          name: x.name,
          price: Number(x.price),
          unit: x.unit || "number",
          change: 0,
        }));
        setPrices(items);
        setLastUpdated(new Date(data.lastUpdated || Date.now()));
        setTtlSeconds(typeof data.ttlSeconds === "number" ? data.ttlSeconds : null);
      } else if (category === "fruits") {
        const res = await fetch("/api/market/fruits");
        if (!res.ok) throw new Error(await res.text());
        const data = await res.json();
        const items: MarketItem[] = (data.items || []).map((x: any) => ({
          name: x.name,
          price: Number(x.price),
          unit: x.unit || "kg",
          change: 0,
        }));
        setPrices(items);
        setLastUpdated(new Date(data.lastUpdated || Date.now()));
        setTtlSeconds(typeof data.ttlSeconds === "number" ? data.ttlSeconds : null);
      } else {
        // Simulate API call for vegetables
        await new Promise((r) => setTimeout(r, 800));
        const updatedPrices = mockPrices.map((price) => ({
          ...price,
          price: Math.max(0.5, price.price + (Math.random() - 0.5) * 0.2),
          change: (Math.random() - 0.5) * 0.3,
        }));
        setPrices(updatedPrices);
        setLastUpdated(new Date());
      }
    } catch (e) {
      console.error("Failed to refresh market prices:", e);
    } finally {
      setIsLoading(false);
    }
  };

  const getChangeIcon = (change: number) => {
    if (change > 0) return <TrendingUp className="h-3 w-3 text-green-500" />;
    if (change < 0) return <TrendingDown className="h-3 w-3 text-red-500" />;
    return <Minus className="h-3 w-3 text-gray-500" />;
  };

  const getChangeColor = (change: number) => {
    if (change > 0) return "text-green-600";
    if (change < 0) return "text-red-600";
    return "text-gray-600";
  };

  const formatChange = (change: number) => {
    const sign = change > 0 ? "+" : "";
    return `${sign}${change.toFixed(2)}`;
  };

  // Auto-load eggs when switched to eggs category
  useEffect(() => {
    // Clear current list immediately to avoid showing stale items from other categories
    setPrices([]);
    if (category === "eggs") {
      refreshPrices();
    } else if (category === "fruits") {
      refreshPrices();
    } else {
      // Reset to mock vegetables when switching back
      setPrices(mockPrices);
      setLastUpdated(new Date());
      setTtlSeconds(null);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [category]);

  return (
    <Card className="w-full">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-semibold">
            {t("daily_market_prices")}
          </CardTitle>
          <div className="flex items-center space-x-2">
            <Select value={category} onValueChange={(v: any) => setCategory(v)}>
              <SelectTrigger className="h-8">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="vegetables">{t("vegetables")}</SelectItem>
                <SelectItem value="eggs">{t("eggs")}</SelectItem>
                <SelectItem value="fruits">{t("fruits")}</SelectItem>
              </SelectContent>
            </Select>
            <Button
              variant="outline"
              size="sm"
              onClick={refreshPrices}
              disabled={isLoading}
              className="h-8 w-8 p-0"
            >
              <RefreshCw className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`} />
            </Button>
          </div>
        </div>
        <p className="text-sm text-muted-foreground">
          {t("last_updated")}: {lastUpdated.toLocaleTimeString()} {(category === "eggs" || category === "fruits") && ttlSeconds != null ? `• refresh in ~${Math.max(0, Math.floor(ttlSeconds/60))}m` : ""}
        </p>
      </CardHeader>
      <CardContent className="pt-0">
        {category === "eggs" && prices.length > 0 && (
          <div className="mb-3 p-3 rounded-md bg-amber-50 border border-amber-200 text-amber-900 flex items-center justify-between">
            <div>
              <div className="text-xs uppercase tracking-wide opacity-80">Per egg price (avg)</div>
              <div className="text-lg font-semibold">₹{(prices.reduce((a,b)=>a+b.price,0)/prices.length).toFixed(2)}</div>
            </div>
            <Button size="sm" variant="outline" onClick={refreshPrices} disabled={isLoading} className="h-8">
              <RefreshCw className={`h-4 w-4 mr-1 ${isLoading ? 'animate-spin' : ''}`} /> Refresh
            </Button>
          </div>
        )}
        <div className="space-y-3">
          {prices.length === 0 && !isLoading && (
            <div className="text-xs text-muted-foreground px-3 py-2">No data yet. Tap refresh.</div>
          )}
          {prices.slice(0, 12).map((item, index) => (
            <div
              key={index}
              className="flex items-center justify-between p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors"
            >
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                  <span className="text-xs font-medium text-primary">
                    {item.name.charAt(0)}
                  </span>
                </div>
                <div>
                  <p className="font-medium text-sm">{item.name}</p>
                  {(() => {
                    const localized = category === "vegetables" ? getLocalizedProduceName(item.name, language) : null;
                    return localized ? (
                      <p className="text-xs text-muted-foreground">{localized}</p>
                    ) : null;
                  })()}
                  <p className="text-xs text-muted-foreground">
                    {t("per")} {category === "eggs" ? "egg" : item.unit}
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <div className="text-right">
                  <p className="font-semibold">₹{item.price.toFixed(2)}</p>
                  <div className={`flex items-center space-x-1 text-xs ${getChangeColor(item.change || 0)}`}>
                    {getChangeIcon(item.change || 0)}
                    <span>{formatChange(item.change || 0)}</span>
                  </div>
                </div>
                <Badge 
                  variant={(item.change || 0) > 0 ? "default" : (item.change || 0) < 0 ? "destructive" : "secondary"}
                  className="text-xs"
                >
                  {(item.change || 0) > 0 ? t("up") : (item.change || 0) < 0 ? t("down") : t("stable")}
                </Badge>
              </div>
            </div>
          ))}
        </div>
        <div className="mt-4 pt-3 border-t border-border">
          <p className="text-xs text-muted-foreground text-center">
            {t("data_source")}: <a 
              href={category === "eggs" ? "https://www.commodityonline.com/egg-rate/karnataka" : "https://vegetablemarketprice.com/"}
              target="_blank" 
              rel="noopener noreferrer"
              className="text-primary hover:underline"
            >
              {category === "eggs" ? "commodityonline.com" : "vegetablemarketprice.com"}
            </a>
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
