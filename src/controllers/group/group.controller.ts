import { Body, Controller, Delete, Get, Param, Post, Put, Req } from '@nestjs/common';
import { Group } from './group.model';
import { GroupService } from './group.service';
import { Utils } from '../../utils/Utils';
import { Constants } from '../../utils/Contansts';
import { LogsService } from '../logs/logs.service';
import { UserService } from '../user/user.service';
import { check } from 'prettier';

@Controller('group')
export class GroupController {

    private utils;

    private roleCRUDGroup : String = "CRUD_GROUP";

    constructor(private groupService: GroupService, 
        private logsService: LogsService,
        private userService: UserService){
        this.utils = new Utils(this.logsService, this.userService, this.groupService);
    }

    @Get()
    async getEnabledGroups(@Req() request){
        try{
            let groups = await this.groupService.getEnabledGroups();
            return await this.utils.getResponse(Constants.SUCCESS_MESSAGE_OPERATION, groups, request);
        } catch(err){
            return await this.utils.getInternalServerError(err.toString(), {}, request);
        }
    }

    @Get('/:id')
    async getById(@Param("id") id: String, @Req() request){
        try{
            let group = await this.groupService.getById(id);
            return await this.utils.getResponse(Constants.SUCCESS_MESSAGE_OPERATION, group, request);
        } catch(err){
            return await this.utils.getInternalServerError(err.toString(), id, request);
        }
    }

    @Post()
    async createGroup(@Body() group, @Req() request){
        try{

            const permissionsChecked = await this.utils.userHasPermissionForAction(request, this.roleCRUDGroup);

            if (permissionsChecked.invalid){
                return await this.utils.getInternalServerError(permissionsChecked.message, group, request);
            }

            let validate = this.validateGroup(group, false, request);
            if (validate){
                return validate;
            }

            const query = {
                description: {
                    "$eq": group.description
                }
            };

            let existingGroups = await this.groupService.findByQuery(query);
            if (existingGroups.length > 0){
                return await this.utils.getInternalServerError(Constants.INVALID_EXISTING_ENTITY, group, request);
            }

            let savedGroup = await this.groupService.save(group);
            return await this.utils.getResponse(Constants.SUCCESS_MESSAGE_OPERATION, savedGroup, request);
        } catch(err){
            return await this.utils.getInternalServerError(err.toString(), group, request);
        }
    }

    @Delete('/:id')
    async deleteGroup(@Param("id") id: String, @Req() request){
        try{

            const permissionsChecked = await this.utils.userHasPermissionForAction(request, this.roleCRUDGroup);

            if (permissionsChecked.invalid){
                return await this.utils.getInternalServerError(permissionsChecked.message, id, request);
            }

            let oldGroup = await this.groupService.getById(id);
            oldGroup.deleted = true;

            await this.groupService.update(id, oldGroup);
            return await this.utils.getResponse(Constants.SUCCESS_MESSAGE_OPERATION, oldGroup, request);
        } catch(err){
            return await this.utils.getInternalServerError(err.toString(), id, request);
        }
    }

    @Put()
    async updateGroup(@Body() group, @Req() request){
        try{

            const permissionsChecked = await this.utils.userHasPermissionForAction(request, this.roleCRUDGroup);

            if (permissionsChecked.invalid){
                return await this.utils.getInternalServerError(permissionsChecked.message, group, request);
            }

            let validate = this.validateGroup(group, true, request);
            if (validate){
                return validate;
            }

            const query = {
                description: {
                    "$eq": group.description
                },
                _id: {
                    "$ne": group._id
                }
            };

            let existingGroups = await this.groupService.findByQuery(query);
            if (existingGroups.length > 0){
                return await this.utils.getInternalServerError(Constants.INVALID_EXISTING_ENTITY, group, request);
            }

            let oldGroup = await this.groupService.getById(group._id);
            let updatedGroup = Object.assign(oldGroup, {description: group.description});

            await this.groupService.update(group._çid, updatedGroup);

            return await this.utils.getResponse(Constants.SUCCESS_MESSAGE_OPERATION, updatedGroup, request);
        } catch(err){
            return await this.utils.getInternalServerError(err.toString(), group, request);
        }
    }

    @Post("role")
    async insertRoleIntoGroup(@Body() group, @Req() request){
        try{

            const permissionsChecked = await this.utils.userHasPermissionForAction(request, this.roleCRUDGroup);

            if (permissionsChecked.invalid){
                return await this.utils.getInternalServerError(permissionsChecked.message, group, request);
            }

            if (!group || !group._id){
                return await this.utils.getInternalServerError(Constants.INVALID_IDENTIFIER_NOT_PROVIDED, group, request);
            }

            if (!group.roles || group.roles.length === 0){
                return await this.utils.getInternalServerError(
                    this.utils.buildMessage("Campo permissões inválido!", Constants.INVALID_FIELD_EMPTY),
                    group,
                    request
                );
            }

            let oldGroup = await this.groupService.getById(group._id);
            oldGroup.roles = group.roles;
            await this.groupService.update(group._id, oldGroup);

            return await this.utils.getResponse(Constants.SUCCESS_MESSAGE_OPERATION, oldGroup, request);

        } catch(err){
            return await this.utils.getInternalServerError(err.toString(), group, request);
        }
    }

    private validateGroup(group, validateId, request){

        if (!group ||
            !group.description ||
            group.description.length > 100 ||
            !new RegExp(Constants.PATTERN_FIELD_WITHOUT_SPECIAL_CHARACTERS).test(group.description)){

            let errorMessage = this.utils.buildMessage("Campo descrição inválido!", 
            Constants.INVALID_FIELD_EMPTY,
            Constants.INVALID_FIELD_100_CHARACTERS,
            Constants.INVALID_PATTERN_FIELD_WITHOUT_SPECIAL_CHARACTERS);

            return this.utils.getInternalServerError(errorMessage, group, request);
        }

        if (validateId && !group._id){
            return this.utils.getInternalServerError(Constants.INVALID_IDENTIFIER_NOT_PROVIDED, group, request);
        }
    }
}
