<template>
  <div class="about">
    <v-navigation-drawer permanent height="100%">
      <v-list v-if="!loggedIn">
        <v-list-item
          v-for="(item, i) in files"
          :key="i"
          :value="item"
          :to="item.to"
          base-color="primary"
        >
          <template v-slot:prepend>
            <v-icon :icon="item.icon"></v-icon>
          </template>
          <!-- eslint-disable vue/no-v-text-v-html-on-component -->
          <v-list-item-title v-text="item.text"></v-list-item-title>
        </v-list-item>
      </v-list>
      <template v-if="loggedIn">
        <v-container>
          <v-autocomplete
            label="Domains"
            :loading="loading"
            :disabled="loading"
            v-model="selectedDomain"
            :items="domains"
            item-title="name"
            v-bind:key="control"
          >
            <template v-slot:item="{ item }">
              <v-list-item
                v-bind="item"
                :title="item.raw.name"
                @click="switchDomain(item.raw)"
              ></v-list-item>
            </template>
          </v-autocomplete>
        </v-container>
        <v-container>
          <v-autocomplete
            label="Problems"
            :loading="loading"
            :disabled="loading"
            v-model="selectedProblem"
            :items="problems"
            item-title="name"
          >
            <template v-slot:item="{ item }">
              <v-list-item
                v-bind="item"
                :title="item.raw.name"
                @click="switchProblem(item.raw)"
              ></v-list-item>
            </template>
          </v-autocomplete>
        </v-container>
        <v-container>
          <v-dialog v-model="dialogDomainCreate" persistent>
            <template v-slot:activator="{ props }">
              <v-btn v-bind="props" :loading="loading" :disabled="loading">
                Create new Domain
              </v-btn>
            </template>
            <v-card>
              <v-card-title class="text-h5"> Create domain </v-card-title>
              <v-card-item>
                <v-text-field
                  v-model="newDomainName"
                  label="Domain name"
                ></v-text-field>
              </v-card-item>
              <v-card-actions>
                <v-spacer></v-spacer>
                <v-btn
                  color="green-darken-1"
                  variant="text"
                  @click="createDomain(newDomainName)"
                >
                  Save
                </v-btn>
                <v-btn
                  color="error"
                  variant="text"
                  @click="dialogDomainCreate = false"
                >
                  Cancel
                </v-btn>
              </v-card-actions>
            </v-card>
          </v-dialog>
        </v-container>
        <v-container>
          <v-dialog v-model="dialogProblemCreate" persistent>
            <template v-slot:activator="{ props }">
              <v-btn v-bind="props" :loading="loading" :disabled="loading">
                Create new Problem
              </v-btn>
            </template>
            <v-card>
              <v-card-title class="text-h5"> Create Problem</v-card-title>
              <v-card-item>
                <v-text-field
                  v-model="newProblemName"
                  label="Problem name"
                ></v-text-field>
              </v-card-item>
              <v-card-actions>
                <v-spacer></v-spacer>
                <v-btn
                  color="green-darken-1"
                  variant="text"
                  @click="createProblem(newProblemName)"
                >
                  Save
                </v-btn>
                <v-btn
                  color="error"
                  variant="text"
                  @click="dialogProblemCreate = false"
                >
                  Cancel
                </v-btn>
              </v-card-actions>
            </v-card>
          </v-dialog>
        </v-container>
        <v-spacer></v-spacer>
        <v-container>
          <v-dialog v-model="dialogDomainDelete" persistent>
            <template v-slot:activator="{ props }">
              <v-btn
                v-bind="props"
                color="error"
                :loading="loading"
                :disabled="loading"
              >
                Delete Domain
              </v-btn>
            </template>
            <v-card>
              <v-card-title class="text-h5"> Delete domain </v-card-title>
              <v-card-text
                >This action is irreversible! The domain, its ATB-DCK and all
                associated problems will be discarded.
              </v-card-text>
              <v-card-actions>
                <v-spacer></v-spacer>
                <v-btn
                  color="green-darken-1"
                  variant="text"
                  @click="deleteDomain(selectedDomain)"
                >
                  Confirm
                </v-btn>
                <v-btn
                  color="error"
                  variant="text"
                  @click="dialogDomainDelete = false"
                >
                  Cancel
                </v-btn>
              </v-card-actions>
            </v-card>
          </v-dialog>
        </v-container>
        <v-container>
          <v-dialog v-model="dialogProblemDelete" persistent>
            <template v-slot:activator="{ props }">
              <v-btn
                v-bind="props"
                color="error"
                :loading="loading"
                :disabled="loading"
              >
                Delete Problem
              </v-btn>
            </template>
            <v-card>
              <v-card-title class="text-h5"> Delete problem </v-card-title>
              <v-card-text>This action is irreversible! </v-card-text>
              <v-card-actions>
                <v-spacer></v-spacer>
                <v-btn
                  color="green-darken-1"
                  variant="text"
                  @click="deleteProblem(selectedProblem)"
                >
                  Confirm
                </v-btn>
                <v-btn
                  color="error"
                  variant="text"
                  @click="dialogProblemDelete = false"
                >
                  Cancel
                </v-btn>
              </v-card-actions>
            </v-card>
          </v-dialog>
        </v-container>
      </template>
      <v-spacer></v-spacer>
      <v-container class="mt-5">
        <template v-if="!loggedIn">
          <v-btn
            :onclick="signingWrapper"
            color="info"
            variant="flat"
            class="justify-center"
          >
            Log in with Google
          </v-btn>
        </template>
        <template v-else>
          <v-btn
            :loading="loading"
            :disabled="loading"
            :onclick="signoutWrapper"
            color="error"
            variant="flat"
            class="justify-center"
          >
            Log out
          </v-btn>
        </template>
      </v-container>
    </v-navigation-drawer>
  </div>
</template>

<script lang="ts" setup>
import { ref, Ref, onMounted } from "vue";
import { PROBLEM_ROUTE, DCK_ROUTE, NEW_FILE } from "../helpers/consts";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { Domain, EMPTY_PROBLEM, Problem } from "@functions/systemTypes";
import { EMPTY_DOMAIN } from "@functions/systemTypes";
import { Manager } from "../stores/resourceManager";
import { signin, signout } from "../helpers/authHelper";
import { useDocumentStore } from "../stores/documentStore";
import EventBus from "../lib/EventBus";
import { useAtbStore } from "../stores/atbStore";
import { useDomainStore } from "../stores/domainStore";
import { useProblemStore } from "../stores/problemStore";

const loggedIn: Ref<boolean> = ref(false);
const files: Ref<Array<{ text: string; icon: string; to: string }>> = ref([
  { text: "Domain", icon: "mdi-earth", to: DCK_ROUTE },
  { text: "Problem", icon: "mdi-file-code-outline", to: PROBLEM_ROUTE },
]);
const domains: Ref<Array<Domain>> = ref([]);
const auth = ref(getAuth());
const selectedDomain: Ref<Domain> = ref(EMPTY_DOMAIN);
const loading: Ref<boolean> = ref(false);
const dialogDomainCreate: Ref<boolean> = ref(false);
const newDomainName: Ref<string> = ref("Default name");
const dialogDomainDelete: Ref<boolean> = ref(false);

const control: Ref<number> = ref(0);

const problems: Ref<Array<Problem>> = ref([]);
const selectedProblem: Ref<Problem> = ref(EMPTY_PROBLEM);
const dialogProblemCreate: Ref<boolean> = ref(false);
const newProblemName: Ref<string> = ref("Default name");
const dialogProblemDelete: Ref<boolean> = ref(false);

onAuthStateChanged(auth.value, (user) => {
  if (user) {
    Manager.getMyDomains().then((doms) => {
      if (doms.length > 0) {
        selectedDomain.value = doms[0];
        domains.value = doms;
        loggedIn.value = true;
        Manager.selectDomain(doms[0]);
        Manager.getDomainProblems(doms[0].id).then((probs) => {
          if (probs && probs.length > 0) {
            selectedProblem.value = probs[0];
            problems.value = probs;
          }
        });
      } else {
        Manager.createDomain(EMPTY_DOMAIN).then((resDom) => {
          domains.value = [resDom];
          selectedDomain.value = resDom;
          loggedIn.value = true;
          Manager.selectDomain(resDom);
        });
      }
    });
  } else {
    loggedIn.value = false;
  }
});

onMounted(() => {
  EventBus.on(NEW_FILE, async (_) => {
    domains.value = useDocumentStore().getAvailableDomains;
    selectedDomain.value = useDocumentStore().getActiveDomain;
    problems.value = useDocumentStore().getActiveProblems;
    selectedProblem.value = useDocumentStore().getActiveProblemById(
      useDocumentStore().activeProblem
    );
  });
  if (getAuth().currentUser) loggedIn.value = true;
});

async function signingWrapper() {
  loading.value = true;
  await signin();
  loading.value = false;
  if (getAuth().currentUser) loggedIn.value = true;
}

async function signoutWrapper() {
  loading.value = true;
  await signout();
  loading.value = false;
  if (!getAuth().currentUser) loggedIn.value = false;
}

async function createDomain(domainName: string) {
  loading.value = true;
  dialogDomainCreate.value = false;
  const dummyDomain = EMPTY_DOMAIN;
  dummyDomain.name = domainName;
  Manager.createDomain(dummyDomain).then((res) => {
    if (res) {
      domains.value.push(res);
      selectedDomain.value = res;
    }
    loading.value = false;
  });
}

async function deleteDomain(domain: Domain) {
  loading.value = true;
  dialogDomainDelete.value = false;
  Manager.deleteDomain(domain.id).then((_) => {
    Manager.getDomainProblems(useDocumentStore().getActiveDomain.id).then(
      (probs) => {
        problems.value = probs;
        if (probs.length > 0) selectedProblem.value = probs[0];
        selectedDomain.value = useDocumentStore().getActiveDomain;
        domains.value = useDocumentStore().getAvailableDomains;
        loading.value = false;
      }
    );
  });
}

function switchDomain(domain: Domain) {
  const tempDomain = selectedDomain.value;
  tempDomain.atbDck = useAtbStore().dck;
  tempDomain.rawDomain = useDomainStore().rawActiveDomain;
  useDocumentStore().modifyDomain(tempDomain);
  selectedDomain.value = domain;
  Manager.getDomainProblems(domain.id).then((probs) => {
    if (probs && probs.length > 0) {
      selectedProblem.value = probs[0];
      problems.value = probs;
    } else {
      selectedProblem.value = null;
      problems.value = [];
    }
    Manager.selectDomain(domain);
  });
}

async function createProblem(problemName: string) {
  loading.value = true;
  dialogProblemCreate.value = false;
  const dummyProblem = EMPTY_PROBLEM;
  dummyProblem.name = problemName;
  dummyProblem.parentDomain = useDocumentStore().activeDomain;
  Manager.createProblem(dummyProblem).then((res) => {
    if (res) {
      problems.value.push(res);
      selectedProblem.value = res;
    }
    loading.value = false;
  });
}

function switchProblem(problem: Problem) {
  const temp = useDocumentStore().getActiveProblemById(
    useDocumentStore().activeProblem
  );
  temp.rawProblem = useProblemStore().getRawValue;
  useDocumentStore().modifyActiveProblem(selectedProblem.value);
  selectedProblem.value = problem;
  Manager.selectProblem(problem);
}

async function deleteProblem(problem: Problem) {
  loading.value = true;
  dialogProblemDelete.value = false;
  console.log(problem);
  Manager.deleteProblem(problem.id).then((_) => {
    Manager.getDomainProblems(useDocumentStore().getActiveDomain.id).then(
      (probs) => {
        problems.value = probs;
        if (probs.length > 0) selectedProblem.value = probs[0];
        else selectedProblem.value = null;
        selectedDomain.value = useDocumentStore().getActiveDomain;
        domains.value = useDocumentStore().getAvailableDomains;
        loading.value = false;
      }
    );
  });
}
</script>
