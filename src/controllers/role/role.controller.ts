import { Body, Controller, Delete, Get, Param, Post, Put, Req } from '@nestjs/common';
import { RoleService } from './role.service';
import { Constants } from '../../utils/Contansts';
import { Utils } from "../../utils/Utils";
import { group } from 'console';
import { LogsService } from '../logs/logs.service';
import { UserService } from '../user/user.service';

@Controller('role')
export class RoleController {

    private utils;

    constructor(private roleService: RoleService, 
        private logsService: LogsService,
        private userService: UserService){
        this.utils = new Utils(this.logsService, this.userService);
    }

    @Get('/:id')
    async findById(@Param('id') id: String, @Req() request){
        try{
            const role = await this.roleService.findById(id);
            return await this.utils.getResponse(Constants.SUCCESS_MESSAGE_OPERATION, role, request);
        } catch(err){
            return await this.utils.getInternalServerError(err.toString(), {}, request);
        }
    }

    @Get()
    async findAllEnabledRoles(@Req() request){
        try{
            const roles = await this.roleService.findAllEnabledRoles();
            return this.utils.getResponse(Constants.SUCCESS_MESSAGE_OPERATION, roles, request);
        } catch(err){
            return this.utils.getInternalServerError(err.toString(), {}, request);
        }
    }

    @Post()
    async createRole(@Body() role, @Req() request){
        try{
            let validation = this.validateRole(role, false, request);
            if (validation){
                return validation;
            }

            const query = {
                description: {
                    "$eq": role.description
                }
            };

            let existingRoles = await this.roleService.findByQuery(query);
            if (existingRoles.length > 0){
                return this.utils.getInternalServerError(Constants.INVALID_EXISTING_ENTITY, role, request);
            }

            const results = await this.roleService.create(role);
            return await this.utils.getResponse(Constants.SUCCESS_MESSAGE_OPERATION, results, request);
        } catch(err){
            return await this.utils.getInternalServerError(Constants.SUCCESS_MESSAGE_OPERATION, role, request);
        }
    }

    @Put()
    async updateRole(@Body() role, @Req() request){
        try{
            let validation = this.validateRole(role, true, request);
            if (validation){
                return validation;
            }

            const query = {
                description: {
                    "$eq": role.description
                },
                _id: {
                    "$ne": role._id
                }
            };

            let existingRoles = await this.roleService.findByQuery(query);
            if (existingRoles.length > 0){
                return this.utils.getInternalServerError(Constants.INVALID_EXISTING_ENTITY, role, request);
            }

            let oldRole = await this.roleService.findById(role._id);
            oldRole = Object.assign(oldRole, {description: role.description});
            await this.roleService.update(oldRole);

            return this.utils.getResponse(Constants.SUCCESS_MESSAGE_OPERATION, oldRole, request);
        } catch (err){
            return this.utils.getInternalServerError(err.toString(), role, request);
        }
    }

    @Delete('/:id')
    async deleteRole(@Param('id') id: String, @Req() request){
        try{
            if (!id){
                let errorMessage = this.utils.buildMessage("Identificador de Permissão não informado.", Constants.INVALID_FIELD_EMPTY);
                return this.utils.getInternalServerError(errorMessage, id, request);
            }
    
            let oldRole = await this.roleService.findById(id);
            oldRole = Object.assign(oldRole, {deleted: true});
            await this.roleService.update(oldRole);
    
            return this.utils.getResponse(Constants.SUCCESS_MESSAGE_OPERATION, oldRole, request);
        } catch(err){
            return this.utils.getInternalServerError(err.toString(), id, request);
        }
    }

    private validateRole(role, validateId, request) {
        if (!role ||
            !role.description || 
            role.description.length > 100 || 
            !new RegExp(Constants.PATTERN_FIELD_WITHOUT_SPECIAL_CHARACTERS).test(role.description)){

            let errorMessage = this.utils.buildMessage("Campo Descrição inválido!",
            Constants.INVALID_FIELD_EMPTY,
            Constants.INVALID_FIELD_100_CHARACTERS, 
            Constants.INVALID_PATTERN_FIELD_WITHOUT_SPECIAL_CHARACTERS);

            return this.utils.getInternalServerError(errorMessage, role, request);
        }

        if (validateId && !role._id){
            return this.utils.getInternalServerError(Constants.INVALID_IDENTIFIER_NOT_PROVIDED, role, request);
        }
    }

}
