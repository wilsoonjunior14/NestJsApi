import { Controller, Post, Body, Req, Get, Param, Delete, Put } from '@nestjs/common';
import { Utils } from '../../utils/Utils';
import { GroupService } from '../group/group.service';
import { LogsService } from '../logs/logs.service';
import { UserService } from '../user/user.service';
import { Constants } from '../../utils/Contansts';
import { ImmobileService } from '../immobile/immobile.service';
import { ContractService } from './contract.service';
import { PaymentService } from '../payment/payment.service';

@Controller('contract')
export class ContractController {

    private utils: Utils;

    constructor(private logService: LogsService, 
        private userService: UserService,
        private groupService: GroupService,
        private immobileService: ImmobileService,
        private contractService: ContractService,
        private paymentService: PaymentService){
        this.utils = new Utils(this.logService, this.userService, this.groupService);
    }

    @Get()
    public async getAll(@Req() request){
        try{
            const results = await this.contractService.findByQuery({deleted: false});
            return this.utils.getResponse(Constants.SUCCESS_MESSAGE_OPERATION, results, request);
        } catch(err){
            return this.utils.getInternalServerError(err.toString(), {}, request);
        }
    }

    @Get('/:id')
    public async getById(@Param("id") id, @Req() request){
        try{
            const results = await this.contractService.findById(id);
            return this.utils.getResponse(Constants.SUCCESS_MESSAGE_OPERATION, results, request);
        } catch(err){
            return this.utils.getInternalServerError(err.toString(), id, request);
        }
    }

    @Delete('/:id')
    public async delete(@Param("id") id, @Req() request){
        try{

            const permissionsChecked = await this.utils.userHasPermissionForAction(request, Constants.ROLE_CRUD_CONTRACT);
            const currentUser = permissionsChecked.currentUser;

            if (permissionsChecked.invalid){
                return await this.utils.getInternalServerError(permissionsChecked.message, id, request);
            }

            const oldContract = await this.contractService.findById(id);
            oldContract.deleted = true;
            oldContract.updatedAt = new Date();
            oldContract.updatedBy = currentUser["_id"];

            const oldImmobile = await this.immobileService.getById(oldContract.immobile);
            oldImmobile.contract = null;
            oldImmobile.updatedAt = new Date();

            await this.immobileService.update(oldImmobile);
            await this.contractService.update(oldContract);

            return this.utils.getResponse(Constants.SUCCESS_MESSAGE_OPERATION, oldContract, request);
        } catch(err){
            return this.utils.getInternalServerError(err.toString(), id, request);
        }
    }

    @Post()
    public async create(@Body() contract, @Req() request){
        try{

            const permissionsChecked = await this.utils.userHasPermissionForAction(request, Constants.ROLE_CRUD_CONTRACT);
            const currentUser = permissionsChecked.currentUser;

            if (permissionsChecked.invalid){
                return await this.utils.getInternalServerError(permissionsChecked.message, contract, request);
            }

            const validator = this.validateContract(contract, false);
            if (validator.invalid){
                return await this.utils.getInternalServerError(validator.message, contract, request);
            }

            let existingContracts = await this.contractService.findByQuery({deleted: false, immobile: contract.immobile._id});
            if (existingContracts.length > 0){
                return await this.utils.getInternalServerError("Já existe um contrato ativo para este imóvel!", contract, request);
            }

            let oldImmobile = await this.immobileService.getById(contract.immobile._id);
            contract.createdBy = currentUser["_id"];
            contract.updatedBy = currentUser["_id"];
            contract.contractCode = "C" + await (await this.contractService.findByQuery({})).length + "" + new Date().getFullYear();
            const results = await this.contractService.save(contract);

            oldImmobile.contract = results._id;
            oldImmobile.updatedAt = new Date();
            await this.immobileService.update(oldImmobile);

            await this.paymentService.generatePaymentsForContract(results, currentUser);

            return this.utils.getResponse(Constants.SUCCESS_MESSAGE_OPERATION, results, request);
        } catch(err){
            return this.utils.getInternalServerError(err.toString(), contract, request);
        }
    }

    @Put()
    public async update(@Body() contract, @Req() request){
        try {

            const permissionsChecked = await this.utils.userHasPermissionForAction(request, Constants.ROLE_CRUD_CONTRACT);
            const currentUser = permissionsChecked.currentUser;

            if (permissionsChecked.invalid){
                return await this.utils.getInternalServerError(permissionsChecked.message, contract, request);
            }

            const validator = this.validateContract(contract, true);
            if (validator.invalid){
                return await this.utils.getInternalServerError(validator.message, contract, request);
            }

            let oldContract = await this.contractService.findById(contract._id);

            if (oldContract.immobile.toString() !== contract.immobile._id.toString()){
                return await this.utils.getInternalServerError("Identificador do imóvel está diferente do original!", contract, request);
            }

            Object.assign(oldContract, contract);
            Object.assign(oldContract, {
               updatedBy: currentUser["_id"],
               updatedAt: new Date() 
            });

            await this.contractService.update(oldContract);

            return this.utils.getResponse(Constants.SUCCESS_MESSAGE_OPERATION, oldContract, request);
        } catch(err){
            return this.utils.getInternalServerError(err.toString(), contract, request);
        }
    }

    private validateContract(contract: any, validateId: boolean){
        let validationResults = {
            invalid: false,
            message: ""
        };

        if (!contract){
            validationResults.invalid = true;
            validationResults.message = this.utils.buildMessage("Dados do contrato não informado!", Constants.INVALID_IDENTIFIER_NOT_PROVIDED);
            return validationResults;
        }

        if (validateId && !contract._id){
            validationResults.invalid = true;
            validationResults.message = this.utils.buildMessage("Dados do contrato não informado!", Constants.INVALID_IDENTIFIER_NOT_PROVIDED);
            return validationResults;
        }

        if (!contract.beginDate ||
            !new RegExp(Constants.PATTERN_FIELD_DATE).test(contract.beginDate)){
            validationResults.invalid = true;
            validationResults.message = this.utils.buildMessage("Data de início incorreta!", "Data inválida ou fora do padrão (yyyy-mm-dd).");
            return validationResults;
        }

        if (!contract.endDate ||
            !new RegExp(Constants.PATTERN_FIELD_DATE).test(contract.endDate)){
            validationResults.invalid = true;
            validationResults.message = this.utils.buildMessage("Data de término incorreta!", "Data inválida ou fora do padrão (yyyy-mm-dd).");
            return validationResults;
        }

        if (new Date(contract.endDate).getTime() <= new Date(contract.beginDate).getTime()){
            validationResults.invalid = true;
            validationResults.message = this.utils.buildMessage("Data de término não pode ser inferior a data de início.");
            return validationResults;
        }

        if (!contract.monthValue ||
            contract.monthValue <= 0 ||
            typeof contract.monthValue === "string"){
            validationResults.invalid = true;
            validationResults.message = this.utils.buildMessage("Valor mensal do contrato incorreto!", "Valor deve ser maior que zero.");
            return validationResults;
        }

        if (!contract.immobile ||
            !contract.immobile._id){
            validationResults.invalid = true;
            validationResults.message = this.utils.buildMessage("Imóvel não informado!", Constants.INVALID_IDENTIFIER_NOT_PROVIDED);
            return validationResults;
        }

        if (!contract.client ||
            !contract.client._id){
            validationResults.invalid = true;
            validationResults.message = this.utils.buildMessage("Cliente não informado!", Constants.INVALID_IDENTIFIER_NOT_PROVIDED);
            return validationResults;
        }

        return validationResults;
    }

}
