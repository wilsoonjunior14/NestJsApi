import * as mongoose from 'mongoose';
import { Immobile } from '../../../dist/controllers/immobile/immobile.model';


export const ContractSchema = new mongoose.Schema({

    beginDate: {
        type: Date,
        required: true
    },

    endDate: {
        type: Date,
        required: true
    },

    deleted: {
        type: Boolean,
        required: true,
        default: false
    },

    immobile: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Immobile",
        required: true
    },

    monthValue: {
        type: Number,
        required: true
    },

    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    },

    updatedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    },

    createdAt: {
        type: Date,
        required: true,
        default: Date.now()
    },

    updatedAt: {
        type: Date,
        required: true,
        default: Date.now()
    }

});

export interface Contract extends mongoose.Document {
    _id: string;
    beginDate: Date;
    endDate: Date;
    createdAt: Date;
    updatedAt: Date;
    updatedBy: any;
    createdBy: any;
    deleted: boolean;
    immobile: any;
    monthValue: number;
};