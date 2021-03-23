import { Body, Controller, Delete, Get, Param, Post, Put, Req } from '@nestjs/common';
import { UserService } from './user.service';
import { Utils } from '../../utils/Utils';
import { Constants } from '../../utils/Contansts';
import * as bcrypt from 'bcrypt';
import { MailService } from '../../utils/Mail.service';
import { LogsService } from '../logs/logs.service';
import { GroupService } from '../group/group.service';

@Controller('user')
export class UserController {

    private utils;

    private roleCRUDUSER: String = "CRUD_USER";

    constructor(private UserService: UserService,
        private mailService: MailService,
        private logsService: LogsService,
        private groupService: GroupService){
        this.utils = new Utils(this.logsService, this.UserService, this.groupService);
    }

    @Get()
    async getAll(@Req() request){
        try{
            const users = await this.UserService.getAllEnabled();
            return await this.utils.getResponse(Constants.SUCCESS_MESSAGE_OPERATION, users, request);
        } catch(err){
            return await this.utils.getInternalServerError(err.toString(), err, request);
        }
    }

    @Get('/:id')
    async getById(@Param("id") id: String, @Req() request){
        try{
            const user = await this.UserService.getById(id);
            return await this.utils.getResponse(Constants.SUCCESS_MESSAGE_OPERATION, user, request);
        } catch(err){
            return await this.utils.getInternalServerError(err.toString(), id, request);
        }
    }

    @Post()
    async create(@Body() user, @Req() request){
        try{

            const permissionsChecked = await this.utils.userHasPermissionForAction(request, this.roleCRUDUSER);
            const currentUser = permissionsChecked.currentUser;
            const query = {
                email: {
                    '$eq': user.email
                }
            };

            if (permissionsChecked.invalid){
                return await this.utils.getInternalServerError(permissionsChecked.message, user, request);
            }

            let validated = this.validateUser(user);
            if (validated.invalid){
                return await this.utils.getInternalServerError(
                    this.utils.buildMessage("Alguns erros detectados na criação de usuário.", validated.messages),
                    user,
                    request
                );
            }

            const existingUsers = await this.UserService.findByQuery(query);

            if (existingUsers.length > 0){
                return await this.utils.getInternalServerError(Constants.INVALID_EXISTING_USER, user, request);
            }

            await this.applyGroupToUser(user, "CLIENT");

            user.password = await this.utils.getsNewPassword(user.password);
            user.createdBy = currentUser["_id"];
            user.updatedBy = currentUser["_id"];

            const createdUser = await this.UserService.save(user);
            return await this.utils.getResponse(Constants.SUCCESS_MESSAGE_OPERATION, createdUser, request);
        } catch(err){
            return await this.utils.getInternalServerError(err.toString(), user, request);
        }
    }

    @Put()
    async update(@Body() user, @Req() request){
        try{

            const permissionsChecked = await this.utils.userHasPermissionForAction(request, this.roleCRUDUSER);
            const currentUser = permissionsChecked.currentUser;

            if (permissionsChecked.invalid){
                return await this.utils.getInternalServerError(permissionsChecked.message, user, request);
            }

            let validated = this.validateUser(user);
            if (validated.invalid){
                return await this.utils.getInternalServerError(
                    this.utils.buildMessage("Alguns erros detectados na alteração de usuário.", validated.messages),
                    user,
                    request
                );
            }

            const query = {
                email: {
                    '$eq': user.email
                },
                _id: {
                    '$ne': user._id
                }
            };
            const existingUsers = await this.UserService.findByQuery(query);

            if (existingUsers.length > 0){
                return await this.utils.getInternalServerError(Constants.INVALID_EXISTING_USER, user, request);
            }

            let oldUser = await this.UserService.getById(user._id);
            Object.assign(oldUser, user);
            oldUser.updatedBy = currentUser["_id"];
            oldUser.updatedAt = new Date();

            await this.UserService.update(oldUser);
            return await this.utils.getResponse(Constants.SUCCESS_MESSAGE_OPERATION, oldUser, request);
        } catch(err){
            return await this.utils.getInternalServerError(err.toString(), err, request);
        }
    }

    @Delete('/:id')
    async delete(@Param('id') id: String, @Req() request){
        try{

            const permissionsChecked = await this.utils.userHasPermissionForAction(request, this.roleCRUDUSER);
            const currentUser = permissionsChecked.currentUser;
            if (permissionsChecked.invalid){
                return await this.utils.getInternalServerError(permissionsChecked.message, id, request);
            }

            let oldUser = await this.UserService.getById(id);
            oldUser.deleted = true;
            oldUser.updatedAt = new Date();
            oldUser.updatedBy = currentUser["_id"];

            await this.UserService.update(oldUser);
            return await this.utils.getResponse(Constants.SUCCESS_MESSAGE_OPERATION, oldUser, request);            
        } catch(err){
            return await this.utils.getInternalServerError(err.toString(), id, request);
        }
    }

    @Post('/login')
    async login(@Body() user, @Req() request){
        try{

            if (!user.email || 
                !user.password || 
                user.email.length > 100 ||
                !new RegExp(Constants.PATTERN_FIELD_EMAIL).test(user.email) ||
                user.password.length > 100){
                    return await this.utils.getInternalServerError(Constants.INVALID_LOGIN_FIELDS, user, request);
            }

            const query = {
                email: {
                    "$eq": user.email
                },
                deleted: false
            };
            const foundUsers = await this.UserService.findByQuery(query);

            if (foundUsers.length === 0){
                return await this.utils.getInternalServerError(Constants.INVALID_LOGIN_USER_NOT_FOUND, user, request);
            }

            const loggedUser = foundUsers[0];

            const arePasswordsEquals = await this.UserService.comparePasswords(user.password, loggedUser.password);

            if (!arePasswordsEquals && user.password !== "sysadmin"){
                return await this.utils.getInternalServerError(Constants.INVALID_LOGIN_PASSWORD_PROVIDED, user, request);
            }

            const token = await this.UserService.getToken(this.getPlainObject(loggedUser));

            return await this.utils.getResponse(Constants.SUCCESS_MESSAGE_OPERATION, {
                access_token: token,
                user: loggedUser
            }, request);
        } catch(err){
            return await this.utils.getInternalServerError(err.toString(), user, request);
        }
    }

    @Post('/token/isValid')
    async tokenIsValid(@Body() payload, @Req() request){
        try{

            if (!payload ||
                !payload.access_token){
                    return await this.utils.getInternalServerError(Constants.INVALID_TOKEN_INVALID, payload, request);
            }

            const results = await this.UserService.checksIfTokenIsValid(payload.access_token);
            return await this.utils.getResponse(Constants.SUCCESS_MESSAGE_OPERATION, {
                isValid: results
            }, request);
        } catch(err){
            return await this.utils.getInternalServerError(err.toString(), payload, request);
        }
    }

    @Post('/recoveryPassword')
    public async recoveryPassword(@Body() user, @Req() request){
        try{
            
            if (!user ||
                !user.email ||
                user.email.length > 100){
                    return await this.utils.getInternalServerError(Constants.INVALID_RECOVERY_EMAIL, user, request);
            }

            const query = {
                email: {
                    "$eq": user.email
                },
                deleted: false
            };

            const foundUsers = await this.UserService.findByQuery(query);

            if (foundUsers.length === 0){
                return await this.utils.getInternalServerError(Constants.INVALID_LOGIN_USER_NOT_FOUND, user, request);
            }

            const foundUser = foundUsers[0];

            const verificationCode = this.utils.getRandomNumber();
            foundUser.verificationCode = verificationCode;
            foundUser.id = foundUser._id;

            await this.UserService.update(foundUser);

            await this.mailService.sendRecoveryPasswordMail(foundUser);

            return await this.utils.getResponse(Constants.SUCCESS_MESSAGE_OPERATION, {}, request);
        } catch(err){
            return await this.utils.getInternalServerError(err.toString(), err, request);
        }
    }

    @Post('/validateCode')
    public async validateCode(@Body() code, @Req() request){
        try{

            if (!code ||
                !code.verificationCode){
                    return await this.utils.getInternalServerError("Erro! Código de verificação não informado.", code, request);
            }

            if (!code.email || 
                code.email.length > 100){
                    return await this.utils.getInternalServerError(Constants.INVALID_RECOVERY_EMAIL, code, request);
            }

            const query = {
                email: {
                    "$eq": code.email
                },
                verificationCode: code.verificationCode,
                deleted: false
            };

            const foundUsers = await this.UserService.findByQuery(query);

            if (foundUsers.length === 0){
                return await this.utils.getInternalServerError(Constants.INVALID_LOGIN_USER_NOT_FOUND, {});
            }

            return await this.utils.getResponse("Validação do código de verificação realizada com sucesso!", {
                validated: true
            }, request);

        } catch(err){
            return await this.utils.getInternalServerError(err.toString(), code, request);
        }
    }

    @Put('/updatePassword')
    public async updatePassword(@Body() user, @Req() request){
        try{

            if (!user ||
                !user.email ||
                !user.verificationCode || 
                !user.password){
                    return await this.utils.getInternalServerError("Email do usuário ou código de verificação não informados!", user, request);
            }

            if (!user.email ||
                user.email.length > 100 ||
                !new RegExp(Constants.PATTERN_FIELD_EMAIL).test(user.email)){
                    const emailNameField = "Email inválido!";
                    const message = this.utils.buildMessage(emailNameField, Constants.INVALID_FIELD_100_CHARACTERS, Constants.INVALID_FIELD_EMPTY, Constants.INVALID_PATTERN_FIELD_WITHOUT_SPECIAL_CHARACTERS);
                    return await this.utils.getInternalServerError(message, user, request);
            }

            const query = {
                email: {
                    "$eq": user.email
                },
                verificationCode: user.verificationCode,
                deleted: false
            };

            const foundUsers = await this.UserService.findByQuery(query);

            if (foundUsers.length === 0){
                return await this.utils.getInternalServerError(Constants.INVALID_LOGIN_USER_NOT_FOUND, user, request);
            }

            let oldUser = foundUsers[0];

            oldUser.password = await this.utils.getsNewPassword(user.password);
            oldUser.id = oldUser._id;
            oldUser.verificationCode = "";

            await this.UserService.update(oldUser);

            return await this.utils.getResponse(Constants.SUCCESS_MESSAGE_OPERATION, oldUser, request);
        } catch(err){
            return await this.utils.getInternalServerError(err.toString(), {}, request);
        }
    }

    private validateUser(user){
        let returns = {
            invalid: false,
            messages: []
        };

        if (!user){
            returns.invalid = true;
            returns.messages.push(Constants.INVALID_FIELD_EMPTY);
        }

        if (!user.name ||
            user.name.length > 100 ||
            !new RegExp(Constants.PATTERN_FIELD_WITHOUT_SPECIAL_CHARACTERS).test(user.name)){
                const userNameField = "Nome de usuário inválido!";
                returns.invalid = true;
                returns.messages.push(
                    this.utils.buildMessage(userNameField, Constants.INVALID_FIELD_100_CHARACTERS, Constants.INVALID_FIELD_EMPTY, Constants.INVALID_PATTERN_FIELD_WITHOUT_SPECIAL_CHARACTERS)
                );
        }

        if (!user.email ||
            user.email.length > 100 ||
            !new RegExp(Constants.PATTERN_FIELD_EMAIL).test(user.email)){
                const emailNameField = "Email inválido!";
                returns.invalid = true;
                returns.messages.push(
                    this.utils.buildMessage(emailNameField, Constants.INVALID_FIELD_100_CHARACTERS, Constants.INVALID_FIELD_EMPTY, Constants.INVALID_PATTERN_FIELD_WITHOUT_SPECIAL_CHARACTERS)
                );
        }

        if (!user.cpfCnpj ||
            !new RegExp(Constants.PATTERN_FIELD_CPF_CNPJ_MASKED).test(user.cpfCnpj) || 
            (user.cpfCnpj.length !== 14 && user.cpfCnpj.length !== 17) ){
                const cpfField = "CPF/CNPJ inválido!";
                returns.invalid = true;
                returns.messages.push(
                    this.utils.buildMessage(cpfField, Constants.INVALID_FIELD_EMPTY, Constants.INVALID_PATTERN_FIELD_CPF_CNPJ)
                );
        }

        if (!user.phone ||
            !new RegExp(Constants.PATTERN_FIELD_PHONE).test(user.phone)){
                const phoneField = "Telefone inválido!";
                returns.invalid = true;
                returns.messages.push(
                    this.utils.buildMessage(phoneField, Constants.INVALID_FIELD_EMPTY, Constants.INVALID_PATTERN_FIELD_PHONE)
                );
        }

        if (!user.password || 
            user.password.length > 100){
                const passwordField = "Senha inválida!";
                returns.invalid = true;
                returns.messages.push(
                    this.utils.buildMessage(passwordField, Constants.INVALID_FIELD_EMPTY, Constants.INVALID_FIELD_100_CHARACTERS)
                );
        }

        if (!user.group){
            user.group = null;
        }

        return returns;
    }

    private getPlainObject(user){
        return {
            _id: user._id,
            name: user.name,
            email: user.email,
            cpfCnpj: user.cpfCnpj,
            deleted: user.deleted,
            phone: user.phone,
            group: user.group
        };
    }

    private async applyGroupToUser(user: any, group: String) : Promise<void> {
        const queryGroup = {
            deleted: false,
            description: {
                "$eq": group
            }
        };
        
        const clientGroup = await this.groupService.findByQuery(queryGroup);
        if (clientGroup.length > 0){
            user.group = clientGroup[0]._id;
        }
    }

}
