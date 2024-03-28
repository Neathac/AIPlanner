<script lang="ts">
import { defineComponent } from "vue";
import { HOME_ROUTE, DCK_ROUTE } from "../helpers/consts";

export default defineComponent({
  name: "ProtectedView",
  data() {
    return {
      menuVisible: true,
      items: [
        { text: "Domů", icon: "mdi-home", to: HOME_ROUTE },
        { text: "Profil", icon: "mdi-account", to: DCK_ROUTE },
      ],
    };
  },
});
</script>

<template>
  <div>
    <v-container style="max-height: 100vh; overflow-y: scroll">
      <div class="text-h2 font-weight-medium text-center">
        Visual editor for Attributed Domain Control Knowledge
      </div>
      <v-divider :thickness="3"></v-divider>
      <p class="font-italic text-center">
        This web application was created to accompany a Bachelor thesis created
        in the year 2024 by Martin Gráf for MFF UK under the supervision of
        Roman Barták. The resulting work bears the name
        <strong>
          Visual Editing of Domain Control Knowledge for Plannning
        </strong>
        and is intended to follow up and supplement a paper called "Attributed
        Transition-based Domain Control Knowledge for Domain-Independent
        Planning" authored by Barták, Chrpa, Vodrážka, and Vomelová. Its primary
        objective is to create a tool allowing domain experts to exploit the
        concept of Attributed Domain Control Knolwedge outlined in the original
        paper. This application allows its users to create, edit, and manage
        multiple domains, create problems associated with these domains, and
        provides a visual interface in the form of adaptive menus, allowing the
        user to specify all information relevant to creating an ATB-DCK.
      </p>
      <div class="text-h3 font-weight-medium text-center mt-10">
        Managing files
      </div>
      <p class="font-weight-medium">
        In order to manage multiple files and versions, a Google account is
        needed. Using the software is possible even without said account, the
        data will, however, be lost upon leaving the site and only 1 domain file
        and 1 problem file are possible. Supported features are:
        <v-list>
          <v-list-item title="Creating domains"></v-list-item>
          <v-list-item
            title="Saving changes made to domain files"
          ></v-list-item>
          <v-list-item
            title="Creating new domains from existing ones"
          ></v-list-item>
          <v-list-item title="Deleting domain documents"></v-list-item>
          <v-list-item
            title="ATB-DCK definition associated with domain"
          ></v-list-item>
          <v-list-item
            title="Automatic encoding of ATB-DCK to domains"
          ></v-list-item>
          <v-list-item
            title="Creating problems associated with domains"
          ></v-list-item>
          <v-list-item title="Saving changes made to problems"></v-list-item>
          <v-list-item title="Deleting problems"></v-list-item>
          <v-list-item
            title="Creating new problems from existing ones"
          ></v-list-item>
          <v-list-item
            title="Automatic encoding of ATB-DCK to problems supporting problem-specific objects and behaviour"
          ></v-list-item>
          <v-list-item
            title="A functional PDDL text editor with syntax highlighting"
          ></v-list-item>
          <v-list-item title="Defining ATB-DCK states"></v-list-item>
          <v-list-item title="Defining ATB-DCK memory"></v-list-item>
          <v-list-item title="Defining ATB-DCK transitions"></v-list-item>
          <v-list-item
            title="Defining ATB-DCK initialization rules"
          ></v-list-item>
        </v-list>
      </p>
      <div class="text-h3 font-weight-medium text-center mt-10">
        ATB-DCK encoder
      </div>
      <p>
        First navigate to the domain file in order to edit. A toggle button can
        be found in the upper left corner of the editor.
      </p>
      <div class="text-h4 font-weight-medium text-left mt-10">
        Attributed States
      </div>
      <p>
        Allows the definition of attributed states and the number of arguements
        they ought to have.
      </p>
      <div class="text-h4 font-weight-medium text-left mt-10">
        Attributed Memory
      </div>
      <p>
        In addition to Attributed States, the user might need to specify
        additional "helper" predicates to ease the encoding of initialization
        rules, but themselves should not be considered for encoding to a
        specific problem or as a memory predicate to domain. This can be done by
        checking the "Don't encode to problem" option.
      </p>
      <div class="text-h4 font-weight-medium text-left mt-10">
        Attributed Transitions
      </div>
      <p>
        Allows the selection of origin and target states, the associated
        operators, and constraints on attributed states, memory, or ordinary
        predicates. An empty transition can be specified via the
        "empty_operator" option.
        <strong
          >Note that it is up to the user to synchronize variable names with
          those of the selected operator.</strong
        >
      </p>
      <div class="text-h4 font-weight-medium text-left mt-10">
        State Initialization rules
      </div>
      <p>
        Autogenerated for all defined states and memory. Can be simply set to
        either start as False for all objects, as True for all objects, or as
        equaling a constant (including numbers). Knowledge of the Prolog
        programming language is recommended, but not strictly needed. User can
        create a series of or disjunctive clauses of conjunctions, mirroring a
        DNF formula. Any rule within a conjunction can be either a predicate
        condition, an attributed state condition, an attributed memory
        condition, or a Prolog operator. Special arithmetic function "count,
        max, and min" are also supported and will be appended to the end of the
        rule. These allow basic arithmetics and cardinality rules to exist
        within the specified DNF. If any bindings of variables in rules meant to
        be encoded into the problem are found upon resolution, new
        problem-specific objects are created to represent them.
        <strong
          >Note that it is up to the user to synchronize variable names with
          those of the selected operator.</strong
        >
      </p>
      <v-footer>@Martin Gráf 2024</v-footer>
    </v-container>
  </div>
</template>
