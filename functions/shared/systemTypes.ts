export interface User {
    id: string;
    name: string;
    email: string;
    pic?: string;
    docNum: number;
    domainIds: Array<string>;
  }

export const NOBODY: User = {
  id: "",
  name: "",
  email: "",
  docNum: 0,
  domainIds: [],
};

export interface Domain {
  id: string;
  name: string;
  rawDomain: string;
  dckState?: string;
  associatedProblems: Array<string>;
}

export const EMPTY_DOMAIN: Domain = {
  id: "",
  name: "",
  rawDomain: "",
  dckState: "",
  associatedProblems: [],
};

export interface Problem {
  id: string;
  name: string;
  parentDomain: string;
  rawProblem: string;
}

export const EMPTY_PROBLEM: Problem = {
  id: "",
  name: "",
  parentDomain: "",
  rawProblem: "",
};
