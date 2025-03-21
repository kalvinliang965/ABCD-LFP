import mongoose, { Schema, Document} from "mongoose";
import { TaxFilingStatus } from "../../core/Enums";

interface IStandardDeduction extends Document {
    amount: number;
    taxpayer_types: TaxFilingStatus.SINGLE | TaxFilingStatus.MARRIED;
}

const StandardDeductionSchema = new Schema<IStandardDeduction>({
    amount: {
        type: Number,
        required: true,
    },
    taxpayer_types: {
        type: String,
        required: true,
        enum: [TaxFilingStatus.SINGLE, TaxFilingStatus.MARRIED],
    }
});

const StandardDeduction = mongoose.model<IStandardDeduction>("StandardDeduction", StandardDeductionSchema);

export default StandardDeduction;
