import React, { createContext, useContext, useState } from 'react';

import { EventSeries, EventSeriesType } from '../types/eventSeries';

interface EventSeriesContextType {
  showForm: boolean;
  setShowForm: (show: boolean) => void;
  selectedType: EventSeriesType | null;
  setSelectedType: (type: EventSeriesType | null) => void;
  eventSeries: EventSeries[];
  setEventSeries: (series: EventSeries[]) => void;
  handleAddEventSeries: (newSeries: EventSeries) => void;
}

const EventSeriesContext = createContext<EventSeriesContextType | undefined>(undefined);

export function EventSeriesProvider({ children }: { children: React.ReactNode }) {
  const [showForm, setShowForm] = useState(false);
  const [selectedType, setSelectedType] = useState<EventSeriesType | null>(null);
  const [eventSeries, setEventSeries] = useState<EventSeries[]>([]);

  const handleAddEventSeries = (newSeries: EventSeries) => {
    setEventSeries([...eventSeries, newSeries]);
    setShowForm(false);
    setSelectedType(null);
  };

  return (
    <EventSeriesContext.Provider
      value={{
        showForm,
        setShowForm,
        selectedType,
        setSelectedType,
        eventSeries,
        setEventSeries,
        handleAddEventSeries,
      }}
    >
      {children}
    </EventSeriesContext.Provider>
  );
}

export function useEventSeries() {
  const context = useContext(EventSeriesContext);
  if (context === undefined) {
    throw new Error('useEventSeries must be used within an EventSeriesProvider');
  }
  return context;
}
