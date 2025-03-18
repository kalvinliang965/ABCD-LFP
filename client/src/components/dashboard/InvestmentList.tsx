import React, { useState } from "react";
import { Box, SimpleGrid, useDisclosure } from "@chakra-ui/react";
import InvestmentCard from "./InvestmentCard";
import AddInvestmentCard from "./AddInvestmentCard";
import InvestmentDetailModal from "./InvestmentDetailModal";

// Define investment type
type ReturnType = "fixed" | "normal";
type AccountType =
  | "non-retirement"
  | "pre-tax-retirement"
  | "after-tax-retirement";

interface Investment {
  id: string | number;
  name: string;
  description: string;
  date: string;
  icon: React.ReactElement;
  value: string;
  returnRate: number;
  returnType: ReturnType;
  expenseRatio: number;
  dividendType: ReturnType;
  dividendRate: number;
  taxability: "taxable" | "tax-exempt";
  accountType: AccountType;
  returnRateStdDev?: number;
  dividendRateStdDev?: number;
}

interface InvestmentListProps {
  investments: Investment[];
  onOpenInvestmentModal: () => void;
}

const InvestmentList: React.FC<InvestmentListProps> = ({
  investments,
  onOpenInvestmentModal,
}) => {
  // 设置状态来跟踪当前选中的投资项
  const [selectedInvestment, setSelectedInvestment] =
    useState<Investment | null>(null);

  // 使用Chakra UI的useDisclosure hook来管理模态窗口的状态
  const { isOpen, onOpen, onClose } = useDisclosure();

  // 处理投资卡片点击事件
  const handleInvestmentClick = (investment: Investment) => {
    setSelectedInvestment(investment);
    onOpen();
  };

  // 关闭模态窗口时清除选中的投资
  const handleCloseModal = () => {
    onClose();
    // 可选：延迟清除数据，以便有淡出动画
    setTimeout(() => setSelectedInvestment(null), 300);
  };

  // Helper function to truncate text
  const truncateText = (text: string, maxLength: number) => {
    return text.length > maxLength
      ? text.substring(0, maxLength) + "..."
      : text;
  };

  return (
    <Box mb={10} width="100%">
      <SimpleGrid
        columns={{ base: 1, sm: 2, md: 2, lg: 3, xl: 4, "2xl": 5 }}
        spacing={{ base: 4, md: 5, lg: 6 }}
        width="100%"
        autoRows="1fr"
      >
        {investments.map((investment) => (
          <InvestmentCard
            key={investment.id}
            investment={investment}
            onClick={() => handleInvestmentClick(investment)}
          />
        ))}

        <AddInvestmentCard onClick={onOpenInvestmentModal} />
      </SimpleGrid>

      {/* 投资详情模态窗口 */}
      <InvestmentDetailModal
        isOpen={isOpen}
        onClose={handleCloseModal}
        investment={selectedInvestment}
      />
    </Box>
  );
};

export default InvestmentList;
