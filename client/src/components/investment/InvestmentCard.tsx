import React from "react";
import { type InvestmentCardProps } from "../../types/investmentTypes";
import Card from "../common/Card";


const InvestmentCard: React.FC<InvestmentCardProps> = ({
  investmentType,
  onClick,
}) => {
  return (
    <Card
      title={investmentType.name}
      subtitle={`Updated: ${investmentType.updatedAt || investmentType.createdAt}`}
      description={investmentType.description}
      onClick={onClick}
      leftBadge={{
        text: investmentType.taxability ? "Taxable" : "Tax-exempt",
        colorScheme: investmentType.taxability ? "red" : "green",
      }}
      rightBadge={{
        text: String(investmentType.returnDistribution.get("type")),
        variant: "outline",
      }}
    />
  );
};

export default InvestmentCard;
