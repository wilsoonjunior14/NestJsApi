import * as mongoose from 'mongoose';

export const GroupSchema = new mongoose.Schema({
    description: {
        type: String,
        required: true
    },
    deleted: {
        type: Boolean,
        required: true,
        default: false,
    },
    roles: {
        type: [{
            type: mongoose.Schema.Types.ObjectId,
            ref: "Role"
        }],
        default: []
    }
});

export interface Group extends mongoose.Document {
    id: string;
    description: string;
    deleted: boolean;
    roles: string;
};