import { Body, Controller, Delete, Get, Param, Post, Put, Req } from '@nestjs/common';
import { RoleService } from './role.service';
import { Constants } from '../../utils/Contansts';
import { Utils } from "../../utils/Utils";
import { group } from 'console';

@Controller('role')
export class RoleController {

    private utils;

    constructor(private roleService: RoleService){
        this.utils = new Utils();
    }

    @Get('/:id')
    async findById(@Param('id') id: String){
        try{
            const role = await this.roleService.findById(id);
            return await this.utils.getSuccessMessage(Constants.SUCCESS_MESSAGE_OPERATION, role);
        } catch(err){
            return this.utils.getFailureMessage(err.toString(), {});
        }
    }

    @Get()
    async findAllEnabledRoles(){
        try{
            const roles = await this.roleService.findAllEnabledRoles();
            return this.utils.getSuccessMessage(Constants.SUCCESS_MESSAGE_OPERATION, roles);
        } catch(err){
            return this.utils.getFailureMessage(err.toString(), {});
        }
    }

    @Post()
    async createRole(@Body() role){
        try{
            let validation = this.validateRole(role, false);
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
                return this.utils.getFailureMessage(Constants.INVALID_EXISTING_ENTITY, role);
            }

            const results = await this.roleService.create(role);
            return this.utils.getSuccessMessage(Constants.SUCCESS_MESSAGE_OPERATION, results);
        } catch(err){
            return this.utils.getFailureMessage(err.toString(), {});
        }
    }

    @Put()
    async updateRole(@Body() role){
        try{
            let validation = this.validateRole(role, true);
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
                return this.utils.getFailureMessage(Constants.INVALID_EXISTING_ENTITY, role);
            }

            let oldRole = await this.roleService.findById(role._id);
            oldRole = Object.assign(oldRole, {description: role.description});
            let updatedRole = await this.roleService.update(oldRole);

            return this.utils.getSuccessMessage(Constants.SUCCESS_MESSAGE_OPERATION, updatedRole);
        } catch (err){
            return this.utils.getFailureMessage(err.toString(), {});
        }
    }

    @Delete('/:id')
    async deleteRole(@Param('id') id: String){
        try{
            if (!id){
                let errorMessage = this.utils.buildMessage("Identificador de Permissão não informado.", Constants.INVALID_FIELD_EMPTY);
                return this.utils.getFailureMessage(errorMessage, {});
            }
    
            let oldRole = await this.roleService.findById(id);
            oldRole = Object.assign(oldRole, {deleted: true});
            let deletedRole = await this.roleService.update(oldRole);
    
            return this.utils.getSuccessMessage(Constants.SUCCESS_MESSAGE_OPERATION, deletedRole);
        } catch(err){
            return this.utils.getFailureMessage(err.toString(), {});
        }
    }

    private validateRole(role, validateId) {
        if (!role ||
            !role.description || 
            role.description.length > 100 || 
            !new RegExp(Constants.PATTERN_FIELD_WITHOUT_SPECIAL_CHARACTERS).test(role.description)){

            let errorMessage = this.utils.buildMessage("Campo Descrição inválido!",
            Constants.INVALID_FIELD_EMPTY,
            Constants.INVALID_FIELD_100_CHARACTERS, 
            Constants.INVALID_PATTERN_FIELD_WITHOUT_SPECIAL_CHARACTERS);

            return this.utils.getFailureMessage(errorMessage, role);
        }

        if (validateId && !role._id){
            return this.utils.getFailureMessage(Constants.INVALID_IDENTIFIER_NOT_PROVIDED, role);
        }
    }

}
