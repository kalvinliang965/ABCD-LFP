import React from 'react';
import { Routes, Route } from 'react-router-dom';

import EventSeriesSection from '../components/event_series/EventSeriesSection';
import { AddedEvent } from '../components/event_series/EventSeriesSection';
import { useEventSeries } from '../contexts/EventSeriesContext';

export const EventSeriesRoutes: React.FC = () => {
  const { eventSeries, handleAddEventSeries } = useEventSeries();

  const handleDeleteEvent = async (id: string) => {
    //to do?
  };

  return (
    <Routes>
      <Route
        path="/new-scenario/event-series"
        element={
          <EventSeriesSection
            addedEvents={eventSeries}
            handleDeleteEvent={handleDeleteEvent}
            handleEventAdded={handleAddEventSeries as (event: AddedEvent) => void}
            handleSaveAndContinue={() => {}}
            handleBackToInvestments={() => {}}
          />
        }
      />
    </Routes>
  );
};
