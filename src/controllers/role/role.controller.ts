import { Body, Controller, Delete, Get, Param, Post, Put, Req } from '@nestjs/common';
import { Role } from './role.model';
import { RoleService } from './role.service';
import { Constants } from '../../utils/Contansts';
import { Utils } from "../../utils/Utils";
import { json } from 'express';

@Controller('role')
export class RoleController {

    private utils;

    constructor(private roleService: RoleService){
        this.utils = new Utils();
    }

    @Get('/:id')
    findById(@Param('id') id: String){
        try{
            return this.roleService.findById(id);
        } catch(err){
            return this.utils.getFailureMessage(err.toString(), {});
        }
    }

    @Get()
    findAllEnabledRoles(){
        try{
            return this.roleService.findAllEnabledRoles();
        } catch(err){
            return this.utils.getFailureMessage(err.toString(), {});
        }
    }

    @Post()
    createRole(@Body() role: Role){
        try{
            let validation = this.validateRole(role);
            if (validation){
                return validation;
            }

            return this.roleService.create(role);
        } catch(err){
            return this.utils.getFailureMessage(err.toString(), {});
        }
    }

    @Put()
    async updateRole(@Body() role: Role){
        try{
            let validation = this.validateRole(role);
            if (validation){
                return validation;
            }

            let oldRole = await this.roleService.findById(role._id);
            oldRole = Object.assign(oldRole, {description: role.description});
            let updatedRole = this.roleService.update(oldRole);

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
            let deletedRole = this.roleService.update(oldRole);
    
            return this.utils.getSuccessMessage(Constants.SUCCESS_MESSAGE_OPERATION, deletedRole);
        } catch(err){
            return this.utils.getFailureMessage(err.toString(), {});
        }
    }

    private validateRole(role: Role) {
        var returns;
        if (!role ||
            !role.description || 
            role.description.length > 100 || 
            !new RegExp(Constants.PATTERN_FIELD_WITHOUT_SPECIAL_CHARACTERS).test(role.description)){

            let errorMessage = this.utils.buildMessage("Campo Descrição inválido!",
            Constants.INVALID_FIELD_EMPTY,
            Constants.INVALID_FIELD_100_CHARACTERS, 
            Constants.INVALID_PATTERN_FIELD_WITHOUT_SPECIAL_CHARACTERS);

            returns = this.utils.getFailureMessage(errorMessage, role);
        }
        return returns;
    }

}
