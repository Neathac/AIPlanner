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
init_rule_arm-empty.

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
init_rule_arm-empty.
goal_rule_arm-empty.
not_goal_rule_arm-empty.
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
                 (not (on ?ob ?underob)) (not (clear ?ob)) (not (arm-empty)))))`;
export const ADVANCED_BLOCKSWORLD_PROBLEM_TEST = `(define (problem pb10)
(:domain blocksworld)
(:objects a b c d e f g h i j - someType)
(:init (on-table a) (on-table b) (on-table c) (on-table d) (on-table e) 
       (on-table f) (on-table g) (on-table h) (on-table i) (on-table j) 
       (clear a)  (clear b) (clear c) (clear d) (clear e) (clear j) 
       (clear f)  (clear g) (clear h) (clear i) (arm-empty))
(:goal (and (on a b) (on b c) (on c d) (on d e) (on e f) (on f g)
            (on g h) (on h i) (on i j) )))`;

export const BLOCKSWORLD_TEST = `
(define 
    
  (domain blocksworld)

  (:requirements :typing)

  (:types
      block
  )

  (:predicates
      (handempty)
      (on ?x - block ?y - block)
      (ontable ?x - block)
      (clear ?x - block)
      (holding ?x - block)
  )


  (:action pick_up
      :parameters 
          (
              ?x - block
          )
      :precondition 
          (and 
              (clear ?x) 
              (ontable ?x) 
              (handempty)
          )
      :effect 
          (and
              (not (ontable ?x))
              (not (clear ?x))
              (not (handempty))
              (holding ?x)
          )
  )

  (:action put_down
      :parameters 
          (
              ?x - block
          )
      :precondition 
          (holding ?x)
      :effect 
          (and
              (ontable ?x)
              (clear ?x)
              (handempty)
              (not (holding ?x))
          )
  )

  (:action unstack
      :parameters 
          (
              ?x - block 
              ?y - block
          )
      :precondition 
          (and 
              (on ?x ?y) 
              (clear ?x) 
              (handempty)
          )
      :effect 
          (and
              (not (on ?x ?y))
              (clear ?y)
              (not (clear ?x))
              (not (handempty))
              (holding ?x))
  )

  (:action stack
      :parameters 
          (
              ?x - block 
              ?y - block
          )
      :precondition 
          (and 
              (holding ?x) 
              (clear ?y)
          )
      :effect 
          (and
              (on ?x ?y)
              (not (clear ?y))
              (clear ?x)
              (handempty)
              (not (holding ?x))
          )
  )

)`;
export const BLOCKSWORLD_PROBLEM_TEST = `(define 

  (problem blocksworld_instance)

  (:domain blocksworld)

  (:objects
      b1 b2 b3 - block
  )

  (:init
      (clear b1)
      (clear b3)
      (on b1 b2)
      (ontable b3)
      (ontable b2)
      (handempty)
  )

  (:goal
      (and 
          (on b1 b2) 
          (on b2 b3) 
          (clear b1)
      )
  )

)`;

export const CHILDSNACK_TEST = `
(define 

	(domain child-snack)
    
    (:requirements :typing :equality)
    
    (:types 
        child bread-portion 
        content-portion sandwich 
        tray 
        place
    )
    
    (:constants 
        kitchen - place
    )

    (:predicates 
        (at_kitchen_bread ?b - bread-portion)
	    (at_kitchen_content ?c - content-portion)
     	(at_kitchen_sandwich ?s - sandwich)
     	(no_gluten_bread ?b - bread-portion)
       	(no_gluten_content ?c - content-portion)
      	(ontray ?s - sandwich ?t - tray)
       	(no_gluten_sandwich ?s - sandwich)
	    (allergic_gluten ?c - child)
     	(not_allergic_gluten ?c - child)
	    (served ?c - child)
	    (waiting ?c - child ?p - place)
        (at ?t - tray ?p - place)
	    (notexist ?s - sandwich)
    )


    (:action make_sandwich_no_gluten 
	 	:parameters 
			(
				?s - sandwich 
				?b - bread-portion 
				?c - content-portion
			)
	 	:precondition 
			(and 
				(at_kitchen_bread ?b) 
				(at_kitchen_content ?c) 
				(no_gluten_bread ?b) 
				(no_gluten_content ?c) 
				(notexist ?s)
			)
	 	:effect 
		 	(and
				(not (at_kitchen_bread ?b))
				(not (at_kitchen_content ?c))
				(at_kitchen_sandwich ?s)
				(no_gluten_sandwich ?s)
				(not (notexist ?s))
			)
    )

	(:action make_sandwich
		:parameters 
			(
				?s - sandwich 
				?b - bread-portion 
				?c - content-portion
			)
		:precondition 
			(and 
				(at_kitchen_bread ?b)
				(at_kitchen_content ?c)
				(notexist ?s)
			)
		:effect 
			(and
				(not (at_kitchen_bread ?b))
				(not (at_kitchen_content ?c))
				(at_kitchen_sandwich ?s)
				(not (notexist ?s))
			)
	)

	(:action put_on_tray
		:parameters 
			(
				?s - sandwich 
				?t - tray
			)
		:precondition 
			(and  
				(at_kitchen_sandwich ?s)
				(at ?t kitchen)
			)
		:effect 
			(and
				(not (at_kitchen_sandwich ?s))
				(ontray ?s ?t)
			)
	)

	(:action serve_sandwich_no_gluten
		:parameters 
			(
				?s - sandwich 
				?c - child 
				?t - tray 
				?p - place
			)
		:precondition 
			(and
				(allergic_gluten ?c)
				(ontray ?s ?t)
				(waiting ?c ?p)
				(no_gluten_sandwich ?s)
				(at ?t ?p)
			)
		:effect 
			(and 
				(not (ontray ?s ?t))
				(served ?c)
			)
	)

	(:action serve_sandwich
		:parameters 
			(
				?s - sandwich 
				?c - child 
				?t - tray 
				?p - place
			)
		:precondition 
			(and 
				(not_allergic_gluten ?c)
				(waiting ?c ?p)
				(ontray ?s ?t)
				(at ?t ?p)
			)
		:effect 
			(and 
				(not (ontray ?s ?t))
				(served ?c)
			)
	)

	(:action move_tray
		:parameters 
			(
				?t - tray 
				?p1 ?p2 - place
			)
		:precondition 
			(and 
				(at ?t ?p1)
			)
		:effect 
			(and 
				(not (at ?t ?p1))
				(at ?t ?p2)
			)
	)
			    
)`;
export const CHILDSNACK_PROBLEM_TEST = `(define 
    
  (problem child-snack_instance)
  
  (:domain child-snack)

  (:objects
      child1 child2 child3 child4 - child
      bread1 bread2 bread3 bread4 - bread-portion
      content1 content2 content3 content4 - content-portion
      tray1 tray2 - tray
      kitchen table1 table2 - place
      sandw1 sandw2 sandw3 sandw4 - sandwich
  )

  (:init
      (at tray1 kitchen)
      (at tray2 kitchen)
      (at_kitchen_bread bread1)
      (at_kitchen_bread bread2)
      (at_kitchen_bread bread3)
      (at_kitchen_bread bread4)
      (at_kitchen_content content1)
      (at_kitchen_content content2)
      (at_kitchen_content content3)
      (at_kitchen_content content4)
      (no_gluten_bread bread1)
      (no_gluten_bread bread4)
      (no_gluten_content content2)
      (no_gluten_content content3)
      (allergic_gluten child1)
      (allergic_gluten child3)
      (not_allergic_gluten child2)
      (not_allergic_gluten child4)
      (waiting child1 table1)
      (waiting child2 table1)
      (waiting child3 table2)
      (waiting child4 table2)
      (notexist sandw1)
      (notexist sandw2)
      (notexist sandw3)
      (notexist sandw4)
  )

  (:goal
      (and
          (served child1)
          (served child2)
          (served child3)
          (served child4)
      )
  )

)`;
