import * as mongoose from 'mongoose';
import {RoleSchema} from '../role/role.model';

export const GroupSchema = new mongoose.Schema({
    description: {
        type: String,
        required: true
    },
    deleted: {
        type: Boolean,
        required: true,
        default: false,
    }

});

export interface Group extends mongoose.Document {
    id: string;
    description: string;
    deleted: boolean;
};