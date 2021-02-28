import { Body, Controller, Delete, Get, Param, Post, Put, Req } from '@nestjs/common';
import { Group } from './group.model';
import { GroupService } from './group.service';
import { Utils } from '../../utils/Utils';
import { Constants } from '../../utils/Contansts';

@Controller('group')
export class GroupController {

    private utils;

    constructor(private groupService: GroupService){
        this.utils = new Utils();
    }

    @Get()
    async getEnabledGroups(){
        try{
            let groups = await this.groupService.getEnabledGroups();
            return this.utils.getSuccessMessage(Constants.SUCCESS_MESSAGE_OPERATION, groups);
        } catch(err){
            return this.utils.getFailureMessage(err.toString(), {});
        }
    }

    @Get('/:id')
    async getById(@Param("id") id: String){
        try{
            let group = await this.groupService.getById(id);
            return this.utils.getSuccessMessage(Constants.SUCCESS_MESSAGE_OPERATION, group);
        } catch(err){
            return this.utils.getFailureMessage(err.toString(), {});
        }
    }

    @Post()
    async createGroup(@Body() group){
        try{

            let validate = this.validateGroup(group, false);
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
                return this.utils.getFailureMessage(Constants.INVALID_EXISTING_ENTITY, group);
            }

            let savedGroup = await this.groupService.save(group);
            return this.utils.getSuccessMessage(Constants.SUCCESS_MESSAGE_OPERATION, savedGroup);
        } catch(err){
            return this.utils.getFailureMessage(err.toString(), group);
        }
    }

    @Delete('/:id')
    async deleteGroup(@Param("id") id: String){
        try{
            let oldGroup = await this.groupService.getById(id);
            oldGroup.deleted = true;

            let results = await this.groupService.update(id, oldGroup);
            return this.utils.getSuccessMessage(Constants.SUCCESS_MESSAGE_OPERATION, results);
        } catch(err){
            return this.utils.getFailureMessage(err.toString(), {});
        }
    }

    @Put()
    async updateGroup(@Body() group){
        try{

            let validate = this.validateGroup(group, true);
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
                return this.utils.getFailureMessage(Constants.INVALID_EXISTING_ENTITY, group);
            }

            let oldGroup = await this.groupService.getById(group._id);
            let updatedGroup = Object.assign(oldGroup, {description: group.description});

            let results = await this.groupService.update(group._çid, updatedGroup);

            return this.utils.getSuccessMessage(Constants.SUCCESS_MESSAGE_OPERATION, results);
        } catch(err){
            return this.utils.getFailureMessage(err.toString(), group);
        }
    }

    @Post("role")
    async insertRoleIntoGroup(@Body() group){
        return await this.groupService.update(group._id, group);
    }

    private validateGroup(group, validateId){

        if (!group ||
            !group.description ||
            group.description.length > 100 ||
            !new RegExp(Constants.PATTERN_FIELD_WITHOUT_SPECIAL_CHARACTERS).test(group.description)){

            let errorMessage = this.utils.buildMessage("Campo descrição inválido!", 
            Constants.INVALID_FIELD_EMPTY,
            Constants.INVALID_FIELD_100_CHARACTERS,
            Constants.INVALID_PATTERN_FIELD_WITHOUT_SPECIAL_CHARACTERS);

            return this.utils.getFailureMessage(errorMessage, group);
        }

        if (validateId && !group._id){
            return this.utils.getFailureMessage(Constants.INVALID_IDENTIFIER_NOT_PROVIDED, group);
        }
    }
}
