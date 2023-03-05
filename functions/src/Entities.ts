import {User, Domain, Problem} from "../shared/systemTypes";

/**
 * A User systemType equivallent stored in the database
 */
export interface UserEntity {
  id: string,
  name: string,
  email: string,
  pic?: string,
  docNum: number,
  domainIds: Array<string>,
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
    domainIds: entity.domainIds,
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
    domainIds: userPatch.domainIds,
  };
}

/**
 * A utility type conversion function
 * @param {User} user - A systemType user object
 * @return {UserEntity} - Database entity corresponding to User
 */
export function toUserEntity(
    user: User): UserEntity {
  return {
    id: user.id,
    email: user.email,
    name: user.name,
    pic: user.pic,
    docNum: user.docNum,
    domainIds: user.domainIds,
  };
}

/**
 * A Domain systemType equivallent stored in the database
 */
export interface DomainEntity {
  id: string;
  name: string;
  rawDomain: string;
  dckState?: string;
  associatedProblems: Array<string>;
}

/**
 * A utility type conversion function
 * @param {DomainEntity | undefined} entity - A Domain entry from the database
 * @return {Domain | undefined} - A Doc retyped to its systemType equivallent
 */
export function toDomain(entity: DomainEntity | undefined): Domain | undefined {
  return entity ? {
    id: entity.id,
    name: entity.name,
    rawDomain: entity.rawDomain,
    dckState: entity.dckState,
    associatedProblems: entity.associatedProblems,
  } : undefined;
}

/**
 * A utility type conversion function
 * @param {Partial<Domain>} domainPatch - A systemType partial Domain object
 * @return {Partial<DomainEntity>} - Database entity corresponding to Domain
 */
export function toDomainEntityPatch(
    domainPatch: Partial<Domain>): Partial<DomainEntity> {
  return {
    id: domainPatch.id,
    name: domainPatch.name,
    rawDomain: domainPatch.rawDomain,
    dckState: domainPatch.dckState,
    associatedProblems: domainPatch.associatedProblems,
  };
}

/**
 * A utility type conversion function
 * @param {Domain} domain - A systemType Domain object
 * @return {DomainEntity} - Database entity corresponding to Domain
 */
export function toDomainEntity(
    domain: Domain): DomainEntity {
  return {
    id: domain.id,
    name: domain.name,
    rawDomain: domain.rawDomain,
    dckState: domain.dckState,
    associatedProblems: domain.associatedProblems,
  };
}

/**
 * A Domain systemType equivallent stored in the database
 */
export interface ProblemEntity {
  id: string;
  name: string;
  parentDomain: string;
  rawProblem: string;
}

/**
 * A utility type conversion function
 * @param {ProblemEntity | undefined} entity - A Problem entry from the database
 * @return {Problem | undefined} - A Doc retyped to its systemType equivallent
 */
export function toProblem(entity: ProblemEntity | undefined): Problem | undefined {
  return entity ? {
    id: entity.id,
    name: entity.name,
    parentDomain: entity.parentDomain,
    rawProblem: entity.rawProblem,
  } : undefined;
}

/**
 * A utility type conversion function
 * @param {Partial<Problem>} problemPatch - A systemType partial Problem object
 * @return {Partial<ProblemEntity>} - Database entity corresponding to Problem
 */
export function toProblemEntityPatch(
    problemPatch: Partial<Problem>): Partial<ProblemEntity> {
  return {
    id: problemPatch.id,
    name: problemPatch.name,
    parentDomain: problemPatch.parentDomain,
    rawProblem: problemPatch.rawProblem,
  };
}

/**
 * A utility type conversion function
 * @param {Problem} problem - A systemType Problem object
 * @return {ProblemEntity} - Database entity corresponding to Problem
 */
export function toProblemEntity(
    problem: Problem): ProblemEntity {
  return {
    id: problem.id,
    name: problem.name,
    parentDomain: problem.parentDomain,
    rawProblem: problem.rawProblem,
  };
}
