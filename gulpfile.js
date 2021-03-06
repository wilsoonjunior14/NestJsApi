const {gulp, src, dest} = require('gulp');
const fs = require('fs');

const emailTemplatesDistFolder = "./dist/utils/templates/";
const emailTemplatesFolder = "./src/utils/templates/";

function setEmailTemplates(cb){
    return src(emailTemplatesFolder + "*.ejs")
        .pipe(dest(emailTemplatesDistFolder));
}

exports.setEmailTemplates = setEmailTemplates;