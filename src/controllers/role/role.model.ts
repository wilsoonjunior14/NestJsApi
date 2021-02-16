import * as mongoose from 'mongoose';

export const RoleSchema = new mongoose.Schema({
    description: {
        type: String,
        required: true
    },
    deleted: {
        type: Boolean,
        required: true,
        default: false
    }
});

export interface Role extends mongoose.Document {
    id: string;
    description: string;
    deleted: boolean;
};