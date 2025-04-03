import React from "react";
import { EventSeriesType } from "../../types/eventSeries";
import { IncomeEventSeriesForm } from "./IncomeEventSeriesForm";
import { ExpenseEventSeriesForm } from "./ExpenseEventSeriesForm";
import { InvestEventSeriesForm } from "./InvestEventSeriesForm";
import { RebalanceEventSeriesForm } from "./RebalanceEventSeriesForm";
import { Investment } from "../../components/scenarios/InvestmentsForm";

export interface EventSeriesFormProps {
  initialType?: EventSeriesType;
  eventSeriesType?: EventSeriesType;
  onBack?: () => void;
  onEventAdded?: (event: any) => void;
  isCompactMode?: boolean;
  existingEvents: { name: string }[];
  investments?: Investment[];
}

export const EventSeriesForm: React.FC<EventSeriesFormProps> = ({
  initialType,
  eventSeriesType,
  onBack,
  onEventAdded,
  isCompactMode = false,
  existingEvents,
  investments = [],
}) => {
  const eventType = eventSeriesType || initialType;

  switch (eventType) {
    case "income":
      return (
        <IncomeEventSeriesForm
          onBack={onBack}
          onEventAdded={onEventAdded}
          existingEvents={existingEvents}
        />
      );
    case "expense":
      return (
        <ExpenseEventSeriesForm
          onBack={onBack}
          onEventAdded={onEventAdded}
          existingEvents={existingEvents}
        />
      );
    case "invest":
      return (
        <InvestEventSeriesForm
          onBack={onBack}
          onEventAdded={onEventAdded}
          existingEvents={existingEvents}
          investments={investments}
        />
      );
    case "rebalance":
      return (
        <RebalanceEventSeriesForm
          onBack={onBack}
          onEventAdded={onEventAdded}
          existingEvents={existingEvents}
          investments={investments}
        />
      );
    default:
      return <div>Please select a valid event type.</div>;
  }
};

export default EventSeriesForm;
