import axios from "axios";
import { InvestmentType } from "../types/investmentTypes";
import { appConfig } from "../config/appConfig";
import { Taxability } from "../types/Enum";

// API base URL
export const API_URL = appConfig.api.baseURL + "/api";

