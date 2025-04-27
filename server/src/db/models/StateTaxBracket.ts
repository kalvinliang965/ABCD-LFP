
import mongoose, { Schema, Document} from "mongoose";
import { TaxFilingStatus, IncomeType, StateType } from "../../core/Enums";

export interface IStateTaxBracket extends Document {
    min: number;
    max: number;
    rate: number;
    taxpayer_type: TaxFilingStatus.INDIVIDUAL | TaxFilingStatus.COUPLE;
    resident_state: StateType.CT | StateType.NJ | StateType.NY;
}

const StateTaxBracketSchema = new Schema<IStateTaxBracket>({
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
    taxpayer_type: {
        type: String,
        required: true,
        enum: [TaxFilingStatus.INDIVIDUAL, TaxFilingStatus.COUPLE],
    },
    resident_state: {
        type: String,
        required: true,
        enum: [StateType.CT, StateType.NJ, StateType.NY],
    }
});

export const StateTaxBracket = mongoose.model<IStateTaxBracket>("StateTaxBracket", StateTaxBracketSchema);

export default StateTaxBracket;
