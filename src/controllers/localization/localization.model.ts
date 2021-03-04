import * as mongoose from 'mongoose';

export const LocalizationSchema = new mongoose.Schema({
    address: {
        type: String,
        required: true
    },

    city: {
        type: String,
        required: true
    },

    neighborhood: {
        type: String,
        required: true
    },

    zipCode: {
        type: String,
        required: true
    },

    number: {
        type: Number,
        required: true
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

export interface Localization extends mongoose.Document {
    id: string;
    address: string;
    zipCode: string;
    city: string;
    createdAt: Date;
    updatedAt: Date;
    number: number;
    neighborhood: string;
};