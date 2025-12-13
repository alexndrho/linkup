"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Sex = void 0;
exports.isIUser = isIUser;
var Sex;
(function (Sex) {
    Sex["MALE"] = "M";
    Sex["FEMALE"] = "F";
    Sex["UNSPECIFIED"] = "";
})(Sex || (exports.Sex = Sex = {}));
// export interface IUserStranger extends IUser {
//   isDisconnected: boolean;
// }
function isIUser(obj) {
    if (typeof obj !== "object" || obj === null) {
        return false;
    }
    const candidate = obj;
    return (typeof candidate.name === "string" &&
        Object.values(Sex).includes(candidate.sex) &&
        (typeof candidate.age === "number" || candidate.age === null) &&
        typeof candidate.location === "string");
}
