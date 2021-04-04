import * as mongoose from 'mongoose';

export enum PaymentStatus {
    WAITING_PAYMENT = "Aguardando Pagamento",
    PROCESSING_PAYMENT = "Processando Pagamento",
    ANALYSING_PAYMENT = "Pagamento em Análise",
    ACCEPTED_PAYMENT = "Pagamento Aceito",
    REJECTED_PAYMENT = "Pagamento Rejeitado"
};

export const PaymentSchema = new mongoose.Schema({

    paymentDate: {
        type: Date,
        required: true
    },

    paymentConfirmedDate: {
        type: Date
    },

    contract: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Contract",
        required: true
    },

    paymentStatus: {
        type: String,
        required: true
    },

    paymentCode: {
        type: String,
        required: true
    },

    value: {
        type: Number,
        required: true
    },

    amountPaid: {
        type: Number,
    },

    documentLink: {
        type: String,
    },

    paymentLink: {
        type: String,
    },

    createdAt: {
        type: Date,
        required: true
    },

    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },

    updatedAt: {
        type: Date,
        required: true
    },

    deleted: {
        type: Boolean,
        required: true,
        default: false
    },

    updatedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },

});

export interface Payment extends mongoose.Document{
    _id: string;
    paymentDate: Date;
    paymentConfirmedDate: Date;
    paymentLink: string;
    paymentStatus: string;
    contract: any;
    createdAt: Date;
    updatedAt: Date;
    createdBy: any;
    updatedBy: any;
    value: number;
    documentLink: any;
}

