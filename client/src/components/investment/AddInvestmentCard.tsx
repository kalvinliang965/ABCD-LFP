import React from "react";
import { AddContentCard } from "../common";

interface AddInvestmentCardProps {
  onClick: () => void;
}

const AddInvestmentCard: React.FC<AddInvestmentCardProps> = ({ onClick }) => {
  return <AddContentCard text="Add New Investment" onClick={onClick} />;
};

export default AddInvestmentCard;
