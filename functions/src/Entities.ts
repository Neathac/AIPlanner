import {User} from "../shared/systemTypes";

/**
 * A User systemType equivallent stored in the database
 */
export interface UserEntity {
  id: string,
  name: string,
  email: string,
  pic?: string,
  docNum: number,
}

/**
 * A utility type conversion function
 * @param {UserEntity | undefined} entity - A User entry from the database
 * @return {User | undefined} - A Doc retyped to its systemType equivallent
 */
export function toUser(entity: UserEntity | undefined): User | undefined {
  return entity ? {
    id: entity.id,
    email: entity.email,
    name: entity.name,
    pic: entity.pic,
    docNum: entity.docNum,
  } : undefined;
}

/**
 * A utility type conversion function
 * @param {Partial<User>} userPatch - A systemType partial user object
 * @return {Partial<UserEntity>} - Database entity corresponding to User
 */
export function toUserEntityPatch(
    userPatch: Partial<User>): Partial<UserEntity> {
  return {
    id: userPatch.id,
    email: userPatch.email,
    name: userPatch.name,
    pic: userPatch.pic,
    docNum: userPatch.docNum,
  };
}
