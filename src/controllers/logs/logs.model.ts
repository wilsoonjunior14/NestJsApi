import * as mongoose from 'mongoose';


export const LogsSchema = new mongoose.Schema({

    data: {
        type: String,
        required: true
    },

    message: {
        type: String
    },

    ip: {
        type: String,
        required: true
    },

    method: {
        type: String,
        required: true
    },

    status: {
        type: Number,
        required: true
    },

    headers: {
        type: String,
        required: true
    },

    user: {
        type: String,
        required: true
    },

    createdAt: {
        type: Date,
        required: true,
        default: Date.now()
    }


});

export interface LogsModel extends mongoose.Document{
    id: string;
    data: string;
    message: string;
    headers: string;
    ip: string;
    method: string;
    user: string;
    createdAt: Date
};