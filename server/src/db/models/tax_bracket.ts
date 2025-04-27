import mongoose, { Schema, Document} from "mongoose";
import { TaxFilingStatus, IncomeType } from "../../core/Enums";

export interface ITaxBracket extends Document {
    min: number;
    max: number;
    rate: number;
    income_type: IncomeType.CAPITAL_GAINS | IncomeType.TAXABLE_INCOME;
    taxpayer_type: TaxFilingStatus.INDIVIDUAL | TaxFilingStatus.COUPLE;
}

const TaxBracketSchema = new Schema<ITaxBracket>({
    min: {
        type: Number,
        required: true,
    },
    max: {
        type: Schema.Types.Number,
        required: true,
    },
    rate: {
        type: Number,
        required: true,
    },
    income_type: {
        type: String,
        required: true,
        enum: [IncomeType.CAPITAL_GAINS, IncomeType.TAXABLE_INCOME],
    },
    taxpayer_type: {
        type: String,
        required: true,
        enum: [TaxFilingStatus.INDIVIDUAL, TaxFilingStatus.COUPLE],
    }
});

export const TaxBracket = mongoose.model<ITaxBracket>("TaxBracket", TaxBracketSchema);

export default TaxBracket;
