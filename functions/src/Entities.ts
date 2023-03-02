import {User} from "../shared/systemTypes";

export interface UserEntity {
  id: string,
  name: string,
  email: string,
  pic?: string,
  docNum: number,
}

export function toUser(entity: UserEntity | undefined): User | undefined {
  return entity ? {
    id: entity.id,
    email: entity.email,
    name: entity.name,
    pic: entity.pic,
    docNum: entity.docNum,
  } : undefined;
}

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
