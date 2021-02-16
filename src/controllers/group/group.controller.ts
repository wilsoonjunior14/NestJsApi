import { Body, Controller, Get, Post, Req } from '@nestjs/common';
import { Request } from 'express';
import { Group } from './group.model';
import { GroupService } from './group.service';

@Controller('group')
export class GroupController {

    constructor(private groupService: GroupService){}

    @Get()
    findAll(@Req() req: Request) : string {

        console.log(req);

        return 'returning all groups';
    }

    @Post()
    createGroup(@Body() group: Group){
        return this.groupService.create(group);
    }

}
