import { TaxFilingStatus } from "../../core/Enums";
import { simulation_logger } from "../../utils/logger/logger";
import StandardDeductionModel, { IStandardDeduction } from "../models/standard_deduction";


export const create_standard_deduction_in_db = async (
    amount: number,
    taxpayer_type: TaxFilingStatus
): Promise<void> => {
    try {
        await StandardDeductionModel.create({amount, taxpayer_type})
        simulation_logger.info("Succesfully added standard Deduction", {
            amount, 
            taxpayer_type
        });
    } catch (error) {
        simulation_logger.error(`Internel Service error: ${(error as Error).message}`);
        throw new Error(`Internel Service error: ${(error as Error).message}`);
    }
}

export const get_standard_deduction_from_db = async (): Promise<IStandardDeduction[]> => {
    try {
        const standard_deduction_list = await StandardDeductionModel.find();
        simulation_logger.info(`Successfully loaded ${standard_deduction_list.length} standard deduction data`);
        return standard_deduction_list;
    } catch (error) {
        simulation_logger.error(`Internel Service Error: ${error}`)
        throw new Error(`Internel Service Error: ${error}`)
    }
}

export const delete_all_standard_deduction_from_db = async () => {
    try {
        await StandardDeductionModel.deleteMany({});
    } catch(error) {
        simulation_logger.error(`Internel Service Error: ${error}`)
        throw new Error(`Internel Service Error: ${error}`)
    }
}
