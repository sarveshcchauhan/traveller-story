const moment = require('moment')

module.exports = {
    formatDate: function(date, formatType){
        return moment(date).format(formatType)
    },

    truncate: function(str,len){
        if(str.length > len && str.length > 0){
            let newStr = str+' '
            newStr = str.substr(0,len)
            newStr = str.substr(0, newStr.lastIndexOf(' '))
            newStr = newStr.length > 0 ? newStr : str.substr(0,len)
            return newStr + '...'
        }
        return str
    },

    stripTags: function(input){
        return input.replace(/<(?:.|\n)*?>/gm,'')
    },

    editIcon: function(storyUser, loggedUser, storyId, floating = true){
        if(storyUser._id.toString() == loggedUser._id.toString()){
            if(floating){
                return `<a href="/stories/edit/${storyId}" class="btn-floating halfway-fab red"><i class="fas fa fa-edit" style="font-size:16px" ></i></a>`
            }else{
                return `<a href="/stories/edit/${storyId}" ><i class="fas fa fa-edit" style="font-size:16px"></i></a>`
            }
        }else{
            return ''
        }
    },

    select: function(selected, options){
        return options
            .fn(this)
            .replace(
                new RegExp(' value="' + selected +'"'),
                '$& selected="selected"'
            ).replace(
                new RegExp('>' + selected + '</option>'),
                ' selected="selected"$&'
            )
    }
}