import React from "react";
import { type InvestmentCardProps } from "../../types/investment";
import Card from "../common/Card";

const InvestmentCard: React.FC<InvestmentCardProps> = ({
  investment,
  onClick,
}) => {
  return (
    <Card
      title={investment.name}
      subtitle={`Updated: ${investment.lastUpdated || investment.date}`}
      description={investment.description}
      onClick={onClick}
      leftBadge={{
        text: investment.taxability === "taxable" ? "Taxable" : "Tax-exempt",
        colorScheme: investment.taxability === "taxable" ? "red" : "green",
      }}
      rightBadge={{
        text: String(investment.returnType),
        variant: "outline",
      }}
    />
  );
};

export default InvestmentCard;
