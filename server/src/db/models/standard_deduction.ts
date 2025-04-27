import mongoose, { Schema, Document} from "mongoose";
import { TaxFilingStatus } from "../../core/Enums";

export interface IStandardDeduction extends Document {
    amount: number;
    taxpayer_type: TaxFilingStatus.INDIVIDUAL | TaxFilingStatus.COUPLE;
}

const StandardDeductionSchema = new Schema<IStandardDeduction>({
    amount: {
        type: Number,
        required: true,
    },
    taxpayer_type: {
        type: String,
        required: true,
        enum: [TaxFilingStatus.INDIVIDUAL, TaxFilingStatus.COUPLE],
    }
});

const StandardDeduction = mongoose.model<IStandardDeduction>("StandardDeduction", StandardDeductionSchema);

export default StandardDeduction;
