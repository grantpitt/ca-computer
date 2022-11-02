/*
Genetic algorithms for "arbitrary" decentralized computation (using CA)
*/
import _ from "lodash";

// CA domain
const numCells = 100;
const numStates = 2;
const radius = 3;
const numUpdates = 200;

// Genetic algorithm
const generationSize = 200;
const numGenerations = 100;
const numTests = 20;
const survivalRate = 0.15;
const mutationRate = 0.15;

// A computation is a function that the policies will be trying to model
// It takes the first state of the CA and return what we want to compute after updates
type Computation = (input: number[]) => number[];

const mode: Computation = (input) => {
  const total = input.reduce((a, b) => a + b, 0);
  if (total > numCells / 2) {
    return Array(numCells).fill(1);
  }
  return Array(numCells).fill(0);
};

function run(computation: Computation) {
  // initialize policy population
  let policies: number[][] = [];
  for (let i = 0; i < generationSize; i++) {
    policies.push(random_policy());
  }

  const bests: number[] = [];

  // run simulation
  for (let i = 0; i < numGenerations; i++) {
    // evaluate fitness
    // TODO: parallelize and run on more than one input
    const tests_fitnesses: number[][] = [];
    for (let k = 0; k < numTests; k++) {
      // input is array of 0s and 1s
      const input = Array(numCells)
        .fill(0)
        .map(() => Math.floor(Math.random() * numStates));
      const output = computation(input);
      tests_fitnesses.push(
        policies.map((policy) => fitness(model(policy, input), output))
      );
    }

    const fitnesses: number[] = [];
    for (let k = 0; k < generationSize; k++) {
      fitnesses.push(
        tests_fitnesses.map((test) => test[k]).reduce((a, b) => a + b) /
          numTests
      );
    }

    // select parents (survival of the fittest)
    const sortedArgs = argsort(fitnesses);
    const parents = [];
    for (let k = 0; k < Math.floor(generationSize * survivalRate); k++) {
      parents.push(policies[sortedArgs[k]]);
    }

    console.log(`Generation ${i}: ${Math.max(...fitnesses)}, ${parents[0].join("")}`);
    bests.push(Math.max(...fitnesses));

    // generate offspring
    const offspring = [];
    for (let j = 0; j < generationSize - parents.length; j++) {
      // lets try assexual reproduction
      const parent = parents[Math.floor(Math.random() * parents.length)];
      offspring.push(crossover(parent, parent));
      // const parent1 = parents[Math.floor(Math.random() * parents.length)];
      // const parent2 = parents[Math.floor(Math.random() * parents.length)];
      // offspring.push(crossover(parent1, parent2));
    }

    // update population
    policies = [...parents, ...offspring];
  }

  // return optimal policy for each generation
  return bests;
}

const argsort = (ns: number[]) => ns.map((n, i) => [n, i]).sort().map(c => c[1]);

function crossover(parent1: number[], parent2: number[]) {
  const child = [];
  for (let i = 0; i < parent1.length; i++) {
    child.push(Math.random() < 0.5 ? parent1[i] : parent2[i]);
  }
  // mutate
  for (let i = 0; i < child.length; i++) {
    if (Math.random() < mutationRate) {
      child[i] = Math.floor(Math.random() * numStates);
    }
  }
  return child;
}

function random_policy() {
  const numNeighborhoodConfigurations = numStates ** (2 * radius + 1);
  let rule = [];
  for (let i = 0; i < numNeighborhoodConfigurations; i++) {
    rule.push(Math.floor(Math.random() * numStates));
  }
  return rule;
}

function model(policy: number[], input: number[]) {
  // model the policy
  let current = [...input];
  for (let i = 0; i < numUpdates; i++) {
    // update the CA
    const next = [];
    for (let j = 0; j < numCells; j++) {
      // get the neighborhood
      const neighborhood = [];
      for (let k = j - radius; k <= j + radius; k++) {
        neighborhood.push(current.at(k));
      }
      const neighborhoodIndex = parseInt(neighborhood.join(""), numStates);
      next.push(policy[neighborhoodIndex]);
    }
    current = next;
  }
  return current;
}

function fitness(output: number[], target: number[]) {

  // console.log(output, target);

  // compute fitness: mean absolute error
  let sum = 0;
  for (let i = 0; i < output.length; i++) {
    sum += Math.abs(output[i] - target[i]);
  }
  return sum / output.length;
}

// The policies are just CA rules, but there are many parameters we can play with
// What's are the parameters?
// states: # of CA states (probably 2)
// radius: # of neighbors on each side (probably 2 or 3)
// What's the math here?
// size of neighborhood = 2 * radius + 1
// # of neighborhood configurations: states ^ (size of neighborhood)
// # of rules = states ^ (# of neighborhood configurations)

// Other questions:
// What's the fitness function?

const bests = run(mode);
console.log(bests)

// const ns = [1, 2, 3, 4]
// const rs = [8, 2, 1, 9]

// console.log()

// argsort
// console.log(argsort(rs))

// function investigateConfigs() {
//   const sampleConfigs = [];
//   for (let i = 0; i < 10; i++) {
//     let config = "";
//     for (let j = 0; j < 2 * radius + 1; j++) {
//       config += Math.floor(Math.random() * numStates);
//     }
//     sampleConfigs.push(config);
//   }

//   // parse the configs
//   const parsedConfigs = sampleConfigs.map((config) => {
//     return Number.parseInt(config, numStates);
//   });
//   console.log(sampleConfigs);
//   console.log(parsedConfigs);
// }

// investigateConfigs();
