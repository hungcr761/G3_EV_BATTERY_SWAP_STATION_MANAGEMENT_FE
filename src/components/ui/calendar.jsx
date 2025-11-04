import * as React from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { cn } from "../../lib/utils"
import { Button } from "./button"

const Calendar = ({ className, date, onDateSelect, mode = "single", ...props }) => {
  const [currentMonth, setCurrentMonth] = React.useState(() => {
    if (date?.from) {
      return new Date(date.from.getFullYear(), date.from.getMonth())
    }
    return new Date()
  })

  const today = new Date()
  const firstDayOfMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1)
  const lastDayOfMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0)
  const startingDayOfWeek = firstDayOfMonth.getDay()

  const daysInMonth = lastDayOfMonth.getDate()

  const previousMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1))
  }

  const nextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1))
  }

  const isSameDay = (date1, date2) => {
    if (!date1 || !date2) return false
    return (
      date1.getDate() === date2.getDate() &&
      date1.getMonth() === date2.getMonth() &&
      date1.getFullYear() === date2.getFullYear()
    )
  }

  const isDateInRange = (day) => {
    if (!date?.from || !date?.to) return false
    const dayDate = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day)
    return dayDate >= date.from && dayDate <= date.to
  }

  const handleDateClick = (day) => {
    const clickedDate = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day)
    
    if (mode === "range") {
      if (!date?.from || (date.from && date.to)) {
        // Start new range
        onDateSelect({ from: clickedDate, to: null })
      } else if (date.from && !date.to) {
        // Complete the range
        if (clickedDate < date.from) {
          // If clicked date is before from, swap them
          onDateSelect({ from: clickedDate, to: date.from })
        } else {
          onDateSelect({ from: date.from, to: clickedDate })
        }
      }
    } else {
      onDateSelect({ from: clickedDate, to: clickedDate })
    }
  }

  const monthName = currentMonth.toLocaleString("default", { month: "long", year: "numeric" })
  const weekDays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]

  const renderDay = (day) => {
    const dayDate = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day)
    const isToday = isSameDay(dayDate, today)
    const isSelectedFrom = date?.from && isSameDay(dayDate, date.from)
    const isSelectedTo = date?.to && isSameDay(dayDate, date.to)
    const isInRange = isDateInRange(day)

    return (
      <button
        key={day}
        type="button"
        onClick={() => handleDateClick(day)}
        className={cn(
          "relative flex h-9 w-9 items-center justify-center rounded-md text-sm transition-colors",
          "hover:bg-accent hover:text-accent-foreground",
          isToday && "font-semibold",
          isSelectedFrom && "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground",
          isSelectedTo && "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground",
          isInRange && !isSelectedFrom && !isSelectedTo && "bg-accent text-accent-foreground",
          isSelectedFrom && "rounded-l-md",
          isSelectedTo && "rounded-r-md"
        )}
      >
        {day}
      </button>
    )
  }

  return (
    <div className={cn("p-3", className)} {...props}>
      <div className="flex items-center justify-between mb-4">
        <Button
          variant="outline"
          size="icon"
          onClick={previousMonth}
          className="h-7 w-7"
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <div className="text-sm font-medium">{monthName}</div>
        <Button
          variant="outline"
          size="icon"
          onClick={nextMonth}
          className="h-7 w-7"
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
      <div className="grid grid-cols-7 gap-1 mb-1">
        {weekDays.map((day) => (
          <div key={day} className="text-center text-xs font-medium text-muted-foreground h-9 flex items-center justify-center">
            {day}
          </div>
        ))}
      </div>
      <div className="grid grid-cols-7 gap-1">
        {Array.from({ length: startingDayOfWeek }).map((_, i) => (
          <div key={`empty-${i}`} className="h-9" />
        ))}
        {Array.from({ length: daysInMonth }, (_, i) => i + 1).map(renderDay)}
      </div>
    </div>
  )
}

Calendar.displayName = "Calendar"

export { Calendar }

