import { Controller, Get, Req, Post, Body, Put, Delete, Param } from '@nestjs/common';
import { Utils } from '../../utils/Utils';
import { LogsService } from '../logs/logs.service';
import { UserService } from '../user/user.service';
import { GroupService } from '../group/group.service';
import { PaymentService } from './payment.service';
import { Constants } from 'src/utils/Contansts';
import { ContractService } from '../contract/contract.service';
import { PaymentStatus } from './payment.model';

@Controller('payment')
export class PaymentController {

    private utils: Utils;

    constructor(private logsService: LogsService, 
        private userService: UserService,
        private groupService: GroupService,
        private paymentService: PaymentService,
        private contractService: ContractService){
        this.utils = new Utils(this.logsService, this.userService, this.groupService);
    }

    @Get()
    public async getAll(@Req() request){
        try{
            const allPayments = await this.paymentService.findByQuery({deleted: false});
            const allContracts = await this.contractService.findByQuery({deleted: false});

            await this.paymentService.applyImmobileOfContractToPayment(allPayments, allContracts);

            return this.utils.getResponse(Constants.SUCCESS_MESSAGE_OPERATION, allPayments, request);
        } catch(err){
            return this.utils.getInternalServerError(err.toString(), err, request);
        }
    }

    @Put()
    public async updatePayment(@Body() payment, @Req() request){
        try{

            const permissionsChecked = await this.utils.userHasPermissionForAction(request, Constants.ROLE_CRUD_CONTRACT);
            const currentUser = permissionsChecked.currentUser;

            if (permissionsChecked.invalid){
                return await this.utils.getInternalServerError(permissionsChecked.message, payment, request);
            }

            let validation = this.validatePayment(payment, true);
            if (validation.invalid){
                return this.utils.getInternalServerError(validation.message, payment, request);
            }

            let oldPayment = await this.paymentService.findById(payment._id);
            oldPayment = Object.assign(oldPayment, {
                value: parseFloat(payment.value),
                paymentDate: payment.paymentDate,
                amountPaid: payment.amountPaid ? parseFloat(payment.amountPaid) : null,
                paymentStatus: payment.paymentStatus,
                updatedAt: Date.now(),
                updatedBy: currentUser["_id"]
            });

            const results = await this.paymentService.update(oldPayment);

            return this.utils.getResponse(Constants.SUCCESS_MESSAGE_OPERATION, results, request);
        } catch(err){
            return this.utils.getInternalServerError(err.toString(), err, request);
        }
    }

    @Delete('/:id')
    public async deletePayment(@Param('id') id: string, @Req() request){
        try{

            const permissionsChecked = await this.utils.userHasPermissionForAction(request, Constants.ROLE_CRUD_CONTRACT);
            const currentUser = permissionsChecked.currentUser;

            if (permissionsChecked.invalid){
                return await this.utils.getInternalServerError(permissionsChecked.message, {}, request);
            }
            
            let oldPayment:any = await this.paymentService.findById(id);
            oldPayment.deleted = true;
            oldPayment.updatedAt = Date.now();
            oldPayment.updatedBy = currentUser["_id"];

            const results = await this.paymentService.update(oldPayment);

            return this.utils.getResponse(Constants.SUCCESS_MESSAGE_OPERATION, results, request);
        } catch(err){
            return this.utils.getInternalServerError(err.toString(), err, request);
        }
    }

    @Post()
    public async create(@Body() payment, @Req() request){
        try{
            const permissionsChecked = await this.utils.userHasPermissionForAction(request, Constants.ROLE_CRUD_CONTRACT);
            const currentUser = permissionsChecked.currentUser;

            if (permissionsChecked.invalid){
                return await this.utils.getInternalServerError(permissionsChecked.message, {}, request);
            }

            let validation = this.validatePayment(payment, false);
            if (validation.invalid){
                return this.utils.getInternalServerError(validation.message, payment, request);
            }

            let newPayment = this.paymentService.getPaymentBaseByContractAndUser({
                _id: payment.contract._id,
                monthValue: payment.value,
            }, currentUser);

            newPayment = Object.assign(newPayment, {
                paymentDate: payment.paymentDate,
                paymentCode: await this.paymentService.getNewPaymentCode(0)
            });
            const results = await this.paymentService.save(newPayment);
            
            return this.utils.getResponse(Constants.SUCCESS_MESSAGE_OPERATION, results, request);
        } catch(err){
            return this.utils.getInternalServerError(err.toString(), err, request);
        }
    }

    @Get('/status')
    public async getTypesOfPayment(@Req() request){
        try{
            return this.utils.getResponse(Constants.SUCCESS_MESSAGE_OPERATION, PaymentStatus, request);
        } catch(err){
            return this.utils.getInternalServerError(err.toString(), err, request);
        }
    }

    private validatePayment(payment, hasId){
        let validation = {
            invalid: false,
            message: ''
        };

        if (!payment ||
            (hasId && !payment._id)){
            validation.invalid = true;
            validation.message = "Dados do pagamento inválidos! "+Constants.INVALID_IDENTIFIER_NOT_PROVIDED;
        }

        if (hasId && !payment.paymentCode){
            validation.invalid = true;
            validation.message = "Código do pagamento não informado! ";
        }

        if (!payment.value){
            validation.invalid = true;
            validation.message = "Valor do pagamento inválido ou não informado! ";
        }

        if (!payment.paymentDate){
            validation.invalid = true;
            validation.message = "Data do pagamento não informado ou inválido! ";
        }

        if (!payment.contract._id){
            validation.invalid = true;
            validation.message = "Contrato referente ao pagamento não informado! ";
        }

        return validation;
    }

}
