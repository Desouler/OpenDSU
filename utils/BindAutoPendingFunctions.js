const PendingCallMixin = require("./PendingCallMixin");
/*
    Utility to make classes that depend on some initialisation easier to use.
    By using the PendingCallMixin, the member function can be used but will be called in order only after proper initialisation
 */

module.exports.bindAutoPendingFunctions = function(obj, exceptionList){
    let originalFunctions = {};
    for(let m in obj){
        if(typeof obj[m] == "function"){
            if(!exceptionList[m]){
                originalFunctions[m] = obj[m];
            }
        }
    }
    PendingCallMixin(obj);
    let isInitialised = false;

    obj.finishInitialisation = function(){
        isInitialised = true;
        obj.executeSerialPendingCalls();
    };

   function getWrapper(func){
       return function(...args){
           if(isInitialised){
               func(...args);
           } else {
               obj.addSerialPendingCall( function(next){
                   let callback = args[args.length -1];
                   if(typeof callback === "function"){
                       args[args.length -1] = function(...args){
                           callback(...args);
                           next();
                       }
                   } else {
                       next();
                   }
                   func(...args);
               })
           }
       }.bind(obj);
   }

    for(let m in originalFunctions){
        obj[m] = getWrapper(originalFunctions[m]);
    }
    return obj;
};