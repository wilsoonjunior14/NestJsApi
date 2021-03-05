import { Body, Controller, Delete, Get, Param, Post, Put } from '@nestjs/common';
import { UserService } from './user.service';
import { Utils } from '../../utils/Utils';
import { Constants } from '../../utils/Contansts';
import * as bcrypt from 'bcrypt';
import { MailService } from '../../utils/Mail.service';

@Controller('user')
export class UserController {

    private utils;

    constructor(private UserService: UserService,
        private mailService: MailService){
        this.utils = new Utils();
    }

    @Get()
    async getAll(){
        try{
            const users = await this.UserService.getAllEnabled();
            return this.utils.getSuccessMessage(Constants.SUCCESS_MESSAGE_OPERATION, users);
        } catch(err){
            return this.utils.getFailureMessage(err.toString(), err);
        }
    }

    @Get('/:id')
    async getById(@Param("id") id: String){
        try{
            const user = await this.UserService.getById(id);
            return this.utils.getSuccessMessage(Constants.SUCCESS_MESSAGE_OPERATION, user);
        } catch(err){
            return this.utils.getFailureMessage(err.toString(), err);
        }
    }

    @Post()
    async create(@Body() user){
        try{

            let validated = this.validateUser(user);
            if (validated.invalid){
                return this.utils.getFailureMessage(
                    this.utils.buildMessage("Alguns erros detectados na criação de usuário.", validated.messages),
                    user
                );
            }

            const query = {
                email: {
                    '$eq': user.email
                }
            };
            const existingUsers = await this.UserService.findByQuery(query);

            if (existingUsers.length > 0){
                return this.utils.getFailureMessage(Constants.INVALID_EXISTING_USER, []);
            }

            user.password = await this.utils.getsNewPassword(user.password);

            const createdUser = await this.UserService.save(user);
            return this.utils.getSuccessMessage(Constants.SUCCESS_MESSAGE_OPERATION, createdUser);
        } catch(err){
            return this.utils.getFailureMessage(err.toString(), err);
        }
    }

    @Put()
    async update(@Body() user){
        try{

            let validated = this.validateUser(user);
            if (validated.invalid){
                return this.utils.getFailureMessage(
                    this.utils.buildMessage("Alguns erros detectados na alteração de usuário.", validated.messages),
                    user
                );
            }

            const query = {
                email: {
                    '$eq': user.email
                },
                _id: {
                    '$ne': user.id
                }
            };
            const existingUsers = await this.UserService.findByQuery(query);

            if (existingUsers.length > 0){
                return this.utils.getFailureMessage(Constants.INVALID_EXISTING_USER, []);
            }

            let oldUser = await this.UserService.getById(user.id);
            Object.assign(oldUser, user);

            const results = await this.UserService.update(oldUser);
            return this.utils.getSuccessMessage(Constants.SUCCESS_MESSAGE_OPERATION, results);
        } catch(err){
            return this.utils.getFailureMessage(err.toString(), err);
        }
    }

    @Delete('/:id')
    async delete(@Param('id') id: String){
        try{

            let oldUser = await this.UserService.getById(id);
            oldUser.deleted = true;

            const results = await this.UserService.update(oldUser);
            return this.utils.getSuccessMessage(Constants.SUCCESS_MESSAGE_OPERATION, results);            
        } catch(err){
            return this.utils.getFailureMessage(err.toString(), err);
        }
    }

    @Post('/login')
    async login(@Body() user){
        try{

            if (!user.email || 
                !user.password || 
                user.email.length > 100 ||
                !new RegExp(Constants.PATTERN_FIELD_EMAIL).test(user.email) ||
                user.password.length > 100){
                    return this.utils.getFailureMessage(Constants.INVALID_LOGIN_FIELDS, user);
            }

            const query = {
                email: {
                    "$eq": user.email
                },
                deleted: false
            };
            const foundUsers = await this.UserService.findByQuery(query);

            if (foundUsers.length === 0){
                return this.utils.getFailureMessage(Constants.INVALID_LOGIN_USER_NOT_FOUND, user);
            }

            const loggedUser = foundUsers[0];

            const arePasswordsEquals = await this.UserService.comparePasswords(user.password, loggedUser.password);

            if (!arePasswordsEquals){
                return this.utils.getFailureMessage(Constants.INVALID_LOGIN_PASSWORD_PROVIDED, user);
            }

            const token = await this.UserService.getToken(this.getPlainObject(loggedUser));

            return this.utils.getSuccessMessage(Constants.SUCCESS_MESSAGE_OPERATION, {
                access_token: token
            });
        } catch(err){
            return this.utils.getFailureMessage(err.toString(), user);
        }
    }

    @Post('/token/isValid')
    async tokenIsValid(@Body() payload){
        try{

            if (!payload ||
                !payload.access_token){
                    return this.utils.getFailureMessage(Constants.INVALID_TOKEN_INVALID, {});
            }

            const results = await this.UserService.checksIfTokenIsValid(payload.access_token);
            return this.utils.getSuccessMessage(Constants.SUCCESS_MESSAGE_OPERATION, {
                isValid: results
            });
        } catch(err){
            return this.utils.getFailureMessage(err.toString(), payload);
        }
    }

    @Post('/recoveryPassword')
    public async recoveryPassword(@Body() user){
        try{
            
            if (!user ||
                !user.email ||
                user.email.length > 100){
                    return this.utils.getFailureMessage(Constants.INVALID_RECOVERY_EMAIL, {});
            }

            const query = {
                email: {
                    "$eq": user.email
                },
                deleted: false
            };

            const foundUsers = await this.UserService.findByQuery(query);

            if (foundUsers.length === 0){
                return this.utils.getFailureMessage(Constants.INVALID_LOGIN_USER_NOT_FOUND, {});
            }

            const foundUser = foundUsers[0];

            const verificationCode = this.utils.getRandomNumber();
            foundUser.verificationCode = verificationCode;
            foundUser.id = foundUser._id;

            await this.UserService.update(foundUser);

            await this.mailService.sendRecoveryPasswordMail(foundUser);

            return this.utils.getSuccessMessage(Constants.SUCCESS_MESSAGE_OPERATION, {});
        } catch(err){
            return this.utils.getFailureMessage(err.toString(), err);
        }
    }

    @Post('/validateCode')
    public async validateCode(@Body() code){
        try{

            if (!code ||
                !code.verificationCode){
                    return this.utils.getFailureMessage("Erro! Código de verificação não informado.", {});
            }

            if (!code.email || 
                code.email.length > 100){
                    return this.utils.getFailureMessage(Constants.INVALID_RECOVERY_EMAIL, {});
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
                return this.utils.getFailureMessage(Constants.INVALID_LOGIN_USER_NOT_FOUND, {});
            }

            return this.utils.getSuccessMessage("Validação do código de verificação realizada com sucesso!", {
                validated: true
            });

        } catch(err){
            return this.utils.getFailureMessage(err.toString(), {});
        }
    }

    @Put('/updatePassword')
    public async updatePassword(@Body() user){
        try{

            if (!user ||
                !user.email ||
                !user.verificationCode || 
                !user.password){
                    return this.utils.getFailureMessage("Email do usuário ou código de verificação não informados!", {});
            }

            if (!user.email ||
                user.email.length > 100 ||
                !new RegExp(Constants.PATTERN_FIELD_EMAIL).test(user.email)){
                    const emailNameField = "Email inválido!";
                    const message = this.utils.buildMessage(emailNameField, Constants.INVALID_FIELD_100_CHARACTERS, Constants.INVALID_FIELD_EMPTY, Constants.INVALID_PATTERN_FIELD_WITHOUT_SPECIAL_CHARACTERS);
                    return this.utils.getFailureMessage(message, {});
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
                return this.utils.getFailureMessage(Constants.INVALID_LOGIN_USER_NOT_FOUND, {});
            }

            let oldUser = foundUsers[0];

            oldUser.password = await this.utils.getsNewPassword(user.password);
            oldUser.id = oldUser._id;
            oldUser.verificationCode = "";

            await this.UserService.update(oldUser);

            return this.utils.getSuccessMessage(Constants.SUCCESS_MESSAGE_OPERATION, {});
        } catch(err){
            return this.utils.getFailureMessage(err.toString(), {});
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
            name: user.name,
            email: user.email,
            cpfCnpj: user.cpfCnpj,
            deleted: user.deleted,
            phone: user.phone
        };
    }

}
