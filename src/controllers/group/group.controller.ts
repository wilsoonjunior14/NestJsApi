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
    async createGroup(@Body() group: Group){
        try{

            let validate = this.validateGroup(group);
            if (validate){
                return validate;
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
    async updateGroup(@Body() group: Group){
        try{

            let validate = this.validateGroup(group);
            if (validate){
                return validate;
            }

            let oldGroup = await this.groupService.getById(group.id);
            let updatedGroup = Object.assign(oldGroup, {description: group.description});

            let results = await this.groupService.update(group.id, updatedGroup);

            return this.utils.getSuccessMessage(Constants.SUCCESS_MESSAGE_OPERATION, results);
        } catch(err){
            return this.utils.getFailureMessage(err.toString(), group);
        }
    }

    @Post("role")
    async insertRoleIntoGroup(@Body() group: Group){
        return await this.groupService.update(group._id, group);
    }

    private validateGroup(group: Group){
        var returns;

        if (!group ||
            !group.description ||
            group.description.length > 100 ||
            !new RegExp(Constants.PATTERN_FIELD_WITHOUT_SPECIAL_CHARACTERS).test(group.description)){

            let errorMessage = this.utils.buildMessage("Campo descrição inválido!", 
            Constants.INVALID_FIELD_EMPTY,
            Constants.INVALID_FIELD_100_CHARACTERS,
            Constants.INVALID_PATTERN_FIELD_WITHOUT_SPECIAL_CHARACTERS);

            returns = this.utils.getFailureMessage(errorMessage, group);
        }

        return returns;
    }
}
