import mongoose, { Schema, Document} from "mongoose";

interface IStandardDeduction extends Document {
    amount: number;
    taxpayer_types: "SINGLE" | "MARRIED";
}

const StandardDeductionSchema = new Schema<IStandardDeduction>({
    amount: {
        type: Number,
        required: true,
    },
    taxpayer_types: {
        type: String,
        required: true,
        enum: ["SINGLE", "MARRIED"],
    }
});

const StandardDeduction = mongoose.model<IStandardDeduction>("StandardDeduction", StandardDeductionSchema);

export default StandardDeduction;
