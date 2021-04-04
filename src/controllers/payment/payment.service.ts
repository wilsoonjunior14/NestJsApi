import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from 'mongoose';
import { Payment, PaymentStatus } from './payment.model';


@Injectable()
export class PaymentService{

    constructor(@InjectModel("Payment") private readonly paymentModel: Model<Payment>){
    }

    public async findByQuery(query: any){
        return await this.paymentModel.aggregate([
            {
                "$match": query
            },
            {
                "$lookup": {
                    "localField": "contract",
                    "from": "contracts",
                    "foreignField": "_id",
                    "as": "contract",
                }
            },
            {
                "$sort": {
                    "paymentDate": 1
                }
            }
        ]);
    }

    public async findById(id: string){
        return await this.paymentModel.findOne({_id: id});
    }

    public async update(payment){
        return await this.paymentModel.updateOne({_id: payment._id}, payment);
    }

    public async save(payment){
        return await new this.paymentModel(payment).save();
    }

    public applyImmobileOfContractToPayment(paymentsList, contractsList){
        paymentsList.forEach(payment => {
            let contractId = payment.contract[0]._id.toString();
            
            payment.immobile = contractsList.filter(contract => {
                return contract._id.toString() === contractId;
            })[0].immobile;
        });
    }

    public async generatePaymentsForContract(contract: any, currentUser: any){
        let startDate:any = new Date(contract.beginDate);
        let endDate:any = new Date(contract.endDate);
        let differenceInMonthsAmoungDates = Math.floor(Math.abs(startDate - endDate)/(1000*60*60*24*30));

        let payments = [];
        payments.push(Object.assign(this.getPaymentBaseByContractAndUser(contract, currentUser), 
            {
                paymentDate: contract.beginDate,
                paymentCode: this.getNewPaymentCode(1)
            }
        ));

        for (var index = 2; index < differenceInMonthsAmoungDates + 1; index ++){
            let nDate = new Date(contract.beginDate);
            let modifiedDate = new Date(nDate.setMonth(nDate.getMonth() + index));
            let nextDate = modifiedDate.getFullYear() + "-" + this.getCurrentMonth(modifiedDate) + "-" + contract.paymentDay;

            payments.push(Object.assign(this.getPaymentBaseByContractAndUser(contract, currentUser), 
            {
                paymentDate: nextDate,
                paymentCode: this.getNewPaymentCode(index)
            }
            ));
        }

        payments.forEach(item => {
            new this.paymentModel(item).save();
        }); 

        return payments;
    }

    public getCurrentMonth(date){
        let value = date.getMonth();
        if (value === 0) return 12;
        if (value < 10) return "0"+value;
        return value;
    }

    public async getNewPaymentCode(index){
        let allPayments = await (await this.findByQuery({})).length;
        return "P" + (allPayments + index) + new Date().getFullYear()
    }

    public getPaymentBaseByContractAndUser(contract, user){
        return {
            contract: contract._id,
            paymentStatus: PaymentStatus.WAITING_PAYMENT,
            value: contract.monthValue,
            createdAt: Date.now(),
            updatedAt: Date.now(),
            createdBy: user._id,
            updatedBy: user._id,
            deleted: false,
        }
    }

}