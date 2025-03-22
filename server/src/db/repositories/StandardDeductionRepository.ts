import { TaxFilingStatus } from "../../core/Enums";
import StandardDeductionModel, { IStandardDeduction } from "../models/standard_deduction";


const save_standard_deduction = async (
    amount: number,
    taxpayer_type: TaxFilingStatus
): Promise<void> => {
    try {
        await StandardDeductionModel.create({amount, taxpayer_type})
        console.log(`Standard Deduction added succesfully: amount: ${amount}, taxpayer: ${taxpayer_type}`);
    } catch (error) {
        throw new Error(`Internel Service error ${(error as Error).message}`);
    }
}

const load_standard_deduction = async (): Promise<IStandardDeduction[]> => {
    try {
        const standard_deduction_list = await StandardDeductionModel.find();
        return standard_deduction_list;
    } catch (error) {
        throw new Error(`Internel Service Error: ${error}`)
    }
}

export {
    save_standard_deduction,
    load_standard_deduction,
}