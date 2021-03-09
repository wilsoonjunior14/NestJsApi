import { Body, Controller, Delete, Get, Param, Patch, Post, Put, Req } from '@nestjs/common';
import { Utils } from '../../utils/Utils';
import { ImmobileService } from './immobile.service';
import { Constants } from '../../utils/Contansts';
import { LocalizationService } from '../localization/localization.service';
import { UserService } from '../user/user.service';
import { Localization } from '../../../dist/controllers/localization/localization.model';
import { LogsService } from '../logs/logs.service';
import { GroupService } from '../group/group.service';

@Controller('immobile')
export class ImmobileController {

    private utils: Utils;

    private roleCRUDImmobile : String = "CRUD_IMMOBILE";

    private roleREMOVEClient: String = "REMOVE_CLIENT";

    private roleADDClient : String = "ADD_CLIENT";

    constructor(private immobileService: ImmobileService, 
        private localizationService: LocalizationService,
        private userService: UserService,
        private logsService: LogsService,
        private groupService: GroupService){
        this.utils = new Utils(this.logsService, this.userService, this.groupService);
    }

    @Get()
    public async getAll(@Req() request){
        try{
            const immobiles = await this.immobileService.getEnabledImmobiles();
            return await this.utils.getResponse(Constants.SUCCESS_MESSAGE_OPERATION, immobiles, request);
        } catch(err){
            return await this.utils.getInternalServerError(err.toString(), err, request);
        }
    }

    @Get('/:id')
    public async getById(@Param('id') id: String, @Req() request){
        try{
            const immobile = await this.immobileService.getById(id);
            return await this.utils.getResponse(Constants.SUCCESS_MESSAGE_OPERATION, immobile, request);
        } catch(err){
            return await this.utils.getInternalServerError(err.toString(), id, request);
        }
    }

    @Delete('/:id')
    public async delete(@Param('id') id: String, @Req() request){
        try{
            const permissionsChecked = await this.utils.userHasPermissionForAction(request, this.roleCRUDImmobile);

            if (permissionsChecked.invalid){
                return await this.utils.getInternalServerError(permissionsChecked.message, id, request);
            }

            if (id.trim().length === 0){
                return await this.utils.getInternalServerError(Constants.INVALID_IDENTIFIER_NOT_PROVIDED, id, request);
            }

            const oldImmobile = await this.immobileService.getById(id);
            oldImmobile.deleted = true;

            const results = await this.immobileService.update(oldImmobile);

            return await this.utils.getResponse(Constants.SUCCESS_MESSAGE_OPERATION, results, request);
        } catch(err){
            return await this.utils.getInternalServerError(err.toString(), id, request);
        }
    }

    @Post()
    public async create(@Body() immobile, @Req() request){
        try{

            const permissionsChecked = await this.utils.userHasPermissionForAction(request, this.roleCRUDImmobile);

            if (permissionsChecked.invalid){
                return await this.utils.getInternalServerError(permissionsChecked.message, immobile, request);
            }

            const validated = this.validateImmobile(immobile, false);
            if (validated.invalid){
                return await this.utils.getInternalServerError(this.utils.buildMessage("Imóvel com campo(s) inválido(s)!", validated.messages.join(",")), immobile, request);
            }

            const user = await this.userService.getById(immobile.user._id);

            const createdLocalization = await this.localizationService.create(immobile.localization);

            const newImmobile = Object.assign(immobile, {
                user: user._id,
                localization: createdLocalization._id,
                client: null
            });

            const createdImmobile = await this.immobileService.create(newImmobile);

            return await this.utils.getResponse(Constants.SUCCESS_MESSAGE_OPERATION, createdImmobile, request);
        } catch(err){
            return await this.utils.getInternalServerError(err.toString(), immobile, request);
        }
    }

    @Put()
    public async update(@Body() immobile, @Req() request){
        try{

            const permissionsChecked = await this.utils.userHasPermissionForAction(request, this.roleCRUDImmobile);

            if (permissionsChecked.invalid){
                return await this.utils.getInternalServerError(permissionsChecked.message, immobile, request);
            }

            const validated = this.validateImmobile(immobile, true);
            if (validated.invalid){
                return await this.utils.getInternalServerError(this.utils.buildMessage("Imóvel com campo(s) inválido(s)!", validated.messages.join(",")), request, request);
            }

            let oldLocalization = await this.localizationService.getById(immobile.localization._id);
            oldLocalization = Object.assign(oldLocalization, immobile.localization);
            await this.localizationService.update(oldLocalization);

            let oldImmobile = await this.immobileService.getById(immobile._id);
            oldImmobile = Object.assign(oldImmobile, immobile);
            oldImmobile.localization = oldLocalization._id;
            oldImmobile.updatedAt = new Date();
            const results = await this.immobileService.update(oldImmobile);

            return await this.utils.getResponse(Constants.SUCCESS_MESSAGE_OPERATION, results, request);
        } catch(err){
            return await this.utils.getInternalServerError(err.toString(), immobile, request);
        }
    }

    @Post('/addClient')
    public async addClient(@Body() immobileWithClient, @Req() request){
        try{

            const permissionsChecked = await this.utils.userHasPermissionForAction(request, this.roleADDClient);

            if (permissionsChecked.invalid){
                return await this.utils.getInternalServerError(permissionsChecked.message, immobileWithClient, request);
            }

            const validation = this.validateInsertClient(immobileWithClient);
            if (validation.invalid){
                return await this.utils.getInternalServerError(validation.message, immobileWithClient, request);
            }

            const oldImmobile = await this.immobileService.getById(immobileWithClient._id);
            oldImmobile.client = immobileWithClient.client._id;
            const results = await this.immobileService.update(oldImmobile);

            return await this.utils.getResponse(Constants.SUCCESS_MESSAGE_OPERATION, results, request);
        } catch(err){
            return await this.utils.getInternalServerError(err.toString(), immobileWithClient, request);
        }
    }

    @Patch('/removeClient')
    public async removeClient(@Body() immobileWithClient, @Req() request){
        try{

            const permissionsChecked = await this.utils.userHasPermissionForAction(request, this.roleREMOVEClient);

            if (permissionsChecked.invalid){
                return await this.utils.getInternalServerError(permissionsChecked.message, immobileWithClient, request);
            }

            const validation = this.validateInsertClient(immobileWithClient);
            if (validation.invalid){
                return await this.utils.getInternalServerError(validation.message, immobileWithClient, request);
            }

            const oldImmobile = await this.immobileService.getById(immobileWithClient._id);
            oldImmobile.client = null;
            const results = await this.immobileService.update(oldImmobile);

            return await this.utils.getResponse(Constants.SUCCESS_MESSAGE_OPERATION, results, request);
        } catch(err){
            return await this.utils.getInternalServerError(err.toString(), immobileWithClient, request);
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
