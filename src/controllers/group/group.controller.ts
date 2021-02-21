import { Body, Controller, Get, Post, Req } from '@nestjs/common';
import { Group } from './group.model';
import { GroupService } from './group.service';

@Controller('group')
export class GroupController {

    constructor(private groupService: GroupService){}

    @Get()
    getEnabledGroups(){
        return this.groupService.getEnabledGroups();
    }

    @Post()
    createGroup(@Body() group: Group){
        return this.groupService.save(group);
    }

    @Post("role")
    insertRoleIntoGroup(@Body() group: Group){
        return this.groupService.update(group._id, group);
    }
}
