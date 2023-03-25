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
  rawDomain: `(define
    (domain construction)
    (:extends building)
    (:requirements :strips :typing)
    (:types
        site material - object
        bricks cables windows - material
    )
    (:constants mainsite - site)

    ;(:domain-variables ) ;deprecated

    (:predicates
        (walls-built ?s - site)
        (windows-fitted ?s - site)
        (foundations-set ?s - site)
        (cables-installed ?s - site)
        (site-built ?s - site)
        (on-site ?m - material ?s - site)
        (material-used ?m - material)
    )

    (:timeless (foundations-set mainsite))

    ;(:safety
        ;(forall
        ;    (?s - site) (walls-built ?s)))
        ;deprecated

    (:action BUILD-WALL
        :parameters (?s - site ?b - bricks)
        :precondition (and
            (on-site ?b ?s)
            (foundations-set ?s)
            (not (walls-built ?s))
            (not (material-used ?b))
        )
        :effect (and
            (walls-built ?s)
            (material-used ?b)
        )
        ; :expansion ;deprecated
    )

    (:axiom
        :vars (?s - site)
        :context (and
            (walls-built ?s)
            (windows-fitted ?s)
            (cables-installed ?s)
        )
        :implies (site-built ?s)
    )

    ;Actions omitted for brevity
)`,
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
  rawProblem: `(define
    (problem buildingahouse)
    (:domain construction)
    ;(:situation <situation_name>) ;deprecated
    (:objects 
        s1 - site 
        b - bricks 
        w - windows 
        c - cables
    )
    (:goal (and
            (walls-built ?s1)
            (cables-installed ?s1)
            (windows-fitted ?s1)
        )
    )
    (:init
        (on-site b s1)
        (on-site c s1)
        (on-site w s1)
    )
)`,
};
