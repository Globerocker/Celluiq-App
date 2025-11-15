import React from 'react';
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon } from "lucide-react";
import { format } from "date-fns";

export default function DateRangeFilter({ dateRange, setDateRange }) {
  const quickFilters = [
    { label: "7 Days", days: 7 },
    { label: "30 Days", days: 30 },
    { label: "90 Days", days: 90 },
    { label: "1 Year", days: 365 }
  ];

  const handleQuickFilter = (days) => {
    setDateRange({
      from: new Date(Date.now() - days * 24 * 60 * 60 * 1000),
      to: new Date()
    });
  };

  return (
    <div className="flex flex-wrap items-center gap-2">
      <div className="flex gap-2">
        {quickFilters.map((filter) => (
          <Button
            key={filter.days}
            variant="outline"
            size="sm"
            onClick={() => handleQuickFilter(filter.days)}
            className="text-xs"
          >
            {filter.label}
          </Button>
        ))}
      </div>
      <Popover>
        <PopoverTrigger asChild>
          <Button variant="outline" size="sm" className="text-xs">
            <CalendarIcon className="w-4 h-4 mr-2" />
            {dateRange.from && dateRange.to
              ? `${format(dateRange.from, "MMM dd")} - ${format(dateRange.to, "MMM dd")}`
              : "Custom Range"}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="end">
          <Calendar
            mode="range"
            selected={{ from: dateRange.from, to: dateRange.to }}
            onSelect={(range) => range && setDateRange(range)}
            numberOfMonths={2}
          />
        </PopoverContent>
      </Popover>
    </div>
  );
}