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

    client: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
    },

    localization: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Localization",
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
    client: any;
    localization: any;
    createdAt: Date;
    updatedAt: Date;
    deleted: boolean;
}