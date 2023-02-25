import { defineStore } from "pinia";
import {
  emptyPddlDocument,
  PddlDocument,
  Action,
  Predicate,
} from "@functions/parserTypes";

export const useDomainStore = defineStore("domainStore", {
  state: () => ({
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
  )
  `,
    structuredDomain: emptyPddlDocument(),
  }),
  getters: {
    getStructure: (state) => state.structuredDomain,
    getRawValue: (state) => state.rawDomain,
    getActions: (state) => {
      const actions: { [key: string]: Action } = {};
      Object.entries(state.structuredDomain.actions).forEach(([, value]) => {
        actions[value.name] = value;
      });
      return actions;
    },
    getPredicates: (state) => {
      const predicates: Map<string, Predicate> = new Map<string, Predicate>();
      Object.entries(state.structuredDomain.predicates).forEach(
        ([, object]) => {
          if (object.rawPredicate) {
            predicates.set(object.rawPredicate, object);
          }
        }
      );
      return predicates;
    },
    getGoalifiedPredicates: (state) => {
      const predicates: Map<string, Predicate> = new Map<string, Predicate>();
      Object.entries(state.structuredDomain.predicates).forEach(
        ([, object]) => {
          if (object.rawPredicate) {
            const newObject = Object.assign({}, object);
            newObject.rawPredicate =
              object.rawPredicate.slice(0, 1) +
              "G" +
              object.rawPredicate.slice(1);

            predicates.set(newObject.rawPredicate, newObject);
          }
        }
      );
      return predicates;
    },
    getPredicatesByName: (state) => {
      const predicates: Map<string, Predicate> = new Map<string, Predicate>();
      Object.entries(state.structuredDomain.predicates).forEach(
        ([, object]) => {
          if (object.rawPredicate) {
            predicates.set(object.name, object);
          }
        }
      );
      return predicates;
    },
  },
  actions: {
    loadDomain(pddlDomain: PddlDocument, rawDomain: string) {
      this.rawDomain = rawDomain;
      this.structuredDomain = pddlDomain;
    },
    loadRawDomain(rawDomain: string) {
      this.rawDomain = rawDomain;
    },
  },
});
