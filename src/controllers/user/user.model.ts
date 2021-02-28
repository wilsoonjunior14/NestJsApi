import * as mongoose from 'mongoose';

export const UserSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true
    },
    phone: {
        type: String,
        required: true
    },
    cpfCnpj: {
        type: String,
        required: true
    },
    deleted: {
        type: Boolean,
        required: true,
        default: false
    },
    createdAt: {
        type: Date,
        required: true,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        required: true,
        default: Date.now
    },
    group: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Group",
        default: ""
    },
    password: {
        type: String,
        required: true
    }

});

export interface User extends mongoose.Document {
    id: string,
    name: string,
    email: string,
    phone: string,
    deleted: boolean,
    cpfCnpj: string,
    createdAt: Date,
    updatedAt: Date,
    group: any,
    password: string
}