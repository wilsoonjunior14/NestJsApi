export const Constants = {
    PATTERN_FIELD_WITHOUT_SPECIAL_CHARACTERS : /[a-zA-Z]+$/g,
    PATTERN_FIELD_EMAIL: /\D+@\D+\.(com|br)$/g,
    PATTERN_FIELD_CPF_CNPJ_MASKED: /((\d{3}\.){2}\d{3}-\d{2})|(\d{2}(\.\d{3}){2}.\d{4}\.\d{2})/g,
    PATTERN_FIELD_PHONE: /\(\d{2}\)\d{5}-\d{4}/g,
    INVALID_COMMON_MESSAGE: "Verifique as seguintes condições:",
    INVALID_FIELD_EMPTY: "Campo não informado ou vazio.",
    INVALID_FIELD_100_CHARACTERS: "Máximo de 100 caracteres são permitidos.",
    INVALID_PATTERN_FIELD_WITHOUT_SPECIAL_CHARACTERS: "Caracteres especiais como @,#,$,%,-,/,' não são permitidos.",
    INVALID_PATTERN_FIELD_EMAIL: "Email fora do padrão com @server.com ou @server.br",
    INVALID_PATTERN_FIELD_CPF_CNPJ: "CPF/CNPJ fora de padrão.",
    INVALID_PATTERN_FIELD_PHONE: "Telefone fora do formato padrão.",
    INVALID_EXISTING_USER: "Usuário já registrado no sistema.",
    INVALID_EXISTING_ENTITY: "O sistema já possui uma entidade com os dados informados!",
    INVALID_IDENTIFIER_NOT_PROVIDED: "Identificador não informado!",
    SUCCESS_MESSAGE_OPERATION: "Operação realizada com sucesso!"
}