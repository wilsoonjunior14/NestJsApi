import { Body, Controller, Delete, Get, Param, Patch, Post, Put } from '@nestjs/common';
import { Utils } from '../../utils/Utils';
import { ImmobileService } from './immobile.service';
import { Constants } from '../../utils/Contansts';
import { LocalizationService } from '../localization/localization.service';
import { UserService } from '../user/user.service';
import { Localization } from '../../../dist/controllers/localization/localization.model';

@Controller('immobile')
export class ImmobileController {

    private utils: Utils;

    constructor(private immobileService: ImmobileService, 
        private localizationService: LocalizationService,
        private userService: UserService){
        this.utils = new Utils();
    }

    @Get()
    public async getAll(){
        try{
            const immobiles = await this.immobileService.getEnabledImmobiles();
            return this.utils.getSuccessMessage(Constants.SUCCESS_MESSAGE_OPERATION, immobiles);
        } catch(err){
            return this.utils.getFailureMessage(err.toString(), {});
        }
    }

    @Get('/:id')
    public async getById(@Param('id') id: String){
        try{
            const immobile = await this.immobileService.getById(id);
            return this.utils.getSuccessMessage(Constants.SUCCESS_MESSAGE_OPERATION, immobile);
        } catch(err){
            return this.utils.getFailureMessage(err.toString(), {});
        }
    }

    @Delete('/:id')
    public async delete(@Param('id') id: String){
        try{
            if (id.trim().length === 0){
                return this.utils.getFailureMessage(Constants.INVALID_IDENTIFIER_NOT_PROVIDED, {});
            }

            const oldImmobile = await this.immobileService.getById(id);
            oldImmobile.deleted = true;

            const results = await this.immobileService.update(oldImmobile);

            return this.utils.getSuccessMessage(Constants.SUCCESS_MESSAGE_OPERATION, results);
        } catch(err){
            return this.utils.getFailureMessage(err.toString(), {});
        }
    }

    @Post()
    public async create(@Body() immobile){
        try{

            const validated = this.validateImmobile(immobile, false);
            if (validated.invalid){
                return this.utils.getFailureMessage(this.utils.buildMessage("Imóvel com campo(s) inválido(s)!", validated.messages.join(",")), {});
            }

            const user = await this.userService.getById(immobile.user._id);

            const createdLocalization = await this.localizationService.create(immobile.localization);

            const newImmobile = Object.assign(immobile, {
                user: user._id,
                localization: createdLocalization._id,
                client: null
            });

            const createdImmobile = await this.immobileService.create(newImmobile);

            return this.utils.getSuccessMessage(Constants.SUCCESS_MESSAGE_OPERATION, createdImmobile);
        } catch(err){
            return this.utils.getFailureMessage(err.toString(), {});
        }
    }

    @Put()
    public async update(@Body() immobile){
        try{

            const validated = this.validateImmobile(immobile, true);
            if (validated.invalid){
                return this.utils.getFailureMessage(this.utils.buildMessage("Imóvel com campo(s) inválido(s)!", validated.messages.join(",")), {});
            }

            let oldLocalization = await this.localizationService.getById(immobile.localization._id);
            oldLocalization = Object.assign(oldLocalization, immobile.localization);
            await this.localizationService.update(oldLocalization);

            let oldImmobile = await this.immobileService.getById(immobile._id);
            oldImmobile = Object.assign(oldImmobile, immobile);
            oldImmobile.localization = oldLocalization._id;
            oldImmobile.updatedAt = new Date();
            const results = await this.immobileService.update(oldImmobile);

            return this.utils.getSuccessMessage(Constants.SUCCESS_MESSAGE_OPERATION, results);
        } catch(err){
            return this.utils.getFailureMessage(err.toString(), {});
        }
    }

    @Post('/addClient')
    public async addClient(@Body() immobileWithClient){
        try{

            const validation = this.validateInsertClient(immobileWithClient);
            if (validation.invalid){
                return this.utils.getFailureMessage(validation.message, immobileWithClient);
            }

            const oldImmobile = await this.immobileService.getById(immobileWithClient._id);
            oldImmobile.client = immobileWithClient.client._id;
            const results = await this.immobileService.update(oldImmobile);

            return this.utils.getSuccessMessage(Constants.SUCCESS_MESSAGE_OPERATION, results);
        } catch(err){
            return this.utils.getFailureMessage(err.toString(), {});
        }
    }

    @Patch('/removeClient')
    public async removeClient(@Body() immobileWithClient){
        try{

            const validation = this.validateInsertClient(immobileWithClient);
            if (validation.invalid){
                return this.utils.getFailureMessage(validation.message, immobileWithClient);
            }

            const oldImmobile = await this.immobileService.getById(immobileWithClient._id);
            oldImmobile.client = null;
            const results = await this.immobileService.update(oldImmobile);

            return this.utils.getSuccessMessage(Constants.SUCCESS_MESSAGE_OPERATION, results);
        } catch(err){
            return this.utils.getFailureMessage(err.toString(), {});
        }
    }

    private validateImmobile(immobile, isUpdateAction){
        let validationResults = {
            invalid: false,
            messages: []
        };

        if (isUpdateAction && !immobile._id){
            validationResults.invalid = true;
            validationResults.messages.push(Constants.INVALID_IDENTIFIER_NOT_PROVIDED);
            return validationResults;
        }

        if (isUpdateAction && (!immobile.localization || !immobile.localization._id) ){
            validationResults.invalid = true;
            validationResults.messages.push("Identificador do endereço não informado!");
        }

        if (!immobile.name ||
            immobile.name.length > 255){
            validationResults.invalid = true;
            validationResults.messages.push(
                this.utils.buildMessage("Nome do imóvel inválido!", Constants.INVALID_FIELD_EMPTY, Constants.INVALID_FIELD_255_CHARACTERS)
            );

            return validationResults;
        }

        if (!immobile.user || 
            !immobile.user._id){
            validationResults.invalid = true;
            validationResults.messages.push(
                this.utils.buildMessage("Usuário não informado!", Constants.INVALID_FIELD_EMPTY, Constants.INVALID_IDENTIFIER_NOT_PROVIDED)
            );

            return validationResults;
        }

        if (!immobile.localization){
            validationResults.invalid = true;
            validationResults.messages.push(
                this.utils.buildMessage("Localização não informado!", Constants.INVALID_FIELD_EMPTY)
            );

            return validationResults;
        }

        if (!immobile.localization.address || 
            !immobile.localization.neighborhood || 
            !immobile.localization.number || !new RegExp(Constants.PATTERN_FIELD_NUMBER).test(immobile.localization.number) ||
            !immobile.localization.city ||
            !immobile.localization.zipCode){
            
            validationResults.invalid = true;
            validationResults.messages.push(
                "Algumas informações de endereço estão incorretas!"
            );

            return validationResults;
        }

        return validationResults;

    }

    private validateInsertClient(immobile){
        const immobileValidation = {
            invalid: false,
            message: ""
        };
        
        if (!immobile){
            immobileValidation.invalid = true;
            immobileValidation.message = Constants.INVALID_FIELD_EMPTY;
            return immobileValidation;
        }

        if (!immobile._id){
            immobileValidation.invalid = true;
            immobileValidation.message = this.utils.buildMessage("Identificador do imóvel inválido!", Constants.INVALID_IDENTIFIER_NOT_PROVIDED, Constants.INVALID_FIELD_EMPTY);
            return immobileValidation;
        }

        if (!immobile.client || 
            !immobile.client._id){
            immobileValidation.invalid = true;
            immobileValidation.message = this.utils.buildMessage("Cliente não identificado!", Constants.INVALID_FIELD_EMPTY, Constants.INVALID_IDENTIFIER_NOT_PROVIDED);
            return immobileValidation;
        }

        return immobileValidation;
    }

}
