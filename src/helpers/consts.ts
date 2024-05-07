// Dev environment
export const DEV_ENVIRONMENT =
  import.meta.env.VITE_APP_DEV_ENVIRONMENT || false;

/*
    Emulator routes
*/
export const EMULATOR_HOST =
  import.meta.env.VITE_APP_EMULATOR_HOST || "localhost";
export const AUTH_EMULATOR = import.meta.env.VITE_APP_AUTH_EMULATOR || "";
export const DATABASE_EMULATOR_PORT = Number(
  import.meta.env.VITE_APP_DATABASE_EMULATOR_PORT
);
export const FIRESTORE_EMULATOR_PORT = Number(
  import.meta.env.VITE_APP_FIRESTORE_EMULATOR_PORT
);
export const CLOUD_STORAGE_EMULATOR_PORT = Number(
  import.meta.env.VITE_APP_CLOUD_STORAGE_EMULATOR_PORT
);
export const FUNCTIONS_EMULATOR_PORT = Number(
  import.meta.env.VITE_APP_FUNCTIONS_EMULATOR_PORT
);

/*
    Router routes
*/
export const HOME_ROUTE = "/";
export const DCK_ROUTE = "/dck";
export const PROBLEM_ROUTE = "/problem";

/*
    Global events
*/
export const NEW_DOMAIN = "new_domain";
export const NEW_PROBLEM = "new_problem";
export const NEW_FILE = "new_file";

/*
    Testing consts
*/
export const PROLOG_TEST = `
cardinality_query(N, Predicate) :- findall(X, call(Predicate), L),length(L,N).

atbObjectControl(b1).
atbObjectControl(b2).
atbObjectControl(b3).

init_rule_clear(b1).
init_rule_clear(b3).
init_rule_on(b1,b2).
init_rule_on-table(b3).
init_rule_on-table(b2).
init_rule_armempty.

goal_rule_on(b1,b2).
goal_rule_on(b2,b3).
goal_rule_clear(b1).
init_rule_goodtower(V0O0) :- init_rule_on-table(V0O0),goal_rule_on-table(V0O0).
init_rule_goodtower(V0O1) :- init_rule_on-table(V0O1),init_rule_freeBot(V0O1).
init_rule_goodtower(V0O2) :- init_rule_on(V0O2,O2A0V1),init_rule_goodtower(O2A0V1),init_rule_gon(V0O2,O2A0V1).
init_rule_goodtower(V0O3) :- init_rule_on(V0O3,O3A0V1),init_rule_goodtower(O3A0V1),init_rule_freeBot(V0O3),init_rule_freeTop(O3A0V1).
init_rule_badtower(V0O0) :- init_rule_on-table(V0O0),init_rule_gon(V0O0,_).
init_rule_badtower(V0O1) :- init_rule_on(V0O1,O1A0V1),goal_rule_on-table(V0O1).
init_rule_badtower(V0O2) :- init_rule_on(V0O2,O2A0V1),init_rule_gon(O2A1V0,O2A0V1),O2A1V0\\=V0O2.
init_rule_badtower(V0O3) :- init_rule_on(V0O3,O3A0V1),init_rule_gon(V0O3,O3A1V1),O3A0V1\\=O3A1V1.
init_rule_badtower(V0O4) :- init_rule_on(V0O4,O4A0V1),goal_rule_clear(V0O4).
init_rule_badtower(V0O5) :- init_rule_on(V0O5,O5A0V1),init_rule_badtower(O5A0V1).
init_rule_dck_holding(V0O0) :- init_rule_holding(V0O0).
init_rule_mStacked(V0O0) :- init_rule_gon(V0O0,_).
init_rule_gon(V0O0,V1O0) :- goal_rule_on(V0O0,V1O0).
init_rule_freeBot(V0O0) :- \\+ goal_rule_clear(V0O0),\\+ init_rule_gon(V0O0,_).
init_rule_freeTop(V0O0) :- \\+ goal_rule_clear(V0O0),\\+ init_rule_gon(_,V0O0).

init_rule_clear(_) :- fail.
goal_rule_clear(_) :- fail.
not_goal_rule_clear(_) :- fail.
init_rule_on-table(_) :- fail.
goal_rule_on-table(_) :- fail.
not_goal_rule_on-table(_) :- fail.
init_rule_armempty.
goal_rule_armempty.
not_goal_rule_armempty.
init_rule_holding(_) :- fail.
goal_rule_holding(_) :- fail.
not_goal_rule_holding(_) :- fail.
init_rule_on(_,_) :- fail.
goal_rule_on(_,_) :- fail.
not_goal_rule_on(_,_) :- fail.`;

export const ADVANCED_BLOCKSWORLD_TEST = `
(define (domain blocksworld)
  (:requirements :strips :equality)
  (:predicates (clear ?x)
               (on-table ?x)
               (armempty)
               (holding ?x)
               (on ?x ?y))
  
  (:action pickup
    :parameters (?ob)
    :precondition (and (clear ?ob) (on-table ?ob) (armempty))
    :effect (and (holding ?ob) (not (clear ?ob)) (not (on-table ?ob)) 
                 (not (armempty))))
  
  (:action putdown
    :parameters  (?ob)
    :precondition (and (holding ?ob))
    :effect (and (clear ?ob) (armempty) (on-table ?ob) 
                 (not (holding ?ob))))
  
  (:action stack
    :parameters  (?ob ?underob)
    :precondition (and  (clear ?underob) (holding ?ob))
    :effect (and (armempty) (clear ?ob) (on ?ob ?underob)
                 (not (clear ?underob)) (not (holding ?ob))))
  
  (:action unstack
    :parameters  (?ob ?underob)
    :precondition (and (on ?ob ?underob) (clear ?ob) (armempty))
    :effect (and (holding ?ob) (clear ?underob)
                 (not (on ?ob ?underob)) (not (clear ?ob)) (not (armempty)))))`;
export const ADVANCED_BLOCKSWORLD_PROBLEM_TEST = `(define (problem pb10)
(:domain blocksworld)
(:objects a b c d e f g h i j - someType)
(:init (on-table a) (on-table b) (on-table c) (on-table d) (on-table e) 
       (on-table f) (on-table g) (on-table h) (on-table i) (on-table j) 
       (clear a)  (clear b) (clear c) (clear d) (clear e) (clear j) 
       (clear f)  (clear g) (clear h) (clear i) (armempty))
(:goal (and (on a b) (on b c) (on c d) (on d e) (on e f) (on f g)
            (on g h) (on h i) (on i j) )))`;
