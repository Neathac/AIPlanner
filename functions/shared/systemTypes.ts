import {AttributedDCK, emptyAttributedDCK} from "./parserTypes";

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
  atbDck: AttributedDCK;
  associatedProblems: Array<string>;
}

export const EMPTY_DOMAIN: Domain = {
  id: "",
  name: "Blocksworld",
  rawDomain: `(define (domain blocksworld)
  (:requirements :strips :equality)
  (:predicates (clear ?x)
               (on-table ?x)
               (arm-empty)
               (holding ?x)
               (on ?x ?y))
  
  (:action pickup
    :parameters (?ob)
    :precondition (and (clear ?ob) (on-table ?ob) (arm-empty))
    :effect (and (holding ?ob) (not (clear ?ob)) (not (on-table ?ob)) 
                 (not (arm-empty))))
  
  (:action putdown
    :parameters  (?ob)
    :precondition (and (holding ?ob))
    :effect (and (clear ?ob) (arm-empty) (on-table ?ob) 
                 (not (holding ?ob))))
  
  (:action stack
    :parameters  (?ob ?underob)
    :precondition (and  (clear ?underob) (holding ?ob))
    :effect (and (arm-empty) (clear ?ob) (on ?ob ?underob)
                 (not (clear ?underob)) (not (holding ?ob))))
  
  (:action unstack
    :parameters  (?ob ?underob)
    :precondition (and (on ?ob ?underob) (clear ?ob) (arm-empty))
    :effect (and (holding ?ob) (clear ?underob)
                 (not (on ?ob ?underob)) (not (clear ?ob)) (not (arm-empty)))))`,
  atbDck: emptyAttributedDCK(),
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
  rawProblem: `(define (problem pb10)
  (:domain blocksworld)
  (:objects a b c d e f g h i j - someType)
  (:init (on-table a) (on-table b) (on-table c) (on-table d) (on-table e) 
         (on-table f) (on-table g) (on-table h) (on-table i) (on-table j) 
         (clear a)  (clear b) (clear c) (clear d) (clear e) (clear j) 
         (clear f)  (clear g) (clear h) (clear i) (arm-empty))
  (:goal (and (on a b) (on b c) (on c d) (on d e) (on e f) (on f g)
              (on g h) (on h i) (on i j) )))`,
};
