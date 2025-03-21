import mongoose, { Schema, Document} from "mongoose";

interface ITaxBracket extends Document {
    min: number;
    max: number;
    rate: number;
    bracket_types: "CAPITAL_GAINS" | "TAXABLE_INCOME";
    taxpayer_types: "SINGLE" | "MARRIED";
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
    bracket_types: {
        type: String,
        required: true,
        enum: ["capital_gains", "taxable_income"],
    },
    taxpayer_types: {
        type: String,
        required: true,
        enum: ["SINGLE", "MARRIED"],
    }
});

const TaxBracket = mongoose.model<ITaxBracket>("TaxBracket", TaxBracketSchema);

export default TaxBracket;
