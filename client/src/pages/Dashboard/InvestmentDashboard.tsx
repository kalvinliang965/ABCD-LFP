import React, { useState, useEffect } from "react";
import "./InvestmentDashboard.css";
import {
  FaPlus,
  FaChartLine,
  FaWallet,
  FaHistory,
  FaCog,
  FaSignOutAlt,
  FaSearch,
  FaFilter,
} from "react-icons/fa";

// 模拟数据
const investmentData = [
  {
    id: 1,
    name: "Stock Portfolio",
    date: "2023-11-10",
    status: "In Progress",
    progress: 75,
    icon: "📈",
    value: 25000,
    returnRate: 8.5,
  },
  {
    id: 2,
    name: "Bond Fund",
    date: "2023-10-15",
    status: "Completed",
    progress: 100,
    icon: "💰",
    value: 15000,
    returnRate: 4.2,
  },
  {
    id: 3,
    name: "Real Estate Trust",
    date: "2023-12-20",
    status: "In Progress",
    progress: 45,
    icon: "🏢",
    value: 50000,
    returnRate: 6.8,
  },
  {
    id: 4,
    name: "Cryptocurrency",
    date: "2023-09-05",
    status: "Rejected",
    progress: 30,
    icon: "🪙",
    value: 5000,
    returnRate: -12.5,
  },
  {
    id: 5,
    name: "Gold ETF",
    date: "2023-11-25",
    status: "Pending",
    progress: 60,
    icon: "🔶",
    value: 10000,
    returnRate: 3.1,
  },
];

const InvestmentDashboard: React.FC = () => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [investments, setInvestments] = useState(investmentData);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [sortBy, setSortBy] = useState("date");
  const [sortOrder, setSortOrder] = useState("desc");
  const [newInvestment, setNewInvestment] = useState({
    name: "",
    description: "",
    returnType: "fixed",
    expenseRatio: 0,
    dividendType: "fixed",
    taxability: "taxable",
  });

  // 计算总投资价值和总支出
  const totalInvestmentValue = investments.reduce(
    (sum, inv) => sum + inv.value,
    0
  );
  const totalExpenses = investments.reduce(
    (sum, inv) => sum + inv.value * 0.01,
    0
  ); // 假设1%的费用率

  // 过滤和排序投资
  const filteredInvestments = investments
    .filter((inv) => inv.name.toLowerCase().includes(searchTerm.toLowerCase()))
    .filter((inv) =>
      filterStatus === "all" ? true : inv.status === filterStatus
    )
    .sort((a, b) => {
      if (sortBy === "name") {
        return sortOrder === "asc"
          ? a.name.localeCompare(b.name)
          : b.name.localeCompare(a.name);
      } else if (sortBy === "value") {
        return sortOrder === "asc" ? a.value - b.value : b.value - a.value;
      } else if (sortBy === "returnRate") {
        return sortOrder === "asc"
          ? a.returnRate - b.returnRate
          : b.returnRate - a.returnRate;
      } else {
        // date
        return sortOrder === "asc"
          ? new Date(a.date).getTime() - new Date(b.date).getTime()
          : new Date(b.date).getTime() - new Date(a.date).getTime();
      }
    });

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => {
    const { id, value } = e.target;
    setNewInvestment((prev) => ({
      ...prev,
      [id]: value,
    }));
  };

  const handleCreateInvestment = (e: React.FormEvent) => {
    e.preventDefault();

    // 创建新投资
    const newInv = {
      id: investments.length + 1,
      name: newInvestment.name,
      date: new Date().toISOString().split("T")[0],
      status: "In Progress",
      progress: 0,
      icon: "💼",
      value: 10000, // 默认值
      returnRate: 5, // 默认值
    };

    setInvestments([...investments, newInv]);
    setShowModal(false);

    // 重置表单
    setNewInvestment({
      name: "",
      description: "",
      returnType: "fixed",
      expenseRatio: 0,
      dividendType: "fixed",
      taxability: "taxable",
    });
  };

  // 自动调整侧边栏
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 768) {
        setSidebarOpen(false);
      } else {
        setSidebarOpen(true);
      }
    };

    window.addEventListener("resize", handleResize);
    handleResize(); // 初始化

    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <div className="dashboard-container">
      {/* 左侧导航栏 */}
      <div
        className={`sidebar ${sidebarOpen ? "open" : "closed"}`}
        onMouseEnter={() => setSidebarOpen(true)}
        onMouseLeave={() => setSidebarOpen(false)}
      >
        <div className="sidebar-header">
          <h3>ByeWind</h3>
        </div>
        <div className="sidebar-menu">
          <div className="menu-item">
            <span className="menu-icon">
              <FaChartLine />
            </span>
            <span className="menu-text">Overview</span>
          </div>
          <div className="menu-item active">
            <span className="menu-icon">
              <FaWallet />
            </span>
            <span className="menu-text">Investments</span>
          </div>
          <div className="menu-item">
            <span className="menu-icon">
              <FaHistory />
            </span>
            <span className="menu-text">Transactions</span>
          </div>
          <div className="menu-item">
            <span className="menu-icon">
              <FaCog />
            </span>
            <span className="menu-text">Settings</span>
          </div>
          <div className="menu-item">
            <span className="menu-icon">
              <FaSignOutAlt />
            </span>
            <span className="menu-text">Logout</span>
          </div>
        </div>
      </div>

      {/* 主内容区 */}
      <div className={`main-content ${sidebarOpen ? "" : "expanded"}`}>
        <div className="dashboard-header">
          <h1>Investment Dashboard</h1>
          <div className="user-profile">
            <img src="https://via.placeholder.com/40" alt="User Avatar" />
          </div>
        </div>

        {/* 搜索和筛选 */}
        <div className="search-filter-container">
          <div className="search-box">
            <FaSearch className="search-icon" />
            <input
              type="text"
              placeholder="Search investments..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="filter-options">
            <div className="filter-group">
              <label>Status:</label>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
              >
                <option value="all">All</option>
                <option value="In Progress">In Progress</option>
                <option value="Completed">Completed</option>
                <option value="Pending">Pending</option>
                <option value="Rejected">Rejected</option>
              </select>
            </div>

            <div className="filter-group">
              <label>Sort By:</label>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
              >
                <option value="date">Date</option>
                <option value="name">Name</option>
                <option value="value">Value</option>
                <option value="returnRate">Return Rate</option>
              </select>
            </div>

            <div className="filter-group">
              <label>Order:</label>
              <select
                value={sortOrder}
                onChange={(e) => setSortOrder(e.target.value)}
              >
                <option value="desc">Descending</option>
                <option value="asc">Ascending</option>
              </select>
            </div>
          </div>
        </div>

        {/* 统计卡片 */}
        <div className="stats-container">
          <div className="stat-card">
            <div className="stat-icon">📊</div>
            <div className="stat-content">
              <h3>Total Investments</h3>
              <div className="stat-value">{investments.length}</div>
              <div className="stat-change positive">+11.02%</div>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon">💸</div>
            <div className="stat-content">
              <h3>Total Expenses</h3>
              <div className="stat-value">
                ¥{totalExpenses.toLocaleString()}
              </div>
              <div className="stat-change negative">-0.03%</div>
            </div>
          </div>
        </div>

        {/* 投资卡片网格 */}
        <div className="investment-grid">
          {filteredInvestments.map((investment) => (
            <div className="investment-card" key={investment.id}>
              <div className="card-header">
                <div className="card-title">{investment.name}</div>
                <div className="card-icon">{investment.icon}</div>
              </div>
              <div className="card-date">Updated: {investment.date}</div>
              <div className="card-value">
                <span>Value: ¥{investment.value.toLocaleString()}</span>
                <span
                  className={
                    investment.returnRate >= 0 ? "positive" : "negative"
                  }
                >
                  {investment.returnRate > 0 ? "+" : ""}
                  {investment.returnRate}%
                </span>
              </div>
              <div className="card-status">
                <span className={`status-badge ${investment.status}`}>
                  {investment.status}
                </span>
              </div>
              <div className="progress-bar">
                <div
                  className="progress-fill"
                  style={{ width: `${investment.progress}%` }}
                ></div>
              </div>
              <div className="progress-text">{investment.progress}%</div>
            </div>
          ))}

          {/* 添加新投资卡片 */}
          <div
            className="investment-card add-card"
            onClick={() => setShowModal(true)}
          >
            <div className="add-icon">
              <FaPlus />
            </div>
            <div className="add-text">Add New Investment</div>
          </div>
        </div>
      </div>

      {/* 新建投资模态框 */}
      {showModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h2>Create New Investment</h2>
              <button
                className="close-button"
                onClick={() => setShowModal(false)}
              >
                ×
              </button>
            </div>
            <div className="modal-body">
              <form
                className="investment-form"
                onSubmit={handleCreateInvestment}
              >
                <div className="form-group">
                  <label htmlFor="name">Name</label>
                  <input
                    type="text"
                    id="name"
                    placeholder="Enter investment name"
                    value={newInvestment.name}
                    onChange={handleInputChange}
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="description">Description</label>
                  <textarea
                    id="description"
                    placeholder="Enter investment description"
                    value={newInvestment.description}
                    onChange={handleInputChange}
                  ></textarea>
                </div>

                <div className="form-group">
                  <label htmlFor="returnType">Expected Annual Return</label>
                  <select
                    id="returnType"
                    value={newInvestment.returnType}
                    onChange={handleInputChange}
                  >
                    <option value="fixed">Fixed Amount</option>
                    <option value="normal">
                      Sampled from Normal Distribution
                    </option>
                    <option value="gbm">Geometric Brownian Motion (GBM)</option>
                  </select>
                </div>

                <div className="form-group">
                  <label htmlFor="expenseRatio">Expense Ratio (%)</label>
                  <input
                    type="number"
                    id="expenseRatio"
                    placeholder="Annual expense ratio"
                    step="0.01"
                    value={newInvestment.expenseRatio}
                    onChange={handleInputChange}
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="dividendType">Expected Annual Income</label>
                  <select
                    id="dividendType"
                    value={newInvestment.dividendType}
                    onChange={handleInputChange}
                  >
                    <option value="fixed">Fixed Amount</option>
                    <option value="normal">
                      Sampled from Normal Distribution
                    </option>
                    <option value="gbm">Geometric Brownian Motion (GBM)</option>
                  </select>
                </div>

                <div className="form-group">
                  <label htmlFor="taxability">Taxability</label>
                  <select
                    id="taxability"
                    value={newInvestment.taxability}
                    onChange={handleInputChange}
                  >
                    <option value="exempt">
                      Tax-Exempt (e.g., Municipal Bonds)
                    </option>
                    <option value="taxable">Taxable</option>
                  </select>
                </div>

                <div className="form-actions">
                  <button
                    type="button"
                    className="cancel-button"
                    onClick={() => setShowModal(false)}
                  >
                    Cancel
                  </button>
                  <button type="submit" className="submit-button">
                    Create
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default InvestmentDashboard;
