import * as React from "react";
import { format } from "date-fns";
import { Calendar as CalendarIcon } from "lucide-react";
import { DayPicker } from "react-day-picker";
import type { DateRange } from "react-day-picker";
import "react-day-picker/style.css"; // Official v9 CSS import

import { Button } from "./Button";

interface DateRangePickerProps {
    className?: string;
    date?: DateRange;
    setDate: (date: DateRange | undefined) => void;
}

export function DateRangePicker({
    className,
    date,
    setDate,
}: DateRangePickerProps) {
    const [isPopoverOpen, setIsPopoverOpen] = React.useState(false);

    // Toggle popover
    const togglePopover = () => setIsPopoverOpen(!isPopoverOpen);

    // Close on click outside (simple implementation)
    const popoverRef = React.useRef<HTMLDivElement>(null);
    React.useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (popoverRef.current && !popoverRef.current.contains(event.target as Node)) {
                setIsPopoverOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, []);

    // Custom CSS to force visibility (fix white-on-white issue)
    const css = `
        .rdp-root {
            --rdp-cell-size: 40px;
            --rdp-accent-color: #2563eb;
            --rdp-background-color: #eff6ff;
            margin: 0;
        }
        /* Force text color to black/slate-800 to prevent inheritance of text-white from Hero */
        .rdp-day_button {
            color: #1e293b !important; 
        }
        .rdp-caption_label {
            color: #0f172a !important;
        }
        .rdp-nav_button {
            color: #334155 !important;
        }
        .rdp-weekday {
            color: #64748b !important;
        }
        /* Selected states */
        .rdp-day_selected .rdp-day_button { 
            background-color: var(--rdp-accent-color) !important; 
            color: white !important;
            font-weight: bold;
        }
        .rdp-day_selected:hover .rdp-day_button { 
            background-color: var(--rdp-accent-color) !important;
            opacity: 0.8;
        }
    `;

    return (
        <div className={`relative ${className}`} ref={popoverRef}>
            <style>{css}</style>
            <div className="flex gap-2 w-full">
                <Button
                    type="button" // Prevent form submission
                    variant="outline"
                    className={`w-full justify-start text-left font-normal ${!date ? "text-slate-500" : ""}`}
                    onClick={togglePopover}
                >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {date?.from ? (
                        date.to ? (
                            <>
                                {format(date.from, "LLL dd, y")} - {format(date.to, "LLL dd, y")}
                            </>
                        ) : (
                            format(date.from, "LLL dd, y")
                        )
                    ) : (
                        <span>Pick a date range</span>
                    )}
                </Button>
            </div>

            {isPopoverOpen && (
                <div className="absolute top-12 left-0 z-50 p-4 bg-white rounded-xl shadow-2xl border border-slate-200 w-auto animate-in fade-in zoom-in-95 duration-200">
                    <div className="flex justify-between items-center mb-4 px-2">
                        <h3 className="font-semibold text-lg text-slate-900">Select Dates</h3>
                        <Button variant="ghost" size="sm" onClick={() => setIsPopoverOpen(false)} className="text-slate-500 hover:text-slate-900">Close</Button>
                    </div>
                    <DayPicker
                        mode="range"
                        defaultMonth={date?.from}
                        selected={date}
                        onSelect={setDate}
                        numberOfMonths={2}
                        pagedNavigation
                        disabled={{ before: new Date() }} // Disable past dates
                        showOutsideDays={false}
                        className="rounded-md border-0"
                    />
                </div>
            )}
        </div>
    );
}
