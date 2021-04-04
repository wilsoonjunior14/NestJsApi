import * as mongoose from 'mongoose';


export const ImmobileSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },

    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },

    localization: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Localization",
        required: true
    },

    contract: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Contract",
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
    },

    deleted: {
        type: Boolean,
        required: true,
        default: false
    }

});

export interface Immobile extends mongoose.Document{
    id: string;
    name: string;
    user: any;
    contract: any;
    client: any;
    localization: any;
    createdAt: Date;
    updatedAt: Date;
    deleted: boolean;
}