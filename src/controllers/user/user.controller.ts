import { Body, Controller, Delete, Get, Param, Post, Put } from '@nestjs/common';
import { UserService } from './user.service';
import { Utils } from '../../utils/Utils';
import { Constants } from '../../utils/Contansts';
import { User } from './user.model';

@Controller('user')
export class UserController {

    private utils;
    private query = {
        
    };

    constructor(private UserService: UserService){
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

        return returns;
    }

}
